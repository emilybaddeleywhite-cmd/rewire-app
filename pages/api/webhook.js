// pages/api/webhook.js
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import {
  sendProConfirmed,
  sendFounderConfirmed,
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

// Whitelist of valid credit amounts per product — never read from metadata
const CREDIT_AMOUNTS = {
  credits_10: 10,
  credits_50: 50,
  credits_100: 100,
  pro_monthly: 100,
  lifetime_founder: 500,
}

// Helper: format a Unix timestamp as "14 June 2025"
function formatDate(unixTs) {
  return new Date(unixTs * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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

  // ── Purchase completed ───────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, productKey } = session.metadata
    const creditAmount = CREDIT_AMOUNTS[productKey] ?? 0

    if (userId) {
      // Add credits atomically (no read-then-write race).
      if (creditAmount > 0) {
        await supabase.rpc('add_credits', { p_user_id: userId, p_amount: creditAmount })
        await supabase
          .from('credit_transactions')
          .insert({ user_id: userId, amount: creditAmount, reason: `purchase:${productKey}` })
      }

      // Build the profile update. Only set `plan` for plans that change it, and
      // only store stripe_subscription_id for actual subscriptions — otherwise a
      // one-off credit-pack purchase by a Pro user would wipe their sub id and
      // break cancellation handling.
      const profileUpdate = { stripe_customer_id: session.customer }
      if (productKey === 'pro_monthly') {
        profileUpdate.plan = 'pro'
        if (session.subscription) profileUpdate.stripe_subscription_id = session.subscription
      } else if (productKey === 'lifetime_founder') {
        profileUpdate.plan = 'lifetime'
      }

      await supabase.from('profiles').update(profileUpdate).eq('id', userId)
    }

    // Send confirmation email
    const email = session.customer_email
    if (email) {
      try {
        if (productKey === 'pro_monthly') {
          await sendProConfirmed({ email })
        } else if (productKey === 'lifetime_founder') {
          await sendFounderConfirmed({ email })
        }
        // Credit top-ups (credits_10/50/100) rely on Stripe's own receipt.
      } catch (emailErr) {
        console.error('Email send failed after purchase:', emailErr.message)
      }
    }
  }

  // ── Subscription renewal succeeded — refresh Pro credits ───────────────────
  // Fires every billing cycle. We act ONLY on 'subscription_cycle' (true
  // renewals); the first payment is 'subscription_create' and is already handled
  // by checkout.session.completed above, so this avoids double-crediting.
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object
    if (invoice.billing_reason === 'subscription_cycle' && invoice.customer) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .single()

      if (profile) {
        // Refresh to the monthly allowance (not accumulate) — protects margin.
        await supabase
          .from('profiles')
          .update({ credits: CREDIT_AMOUNTS.pro_monthly, plan: 'pro' })
          .eq('id', profile.id)

        await supabase
          .from('credit_transactions')
          .insert({ user_id: profile.id, amount: CREDIT_AMOUNTS.pro_monthly, reason: 'renewal:pro_monthly' })
      }
    }
  }

  // ── Subscription payment failed ──────────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const email = invoice.customer_email

    if (email) {
      try {
        await sendPaymentFailed({ email })
      } catch (emailErr) {
        console.error('Email send failed for payment_failed:', emailErr.message)
      }
    }
  }

  // ── Subscription cancelled — downgrade to free ─────────────────────────────
  // Now matches reliably because we store stripe_subscription_id at checkout.
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object

    await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('stripe_subscription_id', subscription.id)

    try {
      const customer = await stripe.customers.retrieve(subscription.customer)
      const email = customer.email
      const periodEnd = formatDate(subscription.current_period_end)

      if (email) {
        await sendSubscriptionCancelled({ email, periodEnd })
      }
    } catch (emailErr) {
      console.error('Email send failed for subscription cancelled:', emailErr.message)
    }
  }

  return res.status(200).json({ received: true })
}
