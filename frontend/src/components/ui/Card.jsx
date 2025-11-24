import PropTypes from 'prop-types';

/**
 * Card Component
 *
 * Contenedor con estilo Soft UI.
 *
 * Variantes:
 * - default: Borde sutil, fondo marfil/surface
 * - elevated: Con sombra suave
 * - outlined: Solo borde, fondo transparente
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hoverable = false,
  onClick,
  ...props
}) {
  const baseStyles = `
    rounded-soft-lg
    transition-all duration-200
  `;

  const variants = {
    default: `
      bg-brand-marfil dark:bg-dark-surface
      border border-brand-arena dark:border-dark-border
    `,
    elevated: `
      bg-brand-marfil dark:bg-dark-surface
      shadow-soft-md
      border border-transparent dark:border-dark-border
    `,
    outlined: `
      bg-transparent
      border border-brand-arena dark:border-dark-border
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverStyles = hoverable
    ? 'hover:shadow-soft-md hover:border-brand-arena dark:hover:border-dark-border cursor-pointer'
    : '';

  const isClickable = onClick || hoverable;

  const Component = isClickable ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `.trim()}
      {...(isClickable && { type: 'button' })}
      {...props}
    >
      {children}
    </Component>
  );
}

// Subcomponentes para estructura
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`font-bold text-lg text-brand-carbon dark:text-dark-text-primary ${className}`}>
      {children}
    </h3>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`text-brand-carbon dark:text-dark-text-primary ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-brand-arena dark:border-dark-border ${className}`}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
};

Card.Header.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.Title.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
