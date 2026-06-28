import Spinner from './Spinner';

/**
 * Reusable Button component.
 * variant: primary | secondary | danger | ghost
 * size: sm | md | lg | icon
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const variantClass = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
  }[variant] ?? 'btn-primary';

  const sizeClass = {
    sm:   'btn-sm',
    md:   '',
    lg:   'btn-lg',
    icon: 'btn-icon',
  }[size] ?? '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading
        ? <Spinner size="sm" />
        : icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
      }
      {children}
    </button>
  );
};

export default Button;
