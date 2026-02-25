import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches all active clients. Intended for admin use only.
 * RLS on Supabase side ensures non-admins can't list all clients.
 */
export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nombre, slug, activo')
      .eq('activo', true)
      .order('nombre')
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          setClientes(data ?? [])
        }
        setLoading(false)
      })
  }, [])

  return { clientes, loading, error }
}
