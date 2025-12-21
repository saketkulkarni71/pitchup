import { createClient } from '@supabase/supabase-js';

// Admin client to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const { data: bookings } = await supabaseAdmin.from('bookings').select('*');
    const { data: slots } = await supabaseAdmin.from('slots').select('*');

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>

            <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Bookings Table (Admin View)</h2>
                <pre className="bg-slate-100 p-4 rounded border overflow-auto">
                    {JSON.stringify(bookings, null, 2)}
                </pre>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-2">Slots Table</h2>
                <pre className="bg-slate-100 p-4 rounded border overflow-auto">
                    {JSON.stringify(slots, null, 2)}
                </pre>
            </div>
        </div>
    );
}
