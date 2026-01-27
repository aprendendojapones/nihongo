import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        console.log('[Invitation History] Session:', session ? 'exists' : 'null');
        
        if (!session?.user) {
            console.log('[Invitation History] No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        console.log('[Invitation History] Profile:', profile, 'Error:', profileError);

        if (profileError || profile?.role !== 'admin') {
            console.log('[Invitation History] User is not admin');
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all invitation tokens (without join to avoid FK issues)
        const { data: invitations, error } = await supabase
            .from('invitation_tokens')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('[Invitation History] Invitations count:', invitations?.length || 0, 'Error:', error);

        if (error) {
            console.error('[Invitation History] Error fetching invitations:', error);
            return NextResponse.json({ error: 'Failed to fetch invitations', details: error.message }, { status: 500 });
        }

        // Fetch creator info separately
        const creatorIds = [...new Set(invitations?.map(i => i.created_by).filter(Boolean))];
        const { data: creators } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', creatorIds);

        const creatorsMap = new Map(creators?.map(c => [c.id, c]) || []);

        // Process invitations to add status and creator info
        const processedInvitations = (invitations || []).map(invite => {
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
                creator: invite.created_by ? creatorsMap.get(invite.created_by) : null,
                status,
                inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?token=${invite.token}`,
                isFamilyPlan: invite.options?.free_family === true,
                isFree: invite.options?.is_free === true,
                discount: invite.options?.discount_percent || 0
            };
        });

        console.log('[Invitation History] Returning', processedInvitations.length, 'invitations');
        return NextResponse.json(processedInvitations);
    } catch (error: any) {
        console.error('[Invitation History] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
