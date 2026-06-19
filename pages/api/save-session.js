// pages/api/save-session.js
// No credits. No streak side-effects (the streak now advances when a session
// is PLAYED, logged separately). This endpoint just saves the session, stores
// the durable audio PATH so it replays forever, tags challenge recordings, and
// keeps free accounts to a single goal.

import { createClient } from '@supabase/supabase-js'
import { canGenerate } from '../../lib/catalog'

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

  const {
    userId, goal, productType, script,
    audioUrl, audioPath, voiceId, mood, musicUrl: clientMusicUrl, challengeId,
  } = req.body
  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('plan').eq('id', authUser.id).single()
    if (profileError || !profile) return res.status(404).json({ error: 'Profile not found' })

    const isPaid = profile.plan && profile.plan !== 'free'

    // Access guard (matches the generation gate): free = Reset + Walking only.
    if (!canGenerate(productType, profile.plan)) {
      return res.status(403).json({ error: 'Sleep and Subliminal are part of Unlimited.', upgrade: true })
    }

    // Free accounts get one goal (their 7-Day Rewire). Same goal can save its
    // free sessions; a *different* goal needs Unlimited.
    if (!isPaid && goal) {
      const { data: otherGoals } = await supabase
        .from('sessions').select('goal').eq('user_id', authUser.id).neq('goal', goal).limit(1)
      if (otherGoals && otherGoals.length > 0) {
        return res.status(403).json({ error: 'Free covers one goal. Upgrade to Unlimited to rewire another.', upgrade: true })
      }
    }

    // Durable audio path: prefer what the client passes; otherwise pull the
    // path out of the (temporary) signed URL so replay never breaks.
    const cleanAudioUrl = audioUrl && audioUrl.startsWith('http') ? audioUrl : null
    let storagePath = audioPath || null
    if (!storagePath && cleanAudioUrl) {
      try {
        const m = new URL(cleanAudioUrl).pathname.match(/\/audio\/(.+)$/)
        if (m) storagePath = decodeURIComponent(m[1])
      } catch (_) { /* ignore */ }
    }

    const musicUrl = (clientMusicUrl && clientMusicUrl.startsWith('http')) ? clientMusicUrl : null

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: authUser.id,
        goal,
        product_type: productType,
        script,
        audio_path: storagePath,
        audio_url: cleanAudioUrl,
        voice_id: voiceId,
        mood,
        music_url: musicUrl,
        challenge_id: challengeId || null,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session save error:', sessionError)
      return res.status(500).json({
        error: 'Could not save session. Your audio played successfully - please try saving again.',
      })
    }

    return res.status(200).json({ session })
  } catch (err) {
    console.error('Save session error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
