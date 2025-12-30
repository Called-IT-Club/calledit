import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mapPrediction } from '@/lib/mappers';

// Helper to get the best available Supabase client
async function getSupabaseClient() {
    const cookieStore = await cookies();

    // 1. Always create the standard client first to verify session/auth
    const standardClient = createServerClient(
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

    // 2. Get the authenticated user
    const { data: { user }, error } = await standardClient.auth.getUser();

    if (error || !user) {
        return { client: null, user: null };
    }

    // 3. If Service Key exists, create a privileged client to BYPASS RLS
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const serviceClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
        return { client: serviceClient, user };
    }

    // 4. Otherwise return standard client (still bound by RLS)
    return { client: standardClient, user };
}

// CREATE
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

    } catch (error: any) {
        console.error('Create Prediction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// UPDATE
export async function PUT(req: NextRequest) {
    try {
        const { client: supabase, user } = await getSupabaseClient();
        if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, outcome, evidenceImageUrl, deletedAt } = body;

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        // Build Payload
        const updates: any = {};
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

    } catch (error: any) {
        console.error('Update Prediction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE (Hard Delete - if needed, but we mostly use soft delete via PUT)
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

    } catch (error: any) {
        console.error('Delete Prediction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
