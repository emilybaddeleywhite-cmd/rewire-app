// pages/api/create-generation-checkout.js
// One-time Stripe payment (mode: 'payment', NOT a subscription/coupon) for a
// single generation. The price is decided server-side — never trust the
// client — using the same trial-eligibility rule as generation-status.js:
//   trial-eligible (first ever)  -> STRIPE_PRICE_TRIAL      (£1)
//   everyone else, Sleep         -> STRIPE_PRICE_GEN_SLEEP  (£3)
//   everyone else, everything else -> STRIPE_PRICE_GEN_LIGHT (£2)

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { isTrialEligible, priceForType } from '../../lib/access'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

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

  const { userId, email, productType, redirectPath } = req.body
  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })
  const type = ['reset', 'walking', 'sleep', 'subliminal'].includes(productType) ? productType : 'reset'

  // Only allow same-site relative redirects — never an external URL.
  const safeRedirect = (typeof redirectPath === 'string' && redirectPath.startsWith('/') && !redirectPath.startsWith('//'))
    ? redirectPath
    : '/rewire'

  try {
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', authUser.id).single()
    const trial = await isTrialEligible(supabase, authUser.id, profile?.plan)

    const priceEnvKey = trial ? 'STRIPE_PRICE_TRIAL' : priceForType(type).envKey
    const price = process.env[priceEnvKey]
    if (!price) return res.status(500).json({ error: `Missing Stripe price: set ${priceEnvKey} in your environment variables.` })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rewiremode.com'
    // Trial credits are stored as 'any' — usable once, for whichever type the
    // person actually generates first, even if it differs from what they were
    // looking at when they bought it.
    const storedType = trial ? 'any' : type
    const sep = safeRedirect.includes('?') ? '&' : '?'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${baseUrl}${safeRedirect}${sep}paid=1&type=${type}`,
      cancel_url: `${baseUrl}/pricing?type=${type}`,
      metadata: { userId: authUser.id, kind: 'generation', productType: storedType },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
