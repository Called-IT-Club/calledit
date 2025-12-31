import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options, maxAge: -1 });
                    cookieStore.delete({ name, ...options });
                },
            },
        }
    );

    // Check if we have a session to sign out from
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        await supabase.auth.signOut();
    }

    // Redirect to home page after sign out
    return NextResponse.json({ success: true });
}
