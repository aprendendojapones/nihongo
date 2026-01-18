import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !session.user?.email) {
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
                return NextResponse.json({
                    error: 'Configuration Error',
                    details: 'SUPABASE_SERVICE_ROLE_KEY is missing in environment variables'
                }, { status: 500 });
            }

            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                serviceRoleKey
            );

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
                const { data: schools, error } = await supabaseAdmin
                    .from('schools')
                    .select('*, profiles(full_name)');

                if (error) throw error;

                return NextResponse.json(schools);
            } catch (error: any) {
                console.error('Error fetching schools:', error);
                return NextResponse.json({
                    error: 'Internal Server Error',
                    details: error.message || String(error)
                }, { status: 500 });
            }
        }
