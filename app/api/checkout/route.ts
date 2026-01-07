import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { addMinutes } from 'date-fns';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2023-10-16', 
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slotId } = await req.json();

    console.log(`[Checkout] Request for User: ${user.id}, Slot: ${slotId}`);

    if (!slotId) {
      return NextResponse.json({ error: 'Missing Slot ID' }, { status: 400 });
    }

    // 1. Check availability & Get Price & Lock the slot
    // We check if it's booked OR if it's pending and the lock hasn't expired yet
    // We also join with venues to get the official price
    const { data: slot, error: fetchError } = await supabaseAdmin
      .from('slots')
      .select('status, locked_until, venues(name, price_per_hour)')
      .eq('id', slotId)
      .single();

    if (fetchError || !slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    const venueData = slot.venues as any;
    const venue = Array.isArray(venueData) ? venueData[0] : venueData;

    if (!venue || !venue.name || !venue.price_per_hour) {
      return NextResponse.json({ error: 'Venue information missing or invalid' }, { status: 500 });
    }

    const now = new Date();
    const isLocked = slot.status === 'pending' && new Date(slot.locked_until) > now;
    const isBooked = slot.status === 'booked';

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
              name: `${venue.name} - Slot Booking`,
              description: `Booking ref: ${slotId}`,
            },
            unit_amount: Math.round(venue.price_per_hour * 100), // Use price from DB
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        slotId: slotId,
        userId: user.id, // Use authenticated user ID
      },
      customer_email: user.email,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      success_url: `${req.headers.get('origin')}/success?slotId=${slotId}&userId=${user.id}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Checkout Error:', err);
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}