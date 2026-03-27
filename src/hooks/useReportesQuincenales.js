import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook para obtener reportes quincenales de un cliente.
 *
 * @param {string|null} clienteId - UUID del cliente
 * @param {string|null} selectedPeriodo - periodo_inicio del reporte seleccionado (YYYY-MM-DD)
 * @param {'admin'|'cliente'} role - rol del usuario actual
 *
 * @returns {Object}
 *   - reportes: lista de períodos disponibles
 *   - reporte: objeto completo del período seleccionado (o el más reciente)
 *   - loading: boolean
 *   - error: string|null
 *   - aprobarReporte(id): aprueba y publica el reporte
 *   - updateReporte(id, fields): actualiza campos del reporte
 */
export function useReportesQuincenales(clienteId, selectedPeriodo = null, role = 'cliente') {
  const [reportes, setReportes] = useState([])
  const [reporte, setReporte] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const isAdmin = role === 'admin'

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

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

      let query = supabase
        .from('reportes_quincenales')
        .select('id, periodo_inicio, periodo_fin, generado_en, aprobado')
        .eq('cliente_id', clienteId)
        .order('periodo_inicio', { ascending: false })

      if (!isAdmin) {
        query = query.eq('aprobado', true)
      }

      const { data, error: err } = await query

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      setReportes(data || [])
      setLoading(false)
    }

    fetchReportes()
  }, [clienteId, isAdmin, refreshKey])

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

  const aprobarReporte = useCallback(
    async (id) => {
      const { error: err } = await supabase
        .from('reportes_quincenales')
        .update({
          aprobado: true,
          aprobado_en: new Date().toISOString(),
        })
        .eq('id', id)

      if (err) return { error: err.message }
      refresh()
      return { error: null }
    },
    [refresh]
  )

  const updateReporte = useCallback(
    async (id, fields) => {
      const { error: err } = await supabase
        .from('reportes_quincenales')
        .update(fields)
        .eq('id', id)

      if (err) return { error: err.message }
      refresh()
      return { error: null }
    },
    [refresh]
  )

  return { reportes, reporte, loading, error, aprobarReporte, updateReporte }
}
