import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)

        // Send welcome email on first ever sign-in.
        // Supabase fires SIGNED_IN after email confirmation — we check the account
        // is less than 2 minutes old so we only email on genuinely new accounts,
        // not every login.
        if (event === 'SIGNED_IN') {
          const createdAt = new Date(session.user.created_at).getTime()
          const ageMs = Date.now() - createdAt
          const isNewAccount = ageMs < 2 * 60 * 1000 // under 2 minutes old

          if (isNewAccount) {
            fetch('/api/send-welcome', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ email: session.user.email }),
            }).catch(() => {})
          }
        }
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  return (
    <Component
      {...pageProps}
      user={user}
      profile={profile}
      setProfile={setProfile}
      loading={loading}
      refreshProfile={() => user && fetchProfile(user.id)}
    />
  )
}
