import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const MUSIC_URLS = {
  subliminal: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-subliminal.mp3.mp3',
  sleep:      'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-sleep.mp3.mp3',
  hype:       'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-hype.mp3.mp3',
  reset:      'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-calm.mp3.mp3',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { userId, goal, productType, script, audioUrl, voiceId, mood, moment, creditCost } = req.body
  try {
    // Get full profile in one query
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, credits, streak_count, last_session_date')
      .eq('id', userId)
      .single()
    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }
    // Check save limits
    const { count } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    const limit = profile.plan === 'pro' ? 50 : 1
    if (count >= limit) {
      return res.status(403).json({ error: 'Session limit reached. Upgrade to save more.', limit })
    }
    // Calculate streak
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    let newStreak = 1
    let bonusCredits = 0
    if (profile.last_session_date === today) {
      newStreak = profile.streak_count || 1
    } else if (profile.last_session_date === yesterday) {
      newStreak = (profile.streak_count || 0) + 1
    }
    // Streak rewards
    if (newStreak === 3) bonusCredits = 1
    if (newStreak === 7) bonusCredits = 3
    if (newStreak === 30) bonusCredits = 10
    const cost = creditCost || 0
    const newCredits = Math.max(0, profile.credits + bonusCredits - cost)
    // Update profile
    await supabase
      .from('profiles')
      .update({
        streak_count: newStreak,
        last_session_date: today,
        credits: newCredits,
      })
      .eq('id', userId)
    // Log credit transactions
    const transactions = []
    if (cost > 0) {
      transactions.push({ user_id: userId, amount: -cost, reason: `generation:${productType}` })
    }
    if (bonusCredits > 0) {
      transactions.push({ user_id: userId, amount: bonusCredits, reason: `streak_reward:${newStreak}days` })
    }
    if (transactions.length > 0) {
      await supabase.from('credit_transactions').insert(transactions)
    }
    // Save session
    const cleanAudioUrl = audioUrl && audioUrl.startsWith('http') ? audioUrl : null
    const musicUrl = MUSIC_URLS[productType] || null

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        goal,
        product_type: productType,
        script,
        audio_url: cleanAudioUrl,
        voice_id: voiceId,
        mood,
        moment,
        music_url: musicUrl,
      })
      .select()
      .single()
    if (sessionError) {
      console.error('Session save error:', sessionError)
      return res.status(500).json({ error: sessionError.message })
    }
    return res.status(200).json({ session, streak: newStreak, bonusCredits, creditsRemaining: newCredits })
  } catch (err) {
    console.error('Save session error:', err)
    return res.status(500).json({ error: err.message })
  }
}
