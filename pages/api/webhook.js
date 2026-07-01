// pages/api/webhook.js
// Handles TWO kinds of Stripe checkout now:
//   mode 'subscription' -> Unlimited plan (existing behaviour, unchanged)
//   mode 'payment'      -> a single purchased generation credit (NEW) —
//                          records a row in generation_purchases, does NOT
//                          touch the user's plan.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import {
  sendProConfirmed,
  sendPaymentFailed,
  sendSubscriptionCancelled,
} from '../../lib/brevo'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function formatDate(unixTs) {
  return new Date(unixTs * 1000).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  // ── Checkout completed — branch on what was actually bought ──────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (session.mode === 'payment' && session.metadata?.kind === 'generation') {
      // ── One-time generation purchase: record an unused credit. ──────────
      const userId = session.metadata?.userId
      const productType = session.metadata?.productType || 'any'

      if (userId) {
        const { error: insertError } = await supabase.from('generation_purchases').insert({
          user_id: userId,
          product_type: productType,
          used: false,
          stripe_session_id: session.id,
          amount_cents: session.amount_total,
        })
        if (insertError) console.error('generation_purchases insert failed:', insertError.message)
      }
      // No plan change, no confirmation email — the person is redirected
      // straight back into the app to use it immediately.
    } else {
      // ── Subscription started (existing behaviour, unchanged) ────────────
      const userId = session.metadata?.userId
      if (userId) {
        const update = { plan: 'pro', stripe_customer_id: session.customer }
        if (session.subscription) update.stripe_subscription_id = session.subscription
        await supabase.from('profiles').update(update).eq('id', userId)
      }

      const email = session.customer_email
      if (email) {
        try { await sendProConfirmed({ email }) }
        catch (e) { console.error('Confirmation email failed:', e.message) }
      }
    }
  }

  // ── Renewal succeeded — keep them on the paid tier ───────────────────────
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object
    if (invoice.billing_reason === 'subscription_cycle' && invoice.customer) {
      const { data: profile } = await supabase
        .from('profiles').select('id').eq('stripe_customer_id', invoice.customer).single()
      if (profile) {
        await supabase.from('profiles').update({ plan: 'pro' }).eq('id', profile.id)
      }
    }
  }

  // ── Payment failed ───────────────────────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const email = event.data.object.customer_email
    if (email) {
      try { await sendPaymentFailed({ email }) }
      catch (e) { console.error('Payment-failed email failed:', e.message) }
    }
  }

  // ── Subscription cancelled — downgrade to free ───────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    await supabase.from('profiles').update({ plan: 'free' })
      .eq('stripe_subscription_id', subscription.id)
    try {
      const customer = await stripe.customers.retrieve(subscription.customer)
      if (customer?.email) {
        await sendSubscriptionCancelled({ email: customer.email, periodEnd: formatDate(subscription.current_period_end) })
      }
    } catch (e) { console.error('Cancellation email failed:', e.message) }
  }

  return res.status(200).json({ received: true })
}
