# Sistema de Diseño - quiéntetoca

**Versión**: 4.0 (Neon Editorial)
**Última actualización**: Nov 26, 2025

---

## 1. Introducción

### Filosofía

**Neon Editorial** es un sistema de diseño dark-mode brutalist con acentos neón. Características principales:

- **Dark-only**: Sin modo claro, fondo negro con superficies oscuras
- **Brutalist**: Esquinas rectas, sin border-radius
- **Neon accents**: 5 colores vibrantes que rotan aleatoriamente
- **Editorial typography**: Mix de display, headline, body y mono

### Stack

| Tecnología       | Uso                    |
|------------------|------------------------|
| React 18         | UI framework           |
| Tailwind CSS     | Estilos utilitarios    |
| Remixicon        | Iconografía            |
| react-hot-toast  | Notificaciones         |
| Google Fonts     | Oswald, Space Grotesk, Source Serif 4, JetBrains Mono |

---

## 2. Colores

### Base (Superficies)

| Token           | Hex       | Uso                    |
|-----------------|-----------|------------------------|
| `neon-base`     | `#0A0A0A` | Fondo de página        |
| `neon-surface`  | `#1A1A1A` | Cards, modals          |
| `neon-elevated` | `#252525` | Superficies elevadas   |
| `neon-border`   | `#333333` | Bordes por defecto     |

### Texto

| Token            | Hex       | Uso              |
|------------------|-----------|------------------|
| `text-primary`   | `#FFFFFF` | Texto principal  |
| `text-secondary` | `#888888` | Texto secundario |
| `text-muted`     | `#666666` | Texto deshabilitado |

### Acentos Neón

| Token             | Hex       | RGB Glow                  | Uso                |
|-------------------|-----------|---------------------------|--------------------|
| `accent-blurple`  | `#7B5CFF` | `123, 92, 255`           | Púrpura neón       |
| `accent-pernod`   | `#C8FF00` | `200, 255, 0`            | Verde lima (éxito) |
| `accent-hotbrick` | `#FF4444` | `255, 68, 68`            | Rojo (error)       |
| `accent-cyber`    | `#00FFFF` | `0, 255, 255`            | Cyan neón          |
| `accent-magenta`  | `#FF00FF` | `255, 0, 255`            | Magenta neón       |

### Sistema de Acento Aleatorio

Al cargar la app, `Layout.jsx` selecciona un color aleatorio:

```javascript
const ACCENT_COLORS = ['blurple', 'pernod', 'hotbrick', 'cyber', 'magenta'];
const random = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
document.documentElement.style.setProperty('--accent-color', `var(--accent-${random})`);
```

**Uso en componentes**:
```jsx
// Dinámico (usa el color aleatorio)
className="text-accent bg-accent border-accent"

// Semántico (siempre el mismo)
className="text-accent-pernod"   // Éxito, confirmación
className="text-accent-hotbrick" // Error, peligro
```

### Colores Externos

| Servicio  | Color     | Uso         |
|-----------|-----------|-------------|
| Google    | `#4285F4` | Login OAuth |
| Microsoft | `#2F2F2F` | Login OAuth |
| WhatsApp  | `#25D366` | Compartir   |

---

## 3. Tipografía

### Fuentes

| Fuente          | Clase          | Peso              | Uso              |
|-----------------|----------------|-------------------|------------------|
| Oswald          | `font-display` | 400-700           | Títulos uppercase |
| Space Grotesk   | `font-headline`| 500-700           | Logo, headlines, botones |
| Source Serif 4  | `font-body`    | 400               | Texto de cuerpo  |
| JetBrains Mono  | `font-mono`    | 400               | Código, datos    |

> **Nota**: El logo "quiéntetoca" usa `font-headline` (Space Grotesk) para soportar minúsculas con tilde.

### Escala

| Nivel   | Clase                  | Fuente        | Uso              |
|---------|------------------------|---------------|------------------|
| Display | `text-6xl md:text-9xl` | font-display  | Logo hero        |
| H1      | `text-3xl`             | font-display  | Títulos página   |
| H2      | `text-2xl`             | font-headline | Secciones        |
| H3      | `text-lg`              | font-headline | Cards            |
| Body    | `text-base`            | font-body     | Texto general    |
| Small   | `text-sm`              | font-body     | Labels           |
| Mono    | `text-xs`              | font-mono     | Datos, códigos   |

