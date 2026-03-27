import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook para obtener reportes quincenales de un cliente.
 *
 * @param {string|null} clienteId - UUID del cliente
 * @param {string|null} selectedPeriodo - periodo_inicio del reporte seleccionado (YYYY-MM-DD)
 *
 * @returns {Object}
 *   - reportes: lista de períodos disponibles [{ id, periodo_inicio, periodo_fin }]
 *   - reporte: objeto completo del período seleccionado (o el más reciente si no hay selección)
 *   - loading: boolean
 *   - error: string|null
 */
export function useReportesQuincenales(clienteId, selectedPeriodo = null) {
  const [reportes, setReportes] = useState([])
  const [reporte, setReporte] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar lista de períodos disponibles
  useEffect(() => {
    if (!clienteId) {
      setReportes([])
      setReporte(null)
      return
    }

    async function fetchReportes() {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('reportes_quincenales')
        .select('id, periodo_inicio, periodo_fin, generado_en')
        .eq('cliente_id', clienteId)
        .order('periodo_inicio', { ascending: false })

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      setReportes(data || [])
      setLoading(false)
    }

    fetchReportes()
  }, [clienteId])

  // Cargar el reporte completo según período seleccionado (o el más reciente)
  useEffect(() => {
    if (!clienteId || reportes.length === 0) {
      setReporte(null)
      return
    }

    const periodoTarget = selectedPeriodo || reportes[0]?.periodo_inicio
    if (!periodoTarget) return

    async function fetchReporte() {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('reportes_quincenales')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('periodo_inicio', periodoTarget)
        .single()

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      setReporte(data)
      setLoading(false)
    }

    fetchReporte()
  }, [clienteId, selectedPeriodo, reportes])

  return { reportes, reporte, loading, error }
}
