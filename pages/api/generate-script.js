export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { goal, tone, mood, moment } = req.body;
  const isHype = tone === 'hype';
 
  const momentContext = moment ? {
    meeting: 'They are about to walk into a big important meeting.',
    workout: 'They are about to do a workout and need energy and drive.',
    sales: 'They are about to make an important sales call.',
    convo: 'They are about to have a difficult conversation.',
    launch: 'They are about to launch something or present publicly.',
  }[moment] : '';
 
  const moodContext = mood <= 3
    ? 'They are really struggling right now — low energy, low mood. Meet them gently where they are before lifting them.'
    : mood <= 6
    ? 'They are feeling okay but not great. Meet them here and gradually elevate them.'
    : 'They are feeling good and energised. Amplify and anchor this state deeply.';
 
  const systemPrompt = isHype
    ? `You are an elite performance coach. Write powerful, direct, emotionally charged hype scripts that fire people up. Use punchy sentences, rhetorical questions, occasional ALL CAPS for impact, rising energy arc, ends with a call to action. Reference neuroscience occasionally. 4-5 paragraphs. ONLY the script, no titles or labels.`
    : `You are a clinical hypnotherapist trained in the Milton Model, Ericksonian hypnosis, and NLP. Use presuppositions, embedded commands, pacing and leading, future pacing, somatic anchoring, identity-level language, permissive indirect language ("you might find...", "perhaps you notice..."), neuroplasticity references, and present tense as if transformation is already happening. Tone: ${tone} (calm=oceanic/slow, confident=powerful/activating, sleep=descending/heavy). 5-6 rich paragraphs. ONLY the script, no titles or labels.`;
 
  const userPrompt = isHype
    ? `Write a personalised hype coach script for: "${goal}". Mood: ${mood}/10. ${moodContext} ${momentContext ? `Context: ${momentContext}` : ''} Raw, real, fired up — like the best coach they've ever had.`
    : `Write a personalised hypnotic script for: "${goal}". Tone: ${tone}. Mood: ${mood}/10. ${moodContext} ${momentContext ? `Context: ${momentContext}` : ''} Make it feel written for this exact person in this exact moment.`;
 
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
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
 
    const data = await response.json();
    if (data.content && data.content[0]) {
      return res.status(200).json({ script: data.content[0].text });
    }
    return res.status(500).json({ error: 'No script returned' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
