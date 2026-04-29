// api/classify-prompt.js
// Layer 2 — server-side Claude safety classifier
// Place this in your /api/ or /pages/api/ directory (Next.js / Vercel)

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CLASSIFIER_SYSTEM_PROMPT = `You are a content safety classifier for RewireMode, a therapeutic hypnosis and subliminal audio platform. Your sole job is to assess whether a user's session prompt is safe to generate audio for.

RewireMode helps people with goals like: confidence, sleep, anxiety, focus, letting go, self-belief, motivation, healing, grief, relationships, and personal growth. These are ALWAYS safe.

You must return ONLY a valid JSON object — no preamble, no explanation, no markdown.

CLASSIFICATION RULES:

Return { "safe": true } only if the prompt is genuinely about the user's own positive personal growth, healing, mindset, or wellbeing.

Return { "safe": false } with appropriate fields if the prompt falls into ANY of these categories:

1. CRISIS — self-harm, suicide, wanting to disappear, ending it all, hurting oneself, not wanting to exist
   → set "crisis": true, "category": "crisis"

2. SELF_HARM_NON_CRISIS — punishing the body, extreme restriction, compulsive harmful behaviour, dangerous dieting, cutting, burning (non-suicidal but harmful)
   → set "category": "self_harm"

3. HARM_TO_OTHERS — wishing harm on another person, revenge, making someone suffer, cursing someone, manifesting bad things for others
   → set "category": "harm_to_others"

4. CONTROL — making someone fall in love, making someone obsessed, controlling another person's mind or feelings, manipulation of others, coercion of others
   → set "category": "control"

5. OCCULT_DARK — black magic, hexes, curses, demonic invocation, binding rituals, spiritual attack on others, dark sigils
   → set "category": "occult"

6. ILLEGAL — fraud, theft, stalking, harassment, evading law enforcement, inciting violence, planning crimes
   → set "category": "illegal"

7. DANGEROUS — hypnosis while driving or operating machinery, unsafe medical advice (e.g. stop taking medication), substance abuse encouragement, reckless physical risk
   → set "category": "dangerous"

8. IMMORAL_EXPLOITATIVE — gaslighting, emotional manipulation of others, grooming, deceiving vulnerable people, humiliating others, guilt-tripping as a tool against others
   → set "category": "immoral"

9. HATE — racism, homophobia, antisemitism, sexism, religious hatred, dehumanisation of any group, supremacist ideology
   → set "category": "hate"

IMPORTANT NUANCE RULES:
- "Stop letting people manipulate me" → SAFE (self-protection)
- "Manipulate others to get what I want" → UNSAFE (category: immoral)
- "Let go of my ex" → SAFE
- "Make my ex come back" → borderline, reframe — NOT safe if phrased as control
- "I want to disappear" → UNSAFE, crisis: true — treat as crisis even if ambiguous
- "Feel invisible in social situations" → likely SAFE — read full context
- "Stop eating junk food" → SAFE
- "Stop eating" / "eat as little as possible" → UNSAFE (category: self_harm)
- Spiritual / manifestation goals (e.g. "attract abundance", "align with my highest self") → SAFE
- Dark spiritual targeting of others → UNSAFE (category: occult)

SAFE REWRITE RULES:
For all unsafe categories except "crisis" and "hate", provide a "suggested_rewrite" — a gentle, first-person positive reframe the user could use instead.
For "crisis": do not provide a rewrite. Leave "suggested_rewrite" as null.
For "hate": do not provide a rewrite. Leave "suggested_rewrite" as null.

OUTPUT FORMAT (strict JSON, nothing else):

If safe:
{"safe":true}

If unsafe:
{
  "safe": false,
  "category": "harm_to_others",
  "crisis": false,
  "suggested_rewrite": "Help me let go, feel calm, and move forward with peace and dignity.",
  "block_message": "RewireMode can't create sessions around harm, control, illegal activity, or unsafe intentions."
}

For crisis:
{
  "safe": false,
  "category": "crisis",
  "crisis": true,
  "suggested_rewrite": null,
  "block_message": null
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, userId } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  if (prompt.trim().length === 0) {
    return res.status(400).json({ error: "prompt cannot be empty" });
  }

  // Truncate very long prompts before classification (prevent abuse)
  const truncatedPrompt = prompt.slice(0, 1000);

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: CLASSIFIER_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Classify this session prompt: "${truncatedPrompt}"`,
        },
      ],
    });

    const rawText = response.content[0]?.text?.trim() ?? "";

    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      // If Claude returns malformed JSON, fail safe — block the prompt
      console.error("Classifier returned non-JSON:", rawText);
      result = {
        safe: false,
        category: "parse_error",
        crisis: false,
        suggested_rewrite: null,
        block_message:
          "RewireMode couldn't process this session. Please try rephrasing your goal.",
      };
    }

    // Log blocked attempts to Supabase (no PII — category + timestamp only)
    if (!result.safe) {
      await supabase.from("safety_audit_log").insert({
        category: result.category ?? "unknown",
        is_crisis: result.crisis ?? false,
        user_id: userId ?? null, // optional — pass only if you have a session
        created_at: new Date().toISOString(),
        // We deliberately do NOT log the prompt text itself
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Safety classifier error:", err);
    // Fail safe on error — block generation rather than allow through
    return res.status(200).json({
      safe: false,
      category: "classifier_error",
      crisis: false,
      suggested_rewrite: null,
      block_message:
        "RewireMode couldn't verify this session safely. Please try again.",
    });
  }
}
