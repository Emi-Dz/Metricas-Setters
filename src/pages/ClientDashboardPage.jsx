import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMetrics } from '../hooks/useMetrics'
import { AppShell } from '../components/layout/AppShell'
import { MetricCardGrid } from '../components/metrics/MetricCardGrid'
import { MetricsAreaChart } from '../components/metrics/MetricsAreaChart'
import { MetricsTable } from '../components/metrics/MetricsTable'
import { DateRangePicker } from '../components/metrics/DateRangePicker'
import { PeriodSummary } from '../components/metrics/PeriodSummary'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { formatDate, subDays } from '../lib/dateUtils'

function getDefaultRange() {
  return {
    from: formatDate(subDays(new Date(), 30)),
    to: formatDate(new Date()),
  }
}

export function ClientDashboardPage() {
  const { profile } = useAuth()
  const clienteId = profile?.cliente_id

  const [range, setRange] = useState(getDefaultRange)

  const { data, totals, loading, error } = useMetrics(
    clienteId,
    range.from,
    range.to
  )

  // Previous period for trend calculation
  const prevDays = Math.max(
    1,
    Math.round(
      (new Date(range.to) - new Date(range.from)) / (1000 * 60 * 60 * 24)
    )
  )
  const prevFrom = formatDate(subDays(new Date(range.from + 'T00:00:00'), prevDays))
  const prevTo = formatDate(subDays(new Date(range.from + 'T00:00:00'), 1))

  const { totals: prevTotals } = useMetrics(clienteId, prevFrom, prevTo)

  const clienteName = profile?.email?.split('@')[0] ?? 'Cliente'

  return (
    <AppShell
      title="Métricas en Tiempo Real"
      subtitle="Tus métricas de performance"
    >
      {/* Header + Date Picker */}
      <div className="dashboard-toolbar">
        <div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Bienvenido, <strong>{clienteName}</strong>
          </p>
        </div>
        <DateRangePicker
          from={range.from}
          to={range.to}
          onChange={(from, to) => setRange({ from, to })}
        />
      </div>

      {error && <ErrorMessage message={`Error al cargar métricas: ${error}`} />}

      {/* KPI Cards */}
      <MetricCardGrid totals={totals} prevTotals={prevTotals} />

      {/* Area Chart */}
      <MetricsAreaChart data={data} />

      {/* Daily Table */}
      <MetricsTable data={data} loading={loading} />

      {/* Period Summary */}
      {clienteId && (
        <PeriodSummary data={data} totals={totals} clienteId={clienteId} />
      )}

    </AppShell>
  )
}
