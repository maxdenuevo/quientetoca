/**
 * Badge Component - Neon Editorial Design
 *
 * Etiquetas con colores neon saturados.
 *
 * Variantes:
 * - default: Muted neutro
 * - success: Pernod (verde neon)
 * - warning: Magenta
 * - danger: Hotbrick (rojo)
 * - info: Cyber (cyan)
 * - primary: Blurple
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = `
    inline-flex items-center gap-1
    font-mono font-medium uppercase
  `;

  const variants = {
    default: `
      bg-neon-elevated text-text-secondary
      border border-neon-border
    `,
    success: `
      bg-accent-pernod/20 text-accent-pernod
      border border-accent-pernod/50
    `,
    warning: `
      bg-accent-magenta/20 text-accent-magenta
      border border-accent-magenta/50
    `,
    danger: `
      bg-accent-hotbrick/20 text-accent-hotbrick
      border border-accent-hotbrick/50
    `,
    info: `
      bg-accent-cyber/20 text-accent-cyber
      border border-accent-cyber/50
    `,
    primary: `
      bg-[color-mix(in_srgb,var(--accent-color)_20%,transparent)] text-accent
      border border-[color-mix(in_srgb,var(--accent-color)_50%,transparent)]
    `,
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

