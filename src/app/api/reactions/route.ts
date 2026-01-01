import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { predictionId, reactionType } = await request.json();

        if (!predictionId || !reactionType) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Check if reaction exists
        const { data: existingReaction, error: fetchError } = await supabase
            .from('prediction_reactions')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('prediction_id', predictionId)
            .eq('reaction_type', reactionType)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error('Error checking reaction:', fetchError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (existingReaction) {
            // Remove reaction (Toggle OFF)
            const { error: deleteError } = await supabase
                .from('prediction_reactions')
                .delete()
                .eq('id', existingReaction.id);

            if (deleteError) throw deleteError;
            return NextResponse.json({ action: 'removed' });
        } else {
            // Add reaction (Toggle ON)
            const { error: insertError } = await supabase
                .from('prediction_reactions')
                .insert({
                    user_id: session.user.id,
                    prediction_id: predictionId,
                    reaction_type: reactionType
                });

            if (insertError) throw insertError;
            return NextResponse.json({ action: 'added' });
        }

    } catch (error: any) {
        console.error('Reaction API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
