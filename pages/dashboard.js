import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const theme = { bg: '#0d0a06', accent: '#c8a96e', grad: 'linear-gradient(135deg,#c8a96e,#9a7040)' }

const TYPE_COLORS = {
  reset: '#c8a96e', sleep: '#7b6fc7', subliminal: '#4a9eff', hype: '#e040fb'
}
const TYPE_EMOJIS = { reset: '🧠', sleep: '🌙', subliminal: '🌊', hype: '🔥' }

export default function Dashboard({ user, profile, refreshProfile }) {
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    if (user) fetchSessions()
  }, [user, filter])

  async function fetchSessions() {
    setLoading(true)
    let query = supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('product_type', filter)
    const { data } = await query
    setSessions(data || [])
    setLoading(false)
  }

  async function deleteSession(id) {
    await supabase.from('sessions').delete().eq('id', id)
    fetchSessions()
    refreshProfile()
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8dcc8', fontFamily: 'Georgia,serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '16px' }}>Please sign in to view your dashboard</p>
        <a href="/" style={{ color: theme.accent }}>← Back to Rewrite Mode</a>
      </div>
    </div>
  )

  return (
    <>
      <Head><title>Dashboard — Rewrite Mode</title></Head>
      <div style={{ minHeight: '100vh', background: theme.bg, color: '#e8dcc8', fontFamily: "'Palatino Linotype','Book Antiqua',Georgia,serif" }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0} button{cursor:pointer;border:none;font-family:inherit}`}</style>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <a href="/" style={{ fontSize: '15px', color: theme.accent, textDecoration: 'none', letterSpacing: '0.1em' }}>REWRITE MODE</a>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'rgba(232,220,200,0.5)' }}>{user.email}</span>
            <button onClick={signOut} style={{ fontSize: '12px', color: 'rgba(232,220,200,0.4)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'none' }}>Sign out</button>
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '36px' }}>
            {[
              { label: 'Credits', value: profile?.credits || 0, icon: '✦' },
              { label: 'Day Streak', value: `${profile?.streak_count || 0} 🔥`, icon: '' },
              { label: 'Sessions', value: sessions.length, icon: '' },
              { label: 'Plan', value: profile?.plan === 'pro' ? 'Pro 💎' : 'Free', icon: '' },
            ].map(s => (
              <div key={s.label} style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,169,110,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', color: theme.accent, marginBottom: '4px', fontWeight: '700' }}>{s.icon}{s.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(232,220,200,0.35)', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Streak message */}
          {profile?.streak_count > 0 && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(200,169,110,0.07)', border: '1px solid rgba(200,169,110,0.2)', marginBottom: '24px', textAlign: 'center', fontSize: '14px', color: '#f0d89a', fontStyle: 'italic' }}>
              You are in Rewrite Mode for {profile.streak_count} day{profile.streak_count !== 1 ? 's' : ''} — your brain rewires through repetition 🔥
            </div>
          )}

          {/* Upgrade prompt if free */}
          {profile?.plan === 'free' && (
            <div style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.2)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#f0d89a', marginBottom: '3px' }}>💎 Upgrade to Pro</div>
                <div style={{ fontSize: '12px', color: 'rgba(232,220,200,0.4)' }}>100 credits/mo · Save 50 sessions · £14.99/month</div>
              </div>
              <a href="/pricing" style={{ padding: '10px 18px', borderRadius: '10px', background: theme.grad, color: '#0d0a06', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>Upgrade →</a>
            </div>
          )}

          {/* Sessions library */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '400', color: '#f0d89a' }}>Your Sessions</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'reset', 'sleep', 'subliminal', 'hype'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '11px', border: `1px solid ${filter === f ? theme.accent + '88' : 'rgba(255,255,255,0.08)'}`, background: filter === f ? theme.accent + '15' : 'transparent', color: filter === f ? theme.accent : 'rgba(232,220,200,0.4)', transition: 'all 0.18s ease' }}>
                  {f === 'all' ? 'All' : TYPE_EMOJIS[f] + ' ' + f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(232,220,200,0.3)' }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(232,220,200,0.3)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
              <p>No sessions yet. <a href="/" style={{ color: theme.accent }}>Create your first →</a></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {sessions.map(s => (
                <div key={s.id} style={{ padding: '18px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <div style={{ fontSize: '24px' }}>{TYPE_EMOJIS[s.product_type]}</div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#e8dcc8', marginBottom: '3px' }}>{s.goal}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(232,220,200,0.35)' }}>
                        <span style={{ color: TYPE_COLORS[s.product_type] }}>{s.product_type}</span>
                        {' · '}{new Date(s.created_at).toLocaleDateString()}
                        {s.mood && ` · Mood ${s.mood}/10`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {s.audio_url && (
                      <a href={s.audio_url} download style={{ padding: '7px 12px', borderRadius: '8px', border: `1px solid ${theme.accent}44`, color: theme.accent, fontSize: '14px', textDecoration: 'none' }}>⬇</a>
                    )}
                    <button onClick={() => deleteSession(s.id)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.2)', color: 'rgba(255,100,100,0.6)', fontSize: '12px', background: 'none' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <a href="/" style={{ fontSize: '14px', color: theme.accent, textDecoration: 'none' }}>+ Create new session</a>
          </div>
        </div>
      </div>
    </>
  )
}
