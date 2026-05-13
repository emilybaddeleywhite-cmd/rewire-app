// lib/brevo.js
// Central email sender for RewireMode — all 8 transactional emails live here.
// Uses Brevo's transactional API (not SMTP, not campaigns).
// Requires: BREVO_API_KEY in your environment variables.

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

// Shared wrapper — plain text email styled simply.
// RewireMode brand: dark background, clean type, no decoration.
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
// Trigger: call from your auth signup handler (see pages/api/send-welcome.js)

export async function sendWelcome({ email }) {
  return send({
    to: email,
    subject: "You're in. Here's how to start.",
    html: template(`
      <p>Welcome to RewireMode.</p>
      <p>Your account is ready and you have 5 free credits to start with.</p>
      <p>Here's what each credit gets you:<br>
      &mdash; 1 credit: Reset Hypnosis or Walking Hypnosis (5 min)<br>
      &mdash; 3 credits: Sleep Hypnosis or Subliminal (15&ndash;30 min)</p>
      <p>Every session is generated specifically for you &mdash; your words, your goal, your voice. No two are the same.</p>
      <p>To generate your first session, head to the app and type in what you want to work on. Be as specific as you like. The more honest you are, the better it works.</p>
      <p>Your free credits reset every week, so there&rsquo;s no pressure to use them all at once.</p>
      <a href="https://rewiremode.com/app" class="cta">Generate your first session</a>
      <p>If you have any questions, just reply to this email.</p>
    `),
  })
}

// ── 2. PRO SUBSCRIPTION CONFIRMED ───────────────────────────────────────────
// Trigger: checkout.session.completed where productKey === 'pro_monthly'

export async function sendProConfirmed({ email }) {
  return send({
    to: email,
    subject: 'Pro is active &mdash; 100 credits ready.',
    html: template(`
      <p>Your Pro subscription is confirmed.</p>
      <p>100 credits have been added to your account. They reset on the same date each month.</p>
      <p>What&rsquo;s now unlocked:<br>
      &mdash; All session types, including Sleep and Subliminals<br>
      &mdash; Up to 50 sessions saved to your library<br>
      &mdash; Full session history<br>
      &mdash; Streak bonus credits<br>
      &mdash; Priority audio generation<br>
      &mdash; Every new feature as we build it</p>
      <p>Your billing date is the same each month. You can cancel anytime from your dashboard &mdash; no hoops, no delays.</p>
      <a href="https://rewiremode.com/app" class="cta">Go to your dashboard</a>
      <p>If you run into anything, reply here.</p>
    `),
  })
}

// ── 3. FOUNDER LIFETIME CONFIRMED ───────────────────────────────────────────
// Trigger: checkout.session.completed where productKey === 'lifetime_founder'

export async function sendFounderConfirmed({ email }) {
  return send({
    to: email,
    subject: "You're a founder. Thank you.",
    html: template(`
      <p>This one means something.</p>
      <p>RewireMode has run no ads. No affiliate deals, no sponsored posts. You found this, or someone you trust showed it to you &mdash; and you decided to back it before it was obvious.</p>
      <p>That matters to me.</p>
      <p>Your Founder Lifetime access is now active. Here&rsquo;s what that means:<br>
      &mdash; 50 credits every month, permanently<br>
      &mdash; Every session type, now and as new ones are added<br>
      &mdash; Every feature we ever build, included<br>
      &mdash; One payment. Nothing more, ever.</p>
      <p>That &pound;99 is locked in for life. As RewireMode grows and the price rises for new members, yours stays exactly where it is.</p>
      <p>You&rsquo;re one of the first 1,000 people to do this. That won&rsquo;t change.</p>
      <p>Welcome.</p>
      <a href="https://rewiremode.com/app" class="cta">Go to your dashboard</a>
      <p>If you ever have a question or something isn&rsquo;t right, reply directly to this email. I read every one.</p>
    `),
  })
}

// ── 4. CREDITS EXHAUSTED ────────────────────────────────────────────────────
// Trigger: generate-script.js returns 402 (not enough credits)
// Pass resetDate as a formatted string e.g. "Monday 19 May"

