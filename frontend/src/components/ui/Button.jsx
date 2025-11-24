import PropTypes from 'prop-types';
import { IconLoader } from '../../lib/icons';

/**
 * Button Component
 *
 * Componente de botón con estilo Soft UI.
 *
 * Variantes:
 * - primary: Terracota, acción principal
 * - secondary: Arena/surface, acción secundaria
 * - danger: Burdeos, acciones destructivas
 * - ghost: Transparente, acciones sutiles
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-soft-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-brand-terracota dark:bg-brand-terracota-light
      text-white
      hover:bg-brand-terracota-dark dark:hover:bg-brand-terracota
      hover:shadow-soft-md
      focus:ring-brand-terracota/30
    `,
    secondary: `
      bg-brand-arena dark:bg-dark-surface
      text-brand-carbon dark:text-dark-text-primary
      border border-brand-arena dark:border-dark-border
      hover:shadow-soft hover:border-brand-arena
      focus:ring-brand-terracota/20
    `,
    danger: `
      bg-accent-burdeos dark:bg-accent-burdeos-light
      text-white
      hover:shadow-soft-md
      focus:ring-accent-burdeos/30
    `,
    ghost: `
      bg-transparent
      text-brand-carbon dark:text-dark-text-primary
      hover:bg-brand-arena dark:hover:bg-dark-surface
      focus:ring-brand-terracota/20
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

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

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};
