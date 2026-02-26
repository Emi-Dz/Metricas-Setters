import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useClientes } from '../hooks/useClientes'
import { useMetrics } from '../hooks/useMetrics'
import { AppShell } from '../components/layout/AppShell'
import { ClientSelector } from '../components/admin/ClientSelector'
import { MetricCardGrid } from '../components/metrics/MetricCardGrid'
import { MetricsAreaChart } from '../components/metrics/MetricsAreaChart'
import { MetricsTable } from '../components/metrics/MetricsTable'
import { DateRangePicker } from '../components/metrics/DateRangePicker'
import { NotasPanel } from '../components/admin/NotasPanel'
import { PeriodSummary } from '../components/metrics/PeriodSummary'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { formatDate, subDays } from '../lib/dateUtils'

function getDefaultRange() {
  return {
    from: formatDate(subDays(new Date(), 30)),
    to: formatDate(new Date()),
  }
}

export function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { clientes, loading: clientesLoading, error: clientesError } = useClientes()

  // Sync selected client with URL param
  const clienteIdFromUrl = searchParams.get('cliente')
  const [selectedClienteId, setSelectedClienteId] = useState(clienteIdFromUrl || null)

  useEffect(() => {
    if (clienteIdFromUrl) {
      setSelectedClienteId(clienteIdFromUrl)
    }
  }, [clienteIdFromUrl])

  const handleClientChange = (id) => {
    setSelectedClienteId(id)
    if (id) {
      setSearchParams({ cliente: id })
    } else {
      setSearchParams({})
    }
  }

  const [range, setRange] = useState(getDefaultRange)

  const { data, totals, loading: metricsLoading, error: metricsError } = useMetrics(
    selectedClienteId,
    range.from,
    range.to
  )

  // Previous period for trends
  const prevDays = Math.max(
    1,
    Math.round(
      (new Date(range.to) - new Date(range.from)) / (1000 * 60 * 60 * 24)
    )
  )
  const prevFrom = formatDate(subDays(new Date(range.from + 'T00:00:00'), prevDays))
  const prevTo = formatDate(subDays(new Date(range.from + 'T00:00:00'), 1))
  const { totals: prevTotals } = useMetrics(selectedClienteId, prevFrom, prevTo)

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId)

  return (
    <AppShell
      title="Panel de Administración"
      subtitle={selectedCliente ? `Viendo: ${selectedCliente.nombre}` : 'Seleccioná un cliente'}
    >
      {/* Client Selector + Date Picker */}
      <div className="dashboard-toolbar">
        <ClientSelector
          clientes={clientes}
          selectedId={selectedClienteId}
          onChange={handleClientChange}
          loading={clientesLoading}
        />
        {selectedClienteId && (
          <DateRangePicker
            from={range.from}
            to={range.to}
            onChange={(from, to) => setRange({ from, to })}
          />
        )}
      </div>

      {clientesError && (
        <ErrorMessage message={`Error al cargar clientes: ${clientesError}`} />
      )}

      {/* No client selected placeholder */}
      {!selectedClienteId && (
        <div className="no-client-selected">
          <div className="no-client-selected__icon">👆</div>
          <p className="no-client-selected__title">Seleccioná un cliente</p>
          <p className="no-client-selected__text">
            Usá el selector de arriba para ver las métricas y notas de un cliente.
          </p>
        </div>
      )}

      {/* Metrics (only when client is selected) */}
      {selectedClienteId && (
        <>
          {metricsError && (
            <ErrorMessage message={`Error al cargar métricas: ${metricsError}`} />
          )}

          <MetricCardGrid totals={totals} prevTotals={prevTotals} />
          <MetricsAreaChart data={data} />
          <MetricsTable data={data} loading={metricsLoading} />

          {/* Period Summary */}
          <PeriodSummary
            data={data}
            totals={totals}
            clienteId={selectedClienteId}
          />

          {/* Notes (admin = editable) */}
          <NotasPanel clienteId={selectedClienteId} readOnly={false} fromDate={range.from} toDate={range.to} />
        </>
      )}
    </AppShell>
  )
}
