import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * GET /api/profiles/[userId]
 * Fetches a user's public profile information.
 * This is a public endpoint - no authentication required.
 * 
 * @param params - Route params containing userId
 * @returns {Promise<NextResponse>} JSON response with profile data
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const supabase = await createSupabaseServerClient();

        // Fetch user profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, role')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({ profile });

    } catch (error: unknown) {
        console.error('Profile API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
