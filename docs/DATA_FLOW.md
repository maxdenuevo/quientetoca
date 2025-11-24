# Data Flow End-to-End - quiéntetoca

**Documento técnico del flujo de información**

---

## Arquitectura General

```
Usuario → React App → api-client.js → Supabase → PostgreSQL
                          ↑                 ↓
                    useRealtime.js ← Supabase Realtime (WebSocket)
```

### Stack
- **Frontend**: React 18 + Vite + Tailwind
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Auth**: Google/Microsoft OAuth
- **Real-time**: Supabase Realtime (WebSocket)

---

## 1. Authentication Flow

```
LoginButton → OAuth (Google/MS) → /auth/callback → AuthProvider → syncUserToDatabase()
```

### Archivos Clave
- `components/auth/LoginButton.jsx` - Botones OAuth
- `components/auth/AuthProvider.jsx` - Context + session management
- `lib/auth.js` - Funciones OAuth
- `pages/AuthCallback.jsx` - Maneja redirect

### Proceso
1. Usuario click "Iniciar con Google/Microsoft"
2. `signInWithOAuth()` redirige al provider
3. Provider autentica y redirige a `/auth/callback`
4. Supabase intercambia código por sesión
5. `onAuthStateChange()` detecta nueva sesión
6. `syncUserToDatabase()` hace UPSERT en tabla `users`
7. Context propaga `user`, `session`, `isAuthenticated`

### Logout
```javascript
supabase.auth.signOut() → setUser(null) → setSession(null)
```

---

## 2. Group Creation Flow

```
CreateGroupForm → validación local → matching algorithm → api-client.createGroup()
    ↓
INSERT groups → INSERT participants → ID mapping → INSERT matches → INSERT restrictions
```

### Archivos Clave
- `components/forms/CreateGroupForm.jsx` - Form UI
- `lib/api-client.js` - `createGroup()`
- `utils/matching.js` - Algoritmo de asignación
- `utils/validation.js` - Validación de forms

### Proceso
1. Organizador llena formulario (nombre, participantes, precio, deadline, restricciones)
2. Validación client-side
3. Matching algorithm genera asignaciones (Fisher-Yates shuffle)
4. API call con datos:
   ```javascript
   {
     name, deadline, priceRange, adminEmail,
     participants: [{ id: 1, name, email }, ...],  // IDs temporales
     restrictions: [{ participant1: 1, participant2: 2 }],
     matches: [[1, 2], [2, 3], ...]  // [giver, receiver]
   }
   ```
5. INSERT secuencial: groups → participants → matches → restrictions
6. ID mapping: IDs temporales (1, 2, 3) → UUIDs de BD
7. Redirect a `/organizer/:groupId`

### Matching Algorithm
```javascript
// utils/matching.js
// Fisher-Yates shuffle + constraint satisfaction
// Max 100 intentos para encontrar asignación válida
// Restricciones: no self, no restricted pairs
```

---

## 3. Join Group Flow

```
/join/:joinCode → getGroupByJoinCode() → [Auth Check] → joinGroup()
    ↓
INSERT participant → Real-time broadcast → Otros ven "X se unió"
```

### Archivos Clave
- `pages/JoinGroup.jsx` - Página de unirse
- `lib/api-client.js` - `getGroupByJoinCode()`, `joinGroup()`
- `hooks/useRealtime.js` - Suscripciones

### Proceso
1. Usuario visita `/join/ABC123`
2. Query público obtiene datos del grupo
3. Si no autenticado → mostrar botones de login
4. Si autenticado → verificar si ya es miembro
5. Click "Unirse" → INSERT en `participants`
6. Real-time broadcast a todos los suscritos
7. Toast: "Alice se unió al grupo"

### Verificaciones
- Usuario no está ya en el grupo
- Usuario no fue expulsado (`kicked = false`)
- Grupo no está lleno (< max_participants)

---

## 4. Voting Flow

```
PriceVoteCard (click) → voteForPriceRange() → UPSERT price_votes
    ↓
Realtime listener → setPriceVotes() → Re-render chart
```

