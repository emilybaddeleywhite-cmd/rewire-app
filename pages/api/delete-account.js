import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── Auth: verify JWT ──
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user: authUser } } = await authClient.auth.getUser()
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

  const { userId } = req.body
  if (userId !== authUser.id) return res.status(403).json({ error: 'Forbidden' })

  try {
    // 1. Get all sessions to find audio file paths
    const { data: sessions } = await supabase
      .from('sessions')
      .select('audio_url')
      .eq('user_id', authUser.id)

    // 2. Delete all audio files from Supabase Storage
    if (sessions && sessions.length > 0) {
      const filePaths = sessions
        .filter(s => s.audio_url)
        .map(s => {
          try {
            const url = new URL(s.audio_url)
            const parts = url.pathname.split('/object/public/audio/')
            return parts[1] || null
          } catch { return null }
        })
        .filter(Boolean)

      if (filePaths.length > 0) {
        await supabase.storage.from('audio').remove(filePaths)
      }
    }

    // 3. Delete all sessions
    await supabase.from('sessions').delete().eq('user_id', authUser.id)

    // 4. Delete credit transactions
    await supabase.from('credit_transactions').delete().eq('user_id', authUser.id)

    // 5. Delete profile
    await supabase.from('profiles').delete().eq('id', authUser.id)

    // 6. Delete the auth user (requires service key)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id)
    if (deleteError) {
      console.error('Auth user deletion error:', deleteError)
      return res.status(500).json({ error: 'Could not delete auth account. Please contact support.' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return res.status(500).json({ error: 'Account deletion failed. Please contact support.' })
  }
}
