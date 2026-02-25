import { MetricCard } from './MetricCard'
import { percentChange } from '../../lib/dateUtils'

function IconLeads() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconEnviadas() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function IconConfirmadas() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

/**
 * Renders the 3-column grid of KPI cards.
 *
 * @param {{ leads, enviadas, confirmadas }} totals - Current period totals
 * @param {{ leads, enviadas, confirmadas }|null} prevTotals - Previous period totals for trend
 */
export function MetricCardGrid({ totals, prevTotals }) {
  const trendLeads = prevTotals ? percentChange(totals.leads, prevTotals.leads) : null
  const trendEnviadas = prevTotals
    ? percentChange(totals.enviadas, prevTotals.enviadas)
    : null
  const trendConfirmadas = prevTotals
    ? percentChange(totals.confirmadas, prevTotals.confirmadas)
    : null

  return (
    <div className="metric-card-grid">
      <MetricCard
        label="Leads Totales"
        value={totals.leads}
        icon={<IconLeads />}
        color="blue"
        trend={trendLeads}
      />
      <MetricCard
        label="Agendas Enviadas"
        value={totals.enviadas}
        icon={<IconEnviadas />}
        color="purple"
        trend={trendEnviadas}
      />
      <MetricCard
        label="Agendas Confirmadas"
        value={totals.confirmadas}
        icon={<IconConfirmadas />}
        color="green"
        trend={trendConfirmadas}
      />
    </div>
  )
}
