# Data Flow End-to-End - quiéntetoca

**Documento técnico del flujo de información**

---

## Arquitectura General

```
Usuario → React App → api-client.js → Supabase → PostgreSQL
                          ↑                 ↓
                    useRealtime.js ← Supabase Realtime (WebSocket)
                                           ↓
                             Edge Functions (execute-raffle, check-deadlines)
                                           ↓
                                    Resend API (emails)
```

### Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Auth**: Google/Microsoft OAuth via Supabase Auth
- **Real-time**: Supabase Realtime (WebSocket + PostgreSQL LISTEN/NOTIFY)
- **Emails**: Resend API (post-sorteo)

### Modos de Operación
El `api-client.js` soporta dos modos:
- **Supabase** (default): Queries directos a PostgreSQL via SDK
- **REST**: API endpoints externos (no implementado completamente)

---

## 1. Authentication Flow

```
LoginButton → OAuth (Google/MS) → /auth/callback → AuthProvider → syncUserToDatabase()
```

### Archivos Clave
| Archivo | Responsabilidad |
|---------|-----------------|
| `components/auth/LoginButton.jsx` | Botones OAuth (Google/Microsoft) |
| `components/auth/AuthProvider.jsx` | Context + session management |
| `lib/auth.js` | Funciones OAuth (`signInWithOAuth`, `syncUserToDatabase`) |
| `pages/AuthCallback.jsx` | Maneja redirect post-OAuth |

### Proceso Detallado
1. Usuario click "Iniciar con Google/Microsoft"
2. `signInWithOAuth()` configura redirect y llama a Supabase Auth
3. Supabase redirige al provider (Google/Microsoft)
4. Provider autentica y redirige a `/auth/callback`
5. `AuthCallback.jsx` detecta código OAuth y redirige a destino guardado
6. `AuthProvider.onAuthStateChange()` detecta nueva sesión
7. `syncUserToDatabase()` hace UPSERT en tabla `users`:
   ```javascript
   {
     id: user.id,           // UUID de auth.users
     email: user.email,
     name: user.user_metadata?.full_name || user.user_metadata?.name,
     avatar_url: user.user_metadata?.avatar_url,
     updated_at: new Date().toISOString()
   }
   ```
8. Context propaga `{ user, session, loading, isAuthenticated, logout }`

### Logout
```javascript
supabase.auth.signOut() → setUser(null) → setSession(null)
```

### Redirect Storage
```javascript
// Antes de login
localStorage.setItem('authRedirect', '/join/ABC123')

// Después de callback
const redirect = localStorage.getItem('authRedirect') || '/'
localStorage.removeItem('authRedirect')
navigate(redirect)
```

---

## 2. Group Creation Flow

```
CreateGroupForm → validación local → matching algorithm → api-client.createGroup()
    ↓
INSERT groups → INSERT participants → ID mapping → INSERT matches → INSERT restrictions
```

### Archivos Clave
| Archivo | Responsabilidad |
|---------|-----------------|
| `components/forms/CreateGroupForm.jsx` | Form UI completo |
| `lib/api-client.js` | `createGroup()` |
| `utils/matching.js` | Algoritmo de asignación (client-side) |
| `utils/validation.js` | Validación de forms |

### Proceso Detallado
1. Organizador llena formulario:
   - Nombre del grupo
   - Participantes (2-20, con nombre y email)
   - Rango de precio (min/max)
   - Fecha límite (deadline)
   - Restricciones opcionales

2. Validación client-side (`validation.js`):
   - Todos los participantes tienen nombre y email válido
   - Al menos 2 participantes
   - Deadline en el futuro
   - Precio mínimo < máximo

3. Matching algorithm genera asignaciones:
   ```javascript
   // utils/matching.js - Fisher-Yates shuffle + constraint satisfaction
   // Max 100 intentos para encontrar asignación válida
   // Restricciones: no self-assignment, no restricted pairs
   ```

