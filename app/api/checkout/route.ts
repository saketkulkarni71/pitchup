import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// This connects to your "Secret Key" in .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    // 1. Get the booking info sent from the "Book Now" button
    const { venueName, price, slotId } = await req.json();

    // 2. Tell Stripe to create a payment page
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: venueName,
            },
            unit_amount: price * 100, // Converts Euro to Cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success`, // Where to go after paying
      cancel_url: `${req.headers.get('origin')}/`,        // Where to go if they cancel
      metadata: {
        slotId: slotId, // Remembers WHICH slot they bought
      },
    });

    // 3. Send the Stripe link back to the "Book Now" button
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // Corrected "catch" spelling here
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}