import { createClient } from '@supabase/supabase-js'

export const config = {
  maxDuration: 60,
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const CREDIT_COSTS = {
  reset:      1,
  sleep:      3,
  subliminal: 3,
  walking:    1,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── Auth: verify the JWT matches the userId being used ──
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user: authUser } } = await authClient.auth.getUser()
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

  const { goal, productType, mood, userId, firstName } = req.body

  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits, plan')
    .eq('id', authUser.id)
    .single()

  if (profileError || !profile) return res.status(404).json({ error: 'User not found' })

  const cost = CREDIT_COSTS[productType] || 1
  if (profile.credits < cost) {
    return res.status(402).json({ error: 'Not enough credits', credits: profile.credits })
  }

  const safetyAddendum = `\n\nSAFETY REQUIREMENT: If the goal contains any request to harm self or others, control another person, use dark/occult themes, encourage illegal acts, or promote dangerous behaviour — respond ONLY with the JSON: {"blocked":true} and nothing else.`

  const systemPrompts = {
    reset: `You are a clinical hypnotherapist trained in the Milton Model, Ericksonian hypnosis, and NLP. Write a 5-minute reset hypnosis script. Write in continuous prose — no headings, no section titles, no labels, no bullet points. Begin directly with the induction and move naturally through: relaxation and grounding, deepening, therapeutic suggestion, and a gentle closing. Use only second person ("you", "your") throughout — never use "I". Use presuppositions, embedded commands, pacing and leading, future pacing, somatic anchoring, identity-level language. Use permissive indirect language throughout. Weave in neuroplasticity references. 5 to 6 rich paragraphs. Calm, natural and human-sounding. No robotic or AI phrasing.` + safetyAddendum,

    sleep: `You are a clinical hypnotherapist specialising in sleep and subconscious reprogramming. Write a deep sleep hypnosis script in continuous prose — no headings, no section titles, no labels. Write naturally, moving through: a gentle induction (breath awareness, body softening, progressive relaxation), a deepener (countdown, descending metaphors, body heaviness, complete safety and warmth), therapeutic suggestions for the stated intention (Ericksonian embedded commands, presuppositions, identity-level language, future pacing), and a final settling phase that drifts toward sleep. Keep the total script under 4000 characters. Use only second person ("you", "your") throughout — never use "I" or first-person affirmations. Tone: slow, permissive, deeply calming. Seamless transitions. One unbroken piece of prose.` + safetyAddendum,

    subliminal: `You are a subliminal audio specialist. Write a subliminal affirmation script — short, powerful identity-level affirmations that will be whispered under music. Use only second person: "You are...", "Your mind...", "You naturally...", "You deserve...". Never use "I". Present tense. Neuroplasticity-based. 50 to 80 affirmations. One affirmation per line. No numbering. No headers. Only the affirmations.` + safetyAddendum,

    walking: `You are a clinical hypnotherapist specialising in ambulatory and eyes-open hypnosis. Write a 5-minute walking hypnosis script. The user will be physically walking outdoors while listening with headphones. CRITICAL: Do NOT use any language that encourages closing eyes, heavy physical relaxation, or deep trance. The user must remain fully alert and physically aware at all times. Write in continuous prose — no headings, no section titles. Move naturally through: grounding in the body and the present moment (breath, footsteps, physical sensation of movement), gentle present-moment awareness (surroundings, senses, rhythm of walking), softly repeated suggestions woven through the movement, and a quiet closing affirmation. Suggestions should feel like thoughts arriving naturally. Use only second person ("you", "your"). Tone: grounding, clear, calm, quietly powerful. 4 to 5 paragraphs.` + safetyAddendum,
  }

  const moodContext = mood <= 3
    ? 'They are really struggling right now. Meet them gently where they are before lifting them.'
    : mood <= 6
    ? 'They are feeling okay but not great. Meet them here and gradually elevate them.'
    : 'They are feeling good and energised. Amplify and anchor this state deeply.'

  const nameContext = firstName ? `The person's name is ${firstName}. Use their name naturally and sparingly — once or twice maximum, at meaningful moments. Never repeat it mechanically.` : ''

  const userPrompt = `Write a personalised script for: "${goal}". Mood: ${mood}/10. ${moodContext} ${nameContext} Make it feel written for this exact person in this exact moment.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: productType === 'sleep' || productType === 'subliminal' ? 3000 : 1500,
        system: systemPrompts[productType] || systemPrompts.reset,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    if (!data.content?.[0]) return res.status(500).json({ error: 'No script returned' })

    const script = data.content[0].text

    return res.status(200).json({ script, cost })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