4. API call con datos:
   ```javascript
   apiClient.createGroup({
     name: 'Navidad 2024',
     deadline: '2024-12-20T23:59:59',
     priceRange: { min: 10000, max: 20000, currency: 'CLP' },
     adminEmail: 'org@example.com',
     participants: [
       { id: 1, name: 'Alice', email: 'alice@example.com' },
       { id: 2, name: 'Bob', email: 'bob@example.com' },
       // IDs son temporales (client-side)
     ],
     restrictions: [{ participant1: 1, participant2: 2 }],
     matches: [[1, 2], [2, 3], [3, 1]]  // [giver, receiver]
   })
   ```

5. INSERT secuencial en Supabase:
   ```sql
   -- 1. Grupo
   INSERT INTO groups (name, deadline, event_date, price_min, price_max,
                       currency, admin_token, admin_email)
   VALUES (...) RETURNING *

   -- 2. Participantes
   INSERT INTO participants (group_id, name, email, access_token)
   VALUES (...) RETURNING *

   -- 3. ID Mapping (en memoria)
   -- { 1: 'uuid-abc', 2: 'uuid-def', ... }

   -- 4. Matches
   INSERT INTO matches (group_id, giver_id, receiver_id)
   VALUES (group_id, idMapping[giver], idMapping[receiver])

   -- 5. Restrictions
   INSERT INTO restrictions (group_id, participant1_id, participant2_id)
   VALUES (group_id, idMapping[p1], idMapping[p2])
   ```

6. Redirect a `/organizer/:groupId`

### Matching Algorithm Detail
```javascript
// utils/matching.js
function generateMatches(participants, restrictions) {
  for (let attempt = 0; attempt < 100; attempt++) {
    // Fisher-Yates shuffle
    const available = shuffle([...participantIds])

    let valid = true
    const matches = new Map()

    for (const giver of participantIds) {
      // Filter: not self, not restricted
      const validReceivers = available.filter(
        r => r !== giver && !hasRestriction(giver, r, restrictions)
      )

      if (validReceivers.length === 0) {
        valid = false
        break
      }

      const receiver = randomPick(validReceivers)
      matches.set(giver, receiver)
      available.splice(available.indexOf(receiver), 1)
    }

    if (valid) return matches
  }

  throw new Error('No valid assignment found')
}
```

---

## 3. Join Group Flow

```
/join/:joinCode → getGroupByJoinCode() → [Auth Check] → joinGroup()
    ↓
INSERT participant → Real-time broadcast → Otros ven "X se unió"
```

### Archivos Clave
| Archivo | Responsabilidad |
|---------|-----------------|
| `pages/JoinGroup.jsx` | Página de unirse (público) |
| `lib/api-client.js` | `getGroupByJoinCode()`, `joinGroup()` |
| `hooks/useRealtime.js` | Suscripciones en tiempo real |

### Proceso Detallado

#### 1. Carga de Datos Públicos
```javascript
// No requiere autenticación
const group = await apiClient.getGroupByJoinCode('ABC123')
// Returns: { ...group, participants, priceVotes, restrictions }
```

Query:
```sql
SELECT * FROM groups WHERE join_code = 'ABC123'
SELECT id, name, user_id, joined_at, kicked
  FROM participants WHERE group_id = ? AND kicked = false
SELECT min_price, max_price, user_id FROM price_votes WHERE group_id = ?
SELECT * FROM restrictions WHERE group_id = ?
```

#### 2. Setup Real-time
```javascript
useRealtimeGroup(groupId, initialData, {
  showToasts: true,
  onParticipantJoin: (p) => console.log('Joined:', p.name),
  onParticipantKick: (p) => console.log('Kicked:', p.name),
  onVoteChange: (v, type) => console.log('Vote:', type),
  onRestrictionChange: (r, type) => console.log('Restriction:', type)
})
```

#### 3. Auth Check
```javascript
const { user, isAuthenticated } = useAuth()
// Si no autenticado → mostrar botones de login
// Si autenticado → verificar membresía
```

#### 4. Verificar Membresía
```javascript
const myParticipant = await apiClient.getParticipantByUserId(groupId, userId)
// null = no es miembro
// { kicked: true } = expulsado
// { ...participant } = es miembro
```

#### 5. Unirse al Grupo
```javascript
await apiClient.joinGroup(groupId, userId, userName)
```

