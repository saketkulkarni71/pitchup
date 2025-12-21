import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/utils/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Signature Verification Failed:", err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const slotId = session.metadata?.slotId;
    const userId = session.metadata?.userId;

    if (slotId && userId) {
      console.log(`Payment Success! Finalizing booking for slot: ${slotId}`);

      // 1. Create a permanent Booking record
      const { error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          user_id: userId,
          slot_id: slotId,
          payment_intent_id: session.payment_intent as string,
          amount: session.amount_total,
          status: 'confirmed'
        });

      if (bookingError) {
        console.error("Failed to create booking record:", bookingError.message);
        // We generally shouldn't fail here, but if we do, we might need manual intervention or retry
      }

      // 2. Update Slot status to 'booked' and remove the lock
      const { error: slotError } = await supabaseAdmin
        .from('slots')
        .update({
          is_booked: true, // Keeping this for backward compatibility if other parts of app use it
          status: 'booked',
          locked_until: null,
          booked_by: userId // Ensure we track who booked it on slot level too if needed for easy joining
        })
        .eq('id', slotId);

      if (slotError) console.error("Failed to update slot status:", slotError.message);

      // 3. Send Confirmation Email (Async - don't block response)
      // Retrieve venue details again inside webhook or pass effectively.
      // For simplicity, we query the slot+venue details or use what we have.
      // Ideally we fetch details to send a nice email.
      (async () => {
        try {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
          const { data: slotData } = await supabaseAdmin
            .from('slots')
            .select('*, venues(*)')
            .eq('id', slotId)
            .single();

          if (userData?.user?.email && slotData?.venues) {
            // Dynamic import to avoid crash if file has issues
            const { sendConfirmationEmail } = await import('@/utils/email');
            await sendConfirmationEmail(userData.user.email, {
              venueName: slotData.venues.name,
              date: slotData.slot_date,
              time: slotData.start_time.substring(11, 16),
              price: slotData.venues.price_per_hour,
              bookingRef: session.id
            });
          }
        } catch (emailErr) {
          console.error("Background email task failed:", emailErr);
        }
      })();
    }
  }

  // Optional: Handle payment failure or session expiry to release slots
  // if (event.type === 'checkout.session.expired') { ... }

  return NextResponse.json({ received: true });
}