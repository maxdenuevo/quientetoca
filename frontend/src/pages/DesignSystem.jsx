import { useState } from 'react';
import {
  IconGift,
  IconUsers,
  IconCheck,
  IconClose,
  IconLoader,
  IconAlert,
  IconCalendar,
  IconMoney,
  IconWhatsapp,
  IconCopy,
  IconSparkles,
  IconPlus,
  IconSun,
  IconMoon,
} from '../lib/icons';

/**
 * Design System Preview
 *
 * Página para visualizar el nuevo sistema de diseño:
 * - Paleta: Terracota + Arena (Cálido Invernal)
 * - Estilo: Soft UI
 * - Copy: Amigable neutro
 */

// Nuevos colores (se agregarán a tailwind.config.js)
const colors = {
  // Brand
  terracota: '#C4704A',
  'terracota-dark': '#A85D3B',
  'terracota-light': '#D4896A', // Para dark mode
  arena: '#E8DFD0',
  carbon: '#2D2D2D',
  marfil: '#FAF7F2',
  // Semantic
  oliva: '#7D8471',
  'oliva-light': '#9AAB8C', // Para dark mode
  arcilla: '#B8860B',
  'arcilla-light': '#D4A82E', // Para dark mode
  burdeos: '#722F37',
  'burdeos-light': '#A34450', // Para dark mode
  piedra: '#8B8680',
  // Dark mode específicos
  dark: {
    bg: '#1A1A1A',        // Fondo principal más oscuro
    surface: '#2A2A2A',   // Cards/surfaces
    surfaceHover: '#333333',
    border: '#404040',
    textPrimary: '#F5F5F5',
    textSecondary: '#A0A0A0',
  }
};

