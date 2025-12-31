import { type NextRequest, NextResponse } from 'next/server';
import { getAdminClients, checkAdminRole } from '@/lib/supabase-server';

/**
 * GET /api/admin/affiliates
 * Fetches all affiliate links for admin management.
 * Requires admin role.
 * 
 * @returns {Promise<NextResponse>} JSON response with affiliates array
 */
export async function GET() {
    try {
        const { authClient, adminClient } = await getAdminClients();
        const { data: { user } } = await authClient.auth.getUser();

        if (!user || !(await checkAdminRole(user.id, adminClient))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data, error } = await adminClient
            .from('affiliates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ affiliates: data });

    } catch (error: unknown) {
        console.error('Admin Affiliates API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/admin/affiliates
 * Creates a new affiliate link.
 * Requires admin role.
 * 
 * @param {NextRequest} req - Request with affiliate data in body
 * @returns {Promise<NextResponse>} JSON response with created affiliate
 */
export async function POST(req: NextRequest) {
    try {
        const { authClient, adminClient } = await getAdminClients();
        const { data: { user } } = await authClient.auth.getUser();

        if (!user || !(await checkAdminRole(user.id, adminClient))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();

        if (!body.label || !body.url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await adminClient
            .from('affiliates')
            .insert([body])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ affiliate: data });

    } catch (error: unknown) {
        console.error('Admin Affiliates POST Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * PUT /api/admin/affiliates
 * Updates an existing affiliate link.
 * Requires admin role.
 * 
 * @param {NextRequest} req - Request with affiliate ID and updates in body
 * @returns {Promise<NextResponse>} JSON response with updated affiliate
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
            .from('affiliates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ affiliate: data });

    } catch (error: unknown) {
        console.error('Admin Affiliates PUT Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/affiliates
 * Deletes an affiliate link by ID.
 * Requires admin role.
 * 
 * @param {NextRequest} req - Request with affiliate ID in query params
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
            .from('affiliates')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Admin Affiliates DELETE Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
