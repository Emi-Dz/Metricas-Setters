import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'

function LogoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

export function LoginPage() {
  const { signIn, signOut } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const buildEmail = (u) => {
    const trimmed = u.trim()
    return trimmed.includes('@') ? trimmed : `${trimmed}@gmail.com`
  }

  const doLogin = async ({ forceSignOut = false } = {}) => {
    if (!username.trim() || !password) {
      setError('Completá tu usuario y contraseña.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      if (forceSignOut) {
        await signOut()
      }

      // Step 1: authenticate
      const { data: authData, error: authError } = await signIn(
        buildEmail(username),
        password
      )
      console.log('[Login] signIn:', { userId: authData?.session?.user?.id, authError })

      if (authError) {
        setError('Credenciales incorrectas. Verificá tu email y contraseña.')
        setSubmitting(false)
        return
      }

      if (!authData?.session?.user) {
        setError('No se recibió sesión. Intentá nuevamente.')
        setSubmitting(false)
        return
      }

      // Step 2: fetch role directly — no state, no timing issues
      const userId = authData.session.user.id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      console.log('[Login] profile:', { profile, profileError })

      if (profileError || !profile?.role) {
        setError(
          'Tu perfil no fue encontrado. Contactá al administrador.'
        )
        setSubmitting(false)
        return
      }

      // Step 3: hard redirect — bypasses React Router timing entirely
      const dest = profile.role === 'admin' ? '/admin' : '/dashboard'
      console.log('[Login] redirecting to', dest)
      window.location.replace(dest)
    } catch (err) {
      console.error('[Login] unexpected error:', err)
      setError('Error inesperado. Intentá nuevamente.')
      setSubmitting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doLogin()
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand__logo">
            <LogoIcon />
          </div>
          <h1 className="login-brand__title">Métricas Setters</h1>
          <p className="login-brand__subtitle">
            Ingresá a tu panel de métricas
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <ErrorMessage message={error} />}

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Usuario
            </label>
            <div className="input-with-suffix">
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="tunombre"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={submitting}
              />
              <span className="input-with-suffix__suffix">@gmail.com</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="login-submit"
          >
            Ingresar
          </Button>

          {error && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              loading={submitting}
              className="login-submit"
              onClick={() => doLogin({ forceSignOut: true })}
            >
              Forzar inicio de sesión
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
