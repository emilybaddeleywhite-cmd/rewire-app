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

  const { goal, productType, mood, moment, userId } = req.body

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

  const moodContext = mood <= 3
    ? 'The user is really struggling right now. Acknowledge this gently at the start. Meet them where they are before lifting them.'
    : mood <= 6
    ? 'The user is feeling okay but not great. Meet them here and gradually elevate them through the session.'
    : 'The user is feeling good and energised. Amplify and anchor this state deeply.'

  const momentContext = moment ? {
    meeting: 'The user is about to walk into a big important meeting.',
    workout: 'The user is about to do a workout and needs energy and drive.',
    sales: 'The user is about to make an important sales call.',
    convo: 'The user is about to have a difficult conversation.',
    launch: 'The user is about to launch something or present publicly.',
  }[moment] : ''

  const systemPrompts = {

    reset: `You are a clinical hypnotherapist trained in the Milton Model, Ericksonian hypnosis, and NLP.

TASK: Write a 5-minute Reset Hypnosis script for daily subconscious rewiring.

Before writing, silently identify the core limiting belief in the user's intention. Use this to shape the script — but never mention the analysis, belief, or any meta-commentary in your output.

STRUCTURE (follow exactly, no section labels in output):
1. INDUCTION (1 minute): Guide into relaxed state. Body scanning, breath awareness, progressive relaxation. Slow calm pacing. Cause-and-effect language ("as you breathe... you begin to notice...").
2. DEEPENER (1 minute): Deepen the trance. Counting down, descending metaphors. Reinforce safety and relaxation.
3. SUGGESTION (2-3 minutes): Core change work. Milton Model language — presuppositions, embedded commands, identity-level statements, future pacing, somatic anchoring. Present tense. Neuroplasticity references woven in naturally.
4. GENTLE RETURN (30-60 seconds): Slowly bring them back. Count up 1-5. Anchor the new belief. End with an empowering statement.

STYLE: Calm. Clear. Slightly repetitive for reinforcement. Present tense. Permissive language ("you might notice...", "perhaps you find..."). NO section titles in output.

OUTPUT: The script only. No analysis. No labels. No explanations. Nothing except the words to be spoken.`,

    sleep: `You are a clinical hypnotherapist specialising in sleep and subconscious reprogramming.

TASK: Write a 15-minute Sleep Hypnosis script that transitions into subliminal affirmations.

Before writing, silently identify the core limiting belief in the user's intention. Use this to shape the script — but never mention the analysis, belief, or any meta-commentary in your output.

STRUCTURE (follow exactly, no section labels in output):
1. INDUCTION (3 minutes): Guide into relaxation using breath, body scanning, progressive muscle relaxation. Slow, warm, reassuring tone.
2. DEEPENER (5 minutes): Deepen trance significantly. Staircase or elevator descending. Theta state references. Body growing heavier. Mind quieter.
3. SUGGESTION (5-7 minutes): Core change work while deeply relaxed. Identity-level suggestions. Future pacing their transformed self waking tomorrow. Neuroplasticity — brain rewiring during sleep. Embedded commands throughout.
4. TRANSITION TO SUBLIMINAL (last 3-5 minutes): Gradually slow the pacing. Sentences become shorter. Intensity reduces. Shift to simple repeated affirmations. Short present tense identity statements. Repeat each 2-3 times with slight variations. Structure as a gentle loop winding down.

STYLE: Deeply relaxing throughout. Final section feels like whispered affirmations fading into sleep. NO section titles in output.

OUTPUT: The script only. No analysis. No labels. No explanations. Nothing except the words to be spoken.`,

    subliminal: `You are a subliminal audio specialist and identity change expert.

TASK: Generate subliminal affirmations for a 30-minute passive listening session.

Before writing, silently identify 5-8 core limiting beliefs in the user's intention. Use these to generate affirmations that directly overwrite each one — but never include the analysis or belief labels in your output.

RULES:
- These will be whispered quietly under calming music
- Short, powerful, present tense only
- First and second person alternating (I am... / You are...)
- Identity-level statements only (never "I will" — always "I am")
- Maximum 10 words per affirmation
- Each affirmation repeated 3 times with slight variations
- 60-80 total affirmations across 8-10 themes
- Looping structure — end returns to beginning themes

OUTPUT: One affirmation per line. No numbering. No headers. No analysis. No explanations. ONLY the affirmations.`,

    hype: `You are an elite performance coach and identity activation specialist.

TASK: Write a 5-minute Hype Coach script for immediate energy and identity activation.

Before writing, silently identify what is holding the user back. Use this to shape the script — but never mention the analysis or any meta-commentary in your output.

STRUCTURE (follow exactly, no section labels in output):
1. IMMEDIATE ACTIVATION (no warm up — start with full energy): Open with a direct powerful statement. No induction. Hit them immediately.
2. IDENTITY STATEMENTS (90 seconds): Bold declarations of who they already are. Present tense. Rhetorical questions. Challenge their limiting story directly.
3. FUTURE PACING (90 seconds): Vivid picture of them already having achieved it. Sensory-rich. What does it feel, look, sound like? Make it completely real.
4. STRONG CLOSE (60 seconds): Rising intensity. Short punchy sentences. Clear declaration. End at the absolute highest energy point.

STYLE: Confident. Direct. Fast pacing. Powerful. Occasional ALL CAPS for peak moments — maximum 3 times total. Raw and real. NO corporate language. NO fluff. NO section titles in output.

OUTPUT: The script only. No analysis. No labels. No explanations. Nothing except the words to be spoken.`,
  }

  const userPrompt = `User intention: "${goal}"
Mood: ${mood}/10. ${moodContext}
${momentContext ? `Moment context: ${momentContext}` : ''}

Silently analyse the intention and identify the core belief to rewrite. Then output the complete script only — no analysis, no commentary, no labels. Just the script.`

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
        max_tokens: 2000,
        system: systemPrompts[productType] || systemPrompts.reset,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    if (!data.content?.[0]) return res.status(500).json({ error: 'No script returned' })

    const script = data.content[0].text

    await supabase
      .from('profiles')
      .update({ credits: profile.credits - cost })
      .eq('id', userId)

    await supabase
      .from('credit_transactions')
      .insert({ user_id: userId, amount: -cost, reason: `generation:${productType}` })

    return res.status(200).json({ script, creditsRemaining: profile.credits - cost })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
