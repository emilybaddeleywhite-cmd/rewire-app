import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const PRODUCTS = {
  pro_monthly: {
    type: 'subscription',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    credits: 100,
  },
  credits_10: {
    type: 'payment',
    amount: 500,
    credits: 10,
    name: '10 Credits',
  },
  credits_50: {
    type: 'payment',
    amount: 1500,
    credits: 50,
    name: '50 Credits',
  },
  credits_100: {
    type: 'payment',
    amount: 2500,
    credits: 100,
    name: '100 Credits',
  },
  lifetime_founder: {
    type: 'payment',
    priceId: 'prod_UQmyGGD0898D6i',
    amount: 9900,
    name: 'RewireMode Founder Lifetime',
    credits: 0,
  },
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

  const { productKey, userId, email } = req.body
  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })

  const product = PRODUCTS[productKey]
  if (!product) return res.status(400).json({ error: 'Invalid product' })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rewiremode.com'

  try {
    let session

    if (product.type === 'subscription') {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{ price: product.priceId, quantity: 1 }],
        success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: { userId: authUser.id, productKey },
      })
    } else if (productKey === 'lifetime_founder') {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{
          price_data: {
            currency: 'gbp',
            unit_amount: product.amount,
            product: product.priceId,
          },
          quantity: 1,
        }],
        success_url: `${baseUrl}/dashboard?success=lifetime&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: { userId: authUser.id, productKey },
      })
    } else {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{
          price_data: {
            currency: 'gbp',
            unit_amount: product.amount,
            product_data: { name: product.name },
          },
          quantity: 1,
        }],
        success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: { userId: authUser.id, productKey, credits: product.credits },
      })
    }

    return res.status(200).json({ url: session.url })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
