export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text, voiceId, productType } = req.body

  // ElevenLabs character limits per plan
  // Turbo v2.5 supports up to 5000 chars per request
  // For longer scripts we truncate to the nearest sentence
  const CHAR_LIMIT = 4800
  let processedText = text

  if (text.length > CHAR_LIMIT) {
    // Truncate at the nearest sentence end before the limit
    const truncated = text.substring(0, CHAR_LIMIT)
    const lastSentence = Math.max(
      truncated.lastIndexOf('. '),
      truncated.lastIndexOf('.\n'),
      truncated.lastIndexOf('... ')
    )
    processedText = lastSentence > 3000
      ? truncated.substring(0, lastSentence + 1)
      : truncated
  }

  const voiceSettings = productType === 'hype'
    ? { stability: 0.38, similarity_boost: 0.80, style: 0.62, use_speaker_boost: true, speed: 1.1 }
    : productType === 'subliminal'
    ? { stability: 0.98, similarity_boost: 0.60, style: 0.00, use_speaker_boost: false, speed: 0.75 }
    : productType === 'sleep'
    ? { stability: 0.98, similarity_boost: 0.80, style: 0.00, use_speaker_boost: false, speed: 0.68 }
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
      return res.status(500).json({ error: err.detail?.message || 'Audio generation failed' })
    }

    const audioBuffer = await response.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Disposition', 'attachment; filename="session.mp3"')
    return res.send(Buffer.from(audioBuffer))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
