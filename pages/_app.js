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
 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
 
    return () => subscription.unsubscribe()
  }, [])
 
  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }
 
  return <Component {...pageProps} user={user} profile={profile} setProfile={setProfile} loading={loading} refreshProfile={() => user && fetchProfile(user.id)} />
}
 
