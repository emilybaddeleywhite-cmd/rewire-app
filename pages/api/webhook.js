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

// Helper: get user email from Supabase by userId
async function getUserEmail(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
  return data?.email || null
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

    if (creditAmount > 0 && userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            credits: profile.credits + creditAmount,
            plan: productKey === 'pro_monthly' ? 'pro'
                : productKey === 'lifetime_founder' ? 'lifetime'
                : profile.plan,
            stripe_customer_id: session.customer,
          })
          .eq('id', userId)

        await supabase
          .from('credit_transactions')
          .insert({ user_id: userId, amount: creditAmount, reason: `purchase:${productKey}` })
      }
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
        // credit top-ups (credits_10/50/100) don't get a separate email —
        // Stripe's receipt covers it. Add sendCreditTopUp() here if you want one later.
      } catch (emailErr) {
        // Log but don't fail the webhook — Stripe will retry if we return non-200
        console.error('Email send failed after purchase:', emailErr.message)
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

  // ── Subscription cancelled ───────────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object

    await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('stripe_subscription_id', subscription.id)

    // Get the user's email via customer ID
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
