import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * GET /api/ads
 * Fetches all active advertisements from the database.
 * This is a public endpoint - no authentication required.
 * 
 * @returns {Promise<NextResponse>} JSON response with active ads array
 */
export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('advertisements')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Ads API Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ads: data || [] });

    } catch (error) {
        console.error('Ads API Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
