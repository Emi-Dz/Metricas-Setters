/**
 * Formats a Date object to 'YYYY-MM-DD' string (local time, no timezone shift).
 */
export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns a new Date N days before the given date.
 */
export function subDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

/**
 * Returns the first day of the month for the given date.
 */
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Formats an ISO date string (YYYY-MM-DD) for display in Spanish.
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formats an ISO datetime string for display.
 */
export function formatDateTime(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculates the percentage change between two numbers.
 * Returns null if the previous value is 0.
 */
export function percentChange(current, previous) {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Returns the number of days between two ISO date strings.
 */
export function daysBetween(fromStr, toStr) {
  const from = new Date(fromStr + 'T00:00:00')
  const to = new Date(toStr + 'T00:00:00')
  return Math.round((to - from) / (1000 * 60 * 60 * 24))
}
