import { createClient } from '@supabase/supabase-js';

// Note: This client should ONLY be used in server-side API routes
// never expose the service role key to the client!
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
