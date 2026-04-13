import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client initialized with the service_role key.
 * Bypasses RLS — use ONLY for privileged admin operations:
 *   - deleteUser
 *   - updateUserById (password change)
 *
 * Never expose this client to non-admin code paths.
 */
export const adminServiceClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'sb-service-auth',
    },
  }
)
