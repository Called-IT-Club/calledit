const { createClient } = require('@supabase/supabase-js');

const url = "https://fgdedmsndzcswojfxuds.supabase.co";
const key = "sb_publishable_dKH20b64-JyvzmOmIfBY6g_i2EVzMWH";

const supabase = createClient(url, key);

async function check() {
    console.log("Testing Join Query...");

    // Test the exact query used in feed/page.tsx
    const { data, error } = await supabase
        .from('predictions')
        .select('id, prediction, created_at, is_private, user_id, profiles(full_name, username, avatar_url, email)')
        .limit(5);

    if (error) {
        console.error("QUERY ERROR:", JSON.stringify(error, null, 2));
        console.log("\nPossible Cause: The foreign key relationship 'profiles' might not exist or is named differently.");
    } else {
        console.log(`Success! Found ${data.length} rows.`);
        if (data.length > 0) {
            console.log("First row:", JSON.stringify(data[0], null, 2));
            if (data[0].profiles === null) {
                console.log("\nWARNING: 'profiles' is null. This means the user_id in predictions table does NOT exist in profiles table (Orphaned Record).");
            }
        }
    }
}

check();
