// pages/index.js
// RewireMode homepage — the new design system.
// A pure landing experience: every creation path leads to /rewire.
// The previous homepage (with the in-page flow) lives in GitHub history.

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import NeuralField from '../components/NeuralField'
import LogoWeave from '../components/LogoWeave'
import { LOGO_URL } from '../lib/catalog'

export default function Home() {
  const [user, setUser] = useState(null)
  const [weaveKey, setWeaveKey] = useState(0)
  const ritualRef = useRef(null)

  const [goal, setGoal] = useState('')
  const [busy, setBusy] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('signup')
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [authNote, setAuthNote] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user || null
      setUser(u)
      // Resume a pending goal after email confirmation / sign-in.
      if (u) { try { if (localStorage.getItem('rw_pending_goal')) startChallenge(u) } catch (_) {} }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function beginRewire() {
    const g = goal.trim()
    if (!g) return
    try { localStorage.setItem('rw_pending_goal', g) } catch (_) {}
    if (!user) { setAuthMode('signup'); setShowAuth(true); return }
    startChallenge(user)
  }

  async function startChallenge(u) {
    if (busy) return
    setBusy(true)
    let g = goal.trim()
    try { g = g || localStorage.getItem('rw_pending_goal') || '' } catch (_) {}
    if (!g) { setBusy(false); return }
    const { data, error } = await supabase.from('challenges').insert({ user_id: u.id, goal: g }).select().single()
    try { localStorage.removeItem('rw_pending_goal') } catch (_) {}
    if (error || !data) { setBusy(false); alert('Could not start your Rewire. Please try again.'); return }
    window.location.href = `/challenge?id=${data.id}`
  }

  async function handleAuth() {
    setAuthErr(''); setBusy(true)
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: authEmail.trim(), password: authPass })
        if (error) throw error
        if (!data.session) { setAuthNote('Almost there — check your email to confirm, then sign in to begin.'); setAuthMode('signin'); setBusy(false); return }
        setUser(data.user); setShowAuth(false); startChallenge(data.user)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPass })
        if (error) throw error
        setUser(data.user); setShowAuth(false); startChallenge(data.user)
      }
    } catch (e) { setAuthErr(e.message || 'Something went wrong'); setBusy(false) }
  }

  // Scroll reveals + ritual steps lighting up in sequence
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.18 })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))

    const steps = ritualRef.current?.querySelectorAll('.rstep')
    if (steps?.length) {
      const io2 = new IntersectionObserver(es => {
        if (es[0].isIntersecting) {
          steps.forEach((s, i) => setTimeout(() => s.classList.add('lit'), 500 + i * 650))
          io2.disconnect()
        }
      }, { threshold: 0.4 })
      io2.observe(ritualRef.current)
      return () => { io.disconnect(); io2.disconnect() }
    }
    return () => io.disconnect()
  }, [])

  return (
    <>
      <Head>
        <title>RewireMode — Rewire your mind. Rewrite your reality.</title>
        <meta name="description" content="Personalised hypnosis and subliminal audio, written for exactly who you are and exactly what you want to change. Create your first Rewire free." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Newsreader:ital,opsz,wght@1,6..72,300;1,6..72,400&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <NeuralField intensity="landing" opacity={1} />

      <div className="page">

        {/* NAV */}
        <nav className="nav">
          <img src={LOGO_URL} alt="RewireMode" className="navlogo" />
          <div className="navlinks">
            {user
              ? <a href="/dashboard">My library</a>
              : <a href="/rewire">Sign in</a>}
            <a className="navcta" href="/rewire">{user ? 'Continue your journey' : 'Begin free'}</a>
          </div>
        </nav>

        {/* HERO */}
        <header className="hero">
          <h1>Rewire your mind.<br /><em>Rewrite your reality.</em></h1>
          <p>Personalised hypnosis written for exactly who you are and exactly what you want to change. Your free 7-day Rewire begins with one intention — no card.</p>
          <div className="starter">
            <input className="goalin" value={goal} onChange={e => setGoal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') beginRewire() }}
              placeholder="I want to feel calm under pressure…" aria-label="What would you like to change?" />
            <button className="cta" onClick={beginRewire} disabled={busy || !goal.trim()}>
              {busy ? 'Beginning…' : 'Begin my 7-day Rewire'}
            </button>
            <a className="ghost" href="#ritual">How it works</a>
          </div>
          <div className="scroll-hint">Scroll</div>
        </header>

        {/* EXPERIENCES */}
        <section>
          <div className="reveal">
            <div className="eyebrow">Four ways in</div>
            <h2 className="section-title">Choose how you want to <em>meet your mind</em></h2>
          </div>
          <div className="exp-grid">
            <a className="exp reveal" href="/rewire" style={{ transitionDelay: '.05s' }}>
              <div className="glyph">
                <svg viewBox="0 0 46 46" fill="none"><circle cx="23" cy="23" r="9" stroke="#4A8FE8" strokeWidth="1.2" /><circle cx="23" cy="23" r="16" stroke="#4A8FE8" strokeWidth="0.8" opacity="0.4" /><circle cx="23" cy="23" r="2.5" fill="#4A8FE8" /></svg>
              </div>
              <h3>Reset</h3>
              <div className="when">5 min · Any moment</div>
              <p>A short, deep recalibration. Step out of the noise and return clear.</p>
              <div className="thread" />
            </a>
            <a className="exp reveal" href="/rewire" style={{ transitionDelay: '.12s' }}>
              <div className="glyph">
                <svg viewBox="0 0 46 46" fill="none"><path d="M30 9a14.5 14.5 0 1 0 7 24 16 16 0 0 1-7-24z" stroke="#6C4BE0" strokeWidth="1.2" /><circle cx="33" cy="12" r="1.4" fill="#A9C4FF" /><circle cx="38" cy="19" r="1" fill="#A9C4FF" opacity="0.7" /></svg>
              </div>
              <h3>Sleep</h3>
              <div className="when">Tonight · In bed</div>
              <p>Drift down gently while suggestion works beneath the surface.</p>
              <div className="thread" />
            </a>
            <a className="exp reveal" href="/rewire" style={{ transitionDelay: '.19s' }}>
              <div className="glyph">
                <svg viewBox="0 0 46 46" fill="none"><path d="M8 34c5-2 7-9 11-9s5 7 9 7 6-8 10-10" stroke="#4A8FE8" strokeWidth="1.2" strokeLinecap="round" /><circle cx="8" cy="34" r="1.8" fill="#4A8FE8" /><circle cx="38" cy="22" r="1.8" fill="#4A8FE8" /></svg>
              </div>
              <h3>Walking</h3>
              <div className="when">Eyes open · Outdoors</div>
              <p>Alert, present, moving — change woven into every step you take.</p>
              <div className="thread" />
            </a>
            <a className="exp reveal" href="/rewire" style={{ transitionDelay: '.26s' }}>
              <div className="glyph">
                <svg viewBox="0 0 46 46" fill="none"><path d="M6 23h6m22 0h6M16 23a7 7 0 0 1 14 0 7 7 0 0 1-14 0z" stroke="#6C4BE0" strokeWidth="1.1" opacity="0.9" /><path d="M10 16c8 0 8 14 16 14s8-14 16-14" stroke="#4A8FE8" strokeWidth="0.9" opacity="0.5" /></svg>
              </div>
              <h3>Subliminal</h3>
              <div className="when">Background · Anytime</div>
              <p>Affirmations beneath the atmosphere, speaking only to your subconscious.</p>
              <div className="thread" />
            </a>
          </div>
        </section>

        {/* RITUAL */}
        <section id="ritual">
          <div className="reveal">
            <div className="eyebrow">The ritual</div>
            <h2 className="section-title">Five minutes to create.<br /><em>A lifetime of listening to yourself.</em></h2>
            <p className="section-sub">No menus, no settings, no jargon. One quiet question at a time.</p>
          </div>
          <div className="ritual">
            <div className="ritual-steps reveal" ref={ritualRef}>
              <div className="rstep"><div className="node" /><div><h4>Set your intention</h4><p className="q">What would you like to rewire?</p></div></div>
              <div className="rstep"><div className="node" /><div><h4>Receive your sessions</h4><p>Your goal, shaped into Reset and Walking hypnosis — yours to keep and replay.</p></div></div>
              <div className="rstep"><div className="node" /><div><h4>Listen daily for seven days</h4><p>A few minutes a day. The more you return, the deeper it settles.</p></div></div>
              <div className="rstep"><div className="node" /><div><h4>See what changes</h4><p>On day seven, feel how far you&rsquo;ve come.</p></div></div>
            </div>
            <div className="creation reveal">
              <LogoWeave key={weaveKey} />
              <div className="creation-caption">While your Rewire is created, the pathways connect.</div>
              <button className="replay" onClick={() => setWeaveKey(k => k + 1)}>Replay</button>
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <div className="closing">
          <div className="reveal">
            <h2>You found RewireMode.<br /><em>Now find out what changes.</em></h2>
            <p>Your first Rewire is free. No card. Just an intention.</p>
            <a className="cta" href="/rewire">Create my free Rewire</a>
            <div className="trust">
              <span>Built on clinical hypnotherapy structure</span><i />
              <span>Transparent about AI</span><i />
              <span>Private by design</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="flinks">
            <a href="/pricing">Pricing</a>
            <a href="/faq">FAQ</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
          <p className="fnote">RewireMode is a wellbeing tool, not a medical treatment. If you&rsquo;re struggling, please speak to a healthcare professional.</p>
          <p className="fcopy">© {new Date().getFullYear()} RewireMode</p>
        </footer>

        {showAuth && (
          <div className="authwrap" onClick={() => setShowAuth(false)}>
            <div className="authcard" onClick={e => e.stopPropagation()}>
              <div className="eyebrow">Your 7-Day Rewire</div>
              <h3 className="serifh">{authMode === 'signup' ? 'Create your free account' : 'Welcome back'}</h3>
              <p className="authgoal">&ldquo;{goal}&rdquo;</p>
              <input className="goalin afield" type="email" placeholder="you@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
              <input className="goalin afield" type="password" placeholder="Password" value={authPass} onChange={e => setAuthPass(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAuth() }} />
              {authErr && <p className="autherr">{authErr}</p>}
              {authNote && <p className="authnote">{authNote}</p>}
              <button className="cta full" onClick={handleAuth} disabled={busy || !authEmail || !authPass}>
                {busy ? 'One moment…' : authMode === 'signup' ? 'Create account & begin' : 'Sign in & begin'}
              </button>
              <button className="authswitch" onClick={() => { setAuthMode(m => m === 'signup' ? 'signin' : 'signup'); setAuthErr(''); setAuthNote('') }}>
                {authMode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:#05070F;color:#EDEFF7;font-family:'Sora','Segoe UI',system-ui,sans-serif;font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::selection{background:rgba(94,155,242,0.3)}
  a{text-decoration:none;color:inherit}
  button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}

  .page{position:relative;z-index:1}

  .nav{display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto;padding:20px 24px}
  .navlogo{height:44px;mix-blend-mode:lighten}
  .navlinks{display:flex;align-items:center;gap:22px}
  .navlinks a{font-size:13px;color:#9AA3C2;transition:color .3s}
  .navlinks a:hover{color:#EDEFF7}
  .navcta{border:1px solid rgba(146,168,255,0.24);border-radius:100px;padding:10px 20px;color:#EDEFF7!important}
  .navcta:hover{background:rgba(94,155,242,0.12)}

  .hero{min-height:92svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:48px 24px;position:relative}
  .hero h1{font-weight:300;font-size:clamp(40px,7vw,84px);line-height:1.06;letter-spacing:-0.03em;max-width:820px;margin:0 0 26px;opacity:0;animation:rise 1.4s cubic-bezier(0.22,1,0.36,1) .5s forwards}
  .hero h1 em{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;letter-spacing:-0.01em;color:transparent;background:linear-gradient(100deg,#A9C4FF,#7E9DFF 55%,#9C86F0);-webkit-background-clip:text;background-clip:text}
  .hero p{font-size:17px;color:#9AA3C2;max-width:480px;opacity:0;animation:rise 1.4s cubic-bezier(0.22,1,0.36,1) .9s forwards}
  .cta-row{margin-top:44px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:center;opacity:0;animation:rise 1.4s cubic-bezier(0.22,1,0.36,1) 1.2s forwards}
  .cta{display:inline-block;font-weight:600;font-size:15px;color:#fff;padding:18px 36px;border-radius:100px;background:linear-gradient(120deg,#6C4BE0 0%,#4A8FE8 52%,#3EC1F0 100%);box-shadow:0 0 0 1px rgba(146,168,255,0.18),0 10px 40px rgba(94,155,242,0.22);transition:transform .45s cubic-bezier(0.22,1,0.36,1),box-shadow .45s}
  .cta:hover{transform:translateY(-2px);box-shadow:0 0 0 1px rgba(146,168,255,0.3),0 16px 52px rgba(94,155,242,0.32)}
  .ghost{font-size:14px;color:#9AA3C2;padding:18px 22px;transition:color .3s}
  .ghost:hover{color:#EDEFF7}
  .scroll-hint{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#5A6280;opacity:0;animation:rise 1.4s cubic-bezier(0.22,1,0.36,1) 2s forwards}
  .scroll-hint::after{content:'';display:block;width:1px;height:36px;margin:12px auto 0;background:linear-gradient(to bottom,rgba(146,168,255,0.24),transparent)}
  @keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

  section{max-width:1060px;margin:0 auto;padding:120px 24px}
  .eyebrow{font-size:12px;letter-spacing:0.36em;text-transform:uppercase;color:#5E9BF2;font-weight:400;margin-bottom:20px}
  .section-title{font-weight:300;font-size:clamp(30px,4.4vw,46px);line-height:1.15;letter-spacing:-0.025em;max-width:640px}
  .section-title em{font-family:'Newsreader',Georgia,serif;font-style:italic;color:#A9C4FF}
  .section-sub{color:#9AA3C2;font-size:16px;max-width:520px;margin-top:18px}

  .reveal{opacity:0;transform:translateY(26px);transition:opacity 1s cubic-bezier(0.22,1,0.36,1),transform 1s cubic-bezier(0.22,1,0.36,1)}
  .reveal.in{opacity:1;transform:none}

  .exp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:64px}
  .exp{position:relative;border:1px solid rgba(146,168,255,0.10);border-radius:20px;padding:34px 26px 30px;background:rgba(255,255,255,0.025);overflow:hidden;transition:border-color .5s,transform .5s cubic-bezier(0.22,1,0.36,1),background .5s;display:block}
  .exp:hover{border-color:rgba(146,168,255,0.24);transform:translateY(-4px);background:rgba(146,168,255,0.04)}
  .exp .glyph{width:46px;height:46px;margin-bottom:22px}
  .exp .glyph svg{width:100%;height:100%;overflow:visible}
  .exp h3{font-weight:600;font-size:17px;letter-spacing:-0.01em;margin-bottom:8px}
  .exp .when{font-size:12px;color:#5E9BF2;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px}
  .exp p{font-size:13.5px;color:#9AA3C2;line-height:1.6}
  .exp .thread{position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,#4A8FE8,transparent);transform:scaleX(0);transition:transform .7s cubic-bezier(0.22,1,0.36,1)}
  .exp:hover .thread{transform:scaleX(1)}

  .ritual{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;margin-top:20px}
  .rstep{display:flex;gap:24px;padding:26px 0;border-bottom:1px solid rgba(146,168,255,0.10)}
  .rstep:last-child{border-bottom:none}
  .rstep .node{flex-shrink:0;width:10px;height:10px;border-radius:50%;margin-top:8px;background:#5A6280;transition:background .5s,box-shadow .5s}
  .rstep.lit .node{background:#5E9BF2;box-shadow:0 0 16px 2px rgba(94,155,242,0.45)}
  .rstep h4{font-weight:600;font-size:16px;margin-bottom:5px;color:#9AA3C2;transition:color .5s}
  .rstep.lit h4{color:#EDEFF7}
  .rstep p{font-size:14px;color:#5A6280;max-width:380px}
  .rstep .q{font-family:'Newsreader',Georgia,serif;font-style:italic;color:#A9C4FF;font-size:15px}

  .creation{border:1px solid rgba(146,168,255,0.10);border-radius:28px;background:radial-gradient(ellipse at 50% 0%,rgba(108,75,216,0.10),transparent 65%),#0A0D1A;padding:60px 30px 50px;text-align:center}
  .creation-caption{font-family:'Newsreader',Georgia,serif;font-style:italic;font-size:16px;color:#9AA3C2;margin-top:18px}
  .replay{margin-top:24px;font-size:13px;color:#5E9BF2;letter-spacing:0.05em;border:1px solid rgba(146,168,255,0.24);border-radius:100px;padding:11px 24px;transition:background .3s}
  .replay:hover{background:rgba(94,155,242,0.12)}

  .closing{text-align:center;padding:150px 24px 130px}
  .closing h2{font-weight:300;font-size:clamp(32px,5vw,54px);letter-spacing:-0.03em;line-height:1.12;max-width:700px;margin:0 auto 22px}
  .closing h2 em{font-family:'Newsreader',Georgia,serif;font-style:italic;color:#A9C4FF}
  .closing p{color:#9AA3C2;font-size:16px;margin-bottom:42px}
  .trust{margin-top:70px;font-size:12px;color:#5A6280;display:flex;gap:28px;justify-content:center;flex-wrap:wrap;letter-spacing:0.04em}
  .trust span{display:flex;align-items:center;gap:8px}
  .trust i{width:4px;height:4px;border-radius:50%;background:#5A6280}

  .footer{border-top:1px solid rgba(146,168,255,0.10);text-align:center;padding:50px 24px 60px}
  .flinks{display:flex;gap:26px;justify-content:center;flex-wrap:wrap;margin-bottom:22px}
  .flinks a{font-size:13px;color:#9AA3C2;transition:color .3s}
  .flinks a:hover{color:#EDEFF7}
  .fnote{font-size:12px;color:#5A6280;max-width:440px;margin:0 auto 14px;line-height:1.7}
  .fcopy{font-size:12px;color:#5A6280}

  @media(max-width:880px){
    .exp-grid{grid-template-columns:1fr 1fr}
    .ritual{grid-template-columns:1fr;gap:50px}
    section{padding:90px 20px}
  }
  @media(max-width:520px){.exp-grid{grid-template-columns:1fr}}
  @media(prefers-reduced-motion:reduce){
    *{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important}
  }

  .starter{display:flex;flex-direction:column;gap:12px;max-width:440px;margin:36px auto 0;width:100%}
  .goalin{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(146,168,255,.14);border-radius:16px;color:#EDEFF7;font-family:'Newsreader',Georgia,serif;font-style:italic;font-size:18px;padding:16px 18px;outline:none}
  .goalin:focus{border-color:rgba(146,168,255,.4)}
  .goalin::placeholder{color:#586089}
  .starter .cta{width:100%;text-align:center;border:none;cursor:pointer}
  .starter .cta:disabled{opacity:.5;cursor:default}
  .starter .ghost{align-self:center}
  .authwrap{position:fixed;inset:0;z-index:60;background:rgba(3,5,12,.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
  .authcard{width:100%;max-width:400px;background:#0A0D1A;border:1px solid rgba(146,168,255,.24);border-radius:24px;padding:30px;text-align:left}
  .afield{font-family:'Sora',sans-serif;font-style:normal;font-size:15px;margin-top:12px}
  .serifh{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;font-size:24px;color:#EDEFF7;margin-top:6px}
  .authgoal{font-family:'Newsreader',Georgia,serif;font-style:italic;color:#A9C4FF;font-size:15px;margin-top:8px}
  .autherr{color:#f87171;font-size:13px;margin-top:10px}
  .authnote{color:#5E9BF2;font-size:13px;margin-top:10px}
  .cta.full{display:block;width:100%;text-align:center;margin-top:16px;border:none;cursor:pointer}
  .cta.full:disabled{opacity:.5;cursor:default}
  .authswitch{display:block;margin:14px auto 0;font-size:13px;color:#5A6280;text-decoration:underline;cursor:pointer}
`
