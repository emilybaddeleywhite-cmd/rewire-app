import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '../../lib/rateLimit'
import { consumeCredit } from '../../lib/access'

export const config = { maxDuration: 60 }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── Auth ──
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user: authUser } } = await authClient.auth.getUser()
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

  const { text, voiceId, productType, userId } = req.body

  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'No text provided' })
  }

  // ── Access gate (defence in depth): this is THE expensive call (ElevenLabs),
  //    so it must independently verify payment. A subscriber generates freely;
  //    everyone else must spend one purchased credit, consumed right here. ──
  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', authUser.id).single()
  const isSubscribed = Boolean(profile?.plan && profile.plan !== 'free')

  if (!isSubscribed) {
    const consumed = await consumeCredit(supabase, authUser.id, productType)
    if (!consumed) {
      return res.status(402).json({ error: 'This session needs to be purchased first.', paymentRequired: true })
    }
  }

  // ── Rate limit: ElevenLabs is the most expensive call in the app ──
  const rl = await checkRateLimit(`audio:${authUser.id}`, 15, 3600)
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many audio generations. Please wait a moment and try again.' })
  }

  const CHAR_LIMIT = 4500
  let processedText = text

  if (text.length > CHAR_LIMIT) {
    const truncated = text.substring(0, CHAR_LIMIT)
    const lastSentence = Math.max(
      truncated.lastIndexOf('. '),
      truncated.lastIndexOf('.\n'),
      truncated.lastIndexOf('... ')
    )
    processedText = lastSentence > 2000
      ? truncated.substring(0, lastSentence + 1)
      : truncated
  }

  const voiceSettings = productType === 'subliminal'
    ? { stability: 0.98, similarity_boost: 0.40, style: 0.00, use_speaker_boost: false, speed: 0.75 }
    : productType === 'sleep'
    ? { stability: 0.98, similarity_boost: 0.80, style: 0.00, use_speaker_boost: false, speed: 0.75 }
    : productType === 'walking'
    ? { stability: 0.92, similarity_boost: 0.80, style: 0.05, use_speaker_boost: false, speed: 0.90 }
    : { stability: 0.95, similarity_boost: 0.85, style: 0.00, use_speaker_boost: false, speed: 0.82 }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: processedText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: voiceSettings,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const errMsg = err.detail?.message || err.detail || JSON.stringify(err) || 'Audio generation failed'
      console.error('ElevenLabs error:', response.status, errMsg)
      return res.status(500).json({ error: `Audio generation failed. Please try again.` })
    }

    const audioBuffer = await response.arrayBuffer()

    const fileName = `${authUser.id}-${Date.now()}.mp3`
    const filePath = `sessions/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filePath, Buffer.from(audioBuffer), {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Content-Disposition', 'attachment; filename="session.mp3"')
      return res.send(Buffer.from(audioBuffer))
    }

    // Signed URL for the immediate first listen (valid 12h). The PATH is what
    // gets persisted — the dashboard mints a fresh signed URL from it on every
    // load, so saved sessions replay forever even though the bucket is private.
    const { data: signedData, error: signedError } = await supabase.storage
      .from('audio')
      .createSignedUrl(filePath, 60 * 60 * 12)

    if (signedError) {
      console.error('Signed URL error:', signedError)
      return res.status(500).json({ error: 'Audio generated but could not create playback URL. Please try again.' })
    }

    return res.status(200).json({ audioUrl: signedData.signedUrl, audioPath: filePath })

  } catch (err) {
    return res.status(500).json({ error: 'Audio generation failed. Please try again.' })
  }
}
