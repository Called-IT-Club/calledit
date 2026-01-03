import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { predictionId, friendId, terms } = await request.json();

    if (!predictionId || !friendId || !terms) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the wager
    const { data, error } = await supabase
        .from('wagers')
        .insert({
            challenger_id: user.id, // Current user is the challenger
            recipient_id: friendId, // Friend is the recipient
            prediction_id: predictionId,
            terms: terms,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ wager: data });
}

export async function GET(request: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch wagers where user is challenger or recipient
    const { data: wagers, error } = await supabase
        .from('wagers')
        .select(`
      *,
      challenger:challenger_id (username, full_name, avatar_url),
      recipient:recipient_id (username, full_name, avatar_url),
      prediction:prediction_id (prediction, category, target_date)
    `)
        .or(`challenger_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ wagers });
}

export async function PUT(request: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wagerId, status } = await request.json();

    // Verify user is involved in the wager to update it
    // For accepting/declining, user must be recipient

    // First fetch the wager to check permissions
    const { data: wager, error: fetchError } = await supabase
        .from('wagers')
        .select('*')
        .eq('id', wagerId)
        .single();

    if (fetchError || !wager) {
        return NextResponse.json({ error: 'Wager not found' }, { status: 404 });
    }

    // Logic: 
    // If status is 'accepted' or 'declined', user must be recipient
    if (['accepted', 'declined'].includes(status)) {
        if (wager.recipient_id !== user.id) {
            return NextResponse.json({ error: 'Only recipient can respond' }, { status: 403 });
        }
    }

    // Update
    const { error: updateError } = await supabase
        .from('wagers')
        .update({ status })
        .eq('id', wagerId);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
