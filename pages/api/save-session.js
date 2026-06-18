// pages/api/save-session.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Resolve "today" from an optional client-supplied local date (YYYY-MM-DD).
// Falls back to UTC if absent/malformed. Sending the user's own local date makes
// streaks respect THEIR midnight rather than UTC's.
function resolveToday(clientDate) {
  if (typeof clientDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
    return clientDate
  }
  return new Date().toISOString().split('T')[0]
}

function dayBefore(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d) - 86400000
  return new Date(t).toISOString().split('T')[0]
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

  const {
    userId, goal, productType, script, audioUrl, voiceId, mood,
    musicUrl: clientMusicUrl, clientDate, audioPath,
  } = req.body
  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, streak_count, last_session_date')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // NOTE: credits are NO LONGER deducted here — they're charged atomically at
    // generation time (generate-script.js). Saving is free, which is what the
    // 7-day challenge loop needs. The old "1 saved session ever" limit is gone.

    // ── Streak ──
    const today = resolveToday(clientDate)
    const yesterday = dayBefore(today)
    let newStreak = 1
    let bonusCredits = 0

    if (profile.last_session_date === today) {
      // Already saved today — keep the streak, award no further bonus.
      newStreak = profile.streak_count || 1
    } else if (profile.last_session_date === yesterday) {
      newStreak = (profile.streak_count || 0) + 1
      // Milestone bonus fires ONLY on the day the streak advances onto it.
      if (newStreak === 3) bonusCredits = 1
      else if (newStreak === 7) bonusCredits = 3
      else if (newStreak === 30) bonusCredits = 10
    } else {
      // Missed a day (or first ever) — streak restarts.
      newStreak = 1
    }

    const cleanAudioUrl = audioUrl && audioUrl.startsWith('http') ? audioUrl : null
    const musicUrl = (clientMusicUrl && clientMusicUrl.startsWith('http')) ? clientMusicUrl : null
    // Canonical reference to the audio file. The signed audio_url expires; this
    // path is what the dashboard re-signs on every load so replay never breaks.
    const cleanAudioPath = typeof audioPath === 'string' && audioPath ? audioPath : null

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: authUser.id,
        goal,
        product_type: productType,
        script,
        audio_url: cleanAudioUrl,
        audio_path: cleanAudioPath,
        voice_id: voiceId,
        mood,
        music_url: musicUrl,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session save error:', sessionError)
      return res.status(500).json({
        error: 'Could not save session. Your audio played successfully - please try saving again.',
      })
    }

    // Update streak only. Credits are never written here directly — that would
    // risk clobbering a concurrent spend. Bonuses go through add_credits below.
    await supabase
      .from('profiles')
      .update({ streak_count: newStreak, last_session_date: today })
      .eq('id', authUser.id)

    let creditsRemaining = profile.credits
    if (bonusCredits > 0) {
      const { data: bal } = await supabase
        .rpc('add_credits', { p_user_id: authUser.id, p_amount: bonusCredits })
      if (typeof bal === 'number') creditsRemaining = bal

      await supabase
        .from('credit_transactions')
        .insert({ user_id: authUser.id, amount: bonusCredits, reason: `streak_reward:${newStreak}days` })
    }

    return res.status(200).json({ session, streak: newStreak, bonusCredits, creditsRemaining })
  } catch (err) {
    console.error('Save session error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
