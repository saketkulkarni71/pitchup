import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2023-10-16', // Or your specific version
});

export async function POST(req: Request) {
  try {
    const { venueName, price, slotId, userId } = await req.json();

    // 1. Validation - check if we have what we need
    if (!slotId || !userId) {
      return NextResponse.json(
        { error: 'Missing Slot ID or User ID' },
        { status: 400 }
      );
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${venueName} - Padel Slot`,
              description: `Booking for slot: ${slotId}`,
            },
            unit_amount: price * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // This "metadata" is CRITICAL. 
      // It tells Stripe to remember WHO booked WHAT so the webhook can update Supabase later.
      metadata: {
        slotId: slotId,
        userId: userId,
      },
      // Inside your Stripe session creation in route.ts:
      success_url: `${req.headers.get('origin')}/success?slotId=${slotId}&userId=${userId}`,
      cancel_url: `${req.headers.get('origin')}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}