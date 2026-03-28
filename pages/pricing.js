import Head from 'next/head'
import { useState } from 'react'

const theme = { bg: '#0d0a06', accent: '#c8a96e', grad: 'linear-gradient(135deg,#c8a96e,#9a7040)' }

export default function Pricing({ user, profile }) {
  const [loading, setLoading] = useState(null)

  async function checkout(productKey) {
    if (!user) { window.location.href = '/?signup=true'; return }
    setLoading(productKey)
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productKey, userId: user.id, email: user.email }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  const plans = [
    {
      key: 'free',
      name: 'Free',
      price: '£0',
      period: 'forever',
      credits: '5 credits/week',
      features: ['5 credits per week', 'All session types', '1 saved session', 'Streak tracking'],
      cta: 'Get Started Free',
      highlight: false,
    },
    {
      key: 'pro_monthly',
      name: 'Pro',
      price: '£14.99',
      period: '/month',
      credits: '100 credits/month',
      features: ['100 credits/month', 'All session types', 'Save up to 50 sessions', 'Full session library', 'Priority generation', 'Streak bonuses'],
      cta: 'Start Pro',
      highlight: true,
      badge: 'BEST VALUE',
    },
  ]

  const packs = [
    { key: 'credits_10', name: '10 Credits', price: '£5', perCredit: '50p/credit' },
    { key: 'credits_50', name: '50 Credits', price: '£15', perCredit: '30p/credit' },
    { key: 'credits_100', name: '100 Credits', price: '£25', perCredit: '25p/credit', badge: 'Best value' },
  ]

  return (
    <>
      <Head><title>Pricing — Rewrite Mode</title></Head>
      <div style={{ minHeight: '100vh', background: theme.bg, color: '#e8dcc8', fontFamily: "'Palatino Linotype','Book Antiqua',Georgia,serif", padding: '60px 20px' }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0} button{cursor:pointer;border:none;font-family:inherit}`}</style>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <a href="/" style={{ fontSize: '16px', color: theme.accent, textDecoration: 'none', letterSpacing: '0.1em', display: 'block', marginBottom: '32px' }}>REWRITE MODE</a>
            <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: '400', marginBottom: '12px', color: '#f0d89a' }}>Choose your plan</h1>
            <p style={{ color: 'rgba(232,220,200,0.45)', fontSize: '15px' }}>Subscription saves you 40%+ vs pay-as-you-go</p>
          </div>

          {/* Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>
            {plans.map(p => (
              <div key={p.key} style={{ padding: '28px', borderRadius: '20px', border: `1px solid ${p.highlight ? theme.accent + '66' : 'rgba(255,255,255,0.08)'}`, background: p.highlight ? theme.accent + '08' : 'rgba(255,255,255,0.02)', position: 'relative' }}>
                {p.badge && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: theme.grad, color: '#0d0a06', fontSize: '10px', fontWeight: '800', padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.1em' }}>{p.badge}</div>}
                <div style={{ fontSize: '18px', color: p.highlight ? theme.accent : '#e8dcc8', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ fontSize: '32px', color: '#f0d89a', marginBottom: '4px' }}>{p.price}<span style={{ fontSize: '14px', color: 'rgba(232,220,200,0.4)' }}>{p.period}</span></div>
                <div style={{ fontSize: '13px', color: theme.accent, marginBottom: '20px' }}>{p.credits}</div>
                <div style={{ marginBottom: '24px' }}>
                  {p.features.map(f => <div key={f} style={{ fontSize: '13px', color: 'rgba(232,220,200,0.6)', marginBottom: '8px' }}>✓ {f}</div>)}
                </div>
                <button onClick={() => p.key === 'free' ? window.location.href = '/' : checkout(p.key)} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: p.highlight ? theme.grad : 'rgba(255,255,255,0.06)', color: p.highlight ? '#0d0a06' : '#e8dcc8', fontSize: '14px', fontWeight: '700' }}>
                  {loading === p.key ? 'Loading...' : p.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Credit packs */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', color: '#f0d89a', fontWeight: '400', marginBottom: '8px', textAlign: 'center' }}>Pay as you go</h2>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(232,220,200,0.35)', marginBottom: '20px' }}>No subscription — buy credits when you need them</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {packs.map(p => (
                <div key={p.key} style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', textAlign: 'center', position: 'relative' }}>
                  {p.badge && <div style={{ fontSize: '10px', color: theme.accent, marginBottom: '4px' }}>{p.badge}</div>}
                  <div style={{ fontSize: '16px', color: '#e8dcc8', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '24px', color: '#f0d89a', marginBottom: '4px' }}>{p.price}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(232,220,200,0.3)', marginBottom: '16px' }}>{p.perCredit}</div>
                  <button onClick={() => checkout(p.key)} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.25)', color: theme.accent, fontSize: '13px', fontWeight: '600' }}>
                    {loading === p.key ? 'Loading...' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(232,220,200,0.2)' }}>✦ Subscription saves you 40%+ vs pay-as-you-go · Cancel anytime</p>
        </div>
      </div>
    </>
  )
}
