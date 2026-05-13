import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, productKey } = session.metadata

    // Always derive credit amount from our whitelist — never trust metadata
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
            plan: productKey === 'pro_monthly' ? 'pro' : profile.plan,
            stripe_customer_id: session.customer,
          })
          .eq('id', userId)

        await supabase
          .from('credit_transactions')
          .insert({ user_id: userId, amount: creditAmount, reason: `purchase:${productKey}` })
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('stripe_subscription_id', subscription.id)
  }

  return res.status(200).json({ received: true })
}
