import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: subjects, error: subjectsError } = await supabaseAdmin
            .from('subjects')
            .select('*')
            .order('order_index');

        if (subjectsError) throw subjectsError;

        const { data: categories, error: categoriesError } = await supabaseAdmin
            .from('game_categories')
            .select('*')
            .order('order_index');

        if (categoriesError) throw categoriesError;

        const { data: games, error: gamesError } = await supabaseAdmin
            .from('games_config')
            .select('*')
            .order('order_index');

        if (gamesError) throw gamesError;

        return NextResponse.json({
            subjects: subjects || [],
            categories: categories || [],
            games: games || []
        });
    } catch (error: any) {
        console.error('Error fetching admin data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
