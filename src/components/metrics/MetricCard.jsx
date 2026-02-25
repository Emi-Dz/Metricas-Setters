/**
 * Single KPI card with an icon, label, value, and optional trend badge.
 *
 * @param {string} label - Card label
 * @param {number} value - Numeric value to display
 * @param {React.ReactNode} icon - SVG icon element
 * @param {'blue'|'purple'|'green'} color - Icon accent color
 * @param {number|null} trend - Percentage change vs previous period (null = hide)
 */
export function MetricCard({ label, value, icon, color = 'blue', trend }) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString('es-AR') : '—'

  return (
    <div className="metric-card">
      <div className={`metric-card__icon-wrap metric-card__icon-wrap--${color}`}>
        {icon}
      </div>
      <div className="metric-card__body">
        <p className="metric-card__label">{label}</p>
        <p className="metric-card__value">{formattedValue}</p>
        {trend !== null && trend !== undefined && (
          <span
            className={`metric-card__trend metric-card__trend--${
              trend >= 0 ? 'up' : 'down'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}