---

## 4. Espaciado y Layout

### Espaciado Base: 4px

| Token | Valor | Clase | Uso              |
|-------|-------|-------|------------------|
| xs    | 4px   | `p-1` | Entre iconos     |
| sm    | 8px   | `p-2` | Padding mínimo   |
| md    | 16px  | `p-4` | Padding estándar |
| lg    | 24px  | `p-6` | Secciones        |
| xl    | 32px  | `p-8` | Entre bloques    |

### Border Radius

**Ninguno.** El diseño brutalist usa esquinas rectas:

```jsx
// Correcto
className="border border-neon-border"

// Incorrecto
className="rounded-lg"
```

### Sombras (Glow)

En lugar de sombras tradicionales, usamos efectos de glow neón:

```css
.glow-accent {
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent-color) 30%, transparent);
}

.glow-accent-lg {
  box-shadow: 0 0 40px color-mix(in srgb, var(--accent-color) 40%, transparent);
}
```

---

## 5. Componentes UI

### Button

**Archivo**: `src/components/ui/Button.jsx`

| Prop           | Valores                                    | Default     |
|----------------|--------------------------------------------|-------------|
| `variant`      | `primary`, `secondary`, `danger`, `ghost`, `outline` | `primary` |
| `size`         | `sm`, `md`, `lg`, `xl`                    | `md`        |
| `glow`         | `boolean`                                  | `false`     |
| `icon`         | React component                            | -           |
| `loading`      | `boolean`                                  | `false`     |

```jsx
<Button variant="primary" size="xl" glow>
  Crear grupo
</Button>

<Button variant="ghost" icon={IconCopy}>
  Copiar
</Button>
```

### Card

**Archivo**: `src/components/ui/Card.jsx`

| Prop        | Valores                          | Default     |
|-------------|----------------------------------|-------------|
| `variant`   | `default`, `elevated`, `outlined`, `glow` | `default` |
| `padding`   | `none`, `sm`, `md`, `lg`        | `md`        |
| `laserLine` | `bottom`, `left`, `top`, `right` | -           |

```jsx
<Card padding="lg" variant="outlined">
  <Card.Header>
    <Card.Title>Título</Card.Title>
  </Card.Header>
  <Card.Body>Contenido</Card.Body>
  <Card.Footer>
    <Button>Acción</Button>
  </Card.Footer>
</Card>
```

### Input

**Archivo**: `src/components/ui/Input.jsx`

| Prop         | Tipo     | Descripción        |
|--------------|----------|--------------------|
| `label`      | string   | Label del campo    |
| `error`      | string   | Mensaje de error   |
| `helperText` | string   | Texto de ayuda     |
| `icon`       | element  | Icono decorativo   |

```jsx
<Input
  label="Nombre del grupo"
  placeholder="ej., Navidad Familiar"
  error={errors.name}
/>
```

### Modal

**Archivo**: `src/components/ui/Modal.jsx`

```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar"
  size="sm"
>
  <p>¿Estás seguro?</p>
  <Modal.Footer>
    <Button variant="ghost">Cancelar</Button>
    <Button variant="danger">Eliminar</Button>
  </Modal.Footer>
</Modal>
```

### Badge

**Archivo**: `src/components/ui/Badge.jsx`

| Variant   | Color         | Uso           |
|-----------|---------------|---------------|
| `default` | neon-border   | Neutral       |
| `success` | accent-pernod | Confirmado    |
| `warning` | amber         | Advertencia   |
| `danger`  | accent-hotbrick | Error       |
| `info`    | accent        | Información   |

---

## 6. Iconografía

### Sistema

**Librería**: `@remixicon/react`
**Centralización**: `src/lib/icons.js`

### Importación

```jsx
// Siempre desde lib/icons
import { IconGift, IconUsers, IconCheck } from '../lib/icons';

// Nunca directamente
import { RiGiftLine } from '@remixicon/react'; // ❌
```

### Categorías Disponibles

