export function Spinner({ size = 'md', color = 'primary' }) {
  return (
    <div
      className={`spinner spinner--${size} spinner--${color}`}
      aria-label="Cargando..."
      role="status"
    />
  )
}
