import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId, userId, newName } = req.body

  if (!newName?.trim()) return res.status(400).json({ error: 'Name cannot be empty' })

  const { error } = await supabase
    .from('sessions')
    .update({ goal: newName.trim() })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ success: true })
}
