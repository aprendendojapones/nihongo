import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
});

export const STRIPE_PRICES = {
    INDIVIDUAL: process.env.STRIPE_PRICE_INDIVIDUAL_MONTHLY || '',
    FAMILY: process.env.STRIPE_PRICE_FAMILY_MONTHLY || '',
    SCHOOL: process.env.STRIPE_PRICE_SCHOOL_MONTHLY || '',
};
