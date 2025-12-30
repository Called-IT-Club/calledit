const { createClient } = require('@supabase/supabase-js');

// Config
const url = "https://fgdedmsndzcswojfxuds.supabase.co";
const key = "sb_publishable_dKH20b64-JyvzmOmIfBY6g_i2EVzMWH";

const supabase = createClient(url, key);

async function check() {
    console.log("Listing all predictions...");

    // Get all predictions
    const { data: predictions, error } = await supabase
        .from('predictions')
        .select('id, prediction, user_id, created_at');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`\nFound ${predictions.length} predictions:\n`);
    predictions.forEach(p => {
        console.log(`[${p.created_at.substring(0, 10)}] ${p.prediction.substring(0, 30)}... (User: ${p.user_id})`);
    });

    console.log("\nNote: Compare the 'User' ID above with your current User ID in the browser URL or profile.");
}

check();
