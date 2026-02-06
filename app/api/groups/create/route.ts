import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabase } from '@/lib/supabase';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
        }

        // 1. Create the Group (School with type='group')
        const { data: group, error: groupError } = await supabase
            .from('schools')
            .insert({
                name,
                director_id: session.user.id,
                type: 'group'
            })
            .select()
            .single();

        if (groupError) {
            console.error('Error creating group:', groupError);
            return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
        }

        // 2. Update User Profile (Role = Director, School = Group ID)
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                role: 'director',
                school_id: group.id
            })
            .eq('id', session.user.id);

        if (profileError) {
            console.error('Error updating profile:', profileError);
            // Rollback group creation? For now, just log.
            return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
        }

        // 3. Setup Stripe Checkout for the Director
        // Get or Create Stripe Customer
        let customerId;
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', session.user.id)
            .single();
        
        if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id;
        } else {
             const customer = await stripe.customers.create({
                email: session.user.email || profile?.email || '',
                metadata: {
                    userId: session.user.id,
                },
            });
            customerId = customer.id;
            
            await supabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', session.user.id);
        }

        // Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: STRIPE_PRICES.SCHOOL, // Using School pricing for Groups as decided
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
            metadata: {
                userId: session.user.id,
                planType: 'school_group',
                schoolId: group.id
            },
        });

        return NextResponse.json({
            success: true,
            groupId: group.id,
            checkoutUrl: checkoutSession.url
        });

    } catch (error: any) {
        console.error('Error in create-group:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
