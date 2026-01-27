import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        // Get user's Stripe customer ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (!profile?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No Stripe customer found' },
                { status: 404 }
            );
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/profile`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Portal session error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
