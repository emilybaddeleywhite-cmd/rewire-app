export const config = { maxDuration: 10 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { error, userId, productType, goal } = req.body

  const emailBody = `
Bug Report from RewireMode

Error: ${error}
User ID: ${userId || 'unknown'}
Session Type: ${productType || 'unknown'}
Goal: ${goal || 'unknown'}
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
      // If Resend fails, still return success to user
      console.error('Failed to send bug report email')
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Bug report error:', err)
    return res.status(200).json({ success: true }) // Don't show error to user
  }
}
