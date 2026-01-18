import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing');
        return NextResponse.json({ error: 'Server Configuration Error: Missing Service Role Key' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );

    // Robust Admin Check: If role is not in session, check DB
    if (user.role !== 'admin') {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        const { data: schools, error } = await supabaseAdmin
            .from('schools')
            .select('*, profiles(full_name)');

        if (error) throw error;

        return NextResponse.json(schools);
    } catch (error) {
        console.error('Error fetching schools:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
