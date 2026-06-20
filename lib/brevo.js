// lib/brevo.js
// Central email sender for RewireMode — all transactional emails live here.
// Uses Brevo's transactional API (not SMTP, not campaigns).
// Requires: BREVO_API_KEY in your environment variables.
//
// NOTE: the product has no credits. Free = the 7-Day Rewire (Reset + Walking,
// one goal, unlimited replay). Paid "Unlimited" adds Sleep + Subliminal, every
// goal, every voice & atmosphere. Links point at real routes: /rewire,
// /dashboard, /pricing (there is no /app route).

const BREVO_API = 'https://api.brevo.com/v3/smtp/email'
const FROM = { name: 'RewireMode', email: 'hello@rewiremode.com' }

async function send({ to, subject, html }) {
  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: FROM,
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Brevo error ${res.status}: ${JSON.stringify(err)}`)
  }

  return res.json()
}

// Shared wrapper — plain, dark, clean. No decoration.
function template(body) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#0a0a0f; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:48px 24px; }
  .logo { font-size:13px; letter-spacing:0.12em; color:#6b6b80; text-transform:uppercase; margin-bottom:40px; }
  .body { font-size:15px; line-height:1.8; color:#c8c8d8; }
  .body p { margin:0 0 18px; }
  .cta { display:inline-block; margin:8px 0 24px; padding:12px 24px; background:#6c5ce7; color:#ffffff; text-decoration:none; border-radius:8px; font-size:14px; font-weight:500; }
  .divider { border:none; border-top:1px solid #1e1e2e; margin:32px 0; }
  .footer { font-size:12px; color:#3e3e52; line-height:1.6; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">RewireMode</div>
  <div class="body">${body}</div>
  <hr class="divider">
  <div class="footer">Built by a qualified hypnotherapist &middot; Powered by Claude AI &middot; Voices by ElevenLabs</div>
</div>
</body>
</html>`
}

// ── 1. WELCOME ──────────────────────────────────────────────────────────────
// Trigger: first sign-in of a new account (see pages/_app.js).

export async function sendWelcome({ email }) {
  return send({
    to: email,
    subject: "You're in. Your 7-Day Rewire starts now.",
    html: template(`
      <p>Welcome to RewireMode.</p>
      <p>Your free 7-Day Rewire is ready &mdash; no card, no catch. It begins with one intention: the thing you'd most like to change.</p>
      <p>Here's how it works:<br>
      &mdash; Type what you want to work on, in your own words<br>
      &mdash; We shape it into personalised Reset and Walking hypnosis, in a real human voice<br>
      &mdash; Listen a few minutes a day for seven days &mdash; the more you return, the deeper it settles</p>
      <p>Reset and Walking are yours free, for one goal, to keep and replay as often as you like. Sleep and Subliminal sessions, and the freedom to rewire any goal, unlock with Unlimited whenever you're ready.</p>
      <p>Be as specific as you like when you start. The more honest you are, the better it works.</p>
      <a href="https://rewiremode.com/rewire" class="cta">Begin your Rewire</a>
      <p>If you have any questions, just reply to this email.</p>
    `),
  })
}

// ── 2. UNLIMITED SUBSCRIPTION CONFIRMED ─────────────────────────────────────
// Trigger: checkout.session.completed (webhook sets plan = 'pro').

export async function sendProConfirmed({ email }) {
  return send({
    to: email,
    subject: "You're on Unlimited.",
    html: template(`
      <p>Your Unlimited subscription is confirmed &mdash; thank you.</p>
      <p>Here's what's now open to you:<br>
      &mdash; Sleep and Subliminal sessions, for any goal<br>
      &mdash; Rewire as many different goals as you like<br>
      &mdash; Every voice and every atmosphere<br>
      &mdash; Your whole library, yours to replay forever</p>
      <p>You can manage or cancel your subscription anytime from your dashboard &mdash; no hoops, no delays.</p>
      <a href="https://rewiremode.com/dashboard" class="cta">Go to your dashboard</a>
      <p>If you run into anything, just reply here.</p>
    `),
  })
}

// ── 3. FOUNDER LIFETIME CONFIRMED ───────────────────────────────────────────
// Dormant: not triggered by the current webhook. Kept for compatibility.

