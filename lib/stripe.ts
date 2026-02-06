import Stripe from 'stripe';

// Safe initialization for build/dev without Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey 
    ? new Stripe(stripeKey, {
        apiVersion: '2025-12-15.clover' as any, // Type assertion for newer api versions
        typescript: true,
      })
    : ({} as any); // Mock object to prevent build crash

if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY missing. Stripe features will be disabled.');
}

export const STRIPE_PRICES = {
    INDIVIDUAL: process.env.STRIPE_PRICE_INDIVIDUAL_MONTHLY || '',
    FAMILY: process.env.STRIPE_PRICE_FAMILY_MONTHLY || '',
    SCHOOL: process.env.STRIPE_PRICE_SCHOOL_MONTHLY || '',
};
