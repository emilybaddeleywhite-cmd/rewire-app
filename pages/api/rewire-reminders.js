// pages/api/rewire-reminders.js
// Daily cron — the retention + conversion engine for RewireMode.
// Scheduled via vercel.json at 16:00 UTC. Protected by CRON_SECRET (Vercel
// automatically sends `Authorization: Bearer $CRON_SECRET` for cron-triggered
// requests when that env var is set — set one so this can't be triggered by
// anyone who finds the URL).
//
// One email per user per day, maximum. Segments, in priority order:
//   never_started / never_started_2   — signed up, never generated anything
//   midway / winback                  — mid-challenge, gone quiet
//   completed_no_purchase / _2        — finished 7 days, never paid
//   credit_no_sub                     — paid once, let it lapse, no subscription
//   paid_reengage                     — subscriber gone quiet (not a renewal notice)
//
// NOTE on tracking: /challenge logs plays to `session_plays` (streak = days
// LISTENED, not generated). /rewire does not — sessions made there only show
// up in the `sessions` table. This cron uses `sessions` as the "has this
// person done anything at all" signal, and `session_plays` (scoped to their
// most recent challenge) for day-count copy where it's available. If someone
// only ever used /rewire, they'll still get accurate never-started / upsell
// / win-back emails — just without a specific "Day N" number, since that
// number only exists for the challenge flow.

import { createClient } from '@supabase/supabase-js'
import { sendRewireNudge } from '../../lib/brevo'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

function daysBetween(fromISO, todayStr) {
  if (!fromISO) return null
  const from = new Date(fromISO.slice(0, 10) + 'T00:00:00Z')
  const to = new Date(todayStr + 'T00:00:00Z')
  return Math.round((to - from) / 86400000)
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.authorization
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  let sent = 0, skipped = 0
  const errors = []

  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, plan, created_at')

    if (profilesError) throw profilesError

    for (const u of profiles || []) {
      try {
        if (!u.email || !u.created_at) { skipped++; continue }

        const isPaid = Boolean(u.plan && u.plan !== 'free')
        const daysSinceSignup = daysBetween(u.created_at, todayStr)

        // ── everything this user has ever generated, on any path ──
        const { data: sessions } = await supabase
          .from('sessions')
          .select('id, created_at, challenge_id')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })

        const hasEverGenerated = Boolean(sessions && sessions.length > 0)
        const lastActivityAt = hasEverGenerated ? sessions[0].created_at : null
        const daysSinceLastActivity = daysBetween(lastActivityAt, todayStr)

        // ── most recent challenge, and how many distinct days they've
        //    actually listened to it (streak = plays, not generations) ──
        const { data: challenges } = await supabase
          .from('challenges')
          .select('id, created_at, completed_at')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })
          .limit(1)

        const challenge = challenges && challenges[0]
        let distinctDaysListened = 0
        let lastPlayedOn = null

        if (challenge) {
          const { data: plays } = await supabase
            .from('session_plays')
            .select('played_on')
            .eq('user_id', u.id)
            .eq('challenge_id', challenge.id)
          const days = [...new Set((plays || []).map(p => p.played_on))].sort()
          distinctDaysListened = days.length
          lastPlayedOn = days.length ? days[days.length - 1] : null
        }

        const daysSinceLastPlay = lastPlayedOn ? daysBetween(lastPlayedOn, todayStr) : null
        const challengeCompleted = Boolean(challenge?.completed_at) || distinctDaysListened >= 7
        const link = challenge ? `https://rewiremode.com/challenge?id=${challenge.id}` : null

        // ── purchase history (one-time credits, not subscription) ──
        const { data: purchases } = await supabase
          .from('generation_purchases')
          .select('used, created_at')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })

        const hasUnusedCredit = Boolean(purchases && purchases.some(p => !p.used))
        const hasEverPurchased = Boolean(purchases && purchases.length > 0)
        const lastPurchaseAt = hasEverPurchased ? purchases[0].created_at : null
        const daysSincePurchase = daysBetween(lastPurchaseAt, todayStr)

        // ── decide, at most one email per user per day ──
        let kind = null

        if (!hasEverGenerated) {
          if (daysSinceSignup === 1) kind = 'never_started'
          else if (daysSinceSignup === 3) kind = 'never_started_2'
        } else if (isPaid) {
          if (daysSinceLastActivity === 20) kind = 'paid_reengage'
        } else if (challengeCompleted && !hasUnusedCredit) {
          const daysSinceCompletion = daysBetween(challenge?.completed_at || lastPlayedOn, todayStr)
          if (daysSinceCompletion === 0) kind = 'completed_no_purchase'
          else if (daysSinceCompletion === 5) kind = 'completed_no_purchase_2'
          else if (hasEverPurchased && daysSincePurchase === 10) kind = 'credit_no_sub'
        } else if (!challengeCompleted) {
          const gapDays = daysSinceLastPlay ?? daysSinceLastActivity
          if (gapDays === 2) kind = 'midway'
          else if (gapDays === 10) kind = 'winback'
        }

        if (!kind) { skipped++; continue }

        await sendRewireNudge({
          email: u.email,
          kind,
          daysListened: distinctDaysListened || null,
          link,
        })
        sent++
      } catch (e) {
        errors.push(`${u.id}: ${e.message}`)
      }
    }

    return res.status(200).json({ success: true, date: todayStr, sent, skipped, errorCount: errors.length, errors: errors.slice(0, 10) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
