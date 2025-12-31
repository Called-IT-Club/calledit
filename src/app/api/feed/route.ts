import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mapPrediction } from '@/lib/mappers';

/**
 * GET /api/feed
 * Fetches public predictions feed with cursor-based pagination.
 * This is a public endpoint - no authentication required.
 * 
 * Query Parameters:
 * - limit: Number of predictions to return (default: 20)
 * - cursor: created_at timestamp for pagination (returns predictions older than cursor)
 * 
 * @param {NextRequest} req - Request with query parameters
 * @returns {Promise<NextResponse>} JSON response with public predictions array
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '20');
        const cursor = searchParams.get('cursor'); // created_at timestamp

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

        let query = supabase
            .from('predictions')
            .select('*, profiles(*)')
            .eq('is_private', false)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (cursor) {
            query = query.lt('created_at', cursor);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Feed API Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const predictions = data ? data.map(mapPrediction) : [];

        return NextResponse.json({ predictions });

    } catch (error) {
        console.error('Feed API Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
