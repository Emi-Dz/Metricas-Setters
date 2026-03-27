import ReporteSeccion from './ReporteSeccion'

/**
 * Muestra los patrones detectados por IA con sus oportunidades,
 * las brechas identificadas y las recomendaciones estratégicas.
 */
export default function ReportePatrones({ patrones = [], brechas = [], recomendaciones = [] }) {
  return (
    <>
      {patrones.length > 0 && (
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

      {recomendaciones.length > 0 && (
        <ReporteSeccion numero="9" titulo="Recomendaciones Estratégicas">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {recomendaciones.map((r, i) => (
              <div key={i}>
                <p style={{
                  margin: '0 0 var(--space-1)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}>
                  {r.numero ? `${r.numero}. ` : ''}{r.titulo}
                </p>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {r.descripcion}
                </p>
              </div>
            ))}
          </div>
        </ReporteSeccion>
      )}
    </>
  )
}
