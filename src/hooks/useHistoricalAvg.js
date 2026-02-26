import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches all-time metricas_diarias for a client and computes
 * the historical conversion rate (agendas_enviadas / leads_totales).
 *
 * Re-fetches only when clienteId changes.
 */
export function useHistoricalAvg(clienteId) {
  const [histRate, setHistRate] = useState(null)
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!clienteId) {
      setHistRate(null)
      setTotalDays(0)
      return
    }

    setLoading(true)

    supabase
      .from('metricas_diarias')
      .select('leads_totales, agendas_enviadas')
      .eq('cliente_id', clienteId)
      .then(({ data, error }) => {
        if (error || !data) {
          setHistRate(null)
          setTotalDays(0)
          setLoading(false)
          return
        }

        const totalLeads = data.reduce((s, r) => s + (r.leads_totales ?? 0), 0)
        const totalEnviadas = data.reduce(
          (s, r) => s + (r.agendas_enviadas ?? 0),
          0
        )

        setHistRate(totalLeads > 0 ? (totalEnviadas / totalLeads) * 100 : null)
        setTotalDays(data.length)
        setLoading(false)
      })
  }, [clienteId])

  return { histRate, totalDays, hasSufficientData: totalDays >= 7, loading }
}
