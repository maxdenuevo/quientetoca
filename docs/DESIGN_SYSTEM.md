# Sistema de Diseño - quiéntetoca

**Última actualización**: Nov 23, 2025
**Estado**: v1.1 - Nueva dirección visual

---

## 1. Principios de Diseño

### Personalidad de Marca

**Cálido invernal** - Como reunirse con amigos en una tarde fría. Acogedor, confiable, sin pretensiones.

| Principio | Sí | No |
|-----------|----|----|
| **Cálido** | Colores tierra, sensación hogareña | Navideño cliché, rojo/verde saturados |
| **Cercano** | Lenguaje natural, sin formalidades | Caricaturesco, chilenismos forzados |
| **Simple** | Interfaces limpias, acciones claras | Decoración innecesaria, animaciones excesivas |
| **Sólido** | Colores planos, fondos uniformes | Gradientes, degradados, efectos de brillo |

### Valores UX

1. **Claridad** - Cada elemento tiene propósito
2. **Confianza** - El usuario siempre sabe qué está pasando
3. **Calidez** - Celebrar los momentos de conexión

---

## 2. User Journey Map

### Etapas y Estados Emocionales

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  LANDING    │───▶│   CREAR     │───▶│  COMPARTIR  │───▶│  PARTICIPAR │
│             │    │   GRUPO     │    │    LINK     │    │             │
│ Curiosidad  │    │ Anticipación│    │  Emoción    │    │ Colaboración│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   REVEAL    │◀───│   ESPERA    │◀───│   UNIRSE    │
                   │             │    │             │    │             │
                   │ Celebración │    │ Anticipación│    │ Bienvenida  │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

### Detalle por Etapa

#### 1. Landing (`/`)
**Emoción**: Curiosidad → Decisión
**Objetivo**: Entender qué es y crear grupo

| Elemento | Propósito |
|----------|-----------|
| Hero con CTA | Acción inmediata |
| Features | Resolver dudas |
| Testimonios | Generar confianza |

#### 2. Crear Grupo (`/create`)
**Emoción**: Anticipación → Logro
**Objetivo**: Configurar grupo rápido

| Elemento | Propósito |
|----------|-----------|
| Formulario por secciones | No abrumar |
| Validación inline | Feedback inmediato |
| Sensación de progreso | Motivar completar |

#### 3. Compartir Link
**Emoción**: Entusiasmo → Acción
**Objetivo**: Invitar participantes

| Elemento | Propósito |
|----------|-----------|
| Código grande visible | Fácil de dictar |
| WhatsApp share | Acción más común |
| QR code | Alternativa presencial |

#### 4. Unirse al Grupo (`/join/:code`)
**Emoción**: Curiosidad → Bienvenida
**Objetivo**: Login + orientarse

| Elemento | Propósito |
|----------|-----------|
| OAuth buttons | Login sin fricción |
| Mensaje de bienvenida | Orientar al nuevo |
| Acciones claras | Qué hacer primero |

#### 5. Participar
**Emoción**: Colaboración → Compromiso
**Objetivo**: Votar + wishlist + restricciones

| Sub-etapa | Emoción | Componente |
|-----------|---------|------------|
| Votar precio | Participación | `PriceVoteCard` |
| Agregar wishlist | Anticipación | `WishlistEditor` |
| Restricciones | Control | `SelfRestrictionPicker` |

#### 6. Espera (Pre-sorteo)
**Emoción**: Anticipación
**Objetivo**: Mantener engagement

| Elemento | Propósito |
|----------|-----------|
| Countdown | Crear expectativa |
| Estado del grupo | Ver quién falta |

#### 7. Reveal (`post-raffle`)
**Emoción**: Sorpresa → Alegría
**Objetivo**: Momento memorable

| Elemento | Propósito |
|----------|-----------|
| Revelación con pausa | Crear suspenso |
| Card del match | Información clara |
| Wishlist visible | Ayuda práctica |

---

## 3. Paleta de Colores

### Nueva Dirección: Cálido Invernal

Alejándonos de los colores navideños cliché hacia una paleta más sofisticada y atemporal.

