import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  // Vercel cron jobs send this header for security
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('id, credits')
      .eq('plan', 'free')
      .lt('credits', 5)

    if (fetchError) throw fetchError
    if (!users || users.length === 0) {
      return res.status(200).json({ success: true, message: 'No users needed topping up', count: 0 })
    }

    await supabase.from('profiles').update({ credits: 5 }).eq('plan', 'free').lt('credits', 5)

    const transactions = users.map(u => ({
      user_id: u.id,
      amount: 5 - u.credits,
      reason: 'weekly_free_credits'
    }))
    await supabase.from('credit_transactions').insert(transactions)

    return res.status(200).json({ success: true, message: `Topped up ${users.length} free users`, count: users.length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
