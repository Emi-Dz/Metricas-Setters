import ReporteSeccion from './ReporteSeccion'

const INDICADORES = [
  { key: 'total', label: 'Total llamadas' },
  { key: 'interes_alto', label: 'Interés alto' },
  { key: 'interes_medio', label: 'Interés medio' },
  { key: 'interes_bajo', label: 'Interés bajo' },
  { key: 'cierres_probables', label: 'Cierres probables' },
]

/**
 * Sección de análisis cualitativo de llamadas desde GHL.
 * analisis_llamadas: { perfil: string[], objecion_principal: string, estado: {...} }
 */
export default function ReporteLlamadas({ analisis_llamadas = {} }) {
  const { perfil = [], objecion_principal, estado = {} } = analisis_llamadas

  const tieneContenido = perfil.length > 0 || objecion_principal || Object.keys(estado).length > 0

  if (!tieneContenido) return null

  return (
    <ReporteSeccion numero="10" titulo="Análisis Cualitativo de Llamadas">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

        {perfil.length > 0 && (
          <div>
            <p style={{
              margin: '0 0 var(--space-2)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)',
            }}>
              Perfil de leads en llamadas
            </p>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {perfil.map((item, i) => (
                <li key={i} style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {objecion_principal && (
          <div>
            <p style={{
              margin: '0 0 var(--space-2)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)',
            }}>
              Objeción principal (implícita)
            </p>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {objecion_principal}
            </p>
          </div>
        )}

        {Object.keys(estado).length > 0 && (
          <div>
            <p style={{
              margin: '0 0 var(--space-3)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)',
            }}>
              Estado Comercial
            </p>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--font-size-sm)',
            }}>
              <thead>
                <tr style={{ background: 'var(--color-primary-500)' }}>
                  <th style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'left', color: '#fff', fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-sm) 0 0 0' }}>
                    Indicador
                  </th>
                  <th style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right', color: '#fff', fontWeight: 'var(--font-weight-semibold)', borderRadius: '0 var(--radius-sm) 0 0' }}>
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {INDICADORES.map(({ key, label }, i) => (
                  <tr key={key} style={{ background: i % 2 === 0 ? 'var(--color-surface-alt, #f9f9f9)' : 'var(--color-surface)' }}>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>
                      {label}
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                      {estado[key] ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ReporteSeccion>
  )
}
