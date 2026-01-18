import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return NextResponse.json({ error: 'Configuration Error' }, { status: 503 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );

    // Robust Admin Check
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
        const body = await request.json();
        const { userId, is_favorite, level } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const updates: any = {};
        if (is_favorite !== undefined) updates.is_favorite = is_favorite;
        if (level !== undefined) updates.level = level;

        const { error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
