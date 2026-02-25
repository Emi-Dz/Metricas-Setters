import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches metricas_diarias for a given client within a date range.
 * Returns the raw rows plus pre-computed column totals.
 */
export function useMetrics(clienteId, fromDate, toDate) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!clienteId || !fromDate || !toDate) {
      setData([])
      return
    }

    setLoading(true)
    setError(null)

    supabase
      .from('metricas_diarias')
      .select('*')
      .eq('cliente_id', clienteId)
      .gte('fecha', fromDate)
      .lte('fecha', toDate)
      .order('fecha', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) {
          setError(err.message)
          setData([])
        } else {
          setData(rows ?? [])
        }
        setLoading(false)
      })
  }, [clienteId, fromDate, toDate])

  const totals = useMemo(
    () => ({
      leads: data.reduce((s, r) => s + (r.leads_totales ?? 0), 0),
      enviadas: data.reduce((s, r) => s + (r.agendas_enviadas ?? 0), 0),
      confirmadas: data.reduce((s, r) => s + (r.agendas_confirmadas ?? 0), 0),
    }),
    [data]
  )

  return { data, totals, loading, error }
}
