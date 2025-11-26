import { IconLoader } from '../../lib/icons';

/**
 * Button Component - Neon Editorial Design
 *
 * Variantes:
 * - primary: Accent color, texto oscuro, hover glow
 * - secondary: Transparente, borde, hover accent
 * - danger: Hotbrick, acciones destructivas
 * - ghost: Transparente, hover elevated
 * - outline: Borde accent, texto accent
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  glow = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-headline font-semibold uppercase tracking-wider
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neon-base
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-accent text-neon-base
      hover:glow-accent
      focus:ring-2
    `,
    secondary: `
      bg-transparent text-text-primary
      border border-neon-border
      hover:border-accent hover:text-accent
      focus:ring-2
    `,
    danger: `
      bg-accent-hotbrick text-white
      hover:shadow-glow-hotbrick
      focus:ring-accent-hotbrick/50
    `,
    ghost: `
      bg-transparent text-text-secondary
      hover:bg-neon-elevated hover:text-text-primary
      focus:ring-2
    `,
    outline: `
      bg-transparent text-accent
      border-2 border-accent
      hover:bg-accent hover:text-neon-base
      hover:glow-accent
      focus:ring-2
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
    xl: 'px-8 py-4 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const glowClass = glow ? 'glow-accent' : '';

  const iconElement = loading ? (
    <IconLoader className="w-4 h-4 animate-spin" />
  ) : Icon ? (
    <Icon className="w-4 h-4" />
  ) : null;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${glowClass}
        ${className}
      `.trim()}
      {...props}
    >
      {iconElement && iconPosition === 'left' && iconElement}
      {children}
      {iconElement && iconPosition === 'right' && iconElement}
    </button>
  );
}

