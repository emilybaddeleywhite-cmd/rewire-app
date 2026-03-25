export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { text, isHype } = req.body;
 
  const HYPNOSIS_VOICE_ID = 'TKePFuDtAVp14EppI8GC';
  const HYPE_VOICE_ID = 'Fc5CaIGWKvLHapoOSM2K';
  const voiceId = isHype ? HYPE_VOICE_ID : HYPNOSIS_VOICE_ID;
 
  const voiceSettings = isHype
    ? { stability: 0.35, similarity_boost: 0.80, style: 0.65, use_speaker_boost: true }
    : { stability: 0.75, similarity_boost: 0.85, style: 0.20, use_speaker_boost: false };
 
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
    });
 
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(500).json({ error: err.detail?.message || 'Audio generation failed' });
    }
 
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="session.mp3"');
    return res.send(Buffer.from(audioBuffer));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
