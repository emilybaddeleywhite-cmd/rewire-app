// pages/api/send-welcome.js
// Called immediately after a new user signs up.
// Fire this from your signup flow on the client, right after Supabase creates the account.
//
// Example client call (in your signup handler):
//   await fetch('/api/send-welcome', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${session.access_token}`,
//     },
//     body: JSON.stringify({ email: user.email }),
//   })

import { createClient } from '@supabase/supabase-js'
import { sendWelcome } from '../../lib/brevo'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Verify the user is who they say they are
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { email } = req.body
  if (!email || email !== user.email) return res.status(400).json({ error: 'Invalid email' })

  try {
    await sendWelcome({ email })
    return res.status(200).json({ sent: true })
  } catch (err) {
    console.error('Welcome email failed:', err.message)
    // Return 200 anyway — a failed welcome email shouldn't break the signup flow
    return res.status(200).json({ sent: false, error: err.message })
  }
}
