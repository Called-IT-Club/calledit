import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mapPrediction } from '@/lib/mappers';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();

        // Standard Client (for session check if needed, but this is a public endpoint usually)
        // We really just want the data.

        let supabase;

        // Use Service Key for fast, reliable fetching (Public Read)
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );
        } else {
            // Fallback
            supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() { return cookieStore.getAll(); },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                        },
                    },
                }
            );
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
