export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { feedback, userId } = req.body

  const body = `
New feedback from RewireMode

User ID: ${userId || 'unknown'}
Feedback:
${feedback}

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