### Archivos Clave
- `components/participant/PriceVoteCard.jsx` - UI de votación
- `lib/api-client.js` - `voteForPriceRange()`
- `utils/formatters.js` - `getWinningPriceRange()`

### Rangos Predefinidos (CLP)
- $5,000 - $10,000
- $10,000 - $15,000
- $15,000 - $20,000
- $20,000 - $30,000
- $30,000 - $50,000

### Proceso
1. Usuario click en rango de precio
2. UPSERT en `price_votes` (permite cambiar voto)
3. Real-time broadcast
4. Todos ven actualización en chart
5. `getWinningPriceRange()` calcula promedio de votos

### Query UPSERT
```sql
INSERT INTO price_votes (group_id, user_id, min_price, max_price)
VALUES (...)
ON CONFLICT (group_id, user_id) DO UPDATE SET
  min_price = EXCLUDED.min_price,
  max_price = EXCLUDED.max_price
```

---

## 5. Wishlist Flow

```
WishlistEditor → handleSave() → DELETE old + INSERT new wishlist_items
```

### Archivos Clave
- `components/participant/WishlistEditor.jsx` - Editor UI
- `lib/api-client.js` - `updateUserWishlist()`

### Proceso
1. Usuario agrega/elimina items (máx 10)
2. Click "Guardar"
3. DELETE todos los items existentes
4. INSERT nuevos items con `item_order`
5. UPDATE `participants.wishlist_updated_at`

### Visibilidad Post-Sorteo
```sql
SELECT receiver.wishlist_items
FROM matches
JOIN participants AS receiver ON matches.receiver_id = receiver.id
WHERE matches.giver_id = :myParticipantId
```

---

## 6. Restriction Flow

### Tipos de Restricciones

| Tipo | Creador | Campo | Remoción |
|------|---------|-------|----------|
| Self-imposed | Participante | `is_self_imposed: true` | Solo creador |
| Forced | Organizador | `forced_by_organizer: true` | Solo organizador |

### Archivos Clave
- `components/participant/SelfRestrictionPicker.jsx` - Auto-restricciones
- `components/organizer/RestrictionManager.jsx` - Restricciones forzadas
- `lib/api-client.js` - `addSelfRestriction()`, `forceRestriction()`

### Proceso Self-Restriction
1. Participante selecciona "No quiero regalarle a X"
2. INSERT en `restrictions` con `is_self_imposed: true`
3. Real-time broadcast
4. Visible para todos (transparencia)

### Proceso Forced Restriction
1. Organizador marca pareja/familia
2. INSERT bidireccional (A→B y B→A)
3. Toast: "Nueva restricción forzada"

---

## 7. Raffle Execution Flow

### Triggers
1. **Manual**: Organizador click "Realizar Sorteo"
2. **Automático**: Cron `check-deadlines` (cada hora)

```
Edge Function: execute-raffle
    ↓
Get participants + restrictions → Matching algorithm
    ↓
INSERT matches → UPDATE groups.raffled_at → Send emails
    ↓
Realtime broadcast → "¡El sorteo ha sido realizado!"
```

### Archivos Clave
- `pages/OrganizerDashboard.jsx` - Botón de sorteo
- `lib/api-client.js` - `triggerRaffle()`
- `supabase/functions/execute-raffle/index.ts` - Edge function
- `supabase/functions/check-deadlines/index.ts` - Cron job

### Proceso Edge Function
1. Verificar organizador y estado del grupo
2. Obtener participantes activos (`kicked = false`)
3. Obtener restricciones
4. Ejecutar matching algorithm (max 100 intentos)
5. INSERT matches
6. UPDATE `groups.raffled_at = NOW()`
7. Enviar emails via Resend API
8. Real-time broadcast

### Validaciones
- Grupo no sorteado (`raffled_at IS NULL`)
- Mínimo 3 participantes activos
- Solo organizador puede trigger manual

---

## 8. Real-time Architecture

### Hook Principal
```javascript
// hooks/useRealtime.js
useRealtimeGroup(groupId, initialData, options)
```

### Suscripciones

