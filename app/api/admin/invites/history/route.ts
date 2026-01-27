import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all invitation tokens with creator info
        const { data: invitations, error } = await supabase
            .from('invitation_tokens')
            .select(`
                *,
                creator:created_by(id, email, full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching invitations:', error);
            return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
        }

        // Process invitations to add status
        const processedInvitations = invitations.map(invite => {
            const now = new Date();
            const expiresAt = new Date(invite.expires_at);
            const isExpired = expiresAt < now;
            const isFullyUsed = invite.uses >= invite.max_uses;

            let status: 'active' | 'used' | 'expired';
            if (isExpired) {
                status = 'expired';
            } else if (isFullyUsed) {
                status = 'used';
            } else {
                status = 'active';
            }

            return {
                ...invite,
                status,
                inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?token=${invite.token}`,
                isFamilyPlan: invite.options?.free_family === true,
                isFree: invite.options?.is_free === true,
                discount: invite.options?.discount_percent || 0
            };
        });

        return NextResponse.json(processedInvitations);
    } catch (error) {
        console.error('Error in invitation history API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
