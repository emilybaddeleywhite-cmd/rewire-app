import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, goal, productType, script, audioUrl, voiceId, mood, moment } = req.body

  // Check save limits based on plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  const { count } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const limit = profile?.plan === 'pro' ? 50 : 1
  if (count >= limit) {
    return res.status(403).json({ error: `Session limit reached. Upgrade to save more.`, limit })
  }

  // Update streak
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('streak_count, last_session_date, credits')
    .eq('id', userId)
    .single()

  let newStreak = 1
  let bonusCredits = 0

  if (currentProfile?.last_session_date === today) {
    newStreak = currentProfile.streak_count
  } else if (currentProfile?.last_session_date === yesterday) {
    newStreak = (currentProfile.streak_count || 0) + 1
  }

  // Streak rewards
  if (newStreak === 3) bonusCredits = 1
  if (newStreak === 7) bonusCredits = 3
  if (newStreak === 30) bonusCredits = 10

  await supabase
    .from('profiles')
    .update({
      streak_count: newStreak,
      last_session_date: today,
      credits: currentProfile.credits + bonusCredits,
    })
    .eq('id', userId)

  if (bonusCredits > 0) {
    await supabase
      .from('credit_transactions')
      .insert({ user_id: userId, amount: bonusCredits, reason: `streak_reward:${newStreak}days` })
  }

  // Save session
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      goal, product_type: productType, script, audio_url: audioUrl,
      voice_id: voiceId, mood, moment,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ session, streak: newStreak, bonusCredits })
}
