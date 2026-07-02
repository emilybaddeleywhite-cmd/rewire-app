// lib/brevo.js
// Central email sender for RewireMode — all transactional emails live here.
// Uses Brevo's transactional API (not SMTP, not campaigns).
// Requires: BREVO_API_KEY in your environment variables.
//
// NOTE: pay-per-generation model. Nothing generates for free — the first
// session is £1 (one-time, any type), then £2 (Reset/Walking/Subliminal) or
// £3 (Sleep) per session, OR £14.99/month · £89/year Unlimited for everything.
// Replaying anything already created stays free forever, even after
// cancelling. Links point at real routes: /rewire, /challenge, /dashboard,
// /pricing (there is no /app route).

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
      <p>Your 7-Day Rewire begins with one intention: the thing you'd most like to change.</p>
      <p>Here's how it works:<br>
      &mdash; Type what you want to work on, in your own words<br>
      &mdash; We shape it into a personalised hypnosis session, in a real human voice<br>
      &mdash; Listen a few minutes a day for seven days &mdash; the more you return, the deeper it settles</p>
      <p>Your first session is just &pound;1 &mdash; enough to feel what this actually is before deciding anything. After that, sessions are &pound;2&ndash;&pound;3 each, or go Unlimited for &pound;14.99/month and never think about it again.</p>
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
      <p>You&rsquo;ll keep full access until ${until}. After that, creating new sessions goes back to pay-per-session (from &pound;1) &mdash; but everything you&rsquo;ve already made stays yours to replay, free, forever. Nothing gets deleted.</p>
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

// ── 9. RETENTION / CONVERSION NUDGES ────────────────────────────────────────
// Trigger: daily cron, pages/api/rewire-reminders.js. One function, dispatched
// by `kind`, so all lifecycle copy lives in one place. `link` should be the
// user's active challenge (e.g. https://rewiremode.com/challenge?id=...) when
// known, falling back to /rewire or /dashboard.

export async function sendRewireNudge({ email, kind, daysListened, link }) {
  const challengeLink = link || 'https://rewiremode.com/rewire'
  const dashboardLink = 'https://rewiremode.com/dashboard'

  const copy = {
    // Signed up, never pressed play at all. Day 1.
    never_started: {
      subject: 'Your 7-Day Rewire is still waiting',
      body: `
        <p>You signed up yesterday, but haven&rsquo;t started your first session yet.</p>
        <p>It takes about ninety seconds: tell us the one thing you&rsquo;d most like to change, and we&rsquo;ll shape it into a session in your voice, for you.</p>
        <p>Your first one is just &pound;1.</p>
        <a href="${challengeLink}" class="cta">Start your first session</a>`,
    },
    // Signed up, still never played. Day 3 — more direct.
    never_started_2: {
      subject: "Still haven't tried your first session?",
      body: `
        <p>No pressure &mdash; just checking in.</p>
        <p>If something felt unclear or you weren&rsquo;t sure what to type as your intention, just reply to this email and tell me. I read every one, and I&rsquo;d genuinely like to help.</p>
        <p>Otherwise, your first session is still just &pound;1 whenever you&rsquo;re ready.</p>
        <a href="${challengeLink}" class="cta">Start your first session</a>`,
    },
    // Mid-challenge, gone quiet for a couple of days.
    midway: {
      subject: daysListened ? `Day ${daysListened} is waiting for you` : 'Keep your streak going',
      body: `
        <p>${daysListened ? `You're ${daysListened} day${daysListened === 1 ? '' : 's'} into your 7-Day Rewire.` : "You've started your 7-Day Rewire."} A couple of days have gone by since your last session.</p>
        <p>Consistency is what actually does the work here &mdash; a few minutes today keeps the pathway you've already started building.</p>
        <a href="${challengeLink}" class="cta">Continue your Rewire</a>`,
    },
    // Hit day 7, no purchase yet. Immediate.
    completed_no_purchase: {
      subject: 'You finished your 7-Day Rewire',
      body: `
        <p>Seven days. That's real consistency &mdash; well done.</p>
        <p>If you want to keep going: Sleep and Subliminal sessions, every goal, every voice, are all open with Unlimited &mdash; &pound;14.99/month or &pound;89/year. Or just get your next session individually, whenever you want one.</p>
        <a href="https://rewiremode.com/pricing" class="cta">See what's next</a>`,
    },
    // Completed, still no purchase. ~Day 10-14 — stronger.
    completed_no_purchase_2: {
      subject: "Don't lose the momentum you built",
      body: `
        <p>You put in seven days. That's the hard part, and it's behind you.</p>
        <p>The people who stick with this long enough to see real change are almost always the ones who keep a light, regular rhythm going &mdash; not the ones who do one intense week and stop.</p>
        <p>Unlimited is &pound;14.99/month, or get just your next session for &pound;2&ndash;&pound;3.</p>
        <a href="https://rewiremode.com/pricing" class="cta">Keep going</a>`,
    },
    // Bought once (trial or single credit), no subscription, gone quiet.
    credit_no_sub: {
      subject: 'How did your session land?',
      body: `
        <p>You tried RewireMode a little while ago &mdash; I hope it helped, even a little.</p>
        <p>If you want to keep it going without thinking about paying per session, Unlimited opens everything &mdash; every session type, every goal &mdash; for &pound;14.99/month or &pound;89/year.</p>
        <a href="https://rewiremode.com/pricing" class="cta">Go Unlimited</a>
        <p>If it wasn't for you, no worries at all &mdash; just reply and let me know why. It genuinely helps.</p>`,
    },
    // Paid subscriber gone quiet for a while — usage reminder, not a renewal notice.
    paid_reengage: {
      subject: "You're paying for this — let's use it",
      body: `
        <p>It's been a little while since your last session. You've got every session type and every goal available whenever you want them.</p>
        <p>A few minutes today is often enough to pick the habit back up.</p>
        <a href="${dashboardLink}" class="cta">Go to your dashboard</a>`,
    },
    // One-off win-back for someone mid-challenge who's gone properly quiet.
    winback: {
      subject: 'Still there?',
      body: `
        <p>${daysListened ? `You made it ${daysListened} day${daysListened === 1 ? '' : 's'} into your 7-Day Rewire` : "You started a 7-Day Rewire"} and then things went quiet &mdash; which happens to everyone.</p>
        <p>Your progress is still saved. It takes one session to pick it back up.</p>
        <a href="${challengeLink}" class="cta">Pick up where you left off</a>`,
    },
  }

  const c = copy[kind]
  if (!c) throw new Error(`Unknown nudge kind: ${kind}`)

  return send({ to: email, subject: c.subject, html: template(c.body) })
}
