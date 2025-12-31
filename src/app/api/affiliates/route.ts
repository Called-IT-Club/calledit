import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/affiliates
 * Fetches all active affiliate links from the database.
 * This is a public endpoint - no authentication required.
 * Uses RLS policy: "Active affiliates are viewable by everyone"
 * 
 * @returns {Promise<NextResponse>} JSON response with active affiliates array
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll() { /* Cookie setting handled by Next.js */ }
                }
            }
        );

        // Fetch only active affiliates
        // Since we have a public RLS policy "Active affiliates are viewable by everyone", 
        // we can just select where is_active is true explicitly or implicitly if relies on RLS, 
        // but explicit is better for clarity here.
        const { data, error } = await supabase
            .from('affiliates')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;

        return NextResponse.json({ affiliates: data });

    } catch (error: unknown) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
