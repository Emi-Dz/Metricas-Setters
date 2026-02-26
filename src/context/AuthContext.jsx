import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

  const fetchProfile = async (userId) => {
    // Reset error at the start so callers can re-detect changes
    setProfileError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        console.error('fetchProfile: error or no data', { userId, error })
        setProfileError(
          'Tu perfil no fue encontrado. Contactá al administrador.'
        )
        return null
      }

      console.log('fetchProfile: got profile', { userId, profile: data })
      setProfile(data)
      setProfileError(null)
      return data
    } catch {
      console.error('fetchProfile: exception for userId', userId)
      setProfileError('Error al cargar el perfil.')
      return null
    }
  }

  useEffect(() => {
    // Defensive: use optional chaining so a null/error response never crashes
    supabase.auth
      .getSession()
      .then(async (result) => {
        const session = result?.data?.session
        console.log('AuthProvider: getSession result', { session })
        if (session?.user) {
          setUser(session.user)
            console.log('AuthProvider: calling fetchProfile for', session.user.id)
            const profile = await fetchProfile(session.user.id)
        }
        setLoading(false)
      })
      .catch((err) => {
        // Ensure loading is always cleared even if getSession rejects
        console.error('AuthProvider: getSession failed', err)
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: onAuthStateChange', { event, session })
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // DO NOT await here — Supabase awaits all onAuthStateChange subscribers
        // internally before resolving signIn(). Awaiting fetchProfile here would
        // block signIn() from ever returning if the DB query hangs.
        fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setProfileError(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      }
    })

      // debug: log right before attempting to fetch profile
      // (this helps verify we actually reach the call site)
      // Note: onAuthStateChange handler already calls fetchProfile; this is extra visibility.
      // (No-op here — actual logging added below where fetchProfile is called.)

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        profileError,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
