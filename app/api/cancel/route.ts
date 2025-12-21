import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

export async function POST(req: Request) {
    try {
        const { bookingId, userId } = await req.json();

        if (!bookingId || !userId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Fetch Booking
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*, slots(*)')
            .eq('id', bookingId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // 2. Check Cancellation Policy (e.g. 24h before)
        // For demo, we allow cancellation anytime if it's in the future
        const slotTime = new Date(booking.slots.start_time);
        const now = new Date();

        if (slotTime < now) {
            return NextResponse.json({ error: 'Cannot cancel past bookings' }, { status: 400 });
        }

        // 3. Process Refund (Optional - just comment out for now)
        // if (booking.payment_intent_id) {
        //    await stripe.refunds.create({ payment_intent: booking.payment_intent_id });
        // }

        // 4. Update Booking Status -> Cancelled
        const { error: cancelError } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);

        if (cancelError) throw cancelError;

        // 5. Release Slot -> Available
        const { error: releaseError } = await supabaseAdmin
            .from('slots')
            .update({
                is_booked: false,
                status: 'available',
                booked_by: null,
            })
            .eq('id', booking.slot_id);

        if (releaseError) throw releaseError;

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Cancellation Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
