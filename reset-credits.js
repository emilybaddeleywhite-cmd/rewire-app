// reset-credits.js (Vercel cron route)
// Runs weekly — tops up free users to 5 credits and emails each one.
// Schedule in vercel.json: { "crons": [{ "path": "/api/reset-credits", "schedule": "0 8 * * 1" }] }
// That fires every Monday at 08:00 UTC.

import { createClient } from '@supabase/supabase-js'
import { sendCreditsReset } from '../../lib/brevo'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('id, credits, email')
      .eq('plan', 'free')
      .lt('credits', 5)

    if (fetchError) throw fetchError
    if (!users || users.length === 0) {
      return res.status(200).json({ success: true, message: 'No users needed topping up', count: 0 })
    }

    // Top up credits
    await supabase.from('profiles').update({ credits: 5 }).eq('plan', 'free').lt('credits', 5)

    const transactions = users.map(u => ({
      user_id: u.id,
      amount: 5 - u.credits,
      reason: 'weekly_free_credits'
    }))
    await supabase.from('credit_transactions').insert(transactions)

    // Send reset emails — fire all in parallel, log individual failures
    const emailResults = await Promise.allSettled(
      users
        .filter(u => u.email)
        .map(u => sendCreditsReset({ email: u.email }))
    )

    const emailsFailed = emailResults.filter(r => r.status === 'rejected').length
    if (emailsFailed > 0) {
      console.error(`Weekly reset: ${emailsFailed} email(s) failed to send`)
    }

    return res.status(200).json({
      success: true,
      message: `Topped up ${users.length} free users`,
      count: users.length,
      emailsSent: users.length - emailsFailed,
      emailsFailed,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
