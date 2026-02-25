import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * CRUD hook for the notas table.
 * Admin can create/update/delete.
 * Both admin and client can read (RLS enforced on Supabase side).
 */
export function useNotas(clienteId) {
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

  const createNota = async ({ titulo, contenido }) => {
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

  const updateNota = async (notaId, { titulo, contenido }) => {
    // Save previous for rollback
    const previous = notas.find((n) => n.id === notaId)

    // Optimistic update
    setNotas((prev) =>
      prev.map((n) =>
        n.id === notaId
          ? { ...n, titulo, contenido, updated_at: new Date().toISOString() }
          : n
      )
    )

    const { data, error: err } = await supabase
      .from('notas')
      .update({ titulo, contenido, updated_at: new Date().toISOString() })
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

  return { notas, loading, error, createNota, updateNota, deleteNota }
}