Validaciones en `joinGroup()`:
```javascript
// 1. Check if already member
const { data: existing } = await supabase
  .from('participants')
  .select('id, kicked')
  .eq('group_id', groupId)
  .eq('user_id', userId)
  .single()

if (existing?.kicked) throw new Error('Has sido expulsado')
if (existing) return { alreadyMember: true }

// 2. Check capacity
const { data: group } = await supabase
  .from('groups')
  .select('max_participants')
  .eq('id', groupId)
  .single()

const { count } = await supabase
  .from('participants')
  .select('id', { count: 'exact', head: true })
  .eq('group_id', groupId)
  .eq('kicked', false)

if (count >= group.max_participants) throw new Error('Grupo lleno')

// 3. Insert
INSERT INTO participants (group_id, user_id, name, joined_at)
VALUES (?, ?, ?, NOW())
```

#### 6. Real-time Broadcast
- WebSocket notifica a todos los suscritos
- Toast: "Alice se unió al grupo"
- Lista de participantes se actualiza

---

## 4. Voting Flow

```
PriceVoteCard (click) → voteForPriceRange() → UPSERT price_votes
    ↓
Realtime listener → setPriceVotes() → Re-render chart
```

### Archivos Clave
| Archivo | Responsabilidad |
|---------|-----------------|
| `components/participant/PriceVoteCard.jsx` | UI de votación |
| `lib/api-client.js` | `voteForPriceRange()`, `getUserVote()` |
| `utils/formatters.js` | `getWinningPriceRange()`, `formatPrice()` |

### Rangos Predefinidos (CLP)
```javascript
const PRICE_RANGES = [
  { min: 5000, max: 10000 },
  { min: 10000, max: 15000 },
  { min: 15000, max: 20000 },
  { min: 20000, max: 30000 },
  { min: 30000, max: 50000 }
]
```

### Proceso Detallado
1. Usuario click en rango de precio
2. `voteForPriceRange()` hace UPSERT:
   ```javascript
   await apiClient.voteForPriceRange(groupId, userId, minPrice, maxPrice)
   ```

3. Query UPSERT:
   ```sql
   INSERT INTO price_votes (group_id, user_id, min_price, max_price, updated_at)
   VALUES (?, ?, ?, ?, NOW())
   ON CONFLICT (group_id, user_id) DO UPDATE SET
     min_price = EXCLUDED.min_price,
     max_price = EXCLUDED.max_price,
     updated_at = NOW()
   ```

4. Real-time broadcast → `useRealtimeGroup` detecta cambio
5. UI actualiza chart con nuevos porcentajes

### Cálculo del Rango Ganador
```javascript
// utils/formatters.js
function getWinningPriceRange(votes) {
  // Agrupa votos por rango
  const rangeCounts = {}
  votes.forEach(v => {
    const key = `${v.min_price}-${v.max_price}`
    rangeCounts[key] = (rangeCounts[key] || 0) + 1
  })

  // Retorna el rango con más votos
  const winner = Object.entries(rangeCounts)
    .sort((a, b) => b[1] - a[1])[0]

  return { min: winner.min, max: winner.max }
}
```

---

## 5. Wishlist Flow

```
WishlistEditor → handleSave() → DELETE old + INSERT new wishlist_items
```

### Archivos Clave
| Archivo | Responsabilidad |
|---------|-----------------|
| `components/participant/WishlistEditor.jsx` | Editor UI |
| `lib/api-client.js` | `updateUserWishlist()` |

### Proceso Detallado
1. Usuario agrega/elimina items (máx 10)
2. Click "Guardar"
3. `updateUserWishlist()` ejecuta:
   ```javascript
   // 1. Delete existing
   await supabase
     .from('wishlist_items')
     .delete()
     .eq('participant_id', participantId)

   // 2. Insert new (if any)
   if (items.length > 0) {
     const data = items.map((item, index) => ({
       participant_id: participantId,
       item_text: item,
       item_order: index
     }))
     await supabase.from('wishlist_items').insert(data)
   }

   // 3. Update timestamp
   await supabase
     .from('participants')
     .update({ wishlist_updated_at: NOW() })
     .eq('id', participantId)
   ```