export async function sendCreditsEmpty({ email, resetDate }) {
  const reset = resetDate || 'next Monday'
  return send({
    to: email,
    subject: "You've used your credits for this week.",
    html: template(`
      <p>You&rsquo;ve used all your free credits for this week.</p>
      <p>They&rsquo;ll reset automatically on ${reset}. You won&rsquo;t need to do anything.</p>
      <p>If you&rsquo;d rather not wait, Pro gives you 100 credits a month &mdash; that&rsquo;s roughly 100 Reset or Walking sessions, or around 33 Sleep or Subliminal sessions per month, for &pound;14.99.</p>
      <p>Or if you want to go further &mdash; the Founder Lifetime offer is still open. &pound;99 once, 50 credits every month, forever. Once 1,000 memberships are claimed, it closes for good.</p>
      <a href="https://rewiremode.com/pricing" class="cta">See plans</a>
      <p>Either way, we&rsquo;ll see you when your credits reset.</p>
    `),
  })
}

// ── 5. PAYMENT FAILED ───────────────────────────────────────────────────────
// Trigger: invoice.payment_failed Stripe webhook event

export async function sendPaymentFailed({ email }) {
  return send({
    to: email,
    subject: "Your payment didn't go through.",
    html: template(`
      <p>We tried to process your subscription renewal but the payment didn&rsquo;t go through.</p>
      <p>Your access is still active for now. To keep it, please update your payment details &mdash; it only takes a moment.</p>
      <p>If you think this is a mistake, it&rsquo;s worth checking with your bank. Some cards decline recurring payments by default.</p>
      <a href="https://rewiremode.com/app/billing" class="cta">Update payment details</a>
      <p>If you&rsquo;re having trouble or want to talk through options, just reply here.</p>
    `),
  })
}

// ── 6. SUBSCRIPTION CANCELLED ───────────────────────────────────────────────
// Trigger: customer.subscription.deleted Stripe webhook event
// Pass periodEnd as a formatted string e.g. "14 June 2025"

export async function sendSubscriptionCancelled({ email, periodEnd }) {
  const until = periodEnd || 'the end of your billing period'
  return send({
    to: email,
    subject: 'Your subscription has been cancelled.',
    html: template(`
      <p>Your Pro subscription has been cancelled.</p>
      <p>You&rsquo;ll keep full Pro access until ${until}. After that, your account will move to the free plan &mdash; 5 credits a week, with the option to top up whenever you want.</p>
      <p>Your session history and saved sessions stay in your account. Nothing gets deleted.</p>
      <p>If you cancelled by mistake, or you&rsquo;d like to come back, you can resubscribe anytime from your dashboard.</p>
      <p>If there was something we got wrong &mdash; a missing feature, a session that didn&rsquo;t land, anything &mdash; I&rsquo;d genuinely like to know. Just reply to this email.</p>
      <a href="https://rewiremode.com/pricing" class="cta">Resubscribe anytime</a>
    `),
  })
}

// ── 7. GENERATION FAILED ────────────────────────────────────────────────────
// Trigger: generate-script.js or generate-audio.js catches an error

export async function sendGenerationFailed({ email }) {
  return send({
    to: email,
    subject: "Your session didn't generate &mdash; no credit was used.",
    html: template(`
      <p>Something went wrong while generating your session.</p>
      <p>No credit was deducted from your account. You haven&rsquo;t lost anything.</p>
      <p>This is usually a temporary issue. Most people find it works if they try again in a few minutes &mdash; you can use the exact same prompt or adjust it slightly.</p>
      <a href="https://rewiremode.com/app" class="cta">Try again</a>
      <p>If it keeps failing, reply to this email and let us know what you were trying to generate. We&rsquo;ll look into it.</p>
    `),
  })
}

// ── 8. WEEKLY CREDIT RESET ──────────────────────────────────────────────────
// Trigger: reset-credits.js cron job, after successful top-up

export async function sendCreditsReset({ email }) {
  return send({
    to: email,
    subject: 'Your free credits have reset.',
    html: template(`
      <p>Your 5 free credits are back.</p>
      <p>If you&rsquo;ve been meaning to try a Sleep session or a Subliminal, this is the week to do it &mdash; just keep in mind those use 3 credits each.</p>
      <p>Not sure what to work on? Some people find it helps to pick one specific thing rather than something broad. &ldquo;I want to feel less anxious before meetings&rdquo; tends to work better than &ldquo;reduce anxiety&rdquo;.</p>
      <a href="https://rewiremode.com/app" class="cta">Generate a session</a>
    `),
  })
}
