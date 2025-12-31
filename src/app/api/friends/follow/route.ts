import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * POST /api/friends/follow
 * Creates a friendship (follow) relationship between the authenticated user and a target user.
 * Requires authentication.
 * 
 * Request Body:
 * - targetUserId: ID of the user to follow
 * 
 * @param req - Request with targetUserId in body
 * @returns {Promise<NextResponse>} JSON response with success status
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { targetUserId } = body;

        if (!targetUserId) {
            return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Prevent following yourself
        if (user.id === targetUserId) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        // Check if target user exists
        const { data: targetProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', targetUserId)
            .single();

        if (profileError || !targetProfile) {
            return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
        }

        // Create friendship (upsert to handle duplicates)
        const { error: insertError } = await supabase
            .from('friendships')
            .upsert(
                {
                    user_id: user.id,
                    friend_id: targetUserId
                },
                {
                    onConflict: 'user_id,friend_id'
                }
            );

        if (insertError) throw insertError;

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Friends Follow API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
