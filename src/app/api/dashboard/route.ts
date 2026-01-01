import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mapPrediction } from '@/lib/mappers';

/**
 * GET /api/dashboard
 * Fetches all predictions for the authenticated user.
 * Requires authentication - returns 401 if not logged in.
 * Excludes soft-deleted predictions.
 * 
 * @returns {Promise<NextResponse>} JSON response with user's predictions array
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Ignored
                        }
                    },
                },
            }
        );

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('predictions')
            // Fetch reaction and bookmark data for mapping
            .select('*, profiles(full_name, username, avatar_url, email), prediction_reactions(*), prediction_bookmarks(*)')
            .eq('user_id', user.id)
            .is('deleted_at', null) // Soft Delete Filter
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Dashboard API Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Pass user.id to mapper for determining user-specific state
        const predictions = data ? data.map(row => mapPrediction(row, user.id)) : [];

        return NextResponse.json({ predictions });

    } catch (error) {
        console.error('Dashboard API Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
