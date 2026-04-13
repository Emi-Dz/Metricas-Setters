import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { adminAuthClient } from '../lib/adminAuthClient'
import { adminServiceClient } from '../lib/adminServiceClient'

/**
 * Fetches all profiles (admin only) joined with their client name.
 * Also provides updateProfile and createUser mutations.
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('profiles')
      .select('*, clientes(id, nombre)')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setProfiles(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  /**
   * Updates a profile's role and/or cliente_id.
   */
  const updateProfile = async (profileId, { role, cliente_id }) => {
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ role, cliente_id: cliente_id || null, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select('*, clientes(id, nombre)')
      .single()

    if (err) return { error: err }

    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? data : p))
    )
    return { data }
  }

  /**
   * Creates a new Supabase Auth user using the secondary client (no session override),
   * then waits briefly for the DB trigger to create the profiles row,
   * and finally updates the profile with the provided role and cliente_id.
   *
   * @param {{ email: string, password: string, role: string, cliente_id: string|null }} fields
   */
  const createUser = async ({ email, password, role, cliente_id }) => {
    // 1. Create auth user (trigger will insert into profiles automatically)
    const { data: authData, error: authErr } = await adminAuthClient.auth.signUp({
      email,
      password,
    })

    if (authErr) return { error: authErr }
    if (!authData.user) return { error: new Error('No se pudo crear el usuario.') }

    const newUserId = authData.user.id

    // 2. Give the trigger a moment to run, then upsert the profile
    //    (upsert handles the case where the trigger ran vs. email-confirm pending)
    await new Promise((r) => setTimeout(r, 800))

    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .upsert(
        {
          id: newUserId,
          email,
          role,
          cliente_id: cliente_id || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('*, clientes(id, nombre)')
      .single()

    if (profileErr) {
      // Auth user was created but profile update failed — still report partial success
      return { error: profileErr }
    }

    setProfiles((prev) => [profileData, ...prev])
    return { data: profileData }
  }

  /**
   * Deletes a user from Supabase Auth (and cascades to profiles via FK).
   * Requires service_role key.
   */
  const deleteUser = async (userId) => {
    const { error: err } = await adminServiceClient.auth.admin.deleteUser(userId)
    if (err) return { error: err }

    setProfiles((prev) => prev.filter((p) => p.id !== userId))
    return { data: true }
  }

  /**
   * Updates a user's password. Requires service_role key.
   */
  const updatePassword = async (userId, newPassword) => {
    const { error: err } = await adminServiceClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )
    if (err) return { error: err }
    return { data: true }
  }

  return { profiles, loading, error, updateProfile, createUser, deleteUser, updatePassword, refetch: fetchProfiles }
}
