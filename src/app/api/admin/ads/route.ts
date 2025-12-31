import { type NextRequest, NextResponse } from 'next/server';
import { getAdminClients, checkAdminRole } from '@/lib/supabase-server';

/**
 * GET /api/admin/ads
 * Fetches all advertisements with view and click statistics.
 * Requires admin role.
 * 
 * @returns {Promise<NextResponse>} JSON response with enriched ads array
 */
export async function GET() {
    try {
        const { authClient, adminClient } = await getAdminClients();

        // 1. Verify User
        const { data: { user }, error: authError } = await authClient.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verify Role
        const isAdmin = await checkAdminRole(user.id, adminClient);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Fetch Data (Authenticated as Admin)
        const { data: ads, error } = await adminClient
            .from('advertisements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 4. Enrich with stats (Optional: keeping logic similar to original page)
        // Note: For large scale, use SQL view or RPC.
        const enriched = await Promise.all((ads || []).map(async (ad) => {
            // We can run these in parallel
            const [{ count: views }, { count: clicks }] = await Promise.all([
                adminClient.from('ad_events').select('*', { count: 'exact', head: true }).eq('ad_id', ad.id).eq('type', 'view'),
                adminClient.from('ad_events').select('*', { count: 'exact', head: true }).eq('ad_id', ad.id).eq('type', 'click')
            ]);
            return { ...ad, views: views || 0, clicks: clicks || 0 };
        }));

        return NextResponse.json({ ads: enriched });

    } catch (error: unknown) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

/**
 * POST /api/admin/ads
 * Creates a new advertisement.
 * Requires admin role.
 * 
 * @param {NextRequest} req - Request with ad data in body
 * @returns {Promise<NextResponse>} JSON response with created ad
 */
export async function POST(req: NextRequest) {
    try {
        const { authClient, adminClient } = await getAdminClients();
        const { data: { user } } = await authClient.auth.getUser();

        if (!user || !(await checkAdminRole(user.id, adminClient))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();

        // Validate basic fields
        if (!body.title || !body.link_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await adminClient
            .from('advertisements')
            .insert([{ ...body, created_by: user.id }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ ad: data });

    } catch (error: unknown) {
        console.error('Admin Create Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

/**
 * PUT /api/admin/ads
 * Updates an existing advertisement.
 * Requires admin role.
 * 
 * @param {NextRequest} req - Request with ad ID and updates in body
 * @returns {Promise<NextResponse>} JSON response with updated ad
 */
export async function PUT(req: NextRequest) {
    try {
        const { authClient, adminClient } = await getAdminClients();
        const { data: { user } } = await authClient.auth.getUser();

        if (!user || !(await checkAdminRole(user.id, adminClient))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { data, error } = await adminClient
            .from('advertisements')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ ad: data });

    } catch (error: unknown) {
        console.error('Admin Update Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/ads
 * Deletes an advertisement by ID.
 * Requires admin role.
 * 
 * @param {NextRequest} req - Request with ad ID in query params
 * @returns {Promise<NextResponse>} JSON response with success status
 */
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        const { authClient, adminClient } = await getAdminClients();
        const { data: { user } } = await authClient.auth.getUser();

        if (!user || !(await checkAdminRole(user.id, adminClient))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await adminClient
            .from('advertisements')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Admin Delete Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
