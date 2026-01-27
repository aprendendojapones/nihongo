import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '@/lib/config';

// Initialize Supabase with Service Role Key for admin privileges
// This bypasses RLS, so we must be careful to only update the authenticated user's data
const supabaseAdmin = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            username,
            full_name,
            phone,
            address,
            country,
            state,
            city,
            phone_public,
            address_public,
            language_pref
        } = body;

        // Update the profile using the email from the secure session
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                username,
                full_name,
                phone,
                address,
                country,
                state,
                city,
                phone_public,
                address_public,
                language_pref
            })
            .eq('email', session.user.email)
            .select();

        if (error) {
            console.error('Error updating profile (server):', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Server error updating profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