### Visibilidad Post-Sorteo (RLS)
```sql
-- El giver puede ver el wishlist de su receiver
SELECT wi.* FROM wishlist_items wi
JOIN matches m ON wi.participant_id = m.receiver_id
WHERE m.giver_id IN (
  SELECT id FROM participants WHERE user_id = auth.uid()
)
```

---

## 6. Restriction Flow

### Tipos de Restricciones

| Tipo | Creador | Campo | Puede Eliminar |
|------|---------|-------|----------------|
| Self-imposed | Participante | `is_self_imposed: true` | Solo el creador |
| Forced | Organizador | `forced_by_organizer: true` | Solo organizador |

### Archivos Clave
| Archivo | Responsabilidad |
|---------|-----------------|
| `components/participant/SelfRestrictionPicker.jsx` | Auto-restricciones |
| `components/organizer/RestrictionManager.jsx` | Restricciones forzadas |
| `lib/api-client.js` | `addSelfRestriction()`, `forceRestriction()`, `removeRestriction()` |

### Proceso Self-Restriction
```javascript
await apiClient.addSelfRestriction(groupId, userId, myParticipantId, targetParticipantId)
```

```sql
INSERT INTO restrictions (
  group_id, participant1_id, participant2_id,
  created_by, is_self_imposed, forced_by_organizer
) VALUES (?, myId, targetId, userId, TRUE, FALSE)
```

### Proceso Forced Restriction (Organizador)
```javascript
await apiClient.forceRestriction(groupId, organizerId, participant1Id, participant2Id)
```

Validaciones:
```javascript
// 1. Verify organizer
const { data: group } = await supabase
  .from('groups')
  .select('organizer_id')
  .eq('id', groupId)
  .single()

if (group.organizer_id !== organizerId) {
  throw new Error('Solo el organizador puede forzar restricciones')
}

// 2. Check duplicate
const { data: existing } = await supabase
  .from('restrictions')
  .select('id')
  .eq('group_id', groupId)
  .or(`and(participant1_id.eq.${p1},participant2_id.eq.${p2}),and(participant1_id.eq.${p2},participant2_id.eq.${p1})`)

if (existing) throw new Error('Restricción ya existe')

// 3. Insert
INSERT INTO restrictions (...) VALUES (...)
```

### Comportamiento Bidireccional
Las restricciones se almacenan una sola vez pero se verifican en ambas direcciones:
```javascript
function hasRestriction(p1, p2, restrictions) {
  return restrictions.some(r =>
    (r.participant1_id === p1 && r.participant2_id === p2) ||
    (r.participant1_id === p2 && r.participant2_id === p1)
  )
}
```

### Real-time Feedback
```javascript
// En useRealtimeGroup
.on('postgres_changes', { table: 'restrictions', filter: `group_id=eq.${groupId}` }, (payload) => {
  if (payload.eventType === 'INSERT') {
    setRestrictions(prev => [...prev, payload.new])
    if (payload.new.forced_by_organizer) {
      toast('Nueva restricción forzada', { icon: '⛔' })
    }
  }
  if (payload.eventType === 'DELETE') {
    setRestrictions(prev => prev.filter(r => r.id !== payload.old.id))
  }
})
```

---

## 7. Raffle Execution Flow

### Triggers
1. **Manual**: Organizador click "Realizar Sorteo" en dashboard
2. **Automático**: Cron `check-deadlines` (cada hora)

```
triggerRaffle() → Edge Function: execute-raffle
    ↓
Validate → Get participants + restrictions → Matching algorithm
    ↓
INSERT matches → UPDATE groups.raffled_at → Send emails
    ↓
Realtime broadcast → "¡El sorteo ha sido realizado!"
```

### Archivos Clave
| Archivo | Responsabilidad |
|---------|-----------------|
| `pages/OrganizerDashboard.jsx` | Botón de sorteo |
| `lib/api-client.js` | `triggerRaffle()` |
| `supabase/functions/execute-raffle/index.ts` | Edge function principal |
| `supabase/functions/check-deadlines/index.ts` | Cron job |

