// pages/api/create-checkout.js
// One subscription product, three ways to buy it:
//   annual    -> £89/year   (STRIPE_PRICE_ANNUAL)
//   monthly   -> £14.99/mo  (STRIPE_PRICE_MONTHLY)
//   solstice  -> £14.99/mo with the £13.99 coupon = £1 first month, then £14.99
// No credits. No one-off products.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PLANS = {
  annual:   { price: process.env.STRIPE_PRICE_ANNUAL },
  monthly:  { price: process.env.STRIPE_PRICE_MONTHLY },
  solstice: { price: process.env.STRIPE_PRICE_MONTHLY, coupon: process.env.STRIPE_SOLSTICE_COUPON },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user: authUser } } = await authClient.auth.getUser()
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

  const { plan, userId, email } = req.body
  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })

  const chosen = PLANS[plan]
  if (!chosen || !chosen.price) return res.status(400).json({ error: 'Invalid plan' })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rewiremode.com'

  try {
    const params = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: chosen.price, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { userId: authUser.id, plan },
      subscription_data: { metadata: { userId: authUser.id, plan } },
    }
    // £1-first-month: apply the coupon to the monthly price
    if (chosen.coupon) params.discounts = [{ coupon: chosen.coupon }]

    const session = await stripe.checkout.sessions.create(params)
    return res.status(200).json({ url: session.url })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
