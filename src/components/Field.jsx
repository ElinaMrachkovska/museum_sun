// Поле форми з підписом і повідомленням про помилку.
export default function Field({ label, name, error, as = 'input', children, className = '', ...props }) {
  const Tag = as;
  const id = `f-${name}`;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label htmlFor={id} className="field__label">{label}</label>
      {as === 'select' ? (
        <select id={id} name={name} className="field__control" aria-invalid={!!error} {...props}>
          {children}
        </select>
      ) : (
        <Tag id={id} name={name} className="field__control" aria-invalid={!!error} {...props} />
      )}
      <span className="field__error" role="alert">{error || ''}</span>
    </div>
  );
}
