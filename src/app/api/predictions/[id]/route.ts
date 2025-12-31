import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { type NextRequest, NextResponse } from 'next/server';
import { mapPrediction } from '@/lib/mappers';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Standard Client (for session check if needed, but this is a public endpoint usually)
        // We really just want the data.

        let supabase;

        // Use Service Key for fast, reliable fetching (Public Read)
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            supabase = createSupabaseAdminClient();
        } else {
            // Fallback
            supabase = await createSupabaseServerClient();
        }

        const { data, error } = await supabase
            .from('predictions')
            .select('*, profiles(*)')
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
        }

        return NextResponse.json({ prediction: mapPrediction(data) });

    } catch (error: any) {
        console.error('Get Prediction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
