
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client for client components.
 * Uses the anonymous key and respects RLS policies.
 * For server-side operations, use createServerClient instead.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
