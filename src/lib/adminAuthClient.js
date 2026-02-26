import { createClient } from '@supabase/supabase-js'

/**
 * Secondary Supabase client with session persistence disabled.
 * Used exclusively by admin operations that create new auth users,
 * so the admin's own session (stored in the main client) is not overwritten.
 */
export const adminAuthClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      // Use a different storage key to avoid multiple GoTrueClient instances
      // colliding with the main client in the same browser context.
      storageKey: 'sb-admin-auth',
    },
  }
)
