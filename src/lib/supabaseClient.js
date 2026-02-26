import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Faltan variables de entorno de Supabase. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

if (import.meta.env.DEV) {
  try {
    // expose for debugging in the browser console (dev only)
    // so you can run: window.supabase.auth.getSession().then(console.log)
    window.supabase = supabase
    console.log('supabase client exposed on window.supabase (dev)')
  } catch (e) {
    // ignore in environments where window is not available
  }
}