### Proceso Client-side (triggerRaffle)
```javascript
async triggerRaffle(groupId, organizerId) {
  // 1. Pre-validation
  const { data: group } = await supabase
    .from('groups')
    .select('*, participants(id, kicked)')
    .eq('id', groupId)
    .eq('organizer_id', organizerId)
    .single()

  if (!group) throw new Error('No encontrado o sin permisos')
  if (group.raffled_at) throw new Error('Ya sorteado')

  const active = group.participants.filter(p => !p.kicked)
  if (active.length < 3) throw new Error('Mínimo 3 participantes')

  // 2. Call Edge Function
  const response = await fetch(`${supabaseUrl}/functions/v1/execute-raffle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`
    },
    body: JSON.stringify({
      group_id: groupId,
      organizer_id: organizerId,
      send_emails: true
    })
  })

  return await response.json()
}
```

### Proceso Edge Function (execute-raffle)
```typescript
// 1. Initialize Supabase with SERVICE_ROLE (bypasses RLS)
const supabase = createClient(url, SERVICE_ROLE_KEY)

// 2. Validate group
const { data: group } = await supabase
  .from('groups')
  .select('*')
  .eq('id', group_id)
  .single()

if (group.raffled_at) throw new Error('Already raffled')
if (organizer_id && group.organizer_id !== organizer_id) {
  throw new Error('Only organizer can trigger')
}

// 3. Get participants
const { data: participants } = await supabase
  .from('participants')
  .select('id, name, user_id, users(email, name)')
  .eq('group_id', group_id)
  .eq('kicked', false)

if (participants.length < 3) throw new Error('Min 3 required')

// 4. Get restrictions
const { data: restrictions } = await supabase
  .from('restrictions')
  .select('participant1_id, participant2_id')
  .eq('group_id', group_id)

// 5. Generate matches (same algorithm as client)
const matches = generateMatches(participants, restrictions)

// 6. Save matches
const matchesData = Array.from(matches.entries()).map(([giver, receiver]) => ({
  group_id, giver_id: giver, receiver_id: receiver
}))
await supabase.from('matches').insert(matchesData)

// 7. Mark as raffled
await supabase
  .from('groups')
  .update({ raffled_at: new Date().toISOString() })
  .eq('id', group_id)

// 8. Send emails (if configured)
if (send_emails && RESEND_API_KEY) {
  for (const [giverId, receiverId] of matches) {
    // Get giver email, receiver name, receiver wishlist
    // Send via Resend API
  }
}

return { success: true, matches_count: matches.size, emails: { sent, failed } }
```

### Email Template
```html
<!-- Enviado via Resend API -->
Subject: 🎁 {groupName} - ¡Ya salió el sorteo!

Body:
- Header verde con "🎁 ¡Sorteo Realizado!"
- Saludo: "¡Hola {giverName}!"
- Match card con gradiente rojo→verde: "Te tocó: {receiverName}"
- Wishlist del receiver (si tiene)
- Presupuesto: $10.000 - $20.000
- Fecha del evento: domingo, 24 de diciembre
- Footer con link a quienteto.ca
```

### Cron Job (check-deadlines)
```typescript
// Ejecuta cada hora
// Busca grupos donde:
// - deadline <= NOW()
// - raffled_at IS NULL
// - >= 3 participantes activos

// Para cada grupo elegible:
await fetch(`${url}/functions/v1/execute-raffle`, {
  body: JSON.stringify({ group_id, send_emails: true })
})
```

---

## 8. Real-time Architecture

### Hook Principal
```javascript
// hooks/useRealtime.js
const {
  participants,   // Array actualizado en tiempo real
  priceVotes,     // Array actualizado en tiempo real
  restrictions,   // Array actualizado en tiempo real
  isRaffled,      // Boolean
  refresh         // Manual refresh function
} = useRealtimeGroup(groupId, initialData, {
  showToasts: true,
  onParticipantJoin,
  onParticipantKick,
  onVoteChange,
  onRestrictionChange
})
```

### Suscripciones

