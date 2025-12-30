import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { adId, type } = await req.json();

        if (!adId || !type || !['view', 'click'].includes(type)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

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
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        // Get user if available (tracking logic is loose for now)
        const { data: { user } } = await supabase.auth.getUser();

        // Fire and Forget (don't await deeply to speed up UI)
        await supabase.from('ad_events').insert({
            ad_id: adId,
            type: type,
            user_id: user?.id || null // Null for anon
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Ad Track Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