**Navegación**: IconHome, IconArrowLeft, IconLink, IconChevronUp, IconChevronDown
**Acciones**: IconPlus, IconClose, IconCheck, IconDelete, IconCopy, IconSave, IconRefresh, IconPlay, IconLogout
**Estados**: IconLoader, IconAlert, IconWarning, IconSuccess
**Entidades**: IconGift, IconUsers, IconUser, IconUserAdd, IconUserRemove, IconCrown
**Contenido**: IconCalendar, IconClock, IconMoney, IconList
**Social**: IconGithub, IconWhatsapp, IconQrCode
**Funcionales**: IconBan, IconShield, IconLock
**Celebración**: IconSparkles, IconParty

### Tamaños

| Contexto    | Clase     |
|-------------|-----------|
| Inline      | `w-4 h-4` |
| Button      | `w-4 h-4` |
| Card header | `w-5 h-5` |
| Feature     | `w-6 h-6` |
| Hero        | `w-8 h-8` |

---

## 7. Patrones UX

### Estados de Carga

```jsx
// Spinner fullscreen
<LoadingSpinner fullScreen message="Cargando..." />

// En botones
<Button loading>Guardando...</Button>
```

### Manejo de Errores

```jsx
<ErrorDisplay
  title="Grupo no encontrado"
  message="El código no existe"
  showHome
/>
```

### Feedback (Toasts)

```jsx
toast.success('Grupo creado');
toast.error('No se pudo guardar');
```

### Transiciones

```css
transition-all duration-200
hover:border-accent
hover:opacity-90
```

---

## 8. Voz y Tono

### Principios

| Hacer                     | Evitar                    |
|---------------------------|---------------------------|
| Tutear naturalmente       | Usted / Vosotros          |
| Español neutro-chileno    | Chilenismos marcados      |
| Ser directo               | Rodeos innecesarios       |
| Usar tildes correctamente | Omitir acentos            |

### Ejemplos

| Contexto     | Evitar              | Preferir                |
|--------------|---------------------|-------------------------|
| Éxito        | "¡Bacán!"           | "Listo"                 |
| Error        | "Ups :("            | "Hubo un problema"      |
| Vacío        | "No hay nada :("    | "Sin participantes aún" |
| Botón crear  | "¡Crear!"           | "Crear grupo"           |

---

## 9. Accesibilidad

### Contraste

Todos los textos cumplen WCAG AA sobre fondos oscuros.

### Focus

```css
focus:outline-none focus:border-accent
```

### ARIA

```jsx
<button aria-label="Cerrar modal">
<div role="dialog" aria-modal="true">
<input aria-invalid="true" aria-describedby="error-msg">
```

### Keyboard

| Tecla  | Acción                    |
|--------|---------------------------|
| Tab    | Navegar elementos         |
| Enter  | Activar botones           |
| Escape | Cerrar modal/dropdown     |
| ↑/↓    | Ajustar precios           |

---

## 10. Responsive

### Breakpoints

| Nombre | Min Width | Uso            |
|--------|-----------|----------------|
| `sm`   | 640px     | Móvil grande   |
| `md`   | 768px     | Tablet         |
| `lg`   | 1024px    | Desktop        |
| `xl`   | 1280px    | Desktop grande |

### Mobile First

```jsx
className="text-2xl md:text-3xl lg:text-4xl"
className="flex flex-col md:flex-row"
className="grid grid-cols-1 md:grid-cols-3"
```

---

## Changelog

### v4.1 (Nov 26, 2025)

- Logo "quiéntetoca" usa `font-headline` (Space Grotesk) para minúsculas con tilde
- Hero section más compacto
- PriceVoteCard refactorizado con inputs ±$1.000
- Corrección de tildes en todo el frontend
- Auth dropdown siempre visible (loading state fix)

### v4.0 (Nov 26, 2025)

- **Neon Editorial**: Nueva identidad visual dark-mode brutalist
- Sistema de acento aleatorio (5 colores)
- Tipografía editorial: Oswald, Space Grotesk, Source Serif 4
- Sin border-radius (brutalist)
- Efectos de glow neón

### v3.0 (Nov 25, 2025)

- Paleta Bubblegum (deprecada)

### v1.0 (Nov 23, 2025)

- Documento inicial
