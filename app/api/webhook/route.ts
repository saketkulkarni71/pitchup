import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Admin client to bypass security and update the 'is_booked' status
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    if (slotId) {
      console.log(`Payment Success! Locking slot: ${slotId}`);
      
      // Update Supabase to mark the pitch as taken
      const { error } = await supabaseAdmin
        .from('slots')
        .update({ is_booked: true })
        .eq('id', slotId);

      if (error) console.error("Supabase Update Error:", error.message);
    }
  }

  return NextResponse.json({ received: true });
}