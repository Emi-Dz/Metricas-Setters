import ReporteSeccion from './ReporteSeccion'

/**
 * Muestra los patrones detectados por IA con sus oportunidades
 * y las brechas identificadas. Las recomendaciones se renderizan
 * por separado en ReportePage para mantener el orden correcto.
 */
export default function ReportePatrones({ patrones = [], brechas = [], ejemplos = [] }) {
  return (
    <>
      {(patrones.length > 0 || ejemplos.length > 0) && (
        <ReporteSeccion numero="6" titulo="Análisis Cualitativo — Patrones Detectados">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {patrones.map((p, i) => (
              <div key={i}>
                <p style={{
                  margin: '0 0 var(--space-1)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-base)',
                }}>
                  {p.titulo}
                </p>
                <p style={{ margin: '0 0 var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {p.descripcion}
                </p>
                {p.oportunidad && (
                  <p style={{
                    margin: 0,
                    color: 'var(--color-primary-500)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}>
                    &gt;&gt; {p.oportunidad}
                  </p>
                )}
              </div>
            ))}

            {ejemplos.length > 0 && (
              <div style={{ marginTop: patrones.length > 0 ? 'var(--space-3)' : 0 }}>
                <p style={{
                  margin: '0 0 var(--space-3)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Ejemplos Destacados de Conversaciones
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {ejemplos.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        borderLeft: '3px solid var(--color-primary-500)',
                        paddingLeft: 'var(--space-4)',
                      }}
                    >
                      {e.titulo && (
                        <p style={{
                          margin: '0 0 var(--space-2)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--font-size-sm)',
                        }}>
                          {e.titulo}
                        </p>
                      )}
                      {e.extracto && (
                        <pre style={{
                          margin: '0 0 var(--space-2)',
                          fontFamily: 'inherit',
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'pre-wrap',
                          background: 'var(--color-surface-raised, #f9fafb)',
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-sm)',
                          lineHeight: 1.6,
                        }}>
                          {e.extracto}
                        </pre>
                      )}
                      {e.contexto && (
                        <p style={{
                          margin: 0,
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-tertiary, var(--color-text-secondary))',
                          fontStyle: 'italic',
                        }}>
                          {e.contexto}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ReporteSeccion>
      )}

      {brechas.length > 0 && (
        <ReporteSeccion numero="7" titulo="Identificación de Brechas">
          <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {brechas.map((b, i) => (
              <li key={i} style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                {b}
              </li>
            ))}
          </ul>
        </ReporteSeccion>
      )}

    </>
  )
}
