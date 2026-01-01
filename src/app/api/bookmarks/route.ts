import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { predictionId } = await request.json();

        if (!predictionId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Check if bookmark exists
        const { data: existingBookmark, error: fetchError } = await supabase
            .from('prediction_bookmarks')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('prediction_id', predictionId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking bookmark:', fetchError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (existingBookmark) {
            // Remove bookmark (Toggle OFF)
            const { error: deleteError } = await supabase
                .from('prediction_bookmarks')
                .delete()
                .eq('id', existingBookmark.id);

            if (deleteError) throw deleteError;
            return NextResponse.json({ action: 'removed' });
        } else {
            // Add bookmark (Toggle ON)
            const { error: insertError } = await supabase
                .from('prediction_bookmarks')
                .insert({
                    user_id: session.user.id,
                    prediction_id: predictionId
                });

            if (insertError) throw insertError;
            return NextResponse.json({ action: 'added' });
        }

    } catch (error: any) {
        console.error('Bookmark API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
