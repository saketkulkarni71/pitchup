import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { addMinutes } from 'date-fns';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2023-10-16', 
});

export async function POST(req: Request) {
  try {
    const { venueName, price, slotId, userId } = await req.json();

    console.log(`[Checkout] Request for User: ${userId}, Slot: ${slotId}`);

    if (!slotId || !userId) {
      return NextResponse.json({ error: 'Missing Slot ID or User ID' }, { status: 400 });
    }

    // 1. Check availability & Lock the slot
    // We check if it's booked OR if it's pending and the lock hasn't expired yet
    const { data: slot, error: fetchError } = await supabaseAdmin
      .from('slots')
      .select('status, locked_until')
      .eq('id', slotId)
      .single();

    if (fetchError || !slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    const now = new Date();
    const isLocked = slot.status === 'pending' && new Date(slot.locked_until) > now;
    const isBooked = slot.status === 'booked'; // or 'confirmed' depending on your schema choice, let's stick to 'booked' for slots table

    if (isBooked || isLocked) {
      return NextResponse.json(
        { error: 'This slot is no longer available.' },
        { status: 409 } // Conflict
      );
    }

    // 2. Optimistically lock the slot for 10 minutes
    const lockedUntil = addMinutes(now, 10).toISOString();

    const { error: updateError } = await supabaseAdmin
      .from('slots')
      .update({
        status: 'pending',
        locked_until: lockedUntil
      })
      .eq('id', slotId);

    if (updateError) {
      throw new Error('Failed to lock slot');
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${venueName} - Slot Booking`,
              description: `Booking ref: ${slotId}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        slotId: slotId,
        userId: userId,
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Stripe session expires in 30 mins (must be at least 30 mins)
      success_url: `${req.headers.get('origin')}/success?slotId=${slotId}&userId=${userId}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`, // Redirect back with param to handle UI feedback if needed
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout Error:', err);
    // If we fail after locking, we might want to attempt to unlock, but for now we rely on the implementation simplicity
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}