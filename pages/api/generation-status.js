// pages/api/generation-status.js
// Tells the client, before they click "buy", whether this person is still
// trial-eligible (£1) or should be shown the per-type price (£2/£3), and
// whether they already hold an unused, unspent credit for this type (e.g.
// they paid but a redirect got interrupted) — so we never double-charge.

import { createClient } from '@supabase/supabase-js'
import { isTrialEligible, priceForType, hasUnusedCredit } from '../../lib/access'

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

  const { userId, productType } = req.body
  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })
  const type = ['reset', 'walking', 'sleep', 'subliminal'].includes(productType) ? productType : 'reset'

  try {
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', authUser.id).single()
    const plan = profile?.plan

    if (plan && plan !== 'free') {
      return res.status(200).json({ isSubscribed: true })
    }

    const [trial, existingCredit] = await Promise.all([
      isTrialEligible(supabase, authUser.id, plan),
      hasUnusedCredit(supabase, authUser.id, type),
    ])

    const price = priceForType(type)
    return res.status(200).json({
      isSubscribed: false,
      trialEligible: trial,
      hasUnusedCredit: existingCredit,
      amountLabel: trial ? '£1' : price.amountLabel,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
