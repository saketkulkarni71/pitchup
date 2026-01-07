import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

        const { bookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing Booking ID' }, { status: 400 });
        }

        // 1. Fetch Booking and verify ownership
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*, slots(*)')
            .eq('id', bookingId)
            .eq('user_id', user.id) // Verify user owns the booking
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
        }

        // 2. Check Cancellation Policy (e.g. 24h before)
        const slotTime = new Date(booking.slots.start_time);
        const now = new Date();

        if (slotTime < now) {
            return NextResponse.json({ error: 'Cannot cancel past bookings' }, { status: 400 });
        }

        // 3. Process Refund (Optional)
        // ... Stripe refund logic if needed ...

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

    } catch (err: unknown) {
        console.error('Cancellation Error:', err);
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
