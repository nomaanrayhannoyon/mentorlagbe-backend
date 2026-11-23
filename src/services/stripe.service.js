import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

/**
 * Create a Checkout Session for the given plan.
 * @param {string} customerId - Stripe customer ID (optional, can be created on the fly).
 * @param {string} plan - 'free' or 'pro'.
 */
export const createCheckoutSession = async (customerId, plan) => {
  const priceId = plan === 'pro' ? process.env.STRIPE_PRICE_PRO : null;
  if (!priceId) throw new Error('Pro price ID not configured');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
  });
  return session;
};
