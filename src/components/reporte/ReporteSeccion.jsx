/**
 * Wrapper genérico para cada sección del reporte quincenal.
 * Renderiza un título con número y el contenido en un card.
 */
export default function ReporteSeccion({ numero, titulo, children }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {numero && (
          <span style={{
            background: 'var(--color-primary-500)',
            color: '#fff',
            borderRadius: 'var(--radius-full)',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            flexShrink: 0,
          }}>
            {numero}
          </span>
        )}
        <h3 style={{
          margin: 0,
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
        }}>
          {titulo}
        </h3>
      </div>
      <div>{children}</div>
    </div>
  )
}
