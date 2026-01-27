import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        // Check if user has active subscription
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (!subscription) {
            return NextResponse.json({
                active: false,
                plan: null,
            });
        }

        // Check if subscription is still valid
        const now = new Date();
        const periodEnd = new Date(subscription.current_period_end);

        if (now > periodEnd && !subscription.cancel_at_period_end) {
            return NextResponse.json({
                active: false,
                plan: null,
            });
        }

        return NextResponse.json({
            active: true,
            plan: subscription.plan_id,
            periodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
    } catch (error: any) {
        console.error('Subscription check error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
