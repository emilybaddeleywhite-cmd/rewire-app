import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const CREDIT_COSTS = {
  reset: 1,
  hype: 1,
  sleep: 3,
  subliminal: 3,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { goal, productType, mood, moment, userId, firstName } = req.body

  // Check and deduct credits
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits, plan')
    .eq('id', userId)
    .single()

  if (profileError || !profile) return res.status(404).json({ error: 'User not found' })

  const cost = CREDIT_COSTS[productType] || 1
  if (profile.credits < cost) {
    return res.status(402).json({ error: 'Not enough credits', credits: profile.credits })
  }

  // Build system prompt based on product type
  const systemPrompts = {
    reset: `You are a clinical hypnotherapist trained in the Milton Model, Ericksonian hypnosis, and NLP. Write a 5-minute reset hypnosis script with 4 clear sections: Induction, Deepener, Suggestion, Release. Use presuppositions, embedded commands, pacing and leading, future pacing, somatic anchoring, identity-level language. Use permissive indirect language. Weave in neuroplasticity references. 5-6 rich paragraphs. ONLY the script, no titles or section labels.`,
    sleep: `You are a clinical hypnotherapist specialising in sleep and subconscious reprogramming. Write a deep sleep hypnosis script in exactly 4 sections. Keep the total script under 4000 characters.

SECTION 1 - INDUCTION (short): Progressive relaxation, breath awareness, eyes closed, body softening. Slow permissive language. Theta state references.

SECTION 2 - DEEPENER (medium): Deepen the trance. Countdown deepener, descending metaphors, body heaviness, complete safety and warmth.

SECTION 3 - SUGGESTION (medium): Therapeutic suggestions for the stated intention. Ericksonian embedded commands, presuppositions, identity-level language, future pacing.

SECTION 4 - SUBLIMINAL AFFIRMATIONS (short): 10-12 short powerful identity-level affirmations in present tense first person, one per line, directly related to the intention.

No section headers in the output. Write continuously. Seamless transitions. ONLY the script text.`,
    subliminal: `You are a subliminal audio specialist. Write a 30-minute subliminal affirmation script — short, powerful identity-level affirmations repeated in varied forms. Present tense. First and second person alternating. Neuroplasticity-based. These will be whispered under music. 50-80 affirmations. ONLY the affirmations, one per line, no numbering.`,
    hype: `You are an elite performance coach. Write a powerful 5-minute hype coach script. Punchy sentences. Rising energy arc. Rhetorical questions. Occasional ALL CAPS for emphasis. Ends with a clear declaration. Reference neuroscience briefly. 4-5 paragraphs. ONLY the script, no titles.`,
  }

  const momentContext = moment ? {
    meeting: 'They are about to walk into a big important meeting.',
    workout: 'They are about to do a workout and need energy and drive.',
    sales: 'They are about to make an important sales call.',
    convo: 'They are about to have a difficult conversation.',
    launch: 'They are about to launch something or present publicly.',
  }[moment] : ''

  const moodContext = mood <= 3
    ? 'They are really struggling right now. Meet them gently where they are before lifting them.'
    : mood <= 6
    ? 'They are feeling okay but not great. Meet them here and gradually elevate them.'
    : 'They are feeling good and energised. Amplify and anchor this state deeply.'

  const nameContext = firstName ? `The person's name is ${firstName}. Use their name naturally and sparingly in the script — once or twice maximum, at meaningful moments. Never repeat it mechanically.` : ''

  const userPrompt = `Write a personalised script for: "${goal}". Mood: ${mood}/10. ${moodContext} ${momentContext ? `Context: ${momentContext}` : ''} ${nameContext} Make it feel written for this exact person in this exact moment.`

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

    // Credits are deducted in save-session only after audio succeeds
    return res.status(200).json({ script, cost })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
