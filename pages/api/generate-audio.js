import { createClient } from '@supabase/supabase-js'

export const config = {
  maxDuration: 60,
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text, voiceId, productType, userId } = req.body

  const CHAR_LIMIT = 4500
  let processedText = text

  console.log(`Audio generation - productType: ${productType}, text length: ${text.length}`)

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
    console.log(`Text truncated from ${text.length} to ${processedText.length} chars`)
  }

  const voiceSettings = productType === 'hype'
    ? { stability: 0.38, similarity_boost: 0.80, style: 0.62, use_speaker_boost: true, speed: 1.1 }
    : productType === 'subliminal'
    ? { stability: 0.98, similarity_boost: 0.60, style: 0.00, use_speaker_boost: false, speed: 0.75 }
    : productType === 'sleep'
    ? { stability: 0.98, similarity_boost: 0.80, style: 0.00, use_speaker_boost: false, speed: 0.75 }
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
      return res.status(500).json({ error: `ElevenLabs ${response.status}: ${errMsg}` })
    }

    const audioBuffer = await response.arrayBuffer()

    // Upload to Supabase Storage for permanent URL
    const fileName = `${userId || 'anon'}-${Date.now()}.mp3`
    const filePath = `sessions/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filePath, Buffer.from(audioBuffer), {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      // Fall back to returning the buffer directly
      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Content-Disposition', 'attachment; filename="session.mp3"')
      return res.send(Buffer.from(audioBuffer))
    }

    // Return permanent public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(filePath)

    return res.status(200).json({ audioUrl: publicUrl })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