export async function sendFounderConfirmed({ email }) {
  return send({
    to: email,
    subject: "You're a founder. Thank you.",
    html: template(`
      <p>This one means something.</p>
      <p>RewireMode has run no ads. You found this, or someone you trust showed it to you &mdash; and you decided to back it early.</p>
      <p>Your Founder Lifetime access is now active: every session type, every goal, every feature we ever build &mdash; one payment, nothing more, ever.</p>
      <p>Welcome.</p>
      <a href="https://rewiremode.com/dashboard" class="cta">Go to your dashboard</a>
      <p>If you ever have a question, reply directly to this email. I read every one.</p>
    `),
  })
}

// ── 4. (DORMANT) CREDITS EXHAUSTED ──────────────────────────────────────────
// Dormant: the credits system was removed; nothing triggers this. Kept so
// existing imports don't break.

export async function sendCreditsEmpty({ email, resetDate }) {
  return send({
    to: email,
    subject: 'A quick note from RewireMode.',
    html: template(`
      <p>Your free Reset and Walking sessions are always available &mdash; listen and replay them as often as you like.</p>
      <p>When you're ready for Sleep and Subliminal, and the freedom to rewire any goal, Unlimited opens everything up.</p>
      <a href="https://rewiremode.com/pricing" class="cta">See plans</a>
    `),
  })
}

// ── 5. PAYMENT FAILED ───────────────────────────────────────────────────────
// Trigger: invoice.payment_failed Stripe webhook event.

export async function sendPaymentFailed({ email }) {
  return send({
    to: email,
    subject: "Your payment didn't go through.",
    html: template(`
      <p>We tried to process your subscription renewal but the payment didn&rsquo;t go through.</p>
      <p>Your access is still active for now. To keep it, please update your payment details &mdash; it only takes a moment.</p>
      <p>If you think this is a mistake, it&rsquo;s worth checking with your bank. Some cards decline recurring payments by default.</p>
      <a href="https://rewiremode.com/dashboard" class="cta">Update payment details</a>
      <p>If you&rsquo;re having trouble or want to talk through options, just reply here.</p>
    `),
  })
}

// ── 6. SUBSCRIPTION CANCELLED ───────────────────────────────────────────────
// Trigger: customer.subscription.deleted Stripe webhook event.
// Pass periodEnd as a formatted string e.g. "14 June 2026".

export async function sendSubscriptionCancelled({ email, periodEnd }) {
  const until = periodEnd || 'the end of your billing period'
  return send({
    to: email,
    subject: 'Your subscription has been cancelled.',
    html: template(`
      <p>Your Unlimited subscription has been cancelled.</p>
      <p>You&rsquo;ll keep full access until ${until}. After that, your account moves to the free plan &mdash; your 7-Day Rewire with Reset and Walking, for one goal, yours to replay anytime.</p>
      <p>Your saved sessions stay in your account. Nothing gets deleted.</p>
      <p>If you cancelled by mistake, or you&rsquo;d like to come back, you can resubscribe anytime from your dashboard.</p>
      <p>If there was something we got wrong &mdash; a missing feature, a session that didn&rsquo;t land, anything &mdash; I&rsquo;d genuinely like to know. Just reply to this email.</p>
      <a href="https://rewiremode.com/pricing" class="cta">Resubscribe anytime</a>
    `),
  })
}

// ── 7. GENERATION FAILED ────────────────────────────────────────────────────
// Trigger: generate-script.js or generate-audio.js catches an error.

export async function sendGenerationFailed({ email }) {
  return send({
    to: email,
    subject: "Your session didn't generate.",
    html: template(`
      <p>Something went wrong while generating your session.</p>
      <p>Nothing was charged and nothing was lost.</p>
      <p>This is usually a temporary issue. Most people find it works if they try again in a few minutes &mdash; you can use the exact same intention or adjust it slightly.</p>
      <a href="https://rewiremode.com/rewire" class="cta">Try again</a>
      <p>If it keeps failing, reply to this email and tell us what you were trying to create. We&rsquo;ll look into it.</p>
    `),
  })
}

// ── 8. (DORMANT) WEEKLY CREDIT RESET ────────────────────────────────────────
// Dormant: the weekly credit cron has been removed. Kept so existing imports
// don't break; nothing triggers this.

export async function sendCreditsReset({ email }) {
  return send({
    to: email,
    subject: 'A gentle nudge from RewireMode.',
    html: template(`
      <p>Your Reset and Walking sessions are here whenever you want them &mdash; listen and replay as often as you like.</p>
      <p>Not sure what to work on? It helps to pick one specific thing. &ldquo;I want to feel less anxious before meetings&rdquo; tends to work better than &ldquo;reduce anxiety&rdquo;.</p>
      <a href="https://rewiremode.com/rewire" class="cta">Create a session</a>
    `),
  })
}
