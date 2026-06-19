// pages/api/log-listen.js
// The 7-Day Rewire streak advances when a session is PLAYED, not generated.
// Records one play per user per challenge per local day and returns the streak.
// Call this from the challenge page when a session starts playing.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

function prevDay(ymd) {
  const d = new Date(ymd + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
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

  const { userId, challengeId, clientDate } = req.body
  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })
  if (!challengeId) return res.status(400).json({ error: 'Missing challengeId' })

  // Use the user's LOCAL day (timezone-aware) so streaks line up with their night.
  const playedOn = (typeof clientDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(clientDate))
    ? clientDate
    : new Date().toISOString().slice(0, 10)

  try {
    // One row per user/challenge/day — ignore if already logged today.
    await supabase.from('session_plays').upsert(
      { user_id: authUser.id, challenge_id: challengeId, played_on: playedOn },
      { onConflict: 'user_id,challenge_id,played_on', ignoreDuplicates: true }
    )

    const { data: plays } = await supabase
      .from('session_plays').select('played_on')
      .eq('user_id', authUser.id).eq('challenge_id', challengeId)

    const days = [...new Set((plays || []).map(p => p.played_on))].sort().reverse()

    // Consecutive-day streak ending today.
    let streak = 0
    let cursor = playedOn
    for (const d of days) {
      if (d === cursor) { streak++; cursor = prevDay(cursor) }
      else if (d > cursor) continue
      else break
    }

    return res.status(200).json({ streak, daysListened: days })
  } catch (err) {
    console.error('log-listen error:', err)
    return res.status(500).json({ error: 'Could not log listen' })
  }
}
