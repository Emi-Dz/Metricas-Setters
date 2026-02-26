import { useHistoricalAvg } from '../../hooks/useHistoricalAvg'
import { formatDisplayDate } from '../../lib/dateUtils'

/** Mini card for a single derived KPI */
function SummaryCard({ label, value }) {
  return (
    <div className="summary-card">
      <p className="summary-card__label">{label}</p>
      <p className="summary-card__value">{value}</p>
    </div>
  )
}

function getAnalysisText(currentRate, histRate, hasSufficientData) {
  if (!hasSufficientData) return 'Sin suficiente historial para comparar.'
  if (currentRate === null || histRate === null) return null

  const diff = currentRate - histRate
  const hist = histRate.toFixed(1)

  if (diff > 3) {
    return `✅ El período muestra una conversión superior al promedio histórico (${hist}%). Buen rendimiento.`
  }
  if (diff >= -3) {
    return `➡️ La conversión del período está en línea con el promedio histórico (${hist}%).`
  }
  return `⚠️ La conversión del período está por debajo del promedio histórico (${hist}%). Revisar calidad de leads.`
}

/**
 * Renders the "Resumen del período" section below the metrics table.
 *
 * @param {object[]} data     - Raw rows from useMetrics (current period)
 * @param {object}   totals   - { leads, enviadas, confirmadas } from useMetrics
 * @param {string}   clienteId
 */
export function PeriodSummary({ data, totals, clienteId }) {
  const { histRate, hasSufficientData } = useHistoricalAvg(clienteId)

  // Derived KPIs
  const { leads, enviadas, confirmadas } = totals

  const conversionRate =
    leads > 0 ? ((enviadas / leads) * 100).toFixed(1) + '%' : '—'

  const confirmationRate =
    enviadas > 0 ? ((confirmadas / enviadas) * 100).toFixed(1) + '%' : '—'

  const peakRow =
    data.length > 0
      ? data.reduce(
          (max, r) =>
            (r.leads_totales ?? 0) > (max.leads_totales ?? 0) ? r : max,
          data[0]
        )
      : null

  const peakDay = peakRow
    ? `${formatDisplayDate(peakRow.fecha)} · ${peakRow.leads_totales} leads`
    : '—'

  // Analysis text
  const currentRate = leads > 0 ? (enviadas / leads) * 100 : null
  const analysisText = getAnalysisText(currentRate, histRate, hasSufficientData)

  return (
    <section className="period-summary">
      <div className="period-summary__header">
        <h2 className="period-summary__title">Resumen del período</h2>
      </div>

      {/* Part 1 — KPI cards */}
      <div className="summary-kpi-grid">
        <SummaryCard
          label="Leads atendidos"
          value={leads.toLocaleString('es-AR')}
        />
        <SummaryCard
          label="Agendas enviadas"
          value={enviadas.toLocaleString('es-AR')}
        />
        <SummaryCard
          label="Agendas confirmadas"
          value={confirmadas.toLocaleString('es-AR')}
        />
        <SummaryCard label="Tasa de conversión a agenda" value={conversionRate} />
        <SummaryCard label="Tasa de confirmación" value={confirmationRate} />
        <SummaryCard label="Día pico" value={peakDay} />
      </div>

      {/* Part 2 — Automatic analysis */}
      <div className="period-summary__analysis">
        <p className="period-summary__analysis-title">Análisis automático</p>
        <p className="period-summary__analysis-text">
          {analysisText ?? 'Sin datos suficientes para el análisis.'}
        </p>
      </div>
    </section>
  )
}
