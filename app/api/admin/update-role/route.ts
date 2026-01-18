import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user is admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { userId, newRole } = await req.json();

        if (!['admin', 'director', 'teacher', 'student'].includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Update user role
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            console.error('Error updating user role:', error);
            return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in update-role:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
