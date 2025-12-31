import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a standard Supabase server client with cookie handling.
 * Uses the anonymous key and respects RLS policies.
 * 
 * @returns {Promise} Supabase server client
 */
export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* Cookie setting handled by Next.js */ }
            }
        }
    );
}

/**
 * Initializes Supabase clients for admin operations.
 * Creates two clients:
 * 1. Auth Client - For identifying the caller using cookies
 * 2. Admin Client - For database operations (bypasses RLS with service role key)
 * 
 * @returns {Promise<{authClient, adminClient}>} Both Supabase client instances
 */
export async function getAdminClients() {
    const cookieStore = await cookies();

    const authClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* Cookie setting handled by Next.js */ }
            }
        }
    );

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    return { authClient, adminClient };
}

/**
 * Helper to check if a user has admin role.
 * @param {string} userId - User ID to check
 * @param {any} supabase - Supabase client instance
 * @returns {Promise<boolean>} True if user is admin, false otherwise
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkAdminRole(userId: string, supabase: any): Promise<boolean> {
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data || data.role !== 'admin') {
        return false;
    }
    return true;
}
