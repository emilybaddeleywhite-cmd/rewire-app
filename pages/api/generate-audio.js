export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text, voiceId, productType } = req.body

  const voiceSettings = productType === 'hype'
    ? { stability: 0.38, similarity_boost: 0.80, style: 0.62, use_speaker_boost: true, speed: 1.1 }
    : productType === 'subliminal'
    ? { stability: 0.95, similarity_boost: 0.75, style: 0.00, use_speaker_boost: false, speed: 0.80 }
    : productType === 'sleep'
    ? { stability: 0.95, similarity_boost: 0.85, style: 0.00, use_speaker_boost: false, speed: 0.72 }
    : { stability: 0.95, similarity_boost: 0.85, style: 0.00, use_speaker_boost: false, speed: 0.82 }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
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
