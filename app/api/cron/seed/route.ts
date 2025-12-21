import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

export const dynamic = 'force-dynamic'; // Ensure it runs every time

export async function GET(req: Request) {
    // 1. Security Check (Optional: verify Cron secret)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    try {
        console.log("⏰ Starting Cron Job...");

        // --- TASK A: Cleanup Expired Locks ---
        const now = new Date().toISOString();
        const { error: cleanupError } = await supabaseAdmin
            .from('slots')
            .update({ status: 'available', locked_until: null })
            .eq('status', 'pending')
            .lt('locked_until', now);

        if (cleanupError) console.error("Cleanup Error:", cleanupError.message);
        else console.log("🧹 Cleaned up expired locks.");


        // --- TASK B: Seed New Slots ---
        // Logic: Ensure we have slots for 14 days from now. 
        // We check the last slot date and add more if needed, or just blindly check each day.

        const { data: venues } = await supabaseAdmin.from('venues').select('id');
        if (!venues) return NextResponse.json({ error: 'No venues' });

        const newSlots = [];
        const times = ["17:00:00", "18:00:00", "19:00:00", "20:00:00", "21:00:00"];

        // Loop next 14 days
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];

            // Check if slots exist for this date/venue to avoid duplicates?
            // For simplicity/performance, we might assume Supabase "ON CONFLICT DO NOTHING" logic if we had constraints,
            // or just check count.
            // Let's just create them and trust the database or application logic to not show dupes, 
            // OR better: Check if any slot exists for this date/venue before inserting.

            // Simpler approach for this MVP cron: 
            // Just try to insert. If you need idempotency, you'd check first.

            for (const venue of venues) {
                for (const time of times) {
                    const fullTimestamp = `${dateString}T${time}Z`;

                    // Add to list, we will use UPSERT or ignore duplicates logic if possible
                    // Without unique constraint on (venue_id, start_time), this might duplicate.
                    // Let's check existence for the *first* batch of the day to save calls, or just ignore for now.

                    // For this demo, let's just Log what we WOULD do, or insert carefully.
                    // Real production: Use "upsert" with a unique constraint on venue_id + start_time
                    newSlots.push({
                        venue_id: venue.id,
                        slot_date: dateString,
                        start_time: fullTimestamp,
                        is_booked: false,
                        status: 'available'
                    });
                }
            }
        }

        // Ideally we use UPSERT on a unique key. 
        // Since we didn't define a unique constraint in the SQL migration, we risk duplicates.
        // I will skip the mass-insert here to avoid flooding the DB with duplicates every run,
        // unless I know I have a unique constraint.
        // Instead, I'll assume the user runs `seed.js` manually or I provide a clearer "Add Next Day" logic.

        // "Add Next Day" logic:
        // Calculate the date 14 days from now.
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 13); // 14th day
        const targetDateString = targetDate.toISOString().split('T')[0];

        // Check if we have slots for this target date
        const { count } = await supabaseAdmin
            .from('slots')
            .select('*', { count: 'exact', head: true })
            .eq('slot_date', targetDateString);

        if (count === 0) {
            console.log(`🌱 Seeding for ${targetDateString}...`);
            const dailySlots = [];
            for (const venue of venues) {
                for (const time of times) {
                    dailySlots.push({
                        venue_id: venue.id,
                        slot_date: targetDateString,
                        start_time: `${targetDateString}T${time}Z`,
                        is_booked: false,
                        status: 'available'
                    });
                }
            }
            await supabaseAdmin.from('slots').insert(dailySlots);
        } else {
            console.log(`✅ Slots already exist for ${targetDateString}`);
        }

        return NextResponse.json({ success: true, message: 'Cron job finished' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
