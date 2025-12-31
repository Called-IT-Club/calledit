import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { affiliateId, type } = await req.json();

        if (!affiliateId || !type || !['view', 'click'].includes(type)) {
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
                        }
                    },
                },
            }
        );

        // Get user if available
        const { data: { user } } = await supabase.auth.getUser();

        // Fire and Forget
        await supabase.from('affiliate_events').insert({
            affiliate_id: affiliateId,
            type: type,
            user_id: user?.id || null
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Affiliate Track Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
