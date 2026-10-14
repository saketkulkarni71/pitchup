const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase URL or Anon Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
    console.log("Testing fetch with Anon Key...");
    const { data, error } = await supabase.from('venues').select('*, slots(*)');

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No venues found.");
        return;
    }

    console.log(`Found ${data.length} venues.`);
    data.forEach(venue => {
        console.log(`Venue: ${venue.name}, Slots count: ${venue.slots ? venue.slots.length : 'null'}`);
        if (venue.slots && venue.slots.length > 0) {
            console.log(`First slot sample:`, venue.slots[0]);
            // Check date format
            console.log(`Slot ID: ${venue.slots[0].id}, Date: ${venue.slots[0].slot_date}, Start: ${venue.slots[0].start_time}`);
        }
    });
}

testFetch();
