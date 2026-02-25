import { useState } from 'react'
import { EmptyState } from '../ui/EmptyState'
import { Spinner } from '../ui/Spinner'
import { formatDisplayDate } from '../../lib/dateUtils'

function IconTable() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="9" x2="9" y2="21" />
    </svg>
  )
}

const COLUMNS = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'leads_totales', label: 'Leads' },
  { key: 'agendas_enviadas', label: 'Ag. Enviadas' },
  { key: 'agendas_confirmadas', label: 'Ag. Confirmadas' },
]

export function MetricsTable({ data, loading }) {
  const [sortKey, setSortKey] = useState('fecha')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc((a) => !a)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const sorted = [...(data ?? [])].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    if (av < bv) return sortAsc ? -1 : 1
    if (av > bv) return sortAsc ? 1 : -1
    return 0
  })

  return (
    <div className="metrics-table-container">
      <div className="metrics-table-container__header">
        <h3 className="card__title">Detalle diario</h3>
        {loading && <Spinner size="sm" />}
      </div>

      {!loading && sorted.length === 0 ? (
        <EmptyState
          icon={<IconTable />}
          title="Sin datos"
          description="No hay registros para el período seleccionado."
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="metrics-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)}>
                    {col.label}
                    <span className="sort-icon">
                      {sortKey === col.key ? (sortAsc ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id}>
                  <td className="col-date">{formatDisplayDate(row.fecha)}</td>
                  <td className="col-leads">{(row.leads_totales ?? 0).toLocaleString('es-AR')}</td>
                  <td className="col-enviadas">{(row.agendas_enviadas ?? 0).toLocaleString('es-AR')}</td>
                  <td className="col-confirmadas">{(row.agendas_confirmadas ?? 0).toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
