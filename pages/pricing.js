import Head from 'next/head'
import { useState, useEffect } from 'react'

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'
const FAVICON = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/FLAVICON.png'

// Solstice offer ends midnight 22 Jun BST (UK) = 23:00 UTC on the 21st.
const SOLSTICE_END = Date.parse('2026-06-21T23:00:00Z')

export default function Pricing({ user, profile }) {
  const [loading, setLoading] = useState(null)
  const [plan, setPlan] = useState('annual')      // everyday-plan toggle
  const [now, setNow] = useState(SOLSTICE_END)     // avoids hydration mismatch; real value set on mount

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const buy = new URLSearchParams(window.location.search).get('buy')
    if (buy && user) checkout(buy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const solsticeLive = now < SOLSTICE_END
  const isPaid = profile?.plan && profile.plan !== 'free'

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

  // countdown parts
  let secs = Math.max(0, Math.floor((SOLSTICE_END - now) / 1000))
  const cdD = Math.floor(secs / 86400); secs -= cdD * 86400
  const cdH = Math.floor(secs / 3600); secs -= cdH * 3600
  const cdM = Math.floor(secs / 60)
  const pad = n => String(n).padStart(2, '0')

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
          'Unlock Sleep & Subliminal for any goal',
          'Generate sessions for unlimited goals',
          'Every voice & every atmosphere',
          'Replay your whole library — always free',
        ].map(t => (
          <div className="feat" key={t}><span className="tick">✦</span>{t}</div>
        ))}
      </div>
      {isPaid ? (
        <a className="ghost line block" href="/dashboard">You're on Unlimited — manage in your account</a>
      ) : (
        <button className="ghost line block" onClick={() => checkout(plan)}>
          {loading === plan ? 'Loading…' : 'Start Unlimited'}
        </button>
      )}
    </div>
  )

  return (
    <>
      <Head>
        <title>Pricing — RewireMode</title>
        <meta name="description" content="One plan. Everything in it. Start your free 7-Day Rewire, upgrade to Unlimited anytime." />
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
          .serif{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300}
          .serif.grad{color:transparent;background:linear-gradient(100deg,#A9C4FF,#7E9DFF 55%,#9C86F0);-webkit-background-clip:text;background-clip:text}
          .small{font-size:12px;color:#5A6280}
          .feat{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:#9AA3C2;margin-bottom:11px;line-height:1.5}
          .feat .tick{color:#5E9BF2;flex-shrink:0}
          .cta{display:inline-block;width:100%;text-align:center;font-weight:600;font-size:15px;color:#fff;padding:17px 34px;border-radius:100px;background:linear-gradient(120deg,#6C4BE0 0%,#4A8FE8 52%,#3EC1F0 100%);box-shadow:0 0 0 1px rgba(146,168,255,.18),0 10px 40px rgba(94,155,242,.22);transition:transform .4s,box-shadow .4s}
          .cta:hover{transform:translateY(-2px)}
          .cta.gold{background:linear-gradient(120deg,#F4D7A6,#E2A24A 55%,#C97E2E);color:#241405;box-shadow:0 0 0 1px rgba(226,162,74,.3),0 12px 40px rgba(226,162,74,.32)}
          .ghost.line{display:block;width:100%;text-align:center;border:1px solid rgba(146,168,255,.24);border-radius:100px;padding:15px;color:#EDEFF7;font-weight:600;font-size:14px;margin-top:18px}
          .ghost.line:hover{border-color:rgba(146,168,255,.45)}
          .panel{width:100%;border:1px solid rgba(146,168,255,.10);border-radius:24px;background:radial-gradient(ellipse at 50% 0%,rgba(108,75,216,.08),transparent 65%),#0A0D1A;padding:26px 24px}
          .toggle{display:flex;gap:6px;background:rgba(255,255,255,.03);border:1px solid rgba(146,168,255,.10);border-radius:100px;padding:4px;width:fit-content;margin:0 auto 18px}
          .toggle button{color:#5A6280;font-weight:400;font-size:12px;padding:8px 16px;border-radius:100px}
          .toggle button.sel{background:linear-gradient(120deg,#6C4BE0,#4A8FE8 52%,#3EC1F0);color:#fff}
          .price-num{font-weight:300;font-size:48px;color:#EDEFF7;letter-spacing:-.03em}
          .sun-stamp{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(120deg,#F4D7A6,#E2A24A 55%,#C97E2E);color:#241405;font-weight:700;font-size:11px;letter-spacing:.16em;padding:7px 16px;border-radius:100px}
          .solstice-hero{width:100%;border:1px solid rgba(226,162,74,.45);border-radius:24px;background:radial-gradient(120% 90% at 50% 0%,rgba(226,162,74,.18),transparent 62%),#0A0D1A;box-shadow:0 0 54px rgba(226,162,74,.16);padding:30px 24px 28px;position:relative;margin-top:22px}
          .sol-price{font-weight:300;font-size:62px;color:#F4D5A6;letter-spacing:-.03em;line-height:1}
          .countdown{display:flex;gap:8px;justify-content:center;margin-top:16px}
          .cd-box{background:rgba(226,162,74,.12);border:1px solid rgba(226,162,74,.3);border-radius:10px;padding:8px 0;min-width:58px}
          .cd-num{font-weight:600;font-size:21px;color:#F4D5A6;font-variant-numeric:tabular-nums;line-height:1}
          .cd-lbl{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#5A6280;margin-top:4px}
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
          {solsticeLive ? (
            <>
              <div className="sun-stamp" style={{ marginTop: 34 }}>☀ SUMMER SOLSTICE</div>
              <h2 className="title">This <em>solstice</em> only</h2>

              <div className="solstice-hero">
                <div className="sol-price">£1</div>
                <div style={{ color: '#F4D5A6', fontSize: 14, marginTop: 2 }}>for your first month</div>
                <div className="small mt8" style={{ color: '#9AA3C2' }}>then £14.99/month · cancel anytime</div>
                <div className="countdown">
                  <div className="cd-box"><div className="cd-num">{cdD}</div><div className="cd-lbl">days</div></div>
                  <div className="cd-box"><div className="cd-num">{pad(cdH)}</div><div className="cd-lbl">hrs</div></div>
                  <div className="cd-box"><div className="cd-num">{pad(cdM)}</div><div className="cd-lbl">min</div></div>
                </div>
                <div className="small mt12" style={{ color: '#5A6280' }}>Ends midnight · 21 June (UK time)</div>
                <p style={{ fontSize: 13, color: '#9AA3C2', marginTop: 18, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
                  To mark the longest day, your first month is just £1. Claim it before the timer runs out.
                </p>
                {isPaid ? (
                  <a className="ghost line" href="/dashboard" style={{ borderColor: 'rgba(226,162,74,.4)', color: '#F4D5A6' }}>You're already a member</a>
                ) : (
                  <button className="cta gold mt18" onClick={() => checkout('solstice')}>
                    {loading === 'solstice' ? 'Loading…' : 'Claim my £1 month'}
                  </button>
                )}
              </div>

              <div className="divider">or the everyday plan</div>
              {UnlimitedPanel}
            </>
          ) : (
            <>
              <div className="eyebrow" style={{ marginTop: 34 }}>One plan. Everything in it.</div>
              <h2 className="title">Unlimited <em>Rewire</em></h2>
              <div style={{ width: '100%', marginTop: 22 }}>{UnlimitedPanel}</div>
            </>
          )}

          <p className="small" style={{ marginTop: 22 }}>Free forever: your first goal, Reset + Walking, unlimited replay.</p>
          <p className="small" style={{ marginTop: 22, color: '#5A6280' }}>
            Built by a qualified hypnotherapist · Secure checkout via Stripe · Cancel anytime
          </p>
        </div>
      </div>
    </>
  )
}