| Tabla | Eventos | Acción |
|-------|---------|--------|
| `participants` | INSERT | Agregar a lista, toast "X se unió" |
| `participants` | UPDATE | Detectar kick, actualizar datos |
| `participants` | DELETE | Remover de lista |
| `price_votes` | INSERT/UPDATE | Actualizar chart de votos |
| `restrictions` | INSERT | Agregar restricción, toast si forzada |
| `restrictions` | DELETE | Remover de lista |
| `groups` | UPDATE | Detectar `raffled_at`, mostrar resultado |

### Patrón Callback Refs
```javascript
// Evita re-suscripciones cuando callbacks cambian
const callbackRefs = useRef({ onParticipantJoin, onVoteChange, ... })
useEffect(() => {
  callbackRefs.current = { onParticipantJoin, onVoteChange, ... }
}, [callbacks])

// En listener: callbackRefs.current.onParticipantJoin?.(data)
```

### Fallback Manual
```javascript
const { refresh } = useRealtimeGroup(groupId, data)
// Llamar refresh() si real-time falla
```

---

## 9. Post-Raffle: Match Reveal

```
MatchReveal → getMyMatch() → Display receiver + wishlist
```

### Archivos Clave
- `components/participant/MatchReveal.jsx` - UI de revelación
- `lib/api-client.js` - `getMyMatch()`

### Query
```sql
SELECT
  receiver:participants (
    id, name,
    users (name, avatar_url),
    wishlist_items (item_text, item_order)
  )
FROM matches
WHERE group_id = :groupId AND giver_id = :myParticipantId
```

---

## 10. Database Schema

### Tablas Principales

```
users (id, email, name, avatar_url)
    ↓
groups (id, organizer_id, join_code, deadline, price_min/max, raffled_at)
    ↓
participants (id, group_id, user_id, name, kicked, wishlist_updated_at)
    ↓
├── matches (id, group_id, giver_id, receiver_id)
├── wishlist_items (id, participant_id, item_text, item_order)
├── restrictions (id, group_id, participant1_id, participant2_id, is_self_imposed, forced_by_organizer)
└── price_votes (id, group_id, user_id, min_price, max_price)
```

### Constraints Clave
- `UNIQUE(group_id, user_id)` en participants
- `UNIQUE(giver_id)` en matches
- `giver_id ≠ receiver_id` en matches
- `participant1_id ≠ participant2_id` en restrictions

---

## 11. Diagrama de Estado por Usuario

```
[No autenticado]
    ↓ (Login OAuth)
[Autenticado, sin grupo]
    ↓ (Crea grupo)           ↓ (Visita /join/:code)
[Organizador]              [En grupo, pre-sorteo]
    ↓                           ↓
[Gestiona grupo]           [Vota, wishlist, restricciones]
    ↓                           ↓
[Trigger sorteo]           [Esperando deadline]
    ↓                           ↓
    └──────────────────────────→
                ↓
        [Post-sorteo]
                ↓
        [Ve match + wishlist]
```

---

## 12. Decisiones Técnicas

| Decisión | Razón | Trade-off |
|----------|-------|-----------|
| Matching client-side | <20ms para 20 participantes | Código visible (aceptable) |
| UPSERT para votos | Un query, permite cambiar | Menos control de respuesta |
| Soft delete (kicked) | Preserva integridad referencial | Queries más complejos |
| Real-time agresivo | UX fluida, sin polling | WebSocket siempre activo |
| OAuth-only | Sin passwords, UX simple | Requiere cuenta Google/MS |

---

## 13. Archivos de Referencia Rápida

### Flujo de Datos
| Flujo | Archivo Principal |
|-------|-------------------|
| Auth | `components/auth/AuthProvider.jsx` |
| Create Group | `components/forms/CreateGroupForm.jsx` |
| Join Group | `pages/JoinGroup.jsx` |
| Voting | `components/participant/PriceVoteCard.jsx` |
| Wishlist | `components/participant/WishlistEditor.jsx` |
| Restrictions | `components/participant/SelfRestrictionPicker.jsx` |
| Raffle | `supabase/functions/execute-raffle/index.ts` |
| Real-time | `hooks/useRealtime.js` |
| API | `lib/api-client.js` |

---

**Última actualización**: Nov 23, 2025