| Tabla | Evento | Acción |
|-------|--------|--------|
| `participants` | INSERT | Agregar a lista, toast "X se unió" |
| `participants` | UPDATE | Detectar kick, actualizar datos |
| `participants` | DELETE | Remover de lista |
| `price_votes` | INSERT | Agregar voto, actualizar chart |
| `price_votes` | UPDATE | Actualizar voto existente |
| `price_votes` | DELETE | Remover voto |
| `restrictions` | INSERT | Agregar restricción, toast si forzada |
| `restrictions` | DELETE | Remover de lista |
| `groups` | UPDATE | Detectar `raffled_at`, mostrar resultado |

### Implementación de Canal
```javascript
const channel = supabase
  .channel(`group:${groupId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'participants',
    filter: `group_id=eq.${groupId}`
  }, handleParticipantChange)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'price_votes',
    filter: `group_id=eq.${groupId}`
  }, handleVoteChange)
  // ... más listeners
  .subscribe()
```

### Patrón Callback Refs
```javascript
// Evita re-suscripciones cuando callbacks cambian
const callbackRefs = useRef({ onParticipantJoin, onVoteChange, ... })

useEffect(() => {
  callbackRefs.current = { onParticipantJoin, onVoteChange, ... }
}, [onParticipantJoin, onVoteChange, ...])

// En handler:
callbackRefs.current.onParticipantJoin?.(data)
```

### Hooks Adicionales
```javascript
// Contador de participantes (lightweight)
const count = useRealtimeParticipantCount(groupId, initialCount)

