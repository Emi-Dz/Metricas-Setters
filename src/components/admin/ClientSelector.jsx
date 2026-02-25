import { Spinner } from '../ui/Spinner'

/**
 * Dropdown to switch between clients (admin view).
 */
export function ClientSelector({ clientes, selectedId, onChange, loading }) {
  if (loading) {
    return <Spinner size="sm" />
  }

  return (
    <div className="client-selector">
      <span className="client-selector__label">Ver cliente:</span>
      <select
        className="form-select"
        value={selectedId ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">— Seleccioná un cliente —</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
