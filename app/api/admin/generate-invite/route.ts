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

        const { role } = await req.json();

        if (!['director', 'teacher'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Generate unique token
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        // Insert token
        const { data, error } = await supabaseAdmin
            .from('invitation_tokens')
            .insert({
                token,
                role,
                expires_at: expiresAt.toISOString(),
                created_by: session.user.id
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating invitation token:', error);
            return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
        }

        // Generate invitation URL
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const invitationUrl = `${baseUrl}/register-school?token=${token}`;

        return NextResponse.json({
            success: true,
            invitationUrl,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error('Error in generate-invite:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