#### Colores Primarios

| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Terracota** | `#C4704A` | 196, 112, 74 | CTAs, acentos principales |
| **Terracota Hover** | `#A85D3B` | 168, 93, 59 | Estados hover |
| **Arena** | `#E8DFD0` | 232, 223, 208 | Fondos, superficies |
| **Carbón** | `#2D2D2D` | 45, 45, 45 | Texto principal |
| **Marfil** | `#FAF7F2` | 250, 247, 242 | Fondo base |

#### Colores Secundarios

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Oliva** | `#7D8471` | Éxito, confirmaciones |
| **Arcilla** | `#B8860B` | Warnings, atención |
| **Burdeos** | `#722F37` | Errores, peligro |
| **Piedra** | `#8B8680` | Texto secundario |

#### Colores de Estado (Semánticos)

| Estado | Color | Fondo | Texto |
|--------|-------|-------|-------|
| Success | Oliva | `#7D8471/10` | `#5C6352` |
| Warning | Arcilla | `#B8860B/10` | `#8B6508` |
| Error | Burdeos | `#722F37/10` | `#5C252C` |
| Info | Piedra | `#8B8680/10` | `#6B6560` |

#### Tailwind Config (Propuesta)

```js
colors: {
  brand: {
    terracota: '#C4704A',
    'terracota-dark': '#A85D3B',
    arena: '#E8DFD0',
    carbon: '#2D2D2D',
    marfil: '#FAF7F2',
  },
  accent: {
    oliva: '#7D8471',
    arcilla: '#B8860B',
    burdeos: '#722F37',
    piedra: '#8B8680',
  }
}
```

### Dark Mode

El dark mode usa un fondo más oscuro que `carbon` para crear mejor contraste con las cards.

#### Colores Dark Mode

| Token | Hex | Uso |
|-------|-----|-----|
| `dark.bg` | `#1A1A1A` | Fondo principal |
| `dark.surface` | `#2A2A2A` | Cards, modals |
| `dark.surfaceHover` | `#333333` | Hover en surfaces |
| `dark.border` | `#404040` | Bordes |
| `dark.textPrimary` | `#F5F5F5` | Texto principal |
| `dark.textSecondary` | `#A0A0A0` | Texto secundario |

#### Colores Semánticos Ajustados (más brillantes para dark)

| Color | Light | Dark |
|-------|-------|------|
| Terracota | `#C4704A` | `#D4896A` |
| Oliva | `#7D8471` | `#9AAB8C` |
| Arcilla | `#B8860B` | `#D4A82E` |
| Burdeos | `#722F37` | `#A34450` |

#### Mapeo Completo

