import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * CRUD hook for the notas table.
 * Admin can create/update/delete.
 * Both admin and client can read (RLS enforced on Supabase side).
 *
 * @param {string}      clienteId
 * @param {string|null} fromDate  - ISO date string 'YYYY-MM-DD' (dashboard range start)
 * @param {string|null} toDate    - ISO date string 'YYYY-MM-DD' (dashboard range end)
 */
export function useNotas(clienteId, fromDate = null, toDate = null) {
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNotas = async () => {
    if (!clienteId) {
      setNotas([])
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('notas')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setNotas(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotas()
  }, [clienteId])

  // Client-side filtering by date overlap.
  // A nota is visible if:
  //   - it has no period (periodo_desde is null) → always visible (legacy)
  //   - its period overlaps with [fromDate, toDate]: periodo_desde <= toDate && periodo_hasta >= fromDate
  const filteredNotas = useMemo(() => {
    if (!fromDate || !toDate) return notas
    return notas.filter((nota) => {
      if (!nota.periodo_desde) return true
      return nota.periodo_desde <= toDate && nota.periodo_hasta >= fromDate
    })
  }, [notas, fromDate, toDate])

  const createNota = async ({ titulo, contenido, periodo_desde = null, periodo_hasta = null }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const tempId = crypto.randomUUID()
    const tempNota = {
      id: tempId,
      cliente_id: clienteId,
      autor_id: user?.id,
      titulo,
      contenido,
      periodo_desde,
      periodo_hasta,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _optimistic: true,
    }

    // Optimistic update
    setNotas((prev) => [tempNota, ...prev])

    const { data, error: err } = await supabase
      .from('notas')
      .insert({
        cliente_id: clienteId,
        autor_id: user?.id,
        titulo,
        contenido,
        periodo_desde,
        periodo_hasta,
      })
      .select()
      .single()

    if (err) {
      // Revert
      setNotas((prev) => prev.filter((n) => n.id !== tempId))
      setError(err.message)
      return { error: err }
    }

    // Replace temp with real
    setNotas((prev) => prev.map((n) => (n.id === tempId ? data : n)))
    return { data }
  }

  const updateNota = async (notaId, { titulo, contenido, periodo_desde = null, periodo_hasta = null }) => {
    // Save previous for rollback
    const previous = notas.find((n) => n.id === notaId)

    // Optimistic update
    setNotas((prev) =>
      prev.map((n) =>
        n.id === notaId
          ? { ...n, titulo, contenido, periodo_desde, periodo_hasta, updated_at: new Date().toISOString() }
          : n
      )
    )

    const { data, error: err } = await supabase
      .from('notas')
      .update({ titulo, contenido, periodo_desde, periodo_hasta, updated_at: new Date().toISOString() })
      .eq('id', notaId)
      .select()
      .single()

    if (err) {
      // Revert
      setNotas((prev) => prev.map((n) => (n.id === notaId ? previous : n)))
      setError(err.message)
      return { error: err }
    }

    setNotas((prev) => prev.map((n) => (n.id === notaId ? data : n)))
    return { data }
  }

  const deleteNota = async (notaId) => {
    // Save for rollback
    const previous = notas.find((n) => n.id === notaId)

    // Optimistic update
    setNotas((prev) => prev.filter((n) => n.id !== notaId))

    const { error: err } = await supabase
      .from('notas')
      .delete()
      .eq('id', notaId)

    if (err) {
      // Revert
      setNotas((prev) => [previous, ...prev].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      ))
      setError(err.message)
      return { error: err }
    }

    return {}
  }

  return { notas: filteredNotas, loading, error, createNota, updateNota, deleteNota }
}
