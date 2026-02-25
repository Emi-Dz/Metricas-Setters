import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { EmptyState } from '../ui/EmptyState'

function IconChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function formatAxisDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const date = new Date(label + 'T00:00:00')
  const formattedDate = date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
        fontSize: '13px',
      }}
    >
      <p
        style={{
          fontWeight: 600,
          color: '#111827',
          marginBottom: '6px',
          textTransform: 'capitalize',
        }}
      >
        {formattedDate}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          style={{ color: entry.color, marginBottom: '2px' }}
        >
          {entry.name}: <strong>{entry.value?.toLocaleString('es-AR')}</strong>
        </p>
      ))}
    </div>
  )
}

export function MetricsAreaChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Evolución diaria</h3>
        </div>
        <EmptyState
          icon={<IconChart />}
          title="Sin datos en el período"
          description="No hay métricas registradas para el rango de fechas seleccionado."
        />
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Evolución diaria</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradEnviadas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradConfirmadas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="fecha"
            tickFormatter={formatAxisDate}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
          />

          <Area
            type="monotone"
            dataKey="leads_totales"
            name="Leads"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradLeads)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="agendas_enviadas"
            name="Agendas Enviadas"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#gradEnviadas)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="agendas_confirmadas"
            name="Agendas Confirmadas"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#gradConfirmadas)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
