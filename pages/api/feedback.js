// pages/api/feedback.js
import { checkRateLimit, getClientIp } from '../../lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { feedback, userId } = req.body

  if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
    return res.status(400).json({ error: 'Feedback is required' })
  }
  if (feedback.length > 2000) {
    return res.status(400).json({ error: 'Feedback too long' })
  }

  // ── Rate limit: 10/hour per user (or per IP if not signed in). ──
  const bucket = userId ? `feedback:${userId}` : `feedback:${getClientIp(req)}`
  const rl = await checkRateLimit(bucket, 10, 3600)
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Thanks! You’ve sent a lot of feedback — please try again later.' })
  }

  const body = `
New feedback from RewireMode

User ID: ${userId || 'unknown'}
Feedback:
${feedback.trim()}

Sent: ${new Date().toISOString()}
  `.trim()

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'RewireMode Feedback', email: 'office@rewiremode.com' },
        to: [{ email: 'office@rewiremode.com' }],
        subject: '💬 New user feedback',
        textContent: body,
      }),
    })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Feedback email error:', err)
    return res.status(200).json({ success: true })
  }
}
