const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

async function seedSlots() {
  console.log("🚀 Starting seed...");

  const { data: venues } = await supabase.from('venues').select('id');
  
  if (!venues || venues.length === 0) {
    console.log("❌ No venues found.");
    return;
  }

  const newSlots = [];
  const times = ["17:00:00", "18:00:00", "19:00:00", "20:00:00", "21:00:00"];

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0]; 

    venues.forEach(venue => {
      times.forEach(time => {
        // COMBINE DATE AND TIME HERE
        // Result looks like: "2025-12-18T17:00:00Z"
        const fullTimestamp = `${dateString}T${time}Z`;

        newSlots.push({
          venue_id: venue.id,
          slot_date: dateString,
          start_time: fullTimestamp, // This is now a valid timestamp
          is_booked: false
        });
      });
    });
  }

  const { error } = await supabase.from('slots').insert(newSlots);

  if (error) {
    console.error("❌ Error seeding:", error.message);
  } else {
    console.log(`✅ Success! Inserted ${newSlots.length} slots for the next 2 weeks.`);
  }
}

seedSlots();