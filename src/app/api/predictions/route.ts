import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { mapPrediction } from '@/lib/mappers';

/**
 * Gets the appropriate Supabase client for predictions operations.
 * 
 * Strategy:
 * 1. First authenticates the user with standard client
 * 2. If service role key is available, returns privileged client that bypasses RLS
 * 3. Otherwise returns standard client (bound by RLS policies)
 * 
 * Note: When using service role client, ownership checks MUST be enforced manually
 * since RLS is bypassed.
 * 
 * @returns {Promise<{client, user}>} Supabase client and authenticated user
 */
async function getSupabaseClient() {
    // 1. Always create the standard client first to verify session/auth
    const standardClient = await createSupabaseServerClient();

    // 2. Get the authenticated user
    const { data: { user }, error } = await standardClient.auth.getUser();

    if (error || !user) {
        return { client: null, user: null };
    }

    // 3. If Service Key exists, create a privileged client to BYPASS RLS
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const serviceClient = createSupabaseAdminClient();
        return { client: serviceClient, user };
    }

    // 4. Otherwise return standard client (still bound by RLS)
    return { client: standardClient, user };
}

/**
 * POST /api/predictions
 * Creates a new prediction for the authenticated user.
 * Requires authentication.
 * 
 * @param {NextRequest} req - Request with prediction data in body
 * @returns {Promise<NextResponse>} JSON response with created prediction
 */
export async function POST(req: NextRequest) {
    try {
        const { client: supabase, user } = await getSupabaseClient();
        if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        // Validate basic fields
        if (!body.prediction || !body.category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('predictions')
            .insert([{
                user_id: user.id, // Enforce current user
                category: body.category,
                prediction: body.prediction,
                target_date: body.targetDate,
                meta: body.meta,
                is_private: body.isPrivate,
            }])
            .select('*, profiles(*)') // Fetch with profiles for UI
            .single();

        if (error) throw error;

        return NextResponse.json({ prediction: mapPrediction(data) });

    } catch (error: unknown) {
        console.error('Create Prediction Error:', error);
        return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
    }
}

/**
 * PUT /api/predictions
 * Updates an existing prediction (outcome, evidence, or soft delete).
 * Requires authentication and ownership of the prediction.
 * 
 * Security: Enforces user_id check even when using service role client
 * to prevent unauthorized updates.
 * 
 * @param {NextRequest} req - Request with prediction ID and updates in body
 * @returns {Promise<NextResponse>} JSON response with success status
 */
export async function PUT(req: NextRequest) {
    try {
        const { client: supabase, user } = await getSupabaseClient();
        if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, outcome, evidenceImageUrl, deletedAt } = body;

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        // Build update payload
        const updates: Record<string, unknown> = {};
        if (outcome) updates.outcome = outcome;
        if (evidenceImageUrl !== undefined) updates.evidence_image_url = evidenceImageUrl;

        // If soft delete
        if (deletedAt) updates.deleted_at = deletedAt;

        // Verify ownership (Service Role can edit ANYTHING, so we MUST strictly enforce user_id check manually if using it)
        let query = supabase.from('predictions').update(updates).eq('id', id);

        // Ensure user owns this record (Important when bypassing RLS!)
        query = query.eq('user_id', user.id);

        const { error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Update Prediction Error:', error);
        return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
    }
}

/**
 * DELETE /api/predictions
 * Soft deletes a prediction by setting deleted_at timestamp.
 * Requires authentication and ownership of the prediction.
 * 
 * @param {NextRequest} req - Request with prediction ID in query params
 * @returns {Promise<NextResponse>} JSON response with success status
 */
export async function DELETE(req: NextRequest) {
    try {
        const { client: supabase, user } = await getSupabaseClient();
        if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        // Soft Delete preferred, but if this is called, use logic
        const { error } = await supabase
            .from('predictions')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id); // Strict ownership check

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Delete Prediction Error:', error);
        return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
    }
}
