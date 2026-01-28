import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'No signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json(
                { error: `Webhook Error: ${err.message}` },
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                console.log('Payment succeeded for invoice:', invoice.id);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                console.error('Payment failed for invoice:', invoice.id);
                // TODO: Send email to user about failed payment
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function handleCheckoutCompleted(session: any) {
    const userId = session.metadata.userId;
    const planType = session.metadata.planType;
    const subscriptionId = session.subscription;

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Create or update subscription in database
    await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan_id: planType,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: 'active',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
    });

    console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: any) {
    // Update subscription in database
    await supabase
        .from('subscriptions')
        .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_subscription_id', subscription.id);

    console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: any) {
    // Mark subscription as cancelled
    await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
        })
        .eq('stripe_subscription_id', subscription.id);

    console.log(`Subscription cancelled: ${subscription.id}`);
}
