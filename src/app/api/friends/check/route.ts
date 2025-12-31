import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * GET /api/friends/check
 * Checks if the authenticated user is following a target user.
 * Requires authentication.
 * 
 * Query Parameters:
 * - targetUserId: ID of the user to check
 * 
 * @param req - Request with targetUserId in query params
 * @returns {Promise<NextResponse>} JSON response with isFollowing boolean
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get('targetUserId');

        if (!targetUserId) {
            return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if friendship exists
        const { data, error } = await supabase
            .from('friendships')
            .select('id')
            .eq('user_id', user.id)
            .eq('friend_id', targetUserId)
            .maybeSingle();

        if (error) throw error;

        return NextResponse.json({ isFollowing: !!data });

    } catch (error: unknown) {
        console.error('Friends Check API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
