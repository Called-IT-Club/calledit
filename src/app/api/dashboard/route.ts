import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mapPrediction } from '@/lib/mappers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
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

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('predictions')
            .select('*, profiles(full_name, username, avatar_url, email)')
            .eq('user_id', user.id)
            .is('deleted_at', null) // Soft Delete Filter
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Dashboard API Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const predictions = data ? data.map(mapPrediction) : []; // Map using the centralized mapper

        return NextResponse.json({ predictions });

    } catch (error) {
        console.error('Dashboard API Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
