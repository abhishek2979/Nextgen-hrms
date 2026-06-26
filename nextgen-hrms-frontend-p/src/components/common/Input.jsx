export default function Input({ label, id, error, hint, className = '', textarea = false, rows = 4, ...rest }) {
  const Component = textarea ? 'textarea' : 'input'
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label-text">
          {label}
        </label>
      )}
      <Component
        id={id}
        rows={textarea ? rows : undefined}
        className={`input-field ${error ? 'border-rose-400 focus:border-rose-500' : ''}`}
        {...rest}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink-900/50">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}
