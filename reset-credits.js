import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// This endpoint is called by a cron job or Vercel scheduled function weekly
// Protect it with a secret token
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Top up free users to 5 credits (only if they are below 5)
    const { data, error } = await supabase
      .from('profiles')
      .update({ credits: 5 })
      .eq('plan', 'free')
      .lt('credits', 5)
      .select('id, email')

    if (error) throw error

    // Log the top-ups
    if (data && data.length > 0) {
      const transactions = data.map(user => ({
        user_id: user.id,
        amount: 5,
        reason: 'weekly_free_credits'
      }))
      await supabase.from('credit_transactions').insert(transactions)
    }

    return res.status(200).json({
      success: true,
      usersTopedUp: data?.length || 0,
      message: `Topped up ${data?.length || 0} free accounts to 5 credits`
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