// Componentes con nuevo estilo
function Button({ children, variant = 'primary', size = 'md', icon: Icon, disabled, loading, darkMode }) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variants = {
    primary: 'text-white hover:shadow-lg focus:ring-[#C4704A]/30',
    secondary: 'border hover:shadow-md focus:ring-[#C4704A]/20',
    ghost: 'focus:ring-[#C4704A]/20',
    danger: 'text-white hover:shadow-lg focus:ring-[#722F37]/30',
  };

  const getVariantStyles = () => {
    if (variant === 'primary') {
      return { backgroundColor: darkMode ? colors['terracota-light'] : colors.terracota };
    }
    if (variant === 'secondary') {
      return {
        backgroundColor: darkMode ? colors.dark.surface : colors.arena,
        color: darkMode ? colors.dark.textPrimary : colors.carbon,
        borderColor: darkMode ? colors.dark.border : colors.arena,
      };
    }
    if (variant === 'ghost') {
      return {
        backgroundColor: 'transparent',
        color: darkMode ? colors.dark.textPrimary : colors.carbon,
      };
    }
    if (variant === 'danger') {
      return { backgroundColor: darkMode ? colors['burdeos-light'] : colors.burdeos };
    }
    return {};
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      style={getVariantStyles()}
      disabled={disabled || loading}
    >
      {loading ? <IconLoader className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

function Card({ children, variant = 'default', className = '', darkMode }) {
  const baseStyles = 'rounded-xl transition-all duration-200';

  const getVariantStyles = () => {
    if (variant === 'default') {
      return {
        backgroundColor: darkMode ? colors.dark.surface : colors.marfil,
        border: `1px solid ${darkMode ? colors.dark.border : colors.arena}`,
      };
    }
    if (variant === 'elevated') {
      return {
        backgroundColor: darkMode ? colors.dark.surface : colors.marfil,
        boxShadow: darkMode
          ? '0 4px 12px 0 rgb(0 0 0 / 0.30)'
          : '0 4px 12px 0 rgb(0 0 0 / 0.10)',
        border: darkMode ? `1px solid ${colors.dark.border}` : 'none',
      };
    }
    return {};
  };

  return (
    <div className={`${baseStyles} p-6 ${className}`} style={getVariantStyles()}>
      {children}
    </div>
  );
}

function Input({ label, placeholder, error, helperText, darkMode }) {
  const [focused, setFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return darkMode ? colors['burdeos-light'] : colors.burdeos;
    if (focused) return darkMode ? colors['terracota-light'] : colors.terracota;
    return darkMode ? colors.dark.border : colors.arena;
  };

  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: darkMode ? colors.dark.textPrimary : colors.carbon }}
        >
          {label}
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 py-3 rounded-lg transition-all duration-200 outline-none"
        style={{
          backgroundColor: darkMode ? colors.dark.surface : colors.marfil,
          border: `1px solid ${getBorderColor()}`,
          color: darkMode ? colors.dark.textPrimary : colors.carbon,
          boxShadow: focused ? `0 0 0 3px ${darkMode ? colors['terracota-light'] : colors.terracota}20` : 'none',
        }}
      />
      {error && (
        <p className="mt-1 text-sm flex items-center gap-1" style={{ color: darkMode ? colors['burdeos-light'] : colors.burdeos }}>
          <IconAlert className="w-4 h-4" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm" style={{ color: colors.dark.textSecondary }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

function Badge({ children, variant = 'default', darkMode }) {
  const getVariantStyles = () => {
    if (variant === 'default') {
      return {
        backgroundColor: darkMode ? colors.dark.surface : colors.arena,
        color: darkMode ? colors.dark.textPrimary : colors.carbon,
        border: darkMode ? `1px solid ${colors.dark.border}` : 'none',
      };
    }
    if (variant === 'success') {
      return {
        backgroundColor: `${darkMode ? colors['oliva-light'] : colors.oliva}20`,
        color: darkMode ? colors['oliva-light'] : colors.oliva,
      };
    }
    if (variant === 'warning') {
      return {
        backgroundColor: `${darkMode ? colors['arcilla-light'] : colors.arcilla}20`,
        color: darkMode ? colors['arcilla-light'] : colors.arcilla,
      };
    }
    if (variant === 'danger') {
      return {
        backgroundColor: `${darkMode ? colors['burdeos-light'] : colors.burdeos}20`,
        color: darkMode ? colors['burdeos-light'] : colors.burdeos,
      };
    }
    return {};
  };

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium"
      style={getVariantStyles()}
    >
      {children}
    </span>
  );
}

// Página principal
export default function DesignSystem() {
  const [darkMode, setDarkMode] = useState(false);

  // Colores dinámicos según modo
  const bg = darkMode ? colors.dark.bg : colors.marfil;
  const surface = darkMode ? colors.dark.surface : colors.marfil;
  const text = darkMode ? colors.dark.textPrimary : colors.carbon;
  const textSecondary = darkMode ? colors.dark.textSecondary : colors.piedra;
  const border = darkMode ? colors.dark.border : colors.arena;
  const accent = darkMode ? colors['terracota-light'] : colors.terracota;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: bg, color: text }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: bg, borderColor: border }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">quiéntetoca</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: darkMode ? colors.dark.surface : colors.arena }}
            >
              {darkMode ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
            </button>
            <Button variant="primary" icon={IconPlus} darkMode={darkMode}>
              Crear grupo
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center py-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            <IconSparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Organiza tu amigo secreto</span>
          </div>
          <h2 className="text-5xl font-bold mb-4 leading-tight">
            Regalar nunca fue<br />tan simple
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: textSecondary }}>
            Crea un grupo, comparte el link, y deja que todos voten el presupuesto.
            El sorteo se hace solo cuando llegue la fecha.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" size="lg" icon={IconPlus} darkMode={darkMode}>
              Crear grupo gratis
            </Button>
            <Button variant="secondary" size="lg" darkMode={darkMode}>
              Ver cómo funciona
            </Button>
          </div>
        </section>

        {/* Paleta de Colores */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Paleta de Colores</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(colors).filter(([name]) => typeof colors[name] === 'string').map(([name, hex]) => (
              <div key={name} className="text-center">
                <div
                  className="w-full h-24 rounded-xl mb-2 border"
                  style={{
                    backgroundColor: hex,
                    borderColor: name === 'marfil' ? colors.arena : border,
                  }}
                />
                <p className="font-medium capitalize">{name}</p>
                <p className="text-sm" style={{ color: textSecondary }}>{hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Botones */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Botones</h3>
          <Card darkMode={darkMode}>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: textSecondary }}>Variantes</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" icon={IconCheck} darkMode={darkMode}>Primary</Button>
                  <Button variant="secondary" icon={IconCopy} darkMode={darkMode}>Secondary</Button>
                  <Button variant="ghost" darkMode={darkMode}>Ghost</Button>
                  <Button variant="danger" icon={IconClose} darkMode={darkMode}>Danger</Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: textSecondary }}>Tamaños</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm" darkMode={darkMode}>Small</Button>
                  <Button variant="primary" size="md" darkMode={darkMode}>Medium</Button>
                  <Button variant="primary" size="lg" darkMode={darkMode}>Large</Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: textSecondary }}>Estados</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" loading darkMode={darkMode}>Cargando</Button>
                  <Button variant="primary" disabled darkMode={darkMode}>Deshabilitado</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Cards */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Cards</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card darkMode={darkMode}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${accent}15` }}
                >
                  <IconUsers className="w-5 h-5" style={{ color: accent }} />
                </div>
                <h4 className="font-semibold">Invita participantes</h4>
              </div>
              <p className="text-sm" style={{ color: textSecondary }}>
                Comparte el link y todos pueden unirse con su cuenta de Google o Microsoft.
              </p>
            </Card>

            <Card variant="elevated" darkMode={darkMode}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${darkMode ? colors['oliva-light'] : colors.oliva}15` }}
                >
                  <IconMoney className="w-5 h-5" style={{ color: darkMode ? colors['oliva-light'] : colors.oliva }} />
                </div>
                <h4 className="font-semibold">Voten el presupuesto</h4>
              </div>
              <p className="text-sm" style={{ color: textSecondary }}>
                Cada participante vota por el rango de precio que prefiere.
              </p>
            </Card>

            <Card darkMode={darkMode}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${darkMode ? colors['arcilla-light'] : colors.arcilla}15` }}
                >
                  <IconGift className="w-5 h-5" style={{ color: darkMode ? colors['arcilla-light'] : colors.arcilla }} />
                </div>
                <h4 className="font-semibold">Sorteo automático</h4>
              </div>
              <p className="text-sm" style={{ color: textSecondary }}>
                Cuando llegue la fecha, el sorteo se hace solo y todos reciben su resultado.
              </p>
            </Card>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Inputs</h3>
          <Card darkMode={darkMode}>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Nombre del grupo"
                placeholder="Ej: Navidad Familia 2025"
                helperText="Dale un nombre que todos reconozcan"
                darkMode={darkMode}
              />
              <Input
                label="Tu correo"
                placeholder="correo@ejemplo.com"
                error="Este campo es requerido"
                darkMode={darkMode}
              />
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Badges</h3>
          <Card darkMode={darkMode}>
            <div className="flex flex-wrap gap-3">
              <Badge darkMode={darkMode}>Default</Badge>
              <Badge variant="success" darkMode={darkMode}>
                <IconCheck className="w-3 h-3" /> Completado
              </Badge>
              <Badge variant="warning" darkMode={darkMode}>
                <IconCalendar className="w-3 h-3" /> Pendiente
              </Badge>
              <Badge variant="danger" darkMode={darkMode}>
                <IconAlert className="w-3 h-3" /> Error
              </Badge>
            </div>
          </Card>
        </section>

        {/* Feature Card - Compartir */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Ejemplo: Compartir Link</h3>
          <Card variant="elevated" className="max-w-md mx-auto" darkMode={darkMode}>
            <div className="text-center mb-6">
              <p className="text-sm mb-1" style={{ color: textSecondary }}>Código del grupo</p>
              <p
                className="text-4xl font-mono font-bold tracking-wider"
                style={{ color: accent }}
              >
                ABC123
              </p>
            </div>

            <div
              className="rounded-lg p-3 mb-4"
              style={{ backgroundColor: darkMode ? colors.dark.bg : colors.arena }}
            >
              <p className="text-xs mb-1" style={{ color: textSecondary }}>URL</p>
              <p className="font-mono text-sm break-all">
                quienteto.ca/join/ABC123
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" icon={IconCopy} darkMode={darkMode}>
                Copiar
              </Button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <IconWhatsapp className="w-5 h-5" />
                WhatsApp
              </button>
            </div>
          </Card>
        </section>

        {/* Voz y Tono */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Voz y Tono</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card darkMode={darkMode}>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <IconCheck className="w-5 h-5" style={{ color: darkMode ? colors['oliva-light'] : colors.oliva }} />
                Preferir
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="p-2 rounded-lg" style={{ backgroundColor: `${darkMode ? colors['oliva-light'] : colors.oliva}15` }}>
                  "Listo, grupo creado"
                </li>
                <li className="p-2 rounded-lg" style={{ backgroundColor: `${darkMode ? colors['oliva-light'] : colors.oliva}15` }}>
                  "Link copiado"
                </li>
                <li className="p-2 rounded-lg" style={{ backgroundColor: `${darkMode ? colors['oliva-light'] : colors.oliva}15` }}>
                  "No se pudo guardar. Intenta de nuevo."
                </li>
                <li className="p-2 rounded-lg" style={{ backgroundColor: `${darkMode ? colors['oliva-light'] : colors.oliva}15` }}>
                  "Sin participantes todavía"
                </li>
              </ul>
            </Card>

            <Card darkMode={darkMode}>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <IconClose className="w-5 h-5" style={{ color: darkMode ? colors['burdeos-light'] : colors.burdeos }} />
                Evitar
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="p-2 rounded-lg" style={{ backgroundColor: `${darkMode ? colors['burdeos-light'] : colors.burdeos}15` }}>
                  "¡Bacán! ¡Ya quedó filete!"
                </li>
                <li className="p-2 rounded-lg" style={{ backgroundColor: `${darkMode ? colors['burdeos-light'] : colors.burdeos}15` }}>
                  "¡Éxito! Link copiado :)"
                </li>
                <li className="p-2 rounded-lg" style={{ backgroundColor: `${darkMode ? colors['burdeos-light'] : colors.burdeos}15` }}>
                  "¡Ups! Algo salió mal :("
                </li>
                <li className="p-2 rounded-lg" style={{ backgroundColor: `${darkMode ? colors['burdeos-light'] : colors.burdeos}15` }}>
                  "No hay nada aquí :("
                </li>
              </ul>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 mt-16"
        style={{ borderColor: border }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm" style={{ color: textSecondary }}>
            Sistema de Diseño v1.1 — Cálido Invernal + Soft UI
          </p>
        </div>
      </footer>
    </div>
  );
}
