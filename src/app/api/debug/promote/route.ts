import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        console.log("Attempting to promote user:", userId);

        // Check if service role key exists
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("SUPABASE_SERVICE_ROLE_KEY is not set!");
            return NextResponse.json({ error: 'Server configuration error: Missing service role key' }, { status: 500 });
        }

        // Use Service Role to bypass RLS and update profile
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log("Executing update for user:", userId);
        const { data, error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)
            .select();

        console.log("Update result:", { data, error: updateError });

        if (updateError) {
            console.error("Promotion failed:", updateError);
            return NextResponse.json({ error: updateError.message, details: updateError }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "User promoted to Admin", data });

    } catch (e: any) {
        console.error("Promote endpoint exception:", e);
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
