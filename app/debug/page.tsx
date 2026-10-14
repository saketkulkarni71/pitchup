import { createClient } from '@supabase/supabase-js';

// Admin client to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Anon client to test RLS
const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const { data: bookings, error: bookingsError } = await supabaseAdmin.from('bookings').select('*');
    const { data: slots, error: slotsError } = await supabaseAdmin.from('slots').select('*');
    const { data: venues, error: venuesError } = await supabaseAdmin.from('venues').select('*');

    // Test anon access
    const { data: venuesAnon, error: venuesAnonError } = await supabaseAnon.from('venues').select('*');

    return (
        <div className="p-8 font-mono text-sm space-y-8">
            <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>

            <div>
                <h2 className="text-xl font-bold mb-2">Venues (Anon View - RLS Check)</h2>
                {venuesAnonError ? (
                    <div className="text-red-500">Error: {JSON.stringify(venuesAnonError)}</div>
                ) : (
                    <pre className="bg-yellow-50 p-4 rounded border overflow-auto max-h-96">
                        {venuesAnon && venuesAnon.length > 0 ? "Venues found: " + venuesAnon.length : "No venues found (Possible RLS issue)"}
                        {JSON.stringify(venuesAnon, null, 2)}
                    </pre>
                )}
            </div>

            <div>
                <h2 className="text-xl font-bold mb-2">Venues Table (Admin View)</h2>
                {venuesError ? (
                    <div className="text-red-500">{JSON.stringify(venuesError)}</div>
                ) : (
                    <pre className="bg-slate-100 p-4 rounded border overflow-auto max-h-96">
                        {JSON.stringify(venues, null, 2)}
                    </pre>
                )}
            </div>

            <div>
                <h2 className="text-xl font-bold mb-2">Bookings Table (Admin View)</h2>
                {bookingsError ? (
                    <div className="text-red-500">{JSON.stringify(bookingsError)}</div>
                ) : (
                    <pre className="bg-slate-100 p-4 rounded border overflow-auto max-h-96">
                        {JSON.stringify(bookings, null, 2)}
                    </pre>
                )}
            </div>

            <div>
                <h2 className="text-xl font-bold mb-2">Slots Table</h2>
                {slotsError ? (
                    <div className="text-red-500">{JSON.stringify(slotsError)}</div>
                ) : (
                    <pre className="bg-slate-100 p-4 rounded border overflow-auto max-h-96">
                        {JSON.stringify(slots, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}
