import { formatDate, subDays, startOfMonth } from '../../lib/dateUtils'

const PRESETS = [
  { label: 'Últimos 7 días', getDates: () => ({ from: formatDate(subDays(new Date(), 7)), to: formatDate(new Date()) }) },
  { label: 'Últimos 30 días', getDates: () => ({ from: formatDate(subDays(new Date(), 30)), to: formatDate(new Date()) }) },
  { label: 'Este mes', getDates: () => ({ from: formatDate(startOfMonth(new Date())), to: formatDate(new Date()) }) },
]

/**
 * Controlled date range picker with preset buttons.
 *
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {(from: string, to: string) => void} onChange - Called on any change
 */
export function DateRangePicker({ from, to, onChange }) {
  const today = formatDate(new Date())

  const handlePreset = (preset) => {
    const dates = preset.getDates()
    onChange(dates.from, dates.to)
  }

  const isActivePreset = (preset) => {
    const dates = preset.getDates()
    return dates.from === from && dates.to === to
  }

  return (
    <div className="date-range-picker">
      <div className="date-range-picker__inputs">
        <label>
          Desde&nbsp;
          <input
            type="date"
            value={from}
            max={to || today}
            onChange={(e) => onChange(e.target.value, to)}
          />
        </label>
        <span className="date-range-picker__sep">—</span>
        <label>
          Hasta&nbsp;
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => onChange(from, e.target.value)}
          />
        </label>
      </div>

      <div className="date-range-picker__presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            className={`preset-btn ${isActivePreset(preset) ? 'preset-btn--active' : ''}`}
            onClick={() => handlePreset(preset)}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
