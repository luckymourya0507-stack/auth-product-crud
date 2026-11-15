// A labelled input that shows the server's field-level validation error underneath.
export default function FormField({ label, name, error, as = 'input', ...props }) {
  const Tag = as
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <Tag name={name} className={error ? 'input input-error' : 'input'} {...props} />
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

// Turns the API's [{ field, message }] list into { field: message } for easy lookup.
export const errorsToMap = (errors = []) =>
  errors.reduce((map, e) => ({ ...map, [e.field]: e.message }), {})