| Elemento | Light | Dark |
|----------|-------|------|
| Background | `marfil` (#FAF7F2) | `dark.bg` (#1A1A1A) |
| Surface (cards) | `marfil` (#FAF7F2) | `dark.surface` (#2A2A2A) |
| Text Primary | `carbon` (#2D2D2D) | `dark.textPrimary` (#F5F5F5) |
| Text Secondary | `piedra` (#8B8680) | `dark.textSecondary` (#A0A0A0) |
| Border | `arena` (#E8DFD0) | `dark.border` (#404040) |
| Accent | `terracota` | `terracota-light` |

---

## 4. Estilo Visual: Soft UI

### Características

Reemplazando el neobrutalism por un estilo más suave y acogedor:

| Aspecto | Antes (Brutal) | Ahora (Soft) |
|---------|----------------|--------------|
| Bordes | `border-2 border-black` | `border border-arena` |
| Sombras | `shadow-brutal` (offset) | `shadow-soft` (difusa) |
| Radios | `rounded-brutal` (4px) | `rounded-xl` (12px) |
| Contraste | Alto, duro | Medio, suave |

### Sombras

```js
boxShadow: {
  'soft-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'soft': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
  'soft-md': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
  'soft-lg': '0 8px 24px 0 rgb(0 0 0 / 0.12)',
}
```

### Bordes

```js
borderRadius: {
  'soft': '8px',
  'soft-lg': '12px',
  'soft-xl': '16px',
}
```

### Ejemplos de Aplicación

```jsx
// Card - Antes
<div className="bg-white border-2 border-black rounded-brutal shadow-brutal" />

// Card - Ahora
<div className="bg-arena border border-arena/50 rounded-xl shadow-soft" />

// Button - Antes
<button className="bg-christmas-red border-2 border-black rounded-brutal shadow-brutal
  hover:shadow-brutal-lg hover:translate-x-[2px]" />

// Button - Ahora
<button className="bg-terracota text-marfil rounded-xl shadow-soft
  hover:bg-terracota-dark hover:shadow-soft-md transition-all" />

// Input - Antes
<input className="border-2 border-black rounded-brutal" />

// Input - Ahora
<input className="border border-arena rounded-lg bg-marfil
  focus:border-terracota focus:ring-2 focus:ring-terracota/20" />
```

---

## 5. Tipografía

### Font Family

```css
/* Principal - Más cálida que Space Grotesk */
font-family: 'DM Sans', 'Inter', system-ui, sans-serif;

/* Alternativa: más personalidad */
font-family: 'Nunito', 'Inter', system-ui, sans-serif;
```

### Escala

| Nivel | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| Display | `text-4xl` / `text-5xl` | `font-bold` | Hero, landing |
| H1 | `text-3xl` | `font-bold` | Títulos de página |
| H2 | `text-2xl` | `font-semibold` | Secciones |
| H3 | `text-xl` | `font-semibold` | Cards, subsecciones |
| Body | `text-base` | `font-normal` | Texto general |
| Small | `text-sm` | `font-normal` | Labels, captions |
| XS | `text-xs` | `font-medium` | Badges, helper text |

### Line Height

| Contexto | Line Height |
|----------|-------------|
| Headings | `leading-tight` (1.25) |
| Body | `leading-relaxed` (1.625) |
| UI Elements | `leading-normal` (1.5) |

---

## 6. Voz y Tono (Copy)

### Registro: Amigable Neutro

Español natural de Chile, sin chilenismos forzados ni formalidad excesiva. Como hablarle a un conocido, no a un amigo íntimo ni a un desconocido.

### Principios

| Hacer | Evitar |
|-------|--------|
| Tutear naturalmente | Usted / Vosotros |
| Ser directo | Rodeos, texto innecesario |
| Celebrar sin exagerar | Exclamaciones excesivas |
| Español neutro-chileno | Chilenismos marcados |

### Ejemplos por Contexto

#### Acciones Completadas

| Evitar | Preferir |
|--------|----------|
| "¡Bacán! ¡Ya quedó filete!" | "Listo, grupo creado" |
| "¡Felicitaciones!" | "Todo listo" |
| "¡Éxito!" | "Guardado" |

#### Errores

| Evitar | Preferir |
|--------|----------|
| "¡Ups! Algo salió mal :(" | "No se pudo completar. Intenta de nuevo." |
| "Error fatal del sistema" | "Hubo un problema" |

#### Instrucciones

| Evitar | Preferir |
|--------|----------|
| "Haz click aquí para continuar" | "Continuar" |
| "Por favor ingresa tu correo" | "Tu correo" (como label) |
| "Debes seleccionar una opción" | "Selecciona una opción" |

#### Estados Vacíos

| Evitar | Preferir |
|--------|----------|
| "No hay nada aquí :(" | "Sin participantes todavía" |
| "¡Invita a tus amigos!" | "Comparte el link para que se unan" |

#### Botones y CTAs

| Contexto | Copy |
|----------|------|
| Crear grupo | "Crear grupo" |
| Guardar cambios | "Guardar" |
| Confirmar acción | "Confirmar" |
| Cancelar | "Cancelar" |
| Copiar link | "Copiar" |
| Compartir | "Compartir por WhatsApp" |

#### Momentos Especiales (Reveal)

Aquí sí podemos ser un poco más expresivos:

| Momento | Copy |
|---------|------|
| Pre-reveal | "Tu amigo secreto es..." |
| Reveal | "Le regalas a [Nombre]" |
| Post-reveal | "Revisa su lista de deseos" |

### Mensajes de Toast

```jsx
// Éxito
toast.success('Guardado');
toast.success('Link copiado');
toast.success('Te uniste al grupo');

// Error
toast.error('No se pudo guardar');
toast.error('El grupo no existe');
toast.error('Intenta de nuevo');

// Info
toast('Cambios sin guardar');
```

---

## 7. Componentes UI (Actualización)

### Button

#### Variantes (Nueva paleta)

| Variante | Estilos | Uso |
|----------|---------|-----|
| `primary` | `bg-terracota text-marfil` | Acción principal |
| `secondary` | `bg-arena text-carbon` | Acción secundaria |
| `ghost` | `bg-transparent text-carbon` | Acciones sutiles |
| `danger` | `bg-burdeos text-marfil` | Acciones destructivas |

#### Estados

```
Normal → Hover (darken + shadow-soft-md) → Active (scale-98) → Disabled (opacity-50)
```

```jsx
// Implementación
<button className={`
  px-4 py-2 rounded-xl font-medium
  transition-all duration-200

  // Primary
  bg-terracota text-marfil
  hover:bg-terracota-dark hover:shadow-soft-md
  active:scale-[0.98]
  disabled:opacity-50 disabled:cursor-not-allowed

  // Focus
  focus:outline-none focus:ring-2 focus:ring-terracota/30 focus:ring-offset-2
`} />
```

### Card

#### Variantes

| Variante | Estilos | Uso |
|----------|---------|-----|
| `default` | `bg-marfil border-arena` | Contenido general |
| `elevated` | `bg-marfil shadow-soft-md` | Destacar |
| `outlined` | `bg-transparent border-arena` | Secciones |

```jsx
<div className={`
  rounded-xl p-6
  transition-all duration-200

  // Default
  bg-marfil border border-arena/50

  // Hover (si es interactivo)
  hover:shadow-soft hover:border-arena
`} />
```

### Input

#### Estados

| Estado | Estilos |
|--------|---------|
| Default | `border-arena bg-marfil` |
| Focus | `border-terracota ring-2 ring-terracota/20` |
| Error | `border-burdeos ring-2 ring-burdeos/20` |
| Disabled | `bg-arena/50 opacity-60` |

```jsx
<input className={`
  w-full px-4 py-3 rounded-lg
  bg-marfil border border-arena
  text-carbon placeholder-piedra
  transition-all duration-200

  focus:outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/20
`} />
```

### Badge

| Variante | Fondo | Texto |
|----------|-------|-------|
| `default` | `bg-arena` | `text-carbon` |
| `success` | `bg-oliva/10` | `text-oliva` |
| `warning` | `bg-arcilla/10` | `text-arcilla` |
| `danger` | `bg-burdeos/10` | `text-burdeos` |

```jsx
<span className={`
  inline-flex items-center gap-1
  px-2 py-1 rounded-full text-sm font-medium

  // Success
  bg-oliva/10 text-oliva
`} />
```

---

## 8. Patrones de Interacción

### Transiciones

| Propiedad | Duración | Easing |
|-----------|----------|--------|
| Color/Background | `200ms` | `ease` |
| Shadow | `200ms` | `ease-out` |
| Transform | `150ms` | `ease-out` |

Clase base: `transition-all duration-200`

### Hover States

```css
/* Buttons */
hover:bg-terracota-dark hover:shadow-soft-md

/* Cards (interactivas) */
hover:shadow-soft hover:border-arena

/* Links */
hover:text-terracota
```

### Focus States

```css
focus:outline-none focus:ring-2 focus:ring-terracota/30 focus:ring-offset-2
```

### Active States

```css
active:scale-[0.98]
```

---

## 9. Espaciado

Base: **4px**

| Token | Valor | Clase | Uso |
|-------|-------|-------|-----|
| xs | 4px | `p-1`, `gap-1` | Entre iconos |
| sm | 8px | `p-2`, `gap-2` | Padding mínimo |
| md | 16px | `p-4`, `gap-4` | Padding estándar |
| lg | 24px | `p-6`, `gap-6` | Secciones |
| xl | 32px | `p-8`, `gap-8` | Entre bloques |
| 2xl | 48px | `p-12`, `gap-12` | Hero, separadores |

### Consistencia en Cards

```jsx
// Card padding estándar
<Card className="p-6">  // 24px

// Espaciado interno
<Card.Body className="space-y-4">  // 16px entre elementos
```

---

## 10. Responsive

### Breakpoints

| Nombre | Min Width | Uso |
|--------|-----------|-----|
| `sm` | 640px | Móvil grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |

### Mobile First

```jsx
// Tipografía
className="text-2xl md:text-3xl lg:text-4xl"

// Layout
className="flex flex-col md:flex-row"

// Grid
className="grid grid-cols-1 md:grid-cols-2"

// Spacing
className="p-4 md:p-6 lg:p-8"
```

---

## 11. Iconos

**Librería**: `@remixicon/react` v4.7.0
**Centralización**: `src/lib/icons.js`
**Catálogo**: https://remixicon.com/

### Instalación

```bash
npm install @remixicon/react
```

### Uso

Todos los iconos se importan desde `lib/icons.js`, nunca directamente de remixicon:

```jsx
// Correcto
import { IconGift, IconUsers } from '../lib/icons';

// Incorrecto - NO hacer esto
import { RiGiftLine } from '@remixicon/react';
```

### Iconos Disponibles

#### Navegación
| Export | Remixicon | Uso |
|--------|-----------|-----|
| `IconHome` | RiHomeLine | Inicio |
| `IconArrowLeft` | RiArrowLeftLine | Volver |
| `IconArrowRight` | RiArrowRightLine | Siguiente |
| `IconChevronDown` | RiArrowDownSLine | Expandir/colapsar |
| `IconExternalLink` | RiExternalLinkLine | Link externo |
| `IconLink` | RiLink | Copiar link |

#### Acciones
| Export | Remixicon | Uso |
|--------|-----------|-----|
| `IconPlus` | RiAddLine | Agregar |
| `IconClose` | RiCloseLine | Cerrar, eliminar |
| `IconCheck` | RiCheckLine | Confirmar, seleccionar |
| `IconDelete` | RiDeleteBinLine | Eliminar permanente |
| `IconCopy` | RiFileCopyLine | Copiar |
| `IconSave` | RiSaveLine | Guardar |
| `IconUpload` | RiUploadLine | Subir archivo |
| `IconRefresh` | RiRefreshLine | Recargar |
| `IconPlay` | RiPlayCircleLine | Ejecutar |
| `IconLogin` | RiLoginBoxLine | Iniciar sesión |
| `IconLogout` | RiLogoutBoxLine | Cerrar sesión |
| `IconSettings` | RiSettings4Line | Configuración |

#### Estados
| Export | Remixicon | Uso |
|--------|-----------|-----|
| `IconLoader` | RiLoader4Line | Cargando (con animate-spin) |
| `IconAlert` | RiErrorWarningLine | Error |
| `IconWarning` | RiAlertLine | Advertencia |
| `IconSuccess` | RiCheckboxCircleLine | Éxito |

#### Entidades
| Export | Remixicon | Uso |
|--------|-----------|-----|
| `IconGift` | RiGiftLine | Regalo, wishlist |
| `IconUsers` | RiGroupLine | Grupo, participantes |
| `IconUser` | RiUserLine | Usuario individual |
| `IconUserAdd` | RiUserAddLine | Agregar usuario |
| `IconUserRemove` | RiUserUnfollowLine | Expulsar usuario |
| `IconCrown` | RiVipCrownLine | Organizador |

#### Contenido
| Export | Remixicon | Uso |
|--------|-----------|-----|
| `IconCalendar` | RiCalendarLine | Fecha, deadline |
| `IconClock` | RiTimeLine | Tiempo, countdown |
| `IconMoney` | RiMoneyDollarCircleLine | Precio, presupuesto |
| `IconList` | RiListCheck2 | Lista, wishlist |

#### Social
| Export | Remixicon | Uso |
|--------|-----------|-----|
| `IconWhatsapp` | RiWhatsappLine | Compartir WhatsApp |
| `IconQrCode` | RiQrCodeLine | Código QR |
| `IconGithub` | RiGithubLine | GitHub |

#### Funcionales
| Export | Remixicon | Uso |
|--------|-----------|-----|
| `IconBan` | RiForbidLine | Restricción |
| `IconLock` | RiLockLine | Privado |
| `IconSun` | RiSunLine | Modo claro |
| `IconMoon` | RiMoonLine | Modo oscuro |

#### Celebración
| Export | Remixicon | Uso |
|--------|-----------|-----|
| `IconSparkles` | RiSparklingLine | Destacar, reveal |
| `IconParty` | RiCake2Line | Celebración |

### Tamaños

| Contexto | Clase | Píxeles |
|----------|-------|---------|
| Inline (en texto) | `w-4 h-4` | 16px |
| Button icon | `w-4 h-4` | 16px |
| Card header | `w-5 h-5` | 20px |
| Feature icon | `w-6 h-6` | 24px |
| Hero/destacado | `w-8 h-8` | 32px |

### Estilos

```jsx
// Heredar color del texto (por defecto)
<IconGift className="w-5 h-5" />

// Color específico
<IconGift className="w-5 h-5 text-terracota" />

// Con animación (loader)
<IconLoader className="w-4 h-4 animate-spin" />

// En botón
<Button icon={IconPlus}>Agregar</Button>
```

### Agregar Nuevos Iconos

1. Buscar el icono en https://remixicon.com/
2. Agregar import en `lib/icons.js`
3. Crear export con nombre `Icon[Nombre]`
4. Documentar en este archivo

---

## 12. Accesibilidad

### Contraste

| Combinación | Ratio | Estado |
|-------------|-------|--------|
| `carbon` sobre `marfil` | 12.5:1 | AA |
| `terracota` sobre `marfil` | 4.8:1 | AA |
| `marfil` sobre `terracota` | 4.8:1 | AA |
| `piedra` sobre `marfil` | 4.1:1 | AA (large text) |

### Checklist

- [x] Contraste WCAG AA en textos principales
- [x] Focus visible en todos los interactivos
- [x] Labels en todos los inputs
- [x] aria-label en botones de solo icono
- [x] role="dialog" en modales
- [ ] Focus trap en modales
- [ ] prefers-reduced-motion

### Patrones

```jsx
// Botón solo icono
<Button icon={IconClose} aria-label="Cerrar" />

// Input con error
<Input error="Campo requerido" />
// Genera automáticamente aria-invalid y aria-describedby

// Skip link (pendiente)
<a href="#main" className="sr-only focus:not-sr-only">
  Ir al contenido
</a>
```

---

## Migración desde v1.0

### Colores

| Antes | Ahora |
|-------|-------|
| `christmas-red` | `terracota` |
| `christmas-green` | `oliva` |
| `christmas-yellow` | `arcilla` |
| `christmas-black` | `carbon` |
| `white` | `marfil` |

### Clases

| Antes | Ahora |
|-------|-------|
| `border-brutal` | `border` |
| `rounded-brutal` | `rounded-lg` |
| `shadow-brutal` | `shadow-soft` |
| `rounded-brutal-lg` | `rounded-xl` |

### Componentes a Actualizar

1. `tailwind.config.js` - Nueva paleta
2. `Button.jsx` - Nuevas variantes
3. `Card.jsx` - Quitar variante gradient
4. `Input.jsx` - Nuevos estilos focus
5. `Badge.jsx` - Nuevas variantes semánticas
6. `tailwind.css` - Quitar utilities brutalist

---

## Changelog

### v1.1 (Nov 23, 2025)
- Nueva paleta: Terracota + Arena (cálido invernal)
- Estilo Soft UI reemplaza Neobrutalist
- Guía de voz y tono agregada
- Copy amigable neutro (sin chilenismos)

### v1.0 (Nov 23, 2025)
- Documento inicial
- Paleta navideña (deprecated)
- Estilo neobrutalist (deprecated)
