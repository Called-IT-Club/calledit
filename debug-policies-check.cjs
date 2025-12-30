const { createClient } = require('@supabase/supabase-js');

const url = "https://fgdedmsndzcswojfxuds.supabase.co";
const key = "sb_publishable_dKH20b64-JyvzmOmIfBY6g_i2EVzMWH";

const supabase = createClient(url, key);

async function checkPolicies() {
    console.log("Checking Active Policies...");

    // Attempt to query pg_policies via RPC (if enabled) or infer from access.
    // Since we can't read system tables directly from client usually...

    // We will test 2 scenarios.

    // 1. Anon Select
    console.log("\n[TEST 1] Anon Select Predictions:");
    const { data: d1, error: e1 } = await supabase
        .from('predictions')
        .select('id, is_private')
        .eq('is_private', false)
        .limit(1);

    if (e1) console.error("Anon Error:", e1.message);
    else console.log("Anon Success. Rows:", d1.length);

    // 2. Anon Select Profiles
    console.log("\n[TEST 2] Anon Select Profiles:");
    const { data: d2, error: e2 } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(1);

    if (e2) console.error("Profile Error:", e2.message);
    else console.log("Profile Success. Rows:", d2.length);

}

checkPolicies();
