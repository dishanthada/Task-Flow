/**
 * Reusable Input — premium, large, top-aligned labels.
 */
const Input = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  required = false,
  disabled = false,
  className = '',
  as: Tag = 'input',
  rows = 4,
  name,
  autoFocus,
  ...props
}) => {
  const inputClass = ['form-input', error ? 'error' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>
          )}
        </label>
      )}

      {Tag === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`${inputClass} resize-none`}
          required={required}
          autoFocus={autoFocus}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClass}
          required={required}
          autoFocus={autoFocus}
          {...props}
        />
      )}

      {error && (
        <p style={{
          fontSize: 12,
          color: 'var(--red)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 1,
        }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
