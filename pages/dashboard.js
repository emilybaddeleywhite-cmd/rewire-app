import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const BASE = {
  bg: '#050a14',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8f4ff',
  textMuted: 'rgba(232,244,255,0.45)',
  textFaint: 'rgba(232,244,255,0.2)',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png.png'

const TYPE_CONFIG = {
  reset:      { color: '#00d4ff', emoji: '🧠', label: 'Reset Hypnosis' },
  sleep:      { color: '#a855f7', emoji: '🌙', label: 'Sleep Hypnosis' },
  subliminal: { color: '#00ff88', emoji: '🌊', label: 'Subliminal' },
  hype:       { color: '#60a5fa', emoji: '🔥', label: 'Hype Coach' },
}

export default function Dashboard({ user, profile, refreshProfile }) {
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('sessions') // sessions | account

  useEffect(() => { if (user) fetchSessions() }, [user, filter])

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

  async function cancelSubscription() {
    setCancelLoading(true)
    // Redirect to Stripe billing portal
    const res = await fetch('/api/billing-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setCancelLoading(false)
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', background: BASE.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BASE.text, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '16px', color: BASE.textMuted }}>Please sign in to view your dashboard</p>
        <a href="/" style={{ color: '#00d4ff', textDecoration: 'none' }}>← Back to RewireMode</a>
      </div>
    </div>
  )

  const isPro = profile?.plan === 'pro'

  return (
    <>
      <Head><title>Dashboard — RewireMode</title></Head>
      <div style={{ minHeight: '100vh', background: BASE.bg, color: BASE.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
          button{cursor:pointer;border:none;background:none;font-family:inherit}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:4px}
        `}</style>

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,150,255,0.06) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,50,220,0.06) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 10s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,150,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,150,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(0,212,255,0.08)', backdropFilter: 'blur(10px)', background: 'rgba(5,10,20,0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
            <a href="/">
              <img src={LOGO} alt="RewireMode" style={{ height: '50px', objectFit: 'contain', mixBlendMode: 'lighten' }}
                onError={e => { e.target.style.display='none' }} />
            </a>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: '#00d4ff', fontWeight: '600', padding: '5px 12px', borderRadius: '100px', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.06)' }}>✦ {profile?.credits || 0} credits</div>
              <button onClick={signOut} style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 14px', borderRadius: '8px', border: `1px solid ${BASE.border}` }}>Sign out</button>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: '32px', animation: 'fadeUp 0.6s ease both' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: BASE.text, marginBottom: '6px' }}>
              Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} 👋
            </h1>
            <p style={{ fontSize: '14px', color: BASE.textMuted }}>{user?.email}</p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '32px', animation: 'fadeUp 0.6s ease 0.1s both' }}>
            {[
              { label: 'Credits', value: profile?.credits || 0, color: '#00d4ff', icon: '✦' },
              { label: 'Day Streak', value: `${profile?.streak_count || 0} 🔥`, color: '#ff9f43', icon: '' },
              { label: 'Sessions', value: sessions.length, color: '#00ff88', icon: '' },
              { label: 'Plan', value: isPro ? 'Pro 💎' : 'Free', color: isPro ? '#a855f7' : BASE.textMuted, icon: '' },
            ].map(s => (
              <div key={s.label} style={{ padding: '18px', borderRadius: '16px', background: BASE.bgCard, border: `1px solid ${BASE.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', color: s.color, fontWeight: '800', marginBottom: '4px' }}>{s.icon}{s.value}</div>
                <div style={{ fontSize: '11px', color: BASE.textFaint, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Streak message */}
          {profile?.streak_count > 0 && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,159,67,0.06)', border: '1px solid rgba(255,159,67,0.2)', marginBottom: '24px', textAlign: 'center', fontSize: '14px', color: '#ff9f43', fontStyle: 'italic', animation: 'fadeUp 0.6s ease 0.15s both' }}>
              🔥 You are in Rewrite Mode for {profile.streak_count} day{profile.streak_count !== 1 ? 's' : ''} — your brain rewires through repetition
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: BASE.bgCard, padding: '4px', borderRadius: '12px', border: `1px solid ${BASE.border}`, width: 'fit-content' }}>
            {['sessions', 'account'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: '600', background: activeTab === tab ? 'rgba(0,212,255,0.12)' : 'transparent', color: activeTab === tab ? '#00d4ff' : BASE.textMuted, border: activeTab === tab ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent', transition: 'all 0.18s ease', textTransform: 'capitalize' }}>
                {tab === 'sessions' ? '🎧 Sessions' : '👤 Account'}
              </button>
            ))}
          </div>

          {/* ── SESSIONS TAB ── */}
          {activeTab === 'sessions' && (
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>
              {!isPro && (
                <div style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#00d4ff', fontWeight: '700', marginBottom: '3px' }}>💎 Upgrade to Pro</div>
                    <div style={{ fontSize: '12px', color: BASE.textMuted }}>100 credits/mo · Save 50 sessions · £14.99/month</div>
                  </div>
                  <a href="/pricing" style={{ padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: '#050a14', fontSize: '13px', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade →</a>
                </div>
              )}

              {/* Filter */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {['all', 'reset', 'sleep', 'subliminal', 'hype'].map(f => {
                  const cfg = TYPE_CONFIG[f]
                  return (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', border: `1px solid ${filter === f ? (cfg?.color || '#00d4ff') + '88' : BASE.border}`, background: filter === f ? (cfg?.color || '#00d4ff') + '12' : 'transparent', color: filter === f ? (cfg?.color || '#00d4ff') : BASE.textMuted, transition: 'all 0.18s ease' }}>
                      {f === 'all' ? 'All' : `${cfg?.emoji} ${cfg?.label}`}
                    </button>
                  )
                })}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: BASE.textMuted }}>Loading your sessions...</div>
              ) : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 20px', color: BASE.textMuted }}>
                  <div style={{ fontSize: '40px', marginBottom: '14px' }}>✦</div>
                  <p style={{ marginBottom: '16px', fontSize: '15px' }}>No sessions yet.</p>
                  <a href="/" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: '600' }}>Create your first session →</a>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {sessions.map(s => {
                    const cfg = TYPE_CONFIG[s.product_type] || TYPE_CONFIG.reset
                    return (
                      <div key={s.id} style={{ padding: '16px 20px', borderRadius: '14px', background: BASE.bgCard, border: `1px solid ${BASE.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', transition: 'border-color 0.18s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '28px', flexShrink: 0 }}>{cfg.emoji}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', color: BASE.text, fontWeight: '600', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.goal}</div>
                            <div style={{ fontSize: '11px', color: BASE.textMuted }}>
                              <span style={{ color: cfg.color, fontWeight: '600' }}>{cfg.label}</span>
                              {' · '}{new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {s.mood && ` · Mood ${s.mood}/10`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {s.audio_url && (
                            <a href={s.audio_url} download style={{ padding: '7px 12px', borderRadius: '8px', border: `1px solid rgba(0,212,255,0.3)`, color: '#00d4ff', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>⬇</a>
                          )}
                          <button onClick={() => deleteSession(s.id)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.2)', color: 'rgba(255,100,100,0.6)', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <a href="/" style={{ fontSize: '14px', color: '#00d4ff', textDecoration: 'none', fontWeight: '600' }}>+ Create new session</a>
              </div>
            </div>
          )}

          {/* ── ACCOUNT TAB ── */}
          {activeTab === 'account' && (
            <div style={{ animation: 'fadeUp 0.4s ease both', display: 'grid', gap: '16px' }}>

              {/* Profile card */}
              <div style={{ padding: '24px', borderRadius: '18px', background: BASE.bgCard, border: `1px solid ${BASE.border}` }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: BASE.textMuted, marginBottom: '16px', fontWeight: '600' }}>PROFILE</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: BASE.textMuted }}>Email</span>
                  <span style={{ color: BASE.text }}>{user?.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: BASE.textMuted }}>Plan</span>
                  <span style={{ color: isPro ? '#a855f7' : BASE.textMuted, fontWeight: '700' }}>{isPro ? '💎 Pro' : 'Free'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: BASE.textMuted }}>Credits remaining</span>
                  <span style={{ color: '#00d4ff', fontWeight: '700' }}>✦ {profile?.credits || 0}</span>
                </div>
              </div>

              {/* Subscription card */}
              <div style={{ padding: '24px', borderRadius: '18px', background: BASE.bgCard, border: `1px solid ${isPro ? 'rgba(168,85,247,0.3)' : BASE.border}` }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: BASE.textMuted, marginBottom: '16px', fontWeight: '600' }}>SUBSCRIPTION</div>
                {isPro ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
                      <span style={{ color: '#a855f7', fontWeight: '700', fontSize: '15px' }}>Pro Plan — Active</span>
                    </div>
                    <p style={{ fontSize: '13px', color: BASE.textMuted, marginBottom: '20px', lineHeight: 1.6 }}>
                      100 credits/month · Save up to 50 sessions · £14.99/month
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={cancelSubscription} disabled={cancelLoading}
                        style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid rgba(255,80,80,0.25)', color: 'rgba(255,100,100,0.7)', fontSize: '13px', fontWeight: '600', background: 'rgba(255,60,60,0.05)' }}>
                        {cancelLoading ? 'Loading...' : 'Manage / Cancel'}
                      </button>
                      <button onClick={cancelSubscription} disabled={cancelLoading}
                        style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', fontSize: '13px', fontWeight: '600', background: 'rgba(0,212,255,0.06)' }}>
                        Update Payment Method
                      </button>
                    </div>
                    <p style={{ fontSize: '11px', color: BASE.textFaint, marginTop: '10px' }}>You'll be taken to our secure billing portal powered by Stripe.</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '13px', color: BASE.textMuted, marginBottom: '20px', lineHeight: 1.6 }}>
                      You're on the free plan — 5 credits per week, 1 saved session.
                    </p>
                    <a href="/pricing" style={{ display: 'inline-block', padding: '12px 22px', borderRadius: '12px', background: 'linear-gradient(135deg,#a855f7,#6d28d9)', color: '#fff', fontSize: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 20px rgba(168,85,247,0.3)' }}>
                      💎 Upgrade to Pro — £14.99/month
                    </a>
                  </>
                )}
              </div>

              {/* Credits card */}
              <div style={{ padding: '24px', borderRadius: '18px', background: BASE.bgCard, border: `1px solid rgba(0,212,255,0.15)` }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: BASE.textMuted, marginBottom: '16px', fontWeight: '600' }}>TOP UP CREDITS</div>
                <p style={{ fontSize: '13px', color: BASE.textMuted, marginBottom: '20px', lineHeight: 1.6 }}>Buy credits without a subscription. Use them whenever you need.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { key: 'credits_10', label: '10 Credits', price: '£5', per: '50p each' },
                    { key: 'credits_50', label: '50 Credits', price: '£15', per: '30p each' },
                    { key: 'credits_100', label: '100 Credits', price: '£25', per: '25p each', best: true },
                  ].map(c => (
                    <a key={c.key} href={`/pricing?buy=${c.key}`} style={{ padding: '16px 12px', borderRadius: '12px', border: `1px solid ${c.best ? 'rgba(0,212,255,0.4)' : BASE.border}`, background: c.best ? 'rgba(0,212,255,0.06)' : BASE.bgCard, textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'all 0.18s ease' }}>
                      {c.best && <div style={{ fontSize: '10px', color: '#00d4ff', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.1em' }}>BEST VALUE</div>}
                      <div style={{ fontSize: '15px', color: BASE.text, fontWeight: '700', marginBottom: '2px' }}>{c.label}</div>
                      <div style={{ fontSize: '18px', color: '#00d4ff', fontWeight: '800', marginBottom: '2px' }}>{c.price}</div>
                      <div style={{ fontSize: '11px', color: BASE.textFaint }}>{c.per}</div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Sign out */}
              <div style={{ padding: '20px 24px', borderRadius: '18px', background: BASE.bgCard, border: `1px solid ${BASE.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: BASE.text, fontWeight: '600', marginBottom: '3px' }}>Sign out</div>
                  <div style={{ fontSize: '12px', color: BASE.textMuted }}>You'll need to sign back in to access your sessions</div>
                </div>
                <button onClick={signOut} style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '13px', fontWeight: '600' }}>Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
