import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !session.user?.email) {

        // Robust Admin Check: If role is not in session, check DB
        if (user.role !== 'admin') {
            try {
                const { data: profile, error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .select('role')
                    .eq('email', session.user.email)
                    .single();

                if (profileError || !profile || profile.role !== 'admin') {
                    return NextResponse.json({ error: 'Unauthorized', details: 'User is not admin in DB' }, { status: 401 });
                }
            } catch (err) {
                return NextResponse.json({ error: 'Auth Check Failed', details: String(err) }, { status: 500 });
            }
        }

        try {
            const { data: profiles, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const { data: schools } = await supabaseAdmin
                .from('schools')
                .select('id, name');

            const schoolMap = new Map(schools?.map((s: any) => [s.id, s.name]));

            const profilesWithSchool = profiles.map(profile => ({
                ...profile,
                schools: profile.school_id ? { name: schoolMap.get(profile.school_id) } : null
            }));

            return NextResponse.json(profilesWithSchool);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            return NextResponse.json({
                error: 'Internal Server Error',
                details: error.message || String(error)
            }, { status: 500 });
        }
    }
