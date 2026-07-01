import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { EXPERIENCES } from '../lib/catalog'

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'
const FAVICON = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/FLAVICON.png'

export default function Pricing({ user, profile }) {
  const [loading, setLoading] = useState(null)
  const [plan, setPlan] = useState('annual')      // everyday-plan toggle
  const [type, setType] = useState('reset')
  const [status, setStatus] = useState(null)       // { isSubscribed, trialEligible, amountLabel, hasUnusedCredit }

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('type')
    if (t && EXPERIENCES.some(e => e.id === t)) setType(t)
  }, [])

  useEffect(() => {
    if (!user) { setStatus(null); return }
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const r = await fetch('/api/generation-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ userId: user.id, productType: type }),
        })
        setStatus(await r.json())
      } catch (e) { setStatus(null) }
    })()
  }, [user, type])

  const isPaid = profile?.plan && profile.plan !== 'free'
  const expName = EXPERIENCES.find(e => e.id === type)?.name || 'session'

  async function checkout(planKey) {
    if (!user) { window.location.href = '/?signup=true'; return }
    setLoading(planKey)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, userId: user.id, email: user.email }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
    } catch (e) { /* fall through */ }
    setLoading(null)
  }

  async function buyGeneration() {
    if (!user) { window.location.href = '/?signup=true'; return }
    setLoading('gen')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/create-generation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: user.id, email: user.email, productType: type, redirectPath: '/rewire' }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
    } catch (e) { /* fall through */ }
    setLoading(null)
  }

  const UnlimitedPanel = (
    <div className="panel">
      <div className="eyebrow" style={{ marginBottom: 10 }}>Unlimited</div>
      <div className="toggle">
        <button className={plan === 'annual' ? 'sel' : ''} onClick={() => setPlan('annual')}>Annual</button>
        <button className={plan === 'monthly' ? 'sel' : ''} onClick={() => setPlan('monthly')}>Monthly</button>
      </div>
      <div>
        <span className="price-num">{plan === 'annual' ? '£89' : '£14.99'}</span>
        <span className="small">{plan === 'annual' ? ' /year' : ' /month'}</span>
      </div>
      <div className="small" style={{ color: 'var(--accent)', marginTop: 8 }}>
        {plan === 'annual' ? 'Just £7.42/month, billed yearly · cancel anytime' : 'Billed monthly · cancel anytime · save 50% on annual'}
      </div>
      <div style={{ textAlign: 'left', marginTop: 22 }}>
        {[
          'Personalised Reset, Walking, Sleep & Subliminal',
          'Generate sessions for unlimited goals',
          'Every voice & every atmosphere',
          'Replay your whole library — yours to keep',
        ].map(t => (
          <div className="feat" key={t}><span className="tick">✦</span>{t}</div>
        ))}
      </div>
      {isPaid ? (
        <a className="ghost line block" href="/dashboard">You're on Unlimited — manage in your account</a>
      ) : (
        <button className="ghost line block" onClick={() => checkout(plan)}>
          {loading === plan ? 'Loading…' : 'Choose this plan'}
        </button>
      )}
    </div>
  )

  return (
    <>
      <Head>
        <title>Pricing — RewireMode</title>
        <meta name="description" content="Get your first personalised hypnotherapy session for £1, or subscribe to Unlimited for everything." />
        <link rel="icon" type="image/png" href={FAVICON} />
        <link rel="apple-touch-icon" href={FAVICON} />
      </Head>

      <div className="wrap">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Newsreader:ital,opsz,wght@1,6..72,300;1,6..72,400&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          .wrap{min-height:100vh;background:#05070F;color:#9AA3C2;font-family:'Sora',system-ui,sans-serif;font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
          .wrap a{text-decoration:none;color:inherit}
          .wrap button{cursor:pointer;border:none;background:none;font-family:inherit;color:inherit}
          .orb{position:fixed;border-radius:50%;filter:blur(70px);z-index:0;pointer-events:none}
          .orb.a{top:-18%;left:-12%;width:520px;height:520px;background:radial-gradient(circle,rgba(108,75,224,.16),transparent 65%)}
          .orb.b{bottom:-20%;right:-12%;width:460px;height:460px;background:radial-gradient(circle,rgba(62,193,240,.10),transparent 65%)}
          .nav{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;max-width:560px;margin:0 auto;padding:20px 22px 0}
          .nav .back{font-size:13px;color:#9AA3C2;border:1px solid rgba(146,168,255,.24);border-radius:100px;padding:9px 16px}
          .nav img{height:40px;mix-blend-mode:lighten}
          .container{position:relative;z-index:2;max-width:560px;margin:0 auto;padding:30px 22px 90px;display:flex;flex-direction:column;align-items:center;text-align:center}
          .eyebrow{font-size:12px;letter-spacing:.36em;text-transform:uppercase;color:#5E9BF2;font-weight:400}
          .title{font-weight:300;font-size:clamp(26px,6vw,38px);line-height:1.15;letter-spacing:-.025em;color:#EDEFF7;margin-top:18px}
          .title em{font-family:'Newsreader',Georgia,serif;font-style:italic;color:#A9C4FF}
          .small{font-size:12px;color:#5A6280}
          .feat{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:#9AA3C2;margin-bottom:11px;line-height:1.5}
          .feat .tick{color:#5E9BF2;flex-shrink:0}
          .cta{display:inline-block;width:100%;text-align:center;font-weight:600;font-size:15px;color:#fff;padding:17px 34px;border-radius:100px;background:linear-gradient(120deg,#6C4BE0 0%,#4A8FE8 52%,#3EC1F0 100%);box-shadow:0 0 0 1px rgba(146,168,255,.18),0 10px 40px rgba(94,155,242,.22);transition:transform .4s,box-shadow .4s}
          .cta:hover{transform:translateY(-2px)}
          .ghost.line{display:block;width:100%;text-align:center;border:1px solid rgba(146,168,255,.24);border-radius:100px;padding:15px;color:#EDEFF7;font-weight:600;font-size:14px;margin-top:18px}
          .ghost.line:hover{border-color:rgba(146,168,255,.45)}
          .panel{width:100%;border:1px solid rgba(146,168,255,.10);border-radius:24px;background:radial-gradient(ellipse at 50% 0%,rgba(108,75,216,.08),transparent 65%),#0A0D1A;padding:26px 24px}
          .toggle{display:flex;gap:6px;background:rgba(255,255,255,.03);border:1px solid rgba(146,168,255,.10);border-radius:100px;padding:4px;width:fit-content;margin:0 auto 18px}
          .toggle button{color:#5A6280;font-weight:400;font-size:12px;padding:8px 16px;border-radius:100px}
          .toggle button.sel{background:linear-gradient(120deg,#6C4BE0,#4A8FE8 52%,#3EC1F0);color:#fff}
          .price-num{font-weight:300;font-size:48px;color:#EDEFF7;letter-spacing:-.03em}
          .start-hero{width:100%;border:1px solid rgba(146,168,255,.28);border-radius:24px;background:radial-gradient(120% 90% at 50% 0%,rgba(108,75,216,.16),transparent 62%),#0A0D1A;box-shadow:0 0 54px rgba(94,155,242,.14);padding:30px 24px 28px;position:relative;margin-top:22px}
          .start-price{font-weight:300;font-size:56px;color:#EDEFF7;letter-spacing:-.03em;line-height:1}
          .type-pick{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:16px}
          .type-pick button{font-size:12px;padding:7px 14px;border-radius:100px;border:1px solid rgba(146,168,255,.18);color:#9AA3C2}
          .type-pick button.sel{border-color:rgba(94,155,242,.6);color:#EDEFF7;background:rgba(94,155,242,.10)}
          .divider{display:flex;align-items:center;gap:14px;width:100%;margin:26px 0 18px;color:#5A6280;font-size:11px;letter-spacing:.14em;text-transform:uppercase}
          .divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(146,168,255,.10)}
          .mt8{margin-top:8px}.mt12{margin-top:12px}.mt18{margin-top:18px}.mt22{margin-top:22px}
        `}</style>

        <div className="orb a" /><div className="orb b" />

        <nav className="nav">
          <a className="back" href="/">← Back</a>
          <a href="/"><img src={LOGO} alt="RewireMode" onError={e => { e.target.style.display = 'none' }} /></a>
        </nav>

        <div className="container">
          <div className="eyebrow" style={{ marginTop: 34 }}>Start today</div>
          <h2 className="title">Try your first <em>{expName}</em></h2>

          <div className="start-hero">
            <div className="start-price">
              {status?.isSubscribed ? "You're covered" : (status?.amountLabel || '£1')}
            </div>
            {!status?.isSubscribed && (
              <div style={{ color: '#A9C4FF', fontSize: 14, marginTop: 2 }}>
                {status?.trialEligible === false ? `for a personalised ${expName}` : 'for your first session — any type'}
              </div>
            )}
            <p style={{ fontSize: 13, color: '#9AA3C2', marginTop: 18, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
              One personalised session, generated just for you, in a real human voice. Built by a qualified hypnotherapist.
            </p>

            <div className="type-pick">
              {EXPERIENCES.map(e => (
                <button key={e.id} className={type === e.id ? 'sel' : ''} onClick={() => setType(e.id)}>{e.name}</button>
              ))}
            </div>

            {status?.isSubscribed ? (
              <a className="ghost line" href="/rewire">Go create — it's included</a>
            ) : status?.hasUnusedCredit ? (
              <a className="ghost line" href="/rewire">You've already paid for this — go create</a>
            ) : (
              <button className="cta mt18" onClick={buyGeneration}>
                {loading === 'gen' ? 'Loading…' : `Get this ${expName} — ${status?.amountLabel || '£1'}`}
              </button>
            )}
          </div>

          <div className="divider">or go unlimited &amp; save</div>
          {UnlimitedPanel}

          <p className="small" style={{ marginTop: 22 }}>
            Anything you create is always yours to replay — even if you never come back to buy another.
          </p>
          <p className="small" style={{ marginTop: 22, color: '#5A6280' }}>
            Built by a qualified hypnotherapist · Secure checkout via Stripe · Cancel anytime
          </p>
        </div>
      </div>
    </>
  )
}
