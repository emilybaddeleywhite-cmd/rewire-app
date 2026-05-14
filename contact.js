// pages/api/contact.js
// Receives contact form submissions and forwards them to office@rewiremode.com via Brevo.

const TOPIC_LABELS = {
  general: 'General question',
  billing: 'Billing or payment',
  technical: 'Technical issue',
  safety: 'Safety concern',
  feedback: 'Feedback or suggestion',
  other: 'Something else',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, topic, message } = req.body

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const topicLabel = TOPIC_LABELS[topic] || topic

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'RewireMode Contact', email: 'office@rewiremode.com' },
        to: [{ email: 'office@rewiremode.com', name: 'RewireMode' }],
        replyTo: { email, name },
        subject: `[${topicLabel}] Message from ${name}`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0a0a0f;color:#c8c8d8;border-radius:12px">
            <p style="font-size:12px;letter-spacing:0.1em;color:#6b6b80;margin-bottom:24px">REWIREMODE · CONTACT FORM</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:8px 0;border-bottom:1px solid #1e1e2e;font-size:13px;color:#6b6b80;width:80px">Topic</td><td style="padding:8px 0;border-bottom:1px solid #1e1e2e;font-size:13px;color:#e8f4ff">${topicLabel}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #1e1e2e;font-size:13px;color:#6b6b80">Name</td><td style="padding:8px 0;border-bottom:1px solid #1e1e2e;font-size:13px;color:#e8f4ff">${name}</td></tr>
              <tr><td style="padding:8px 0;font-size:13px;color:#6b6b80">Email</td><td style="padding:8px 0;font-size:13px"><a href="mailto:${email}" style="color:#9B6FF0">${email}</a></td></tr>
            </table>
            <div style="background:#13131f;border-radius:8px;padding:16px 20px;border-left:3px solid #6c5ce7">
              <p style="font-size:14px;line-height:1.8;color:#c8c8d8;margin:0;white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
            <p style="font-size:12px;color:#3e3e52;margin-top:24px">Reply directly to this email to respond to ${name}.</p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('Brevo contact email error:', err)
      return res.status(500).json({ error: 'Failed to send' })
    }

    return res.status(200).json({ sent: true })
  } catch (err) {
    console.error('Contact form error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
