import PropTypes from 'prop-types';

/**
 * Badge Component
 *
 * Etiquetas pequeñas para estados, conteos, etc.
 * Estilo Soft UI con colores del sistema de diseño.
 *
 * Variantes:
 * - default: Piedra neutro
 * - success: Oliva
 * - warning: Arcilla
 * - danger: Burdeos
 * - info: Terracota
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
    font-medium rounded-soft
  `;

  const variants = {
    default: `
      bg-accent-piedra/20 dark:bg-dark-surface
      text-accent-piedra dark:text-dark-text-secondary
      border border-accent-piedra/30 dark:border-dark-border
    `,
    success: `
      bg-accent-oliva/20 dark:bg-accent-oliva/10
      text-accent-oliva dark:text-accent-oliva-light
      border border-accent-oliva/30 dark:border-accent-oliva/20
    `,
    warning: `
      bg-accent-arcilla/20 dark:bg-accent-arcilla/10
      text-accent-arcilla dark:text-accent-arcilla-light
      border border-accent-arcilla/30 dark:border-accent-arcilla/20
    `,
    danger: `
      bg-accent-burdeos/20 dark:bg-accent-burdeos/10
      text-accent-burdeos dark:text-accent-burdeos-light
      border border-accent-burdeos/30 dark:border-accent-burdeos/20
    `,
    info: `
      bg-brand-terracota/20 dark:bg-brand-terracota/10
      text-brand-terracota dark:text-brand-terracota-light
      border border-brand-terracota/30 dark:border-brand-terracota/20
    `,
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
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

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  className: PropTypes.string,
};
