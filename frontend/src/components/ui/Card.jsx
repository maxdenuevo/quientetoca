/**
 * Card Component - Neon Editorial Design
 *
 * Variantes:
 * - default: Fondo surface, borde sutil
 * - elevated: Fondo elevated
 * - outlined: Solo borde, transparente
 * - glow: Con efecto glow en hover
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hoverable = false,
  laserLine,
  accentBorder = false,
  onClick,
  ...props
}) {
  const baseStyles = `
    transition-all duration-200
  `;

  const variants = {
    default: `
      bg-neon-surface border border-neon-border
    `,
    elevated: `
      bg-neon-elevated border border-neon-border
    `,
    outlined: `
      bg-transparent border border-neon-border
    `,
    glow: `
      bg-neon-surface border border-neon-border
      hover:glow-accent
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverStyles = hoverable
    ? 'hover:border-accent cursor-pointer'
    : '';

  const laserLineStyles = laserLine
    ? {
        bottom: 'border-b-2 border-accent',
        left: 'border-l-3 border-accent',
        top: 'border-t-2 border-accent',
        right: 'border-r-3 border-accent',
      }[laserLine]
    : '';

  const accentBorderStyle = accentBorder ? 'border-accent' : '';

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
        ${laserLineStyles}
        ${accentBorderStyle}
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
    <h3 className={`font-headline font-bold text-lg text-text-primary ${className}`}>
      {children}
    </h3>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`text-text-primary font-body ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-neon-border ${className}`}>
      {children}
    </div>
  );
};

