import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * POST /api/auth/sync-role
 * Syncs user role from database to Supabase user metadata.
 * Reduces database queries by caching role in session.
 * 
 * @returns {Promise<NextResponse>} JSON response with synced role
 */
export async function POST() {
    console.log('🔄 Sync-role API called');

    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('Sync-role - Auth check:', {
            hasUser: !!user,
            userId: user?.id,
            authError: authError?.message
        });

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch role from database
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        const role = profile?.role || 'user';

        // Update user metadata using admin client
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({
                success: false,
                error: 'Service role key not configured'
            }, { status: 500 });
        }

        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { error: updateError } = await adminClient.auth.admin.updateUserById(
            user.id,
            { user_metadata: { ...user.user_metadata, role } }
        );

        if (updateError) {
            console.error('Error updating user metadata:', updateError);
            return NextResponse.json({ error: 'Failed to sync role' }, { status: 500 });
        }

        console.log('✅ Role synced successfully:', { userId: user.id, role });

        return NextResponse.json({ success: true, role });

    } catch (error: unknown) {
        console.error('Sync Role API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
