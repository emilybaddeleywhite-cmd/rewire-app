// pages/api/report-bug.js
import { checkRateLimit, getClientIp } from '../../lib/rateLimit'

export const config = { maxDuration: 10 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { error, userId, productType, goal } = req.body

  if (!error || typeof error !== 'string') {
    return res.status(400).json({ error: 'Error description is required' })
  }

  // ── Rate limit: 30/hour per user (or per IP). Generous, since bug reports can
  //    legitimately fire on retries, but still bounded. ──
  const bucket = userId ? `bug:${userId}` : `bug:${getClientIp(req)}`
  const rl = await checkRateLimit(bucket, 30, 3600)
  if (!rl.allowed) {
    // Swallow quietly — a dropped bug report should never surface as an error.
    return res.status(200).json({ success: true })
  }

  const safeError = error.slice(0, 500)
  const safeGoal = typeof goal === 'string' ? goal.slice(0, 200) : 'unknown'

  const emailBody = `
Bug Report from RewireMode

Error: ${safeError}
User ID: ${userId || 'unknown'}
Session Type: ${productType || 'unknown'}
Goal: ${safeGoal}
Time: ${new Date().toISOString()}
  `.trim()

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'bugs@mail.rewiremode.com',
        to: 'office@rewiremode.com',
        subject: `🐛 Bug Report — ${productType || 'unknown'} session`,
        text: emailBody,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send bug report email')
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Bug report error:', err)
    return res.status(200).json({ success: true })
  }
}
