import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { updateUserSubscription, savePaymentHistory } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get customer email
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as any).email;

        if (!email) break;

        // Get user from database
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!user) break;

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Determine tier from price ID
        let tier = 'basic';
        if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) tier = 'pro';
        if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) tier = 'premium';

        // Update user subscription
        await updateUserSubscription(
          user.id,
          'active',
          tier,
          new Date(subscription.current_period_end * 1000)
        );

        // Update stripe customer ID
        await supabaseAdmin
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);

        // Save payment history
        await savePaymentHistory(
          user.id,
          session.payment_intent as string,
          (session.amount_total || 0) / 100,
          'usd',
          tier,
          'succeeded'
        );

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Get customer
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as any).email;

        if (!email) break;

        // Get user
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!user) break;

        // Update subscription status
        const status =
          subscription.status === 'active' || subscription.status === 'trialing'
            ? 'active'
            : 'inactive';

        const priceId = subscription.items.data[0].price.id;
        let tier = 'basic';
        if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) tier = 'pro';
        if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) tier = 'premium';

        await updateUserSubscription(
          user.id,
          status,
          tier,
          new Date(subscription.current_period_end * 1000)
        );

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as any).email;

        if (!email) break;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!user || !invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        const priceId = subscription.items.data[0].price.id;
        let tier = 'basic';
        if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) tier = 'pro';
        if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) tier = 'premium';

        await savePaymentHistory(
          user.id,
          invoice.payment_intent as string,
          (invoice.amount_paid || 0) / 100,
          'usd',
          tier,
          'succeeded'
        );

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as any).email;

        if (!email) break;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!user) break;

        // Update subscription status to inactive
        await updateUserSubscription(user.id, 'past_due', 'free');

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
