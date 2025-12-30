const { createClient } = require('@supabase/supabase-js');

const url = "https://fgdedmsndzcswojfxuds.supabase.co";
const key = "sb_publishable_dKH20b64-JyvzmOmIfBY6g_i2EVzMWH";

const supabase = createClient(url, key);

async function check() {
    console.log("Checking RLS Status via rpc or inference...");
    // We can't query pg_class directly from client easily without function.
    // So we will try to fetch a row that is NOT ours while Authenticated.

    // I need a secondary test.
    // This script runs as ANON. User says ANON works.
    console.log("This script runs as ANON. Verifying Anon Access...");
    const { data, error } = await supabase.from('predictions').select('id').limit(1);
    if (data && data.length > 0) console.log("Anon Access: OK");
    else console.log("Anon Access: FAILED or Empty");

    console.log("To debug authenticated access preventing feed visibility:");
    console.log("If RLS is Enabled, you need a policy: 'Allow Public Read' for role 'authenticated'.");
    console.log("If RLS is Disabled, everyone sees everything.");
}

check();
