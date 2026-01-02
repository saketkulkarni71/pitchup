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

  // Fetch ALL existing slots using pagination (Supabase default limit is 1000)
  let allExistingSlots = [];
  let from = 0;
  const step = 1000;
  let fetching = true;

  console.log("📡 Fetching existing slots...");
  while (fetching) {
    const { data, error } = await supabase
      .from('slots')
      .select('venue_id, slot_date, start_time')
      .range(from, from + step - 1);

    if (error) {
      console.error("❌ Error fetching slots:", error.message);
      return;
    }

    if (data && data.length > 0) {
      allExistingSlots = allExistingSlots.concat(data);
      from += step;
      if (data.length < step) fetching = false;
    } else {
      fetching = false;
    }
  }
  console.log(`📊 Found ${allExistingSlots.length} existing slots in database.`);

  // Create two types of lookups:
  // 1. A set of exact venue-timestamp combinations (numeric)
  // 2. A set of venue-date combinations that already have slots
  const existingSlotKeys = new Set();
  const venueDatesWithSlots = new Set();

  allExistingSlots.forEach(slot => {
    const timeValue = new Date(slot.start_time).getTime();
    existingSlotKeys.add(`${slot.venue_id}-${timeValue}`);
    venueDatesWithSlots.add(`${slot.venue_id}-${slot.slot_date}`);
  });

  const newSlots = [];
  const times = ["17:00:00", "18:00:00", "19:00:00", "20:00:00", "21:00:00"];

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];

    venues.forEach(venue => {
      // RULE: Only if the venue has no slot times for this date, we add the time slots
      if (venueDatesWithSlots.has(`${venue.id}-${dateString}`)) {
        return;
      }

      times.forEach(time => {
        const fullTimestamp = `${dateString}T${time}Z`;
        const timeValue = new Date(fullTimestamp).getTime();
        const slotKey = `${venue.id}-${timeValue}`;

        if (!existingSlotKeys.has(slotKey)) {
          newSlots.push({
            venue_id: venue.id,
            slot_date: dateString,
            start_time: fullTimestamp,
            is_booked: false,
            status: 'available'
          });
        }
      });
    });
  }

  if (newSlots.length === 0) {
    console.log("✨ All venues are already seeded for the next 14 days. 0 slots added.");
    return;
  }

  console.log(`🌱 Inserting ${newSlots.length} new slots...`);
  const { error: insertError } = await supabase.from('slots').insert(newSlots);

  if (insertError) {
    console.error("❌ Error seeding:", insertError.message);
  } else {
    console.log(`✅ Success! Inserted ${newSlots.length} new slots.`);
  }
}

seedSlots();