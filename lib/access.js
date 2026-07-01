// lib/access.js
// Shared helpers for the pay-per-generation model.
//
// A user can generate a session if EITHER:
//   - they hold an active paid subscription (profile.plan !== 'free'), OR
//   - they hold an unused purchased "generation credit" that matches the
//     requested type (or a trial credit, stored as product_type = 'any',
//     which is usable once for whichever type the person picks).
//
// Credits are created by the Stripe webhook when a one-time payment succeeds
// (see pages/api/webhook.js) and consumed here at the point of generation.

export async function hasUnusedCredit(supabase, userId, productType) {
  const { data } = await supabase
    .from('generation_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('used', false)
    .in('product_type', [productType, 'any'])
    .limit(1)
  return !!(data && data.length > 0)
}

// Atomically marks ONE matching unused credit as used. Returns true if a
// credit was found and consumed, false if none was available. The final
// .eq('used', false) guards against a double-spend race between two
// near-simultaneous requests.
export async function consumeCredit(supabase, userId, productType) {
  const { data: candidates } = await supabase
    .from('generation_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('used', false)
    .in('product_type', [productType, 'any'])
    .order('created_at', { ascending: true })
    .limit(1)

  if (!candidates || candidates.length === 0) return false

  const { data: updated, error } = await supabase
    .from('generation_purchases')
    .update({ used: true })
    .eq('id', candidates[0].id)
    .eq('used', false)
    .select()

  return !error && updated && updated.length > 0
}

// Has this user EVER generated or purchased before? Governs the £1 trial —
// it's a one-time-ever price, not per-type. Existing users who already used
// the old free tier don't get a second free-ish trial; only genuinely new
// accounts qualify.
export async function isTrialEligible(supabase, userId, plan) {
  if (plan && plan !== 'free') return false // subscribers don't need a trial

  const { count: purchaseCount } = await supabase
    .from('generation_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (purchaseCount > 0) return false

  const { count: sessionCount } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return !sessionCount || sessionCount === 0
}

// Cost-matched pricing: Sleep is the expensive one (longest ElevenLabs audio),
// everything else costs roughly the same to produce.
export function priceForType(productType) {
  return productType === 'sleep'
    ? { envKey: 'STRIPE_PRICE_GEN_SLEEP', amountLabel: '£3' }
    : { envKey: 'STRIPE_PRICE_GEN_LIGHT', amountLabel: '£2' }
}