// Detectar si fui expulsado
const isKicked = useRealtimeMembership(groupId, participantId)
// Muestra toast "Has sido expulsado del grupo" si kicked=true
```

### Fallback Manual
```javascript
const { refresh } = useRealtimeGroup(groupId, data)
// Llamar refresh() si real-time parece desconectado
await refresh() // Re-fetch all data from DB
```

---

## 9. Post-Raffle: Match Reveal

```
MatchReveal → getMyMatch() → Display receiver + wishlist
```

### Archivos Clave
| Archivo | Responsabilidad |
|---------|-----------------|
| `components/participant/MatchReveal.jsx` | UI de revelación |
| `lib/api-client.js` | `getMyMatch()`, `getGroupForParticipant()` |

### Query
```javascript
async getMyMatch(groupId, participantId) {
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id,
      receiver:participants!matches_receiver_id_fkey (
        id, name, user_id,
        users (name, avatar_url),
        wishlist_items (item_text, item_order)
      )
    `)
    .eq('group_id', groupId)
    .eq('giver_id', participantId)
    .single()

  return match?.receiver || null
}
```

### Display
```
┌──────────────────────────────────┐
│  🎁 ¡Tu amigo secreto es...      │
│  ┌────────────────────────────┐  │
│  │     [Avatar]               │  │
│  │     María García           │  │
│  └────────────────────────────┘  │
│                                  │
│  Su Wishlist:                    │
│  • Libro de cocina               │
│  • Set de velas aromáticas       │
│  • Gift card de Spotify          │
│                                  │
│  Presupuesto: $15.000 - $20.000  │
│  Fecha: 24 de diciembre          │
│  Faltan 12 días                  │
└──────────────────────────────────┘
```

---

## 10. Database Schema

### Diagrama de Relaciones

```
auth.users (Supabase native)
    │
    ▼ (1:1, sync on login)
users ─────────────────────────────────────────────┐
    │                                              │
    ▼ (1:N organizer)                              │
groups ◄───────────────────────────────────────────┤
    │                                              │
    ├──▶ participants (1:N group_id) ◄─────────────┤ (1:N user_id)
    │        │                                     │
    │        ├──▶ wishlist_items (1:N participant_id)
    │        │
    │        ├──▶ matches (giver_id, receiver_id)
    │        │
    │        └──▶ restrictions (participant1_id, participant2_id)
    │
    └──▶ price_votes (1:N group_id) ◄──────────────┘ (1:N user_id)
```

### Tablas Principales

```sql
-- Usuarios (sync desde auth.users)
users (
  id UUID PRIMARY KEY,          -- Same as auth.users.id
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Grupos
groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  join_code TEXT UNIQUE,        -- 6 chars, auto-generated
  deadline TIMESTAMP NOT NULL,
  event_date TIMESTAMP,
  price_min DECIMAL,
  price_max DECIMAL,
  currency TEXT DEFAULT 'CLP',
  max_participants INT DEFAULT 20,
  admin_token UUID,             -- Legacy
  admin_email TEXT,             -- Legacy
  raffled_at TIMESTAMP,         -- NULL = not raffled
  created_at TIMESTAMP DEFAULT NOW()
)

-- Participantes
participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),  -- NULL until joined
  name TEXT NOT NULL,
  email TEXT,                   -- From creation (pre-auth)
  access_token UUID,            -- Legacy
  kicked BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP,
  wishlist_updated_at TIMESTAMP,
  has_viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
)

-- Matches (post-raffle)
matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  giver_id UUID REFERENCES participants(id),
  receiver_id UUID REFERENCES participants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (giver_id != receiver_id),
  UNIQUE(giver_id)              -- One receiver per giver
)

-- Restricciones
restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  participant1_id UUID REFERENCES participants(id),
  participant2_id UUID REFERENCES participants(id),
  created_by UUID REFERENCES users(id),
  is_self_imposed BOOLEAN DEFAULT FALSE,
  forced_by_organizer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (participant1_id != participant2_id)
)

-- Wishlist Items
wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  item_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Votos de Precio
price_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  min_price DECIMAL NOT NULL,
  max_price DECIMAL NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
)
```

### Constraints Clave
- `UNIQUE(group_id, user_id)` en participants → Un usuario por grupo
- `UNIQUE(group_id, user_id)` en price_votes → Un voto por usuario por grupo
- `UNIQUE(giver_id)` en matches → Cada giver tiene un solo receiver
- `giver_id != receiver_id` en matches → No self-assignment
- `participant1_id != participant2_id` en restrictions

---

## 11. Diagrama de Estado por Usuario

```
[No autenticado]
    │
    │ (Login OAuth)
    ▼
[Autenticado, sin grupo]
    │
    ├──────────────────────────────┬─────────────────────────────┐
    │ (Crea grupo)                 │ (Visita /join/:code)        │
    ▼                              ▼                             │
[Organizador]                 [En grupo, pre-sorteo]            │
    │                              │                             │
    │                              ├── Vota presupuesto          │
    │                              ├── Agrega wishlist           │
    │                              ├── Configura restricciones   │
    │                              │                             │
    ▼                              ▼                             │
[Gestiona grupo]              [Esperando deadline]               │
    │                              │                             │
    │ (Trigger sorteo)             │ (Deadline pasa)             │
    ▼                              ▼                             │
    └─────────────► [Post-sorteo] ◄──────────────────────────────┘
                         │
                         ▼
                   [Ve match + wishlist]
```

---

## 12. API Client - Referencia Completa

### Métodos Disponibles

#### Groups
| Método | Descripción |
|--------|-------------|
| `createGroup(data)` | Crear grupo con participantes, matches, restricciones |
| `getGroup(groupId, adminToken)` | Obtener grupo (legacy admin mode) |
| `getGroupByJoinCode(code)` | Obtener grupo público por código |
| `getGroupForOrganizer(groupId, organizerId)` | Datos completos para organizador |
| `getGroupForParticipant(groupId, userId)` | Datos para participante post-raffle |
| `updateGroup(groupId, updates)` | Actualizar campos del grupo |
| `getUserGroups(userId)` | Grupos como organizador y participante |

#### Participants
| Método | Descripción |
|--------|-------------|
| `getParticipant(participantId)` | Participante con match y wishlist |
| `getParticipantByUserId(groupId, userId)` | Buscar por auth user |
| `updateParticipant(participantId, updates)` | Actualizar datos |
| `joinGroup(groupId, userId, userName)` | Unirse a grupo |
| `kickParticipant(groupId, participantId, organizerId)` | Expulsar (org only) |

#### Voting & Wishlist
| Método | Descripción |
|--------|-------------|
| `voteForPriceRange(groupId, userId, min, max)` | Votar/cambiar voto |
| `getUserVote(groupId, userId)` | Obtener voto actual |
| `updateUserWishlist(participantId, items)` | Guardar wishlist |

#### Restrictions
| Método | Descripción |
|--------|-------------|
| `addSelfRestriction(groupId, userId, myId, targetId)` | Auto-restricción |
| `removeSelfRestriction(restrictionId, userId)` | Quitar auto-restricción |
| `forceRestriction(groupId, organizerId, p1Id, p2Id)` | Forzar (org only) |
| `removeRestriction(groupId, restrictionId, organizerId)` | Quitar (org only) |

#### Raffle
| Método | Descripción |
|--------|-------------|
| `triggerRaffle(groupId, organizerId)` | Ejecutar sorteo manual |
| `getMyMatch(groupId, participantId)` | Obtener match post-raffle |

#### Utility
| Método | Descripción |
|--------|-------------|
| `generateToken()` | UUID v4 criptográficamente seguro |
| `healthCheck()` | Verificar conexión a Supabase |

---

## 13. Decisiones Técnicas

| Decisión | Razón | Trade-off |
|----------|-------|-----------|
| Matching client + server | Disponible en ambos contextos | Código duplicado (aceptable) |
| UPSERT para votos | Un query, permite cambiar voto | Menos control de respuesta |
| Soft delete (kicked) | Preserva integridad referencial | Queries más complejos (`kicked=false`) |
| Real-time agresivo | UX fluida sin polling | WebSocket siempre activo |
| OAuth-only | Sin passwords, UX simple | Requiere cuenta Google/MS |
| Edge Functions | Server-side raffle con service role | Cold start ~200ms |
| Resend para emails | Simple, rate limits generosos | Dependencia externa |

---

## 14. RLS (Row Level Security) Summary

### Groups
- Lectura: Todos los autenticados
- Escritura: Solo organizador

### Participants
- Lectura: Miembros del grupo
- Insert: Usuarios autenticados (join)
- Update/Delete: Organizador del grupo

### Matches
- Lectura: Giver ve su match, Organizador ve todos
- Insert/Update/Delete: Solo service role (Edge Function)

### Wishlist Items
- Lectura: Owner, Giver (post-raffle), Organizador
- CRUD: Solo owner

### Restrictions
- Lectura: Miembros del grupo
- Insert: Owner (self) o Organizador (forced)
- Delete: Creador (self) o Organizador

### Price Votes
- Lectura: Miembros del grupo
- CRUD: Solo owner

---

## 15. Archivos de Referencia Rápida

### Por Flujo
| Flujo | Archivo Principal | Archivo Secundario |
|-------|-------------------|-------------------|
| Auth | `AuthProvider.jsx` | `lib/auth.js` |
| Create Group | `CreateGroupForm.jsx` | `utils/matching.js` |
| Join Group | `JoinGroup.jsx` | `api-client.js` |
| Voting | `PriceVoteCard.jsx` | `formatters.js` |
| Wishlist | `WishlistEditor.jsx` | `api-client.js` |
| Restrictions | `SelfRestrictionPicker.jsx` | `RestrictionManager.jsx` |
| Raffle | `execute-raffle/index.ts` | `check-deadlines/index.ts` |
| Real-time | `useRealtime.js` | `supabase.js` |
| API | `api-client.js` | `config.js` |

### Por Componente UI
| Componente | Ubicación |
|------------|-----------|
| Login buttons | `components/auth/LoginButton.jsx` |
| Group form | `components/forms/CreateGroupForm.jsx` |
| Share link | `components/organizer/ShareLinkCard.jsx` |
| Participant list | `components/organizer/ParticipantManager.jsx` |
| Vote card | `components/participant/PriceVoteCard.jsx` |
| Wishlist editor | `components/participant/WishlistEditor.jsx` |
| Match reveal | `components/participant/MatchReveal.jsx` |
| Price chart | `components/ui/PriceRangePieChart.jsx` |

---

**Última actualización**: Nov 25, 2025
