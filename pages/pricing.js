import Head from 'next/head'
import { useState, useEffect } from 'react'

const BASE = {
  bg: '#050a14',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8f4ff',
  textMuted: 'rgba(232,244,255,0.45)',
  textFaint: 'rgba(232,244,255,0.2)',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png.png'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function Pricing({ user, profile }) {
  const [loading, setLoading] = useState(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const buy = params.get('buy')
    if (buy && user) checkout(buy)
  }, [user])

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

  return (
    <>
      <Head>
        <title>Pricing — RewireMode</title>
        <meta name="description" content="Simple, transparent pricing for RewireMode. Start free, upgrade when you're ready." />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <div style={{ minHeight: '100vh', background: BASE.bg, color: BASE.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
          @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
          button{cursor:pointer;border:none;background:none;font-family:inherit}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:4px}
        `}</style>

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,150,255,0.07) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,50,220,0.07) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 10s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,150,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,150,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(0,212,255,0.08)', backdropFilter: 'blur(10px)', background: 'rgba(5,10,20,0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px 24px 0', gap: '10px' }}>
            {profile && <div style={{ fontSize: '13px', color: '#00d4ff', fontWeight: '600', padding: '5px 12px', borderRadius: '100px', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.06)' }}>✦ {profile.credits} credits</div>}
            <a href="/faq" style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 12px', borderRadius: '8px', border: `1px solid ${BASE.border}`, textDecoration: 'none' }}>FAQ</a>
            <a href="/" style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 12px', borderRadius: '8px', border: `1px solid ${BASE.border}`, textDecoration: 'none' }}>← Back</a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 10px' }}>
            <a href="/"><img src={LOGO} alt="RewireMode" style={{ height: isMobile ? '100px' : '160px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => { e.target.style.display='none' }} /></a>
          </div>
        </nav>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '32px 16px 60px' : '60px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeUp 0.6s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.06)', fontSize: '11px', letterSpacing: '0.15em', color: '#00d4ff', marginBottom: '20px', fontWeight: '600' }}>
              ◈ SIMPLE PRICING
            </div>
            <h1 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', marginBottom: '12px', background: 'linear-gradient(135deg,#ffffff 0%,#00d4ff 50%,#a855f7 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite' }}>
              Choose your plan
            </h1>
            <p style={{ color: BASE.textMuted, fontSize: '15px' }}>Start free. Upgrade when you're ready. Cancel anytime.</p>
          </div>

          {/* Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '48px', animation: 'fadeUp 0.6s ease 0.1s both' }}>

            {/* Free */}
            <div style={{ padding: '32px', borderRadius: '20px', border: `1px solid ${BASE.border}`, background: BASE.bgCard }}>
              <div style={{ fontSize: '12px', color: BASE.textMuted, fontWeight: '700', marginBottom: '8px', letterSpacing: '0.08em' }}>FREE</div>
              <div style={{ fontSize: '38px', fontWeight: '800', color: BASE.text, marginBottom: '4px' }}>£0
                <span style={{ fontSize: '14px', color: BASE.textMuted, fontWeight: '400' }}>/month</span>
              </div>
              <div style={{ fontSize: '13px', color: '#00ff88', marginBottom: '28px', fontWeight: '600' }}>5 credits per week</div>
              <div style={{ marginBottom: '28px' }}>
                {[
                  '5 credits per week',
                  'All 4 session types',
                  '1 saved session',
                  'Streak tracking',
                  'Full session library access',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: BASE.textMuted, marginBottom: '12px' }}>
                    <span style={{ color: '#00ff88', fontWeight: '700', fontSize: '16px' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a href="/" style={{ display: 'block', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: BASE.text, fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center', border: `1px solid ${BASE.border}` }}>
                Start Free
              </a>
            </div>

            {/* Pro */}
            <div style={{ padding: '32px', borderRadius: '20px', border: '1px solid rgba(168,85,247,0.5)', background: 'rgba(168,85,247,0.06)', position: 'relative', boxShadow: '0 0 50px rgba(168,85,247,0.1)' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#a855f7,#6d28d9)', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '5px 18px', borderRadius: '100px', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>⭐ BEST VALUE</div>
              <div style={{ fontSize: '12px', color: '#a855f7', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.08em' }}>PRO</div>
              <div style={{ fontSize: '38px', fontWeight: '800', color: BASE.text, marginBottom: '4px' }}>£14.99
                <span style={{ fontSize: '14px', color: BASE.textMuted, fontWeight: '400' }}>/month</span>
              </div>
              <div style={{ fontSize: '13px', color: '#a855f7', marginBottom: '28px', fontWeight: '600' }}>100 credits per month</div>
              <div style={{ marginBottom: '28px' }}>
                {[
                  '100 credits per month',
                  'All 4 session types',
                  'Save up to 50 sessions',
                  'Full session library',
                  'Streak bonus credits',
                  'Priority audio generation',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: BASE.textMuted, marginBottom: '12px' }}>
                    <span style={{ color: '#a855f7', fontWeight: '700', fontSize: '16px' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => checkout('pro_monthly')} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'linear-gradient(135deg,#a855f7,#6d28d9)', color: '#fff', fontSize: '15px', fontWeight: '800', boxShadow: '0 4px 24px rgba(168,85,247,0.4)', letterSpacing: '0.02em' }}>
                {loading === 'pro_monthly' ? 'Loading...' : 'Start Pro →'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: BASE.textFaint, marginTop: '10px' }}>Cancel anytime · No hidden fees · Secure checkout</p>
            </div>
          </div>

          {/* What uses credits */}
          <div style={{ padding: '28px', borderRadius: '20px', background: BASE.bgCard, border: `1px solid ${BASE.border}`, marginBottom: '32px', animation: 'fadeUp 0.6s ease 0.15s both' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#00d4ff', fontWeight: '700', marginBottom: '20px' }}>HOW CREDITS WORK</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '16px' }}>
              {[
                { emoji: '🧠', label: 'Reset Hypnosis', credits: '1 credit', duration: '5 min' },
                { emoji: '🔥', label: 'Hype Coach', credits: '1 credit', duration: '5 min' },
                { emoji: '🌙', label: 'Sleep Hypnosis', credits: '3 credits', duration: '15 min' },
                { emoji: '🌊', label: 'Subliminal', credits: '3 credits', duration: '30 min' },
              ].map(s => (
                <div key={s.label} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${BASE.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.emoji}</div>
                  <div style={{ fontSize: '13px', color: BASE.text, fontWeight: '600', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '12px', color: '#00d4ff', fontWeight: '700', marginBottom: '2px' }}>{s.credits}</div>
                  <div style={{ fontSize: '11px', color: BASE.textFaint }}>{s.duration}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit packs */}
          <div style={{ marginBottom: '48px', animation: 'fadeUp 0.6s ease 0.2s both' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: BASE.text, marginBottom: '8px' }}>Pay as you go</h2>
              <p style={{ fontSize: '14px', color: BASE.textMuted }}>No subscription. Buy credits when you need them. They never expire.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '14px' }}>
              {[
                { key: 'credits_10',  label: '10 Credits', price: '£5',  per: '50p per credit', best: false },
                { key: 'credits_50',  label: '50 Credits', price: '£15', per: '30p per credit', best: false },
                { key: 'credits_100', label: '100 Credits', price: '£25', per: '25p per credit', best: true },
              ].map(c => (
                <div key={c.key} style={{ padding: '24px 20px', borderRadius: '18px', border: `1px solid ${c.best ? 'rgba(0,212,255,0.4)' : BASE.border}`, background: c.best ? 'rgba(0,212,255,0.05)' : BASE.bgCard, textAlign: 'center', position: 'relative', boxShadow: c.best ? '0 0 30px rgba(0,212,255,0.08)' : 'none' }}>
                  {c.best && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: '#050a14', fontSize: '10px', fontWeight: '800', padding: '4px 14px', borderRadius: '100px', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>BEST VALUE</div>}
                  <div style={{ fontSize: '17px', color: BASE.text, fontWeight: '700', marginBottom: '6px' }}>{c.label}</div>
                  <div style={{ fontSize: '32px', color: '#00d4ff', fontWeight: '800', marginBottom: '4px' }}>{c.price}</div>
                  <div style={{ fontSize: '12px', color: BASE.textFaint, marginBottom: '20px' }}>{c.per}</div>
                  <button onClick={() => checkout(c.key)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: c.best ? 'linear-gradient(135deg,#00d4ff,#0088cc)' : 'rgba(0,212,255,0.08)', border: c.best ? 'none' : '1px solid rgba(0,212,255,0.25)', color: c.best ? '#050a14' : '#00d4ff', fontSize: '14px', fontWeight: '700' }}>
                    {loading === c.key ? 'Loading...' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ padding: '32px', borderRadius: '20px', background: BASE.bgCard, border: `1px solid ${BASE.border}`, marginBottom: '32px', animation: 'fadeUp 0.6s ease 0.25s both' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: BASE.text, marginBottom: '24px' }}>Common questions</h3>
            {[
              ['What is a credit?', 'One credit generates one Reset Hypnosis or Hype Coach session (5 minutes). Sleep Hypnosis and Subliminal sessions use 3 credits each due to their length and depth.'],
              ['Can I cancel anytime?', 'Yes. Cancel your Pro subscription at any time from your dashboard. You keep your credits until the end of the billing period.'],
              ['Do unused credits roll over?', 'Monthly subscription credits reset each month. Credits purchased as one-off packs never expire.'],
              ['Is my payment secure?', 'All payments are processed securely by Stripe. We never store your card details.'],
              ['Can I try before I buy?', 'Yes — free accounts get 5 credits per week, no card required. Try all four session types before upgrading.'],
            ].map(([q, a]) => (
              <div key={q} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${BASE.border}` }}>
                <div style={{ fontSize: '14px', color: BASE.text, fontWeight: '700', marginBottom: '6px' }}>{q}</div>
                <div style={{ fontSize: '13px', color: BASE.textMuted, lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.6s ease 0.3s both' }}>
            <p style={{ fontSize: '13px', color: BASE.textFaint, marginBottom: '16px' }}>
              Built by a qualified hypnotherapist · Powered by Claude AI · Voices by ElevenLabs
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {['🔒 Secure checkout', '↩ Cancel anytime', '✦ Credits never expire', '🎧 Instant generation'].map(t => (
                <span key={t} style={{ fontSize: '12px', color: BASE.textFaint }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
