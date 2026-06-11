// pages/rewire.js
// The Rewire Experience — the new core product journey, in the new design system.
// Deployed at /rewire so it can be tested live alongside the existing homepage.
// Wired to the real APIs: classify-prompt (via useSafetyGate) → generate-script
// → generate-audio → save-session. Voice + atmosphere mixing matches index.js,
// including subliminal near-silent looping and screen wake lock.

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { useSafetyGate } from '../components/SafetyBlock'
import NeuralField from '../components/NeuralField'
import LogoWeave from '../components/LogoWeave'

import { VOICES, EXPERIENCES, atmospheresFor, CREATION_PHASES, LOGO_URL } from '../lib/catalog'

const CHIPS = ['Confidence', 'Calm', 'Sleep', 'Self-belief', 'Focus', 'Letting go', 'Abundance', 'Motivation']
const FEELS = ['Calmer', 'Clearer', 'Motivated', 'Sleepy', 'Emotional', 'No change yet']
const RESPONSES = {
  'Calmer': 'That calm was already in you. The Rewire just reminded your mind where to find it.',
  'Clearer': 'Clarity compounds. Tomorrow, the pathway will be a little easier to find.',
  'Motivated': 'Hold that. Your next session will anchor it deeper.',
  'Sleepy': "Perfect — that's your nervous system letting go. Rest well.",
  'Emotional': 'That\u2019s movement. Something that was held is loosening. Be gentle with yourself.',
  'No change yet': 'Completely normal. Rewiring is repetition — the first listen lays the path, the next ones deepen it.',
}

export default function Rewire() {
  // ── auth & profile ─────────────────────────────────────────────
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  // ── flow state ─────────────────────────────────────────────────
  const [step, setStep] = useState(0) // 0 intention · 1 experience · 2 voice · 3 atmosphere · 4 creating · 5 ready · 6 reflection
  const [intent, setIntent] = useState('')
  const [exp, setExp] = useState(null)
  const [voice, setVoice] = useState(null)
  const [atmo, setAtmo] = useState(null)
  const [previewingId, setPreviewingId] = useState(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showNoCredits, setShowNoCredits] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [genError, setGenError] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [script, setScript] = useState('')
  const [savedOk, setSavedOk] = useState(false)
  const [saveLimitHit, setSaveLimitHit] = useState(false)
  const [streak, setStreak] = useState(null)
  const [feeling, setFeeling] = useState(null)

  // ── playback ───────────────────────────────────────────────────
  const [playing, setPlaying] = useState(false)
  const [timer, setTimer] = useState(0)
  const audioRef = useRef(null)
  const musicRef = useRef(null)
  const previewRef = useRef(null)
  const timerRef = useRef(null)
  const phaseRef = useRef(null)
  const wakeLockRef = useRef(null)
  const pendingGenerateRef = useRef(false)

  const { safetyState, checkSafety, clearSafety } = useSafetyGate()

  const isSubliminal = exp?.id === 'subliminal'
  const cost = exp?.credits || 1

  // ── session bootstrap ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id) }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
      if (session?.user) loadProfile(session.user.id)
    })
    return () => sub?.subscription?.unsubscribe()
  }, [])

  async function loadProfile(id) {
    const { data } = await supabase.from('profiles').select('plan, credits, streak_count').eq('id', id).single()
    if (data) setProfile(data)
  }

  async function handleAuth() {
    setAuthErr(''); setAuthBusy(true)
    try {
      const fn = authMode === 'signin'
        ? supabase.auth.signInWithPassword({ email: authEmail, password: authPass })
        : supabase.auth.signUp({ email: authEmail, password: authPass })
      const { data, error } = await fn
      if (error) { setAuthErr(error.message); setAuthBusy(false); return }
      if (data?.user) {
        setShowAuth(false)
        if (authMode === 'signup') {
          // fire-and-forget welcome email, mirrors existing signup flow
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            fetch('/api/send-welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
              body: JSON.stringify({ email: data.user.email }),
            }).catch(() => {})
          }
        }
        if (pendingGenerateRef.current) { pendingGenerateRef.current = false; setTimeout(beginCreation, 600) }
      }
    } catch (e) { setAuthErr('Something went wrong. Please try again.') }
    setAuthBusy(false)
  }

  // ── disclaimer (same localStorage key as the existing app) ─────
  function needsDisclaimer() { try { return !localStorage.getItem('rw_disclaimer_accepted') } catch { return false } }
  function acceptDisclaimer() {
    try { localStorage.setItem('rw_disclaimer_accepted', '1') } catch {}
    setShowDisclaimer(false)
    if (pendingGenerateRef.current) { pendingGenerateRef.current = false; beginCreation() }
  }

  // ── voice preview ──────────────────────────────────────────────
  function togglePreview(v) {
    if (previewingId === v.id) {
      previewRef.current?.pause(); setPreviewingId(null); return
    }
    if (previewRef.current) previewRef.current.pause()
    previewRef.current = new Audio(v.preview)
    previewRef.current.play().catch(() => {})
    previewRef.current.onended = () => setPreviewingId(null)
    setPreviewingId(v.id)
  }

  // ── creation ───────────────────────────────────────────────────
  async function beginCreation() {
    if (!user) { pendingGenerateRef.current = true; setShowAuth(true); return }
    if (!profile || profile.credits < cost) { setShowNoCredits(true); return }
    if (needsDisclaimer()) { pendingGenerateRef.current = true; setShowDisclaimer(true); return }

    clearSafety()
    const isSafe = await checkSafety(intent, user.id)
    if (!isSafe) return

    setGenError(''); setAudioUrl(null); setSavedOk(false); setSaveLimitHit(false)
    setPhaseIdx(0); setStep(4)
    window.scrollTo({ top: 0 })

    // Phases advance gently and hold on the final one until the APIs finish —
    // the breathing logo is the honest "still working" state. No fake percentages.
    let pi = 0
    phaseRef.current = setInterval(() => {
      pi = Math.min(pi + 1, CREATION_PHASES.length - 1)
      setPhaseIdx(pi)
    }, 4000)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const scriptRes = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goal: intent, productType: exp.id, mood: 5, userId: user.id, firstName: null }),
      })
      const scriptData = await scriptRes.json()
      if (scriptRes.status === 402) { clearInterval(phaseRef.current); setStep(3); setShowNoCredits(true); return }
      if (!scriptRes.ok) throw new Error(scriptData.error || 'Script generation failed')
      setScript(scriptData.script)

      const audioRes = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: scriptData.script, voiceId: voice.id, productType: exp.id, userId: user.id }),
      })
      const audioData = await audioRes.json()
      if (!audioRes.ok || audioData.error) throw new Error(audioData.error || 'Audio generation failed')
      setAudioUrl(audioData.audioUrl)

      const saveRes = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: user.id, goal: intent, productType: exp.id, script: scriptData.script,
          audioUrl: audioData.audioUrl, voiceId: voice.id, mood: 5, musicUrl: atmo?.url || null,
        }),
      })
      const saveData = await saveRes.json()
      if (saveRes.status === 403) setSaveLimitHit(true)
      else if (saveRes.ok) { setSavedOk(true); if (saveData.streak) setStreak(saveData.streak) }

      clearInterval(phaseRef.current)
      loadProfile(user.id)
      setTimeout(() => setStep(5), 800)
    } catch (err) {
      clearInterval(phaseRef.current)
      setGenError(friendly(err.message))
      setStep(3)
    }
  }

  function friendly(msg) {
    if (!msg) return 'Something went wrong. Please try again.'
    if (msg.includes('fetch') || msg.includes('network')) return 'Connection hiccup. Check your internet and try again.'
    return msg
  }

  // ── playback (mirrors index.js: mixing, subliminal, wake lock) ──
  async function togglePlay() {
    if (!audioRef.current) return
    if (!playing) {
      audioRef.current.volume = isSubliminal ? 0.001 : 1.0
      audioRef.current.loop = isSubliminal
      audioRef.current.play()
      if (musicRef.current && atmo?.url) {
        musicRef.current.volume = 0.35
        musicRef.current.loop = true
        musicRef.current.play().catch(() => {})
      }
      setPlaying(true)
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
      try { if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen') } catch {}
    } else {
      audioRef.current.pause()
      if (musicRef.current) musicRef.current.pause()
      setPlaying(false); clearInterval(timerRef.current)
      if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null }
    }
  }

  function handleAudioEnd() {
    if (isSubliminal) {
      if (audioRef.current) { audioRef.current.loop = true; audioRef.current.play().catch(() => {}) }
      return
    }
    if (musicRef.current) {
      let vol = musicRef.current.volume
      const fade = setInterval(() => {
        vol = Math.max(0, vol - 0.02)
        if (musicRef.current) musicRef.current.volume = vol
        if (vol <= 0) { clearInterval(fade); musicRef.current?.pause() }
      }, 150)
    }
    setPlaying(false); clearInterval(timerRef.current)
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null }
  }

  useEffect(() => () => { // unmount cleanup
    clearInterval(timerRef.current); clearInterval(phaseRef.current)
    audioRef.current?.pause(); musicRef.current?.pause(); previewRef.current?.pause()
    wakeLockRef.current?.release?.()
  }, [])

  // ── reflection ─────────────────────────────────────────────────
  function chooseFeeling(f) {
    setFeeling(f)
    // Lightweight signal back to you via the existing feedback endpoint
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: `Post-Rewire reflection: ${f} — goal: "${intent}" (${exp?.id})`, userId: user?.id }),
    }).catch(() => {})
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const canContinue = [intent.trim(), exp, voice, atmo][step] // steps 0–3 gating

  // ── render ─────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Create a Rewire — RewireMode</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Newsreader:ital,opsz,wght@1,6..72,300;1,6..72,400&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <NeuralField intensity="ambient" />

      <div className="shell">
        <div className="topbar">
          <a href="/"><img src={LOGO_URL} alt="RewireMode" /></a>
          <a className="leave" href="/dashboard">My library</a>
        </div>

        {step <= 3 && (
          <div className="progress">
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} style={{ display: 'contents' }}>
                <div className={`pnode ${i < step ? 'done' : ''} ${i === step ? 'now' : ''}`} />
                {i < 4 && <div className={`pline ${i < step ? 'done' : ''}`} />}
              </span>
            ))}
          </div>
        )}

        {/* STEP 0 · INTENTION */}
        {step === 0 && (
          <div className="step">
            <div className="ask">What would you like to rewire?</div>
            <div className="ask-sub">In your own words. There&rsquo;s no wrong answer.</div>
            <textarea className="intent" rows={3} placeholder="I want to feel..." value={intent}
              onChange={e => { setIntent(e.target.value); clearSafety() }} />
            <div className="chips">
              {CHIPS.map(c => (
                <button key={c} className={`chip ${intent === c ? 'on' : ''}`} onClick={() => { setIntent(c); clearSafety() }}>{c}</button>
              ))}
            </div>

            {safetyState?.type === 'crisis' && <CrisisPanel onDismiss={clearSafety} />}
            {safetyState?.type === 'block' && (
              <SafetyPanel state={safetyState} onUseRewrite={r => { setIntent(r); clearSafety() }} onDismiss={clearSafety} />
            )}

            <div className="navrow">
              <button className="next" disabled={!intent.trim()} onClick={() => setStep(1)}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 1 · EXPERIENCE */}
        {step === 1 && (
          <div className="step">
            <div className="ask">Choose your experience</div>
            <div className="ask-sub">How do you want this to reach you?</div>
            <div className="opts">
              {EXPERIENCES.map(x => (
                <button key={x.id} className={`opt ${exp?.id === x.id ? 'on' : ''}`}
                  onClick={() => { setExp(x); setAtmo(null) }}>
                  <div className="mark" />
                  <h4>{x.name}</h4>
                  <div className="meta">{x.meta}</div>
                  <p>{x.desc}</p>
                </button>
              ))}
            </div>
            <div className="navrow">
              <button className="back" onClick={() => setStep(0)}>Back</button>
              <button className="next" disabled={!exp} onClick={() => setStep(2)}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 2 · VOICE */}
        {step === 2 && (
          <div className="step">
            <div className="ask">Choose your voice</div>
            <div className="ask-sub">The voice that will speak to your subconscious.</div>
            {VOICES.map(v => {
              const locked = v.proOnly && (!profile || profile.plan === 'free')
              return (
                <div key={v.id} className={`voice ${voice?.id === v.id ? 'on' : ''} ${previewingId === v.id ? 'playing' : ''} ${locked ? 'locked' : ''}`}
                  onClick={() => { if (!locked) setVoice(v) }}>
                  <div className="vinfo">
                    <h4>{v.name} {locked && <span className="pro">Pro</span>}</h4>
                    <p>{v.desc}</p>
                  </div>
                  <div className="wave"><i /><i /><i /><i /><i /></div>
                  <button className="pv" aria-label={`Preview ${v.name}`}
                    onClick={e => { e.stopPropagation(); togglePreview(v) }}>
                    {previewingId === v.id
                      ? <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                      : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                  </button>
                </div>
              )
            })}
            {VOICES.some(v => v.proOnly) && (!profile || profile.plan === 'free') && (
              <p className="hint">More voices unlock with <a href="/pricing">RewireMode Pro</a> — preview them any time.</p>
            )}
            <div className="navrow">
              <button className="back" onClick={() => setStep(1)}>Back</button>
              <button className="next" disabled={!voice} onClick={() => setStep(3)}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 3 · ATMOSPHERE */}
        {step === 3 && (
          <div className="step">
            <div className="ask">Choose your atmosphere</div>
            <div className="ask-sub">What the world sounds like while you listen.</div>
            <div className="opts">
              {atmospheresFor(exp.id).map(a => (
                <button key={a.id} className={`opt ${atmo?.id === a.id ? 'on' : ''}`} onClick={() => setAtmo(a)}>
                  <div className="mark" />
                  <h4>{a.name}</h4>
                  <p>{a.desc}</p>
                </button>
              ))}
            </div>
            {genError && <p className="error">{genError}</p>}
            <div className="navrow">
              <button className="back" onClick={() => setStep(2)}>Back</button>
              <button className="next" disabled={!atmo} onClick={beginCreation}>Begin creating</button>
            </div>
          </div>
        )}

        {/* STEP 4 · CREATING */}
        {step === 4 && (
          <div className="step create-stage">
            <LogoWeave />
            <div className="phase">{CREATION_PHASES[phaseIdx]}</div>
            <div className="createlabel">Creating your Rewire</div>
          </div>
        )}

        {/* STEP 5 · READY */}
        {step === 5 && (
          <div className="step">
            <div className="ritualtext">
              Your Rewire is ready.<br /><br />
              <b>Find somewhere comfortable.</b><br />
              Use headphones if you can.<br />
              Take one slow breath.<br /><br />
              <b>Begin when you&rsquo;re ready.</b>
            </div>
            <div className="player">
              <div className="art">
                <div className="title">
                  <div className="kind">{exp.name} Rewire · {exp.duration.replace(':00', '')} min</div>
                  <h3>{intent.length < 34 ? intent : intent.slice(0, 32) + '…'}</h3>
                </div>
              </div>
              <div className="controls">
                <button className="play" onClick={togglePlay}>
                  {playing
                    ? <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                    : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                </button>
                <div className="track">
                  <div className="tmeta"><span>{fmt(timer)}</span><span>{exp.duration}</span></div>
                </div>
              </div>
              {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd} preload="auto" />}
              {atmo?.url && <audio ref={musicRef} src={atmo.url} preload="auto" />}
            </div>
            {streak && <p className="hint center">🔥 Day {streak} of your journey</p>}
            {saveLimitHit && <p className="hint center">Your library is full — <a href="/pricing">upgrade</a> to keep every Rewire.</p>}
            {savedOk && <p className="hint center">Saved to your library.</p>}
            <div className="navrow">
              <button className="next ghosted" onClick={() => { if (playing) togglePlay(); setStep(6) }}>
                I&rsquo;ve finished listening
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 · REFLECTION */}
        {step === 6 && (
          <div className="step">
            <div className="ask">How do you feel now?</div>
            <div className="ask-sub">One honest word is enough.</div>
            <div className="feels">
              {FEELS.map(f => (
                <button key={f} className={`feel ${feeling === f ? 'on' : ''}`} onClick={() => chooseFeeling(f)}>{f}</button>
              ))}
            </div>
            <div className="afterword">
              {feeling && <div className="voiceline">{RESPONSES[feeling]}</div>}
              {feeling && (
                <>
                  <a className="next center-btn" href="/dashboard">Go to my library</a>
                  <p className="hint center">Return tomorrow. Repetition is how rewiring works.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── AUTH PANEL ── */}
      {showAuth && (
        <Modal onClose={() => setShowAuth(false)}>
          <h3 className="mtitle">{authMode === 'signin' ? 'Welcome back' : 'Save your Rewire'}</h3>
          <p className="msub">{authMode === 'signin' ? 'Sign in to continue your journey.' : 'Create a free account — your first Rewire is on us.'}</p>
          <input className="minput" type="email" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
          <input className="minput" type="password" placeholder="Password" value={authPass} onChange={e => setAuthPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()} />
          {authErr && <p className="error">{authErr}</p>}
          <button className="next full" disabled={authBusy} onClick={handleAuth}>
            {authBusy ? 'One moment…' : authMode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
          <button className="switch" onClick={() => setAuthMode(m => m === 'signin' ? 'signup' : 'signin')}>
            {authMode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </button>
        </Modal>
      )}

      {/* ── DISCLAIMER ── */}
      {showDisclaimer && (
        <Modal onClose={() => setShowDisclaimer(false)}>
          <h3 className="mtitle">Before you begin</h3>
          <p className="msub">
            RewireMode is a wellbeing tool, not a medical treatment. It doesn&rsquo;t diagnose or cure any condition.
            Don&rsquo;t listen while driving or operating machinery (Walking Rewires are designed for full awareness).
            If you experience epilepsy, psychosis, or severe mental illness, please speak to a healthcare professional first.
          </p>
          <button className="next full" onClick={acceptDisclaimer}>I understand — continue</button>
        </Modal>
      )}

      {/* ── OUT OF REWIRES ── */}
      {showNoCredits && (
        <Modal onClose={() => setShowNoCredits(false)}>
          <h3 className="mtitle">You&rsquo;ve used today&rsquo;s Rewires</h3>
          <p className="msub">Your next free Rewire is on its way. Or unlock unlimited listening and daily creation with Pro.</p>
          <a className="next full center-btn" href="/pricing">See plans</a>
        </Modal>
      )}
    </>
  )
}

// ── Safety panels (new design language, same protective content) ──
function CrisisPanel({ onDismiss }) {
  return (
    <div className="safety crisis">
      <p className="stitle">This sounds like something serious — we want you to be okay.</p>
      <p className="sbody">RewireMode isn&rsquo;t a crisis service. Please reach out to someone who can really help right now.</p>
      <a className="sline" href="tel:116123"><b>Samaritans</b> — call or text 116 123, free, 24/7</a>
      <a className="sline" href="sms:85258?body=SHOUT"><b>Shout</b> — text SHOUT to 85258</a>
      <a className="sline" href="tel:999"><b>Emergency services</b> — call 999 if in immediate danger</a>
      <a className="sline" href="https://www.mind.org.uk/need-urgent-help" target="_blank" rel="noopener noreferrer"><b>Mind</b> — mind.org.uk</a>
      <button className="sdismiss" onClick={onDismiss}>Go back</button>
    </div>
  )
}

function SafetyPanel({ state, onUseRewrite, onDismiss }) {
  return (
    <div className="safety">
      <p className="stitle">Let&rsquo;s shape this differently</p>
      <p className="sbody">
        Rewires work best when they&rsquo;re about you — what you want to feel, build, or release.
        This intention isn&rsquo;t something we can create.
      </p>
      {state.suggestedRewrite && (
        <div className="rewrite">
          <div className="rlabel">Try this instead</div>
          <p className="rtext">&ldquo;{state.suggestedRewrite}&rdquo;</p>
          <button className="next" style={{ padding: '12px 24px' }} onClick={() => onUseRewrite(state.suggestedRewrite)}>Use this intention</button>
        </div>
      )}
      <button className="sdismiss" onClick={onDismiss}>Edit my intention</button>
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

// ── Styles (token values inlined from styles/theme.js) ──────────
const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${'#05070F'};color:#EDEFF7;font-family:'Sora','Segoe UI',system-ui,sans-serif;font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100svh}
  button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
  textarea,input{font-family:inherit;outline:none}
  ::selection{background:rgba(94,155,242,0.3)}
  a{color:#5E9BF2}

  .shell{position:relative;z-index:1;max-width:560px;margin:0 auto;padding:0 22px 60px;min-height:100svh;display:flex;flex-direction:column}
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:22px 0 10px}
  .topbar img{height:42px;display:block}
  .leave{font-size:12px;color:#5A6280;letter-spacing:.06em;text-decoration:none;transition:color .3s}
  .leave:hover{color:#9AA3C2}

  .progress{display:flex;align-items:center;margin:18px 0 8px}
  .pnode{width:7px;height:7px;border-radius:50%;background:#5A6280;opacity:.4;transition:all .6s cubic-bezier(0.22,1,0.36,1);flex-shrink:0}
  .pnode.done{background:#5E9BF2;opacity:1}
  .pnode.now{background:#5E9BF2;opacity:1;box-shadow:0 0 12px 2px rgba(94,155,242,.5);transform:scale(1.45)}
  .pline{height:1px;flex:1;background:rgba(146,168,255,0.10);position:relative;overflow:hidden}
  .pline::after{content:'';position:absolute;inset:0;background:#5E9BF2;transform:scaleX(0);transform-origin:left;transition:transform .8s cubic-bezier(0.22,1,0.36,1)}
  .pline.done::after{transform:scaleX(1)}

  .step{display:flex;flex-direction:column;flex:1;animation:stepIn .7s cubic-bezier(0.22,1,0.36,1)}
  @keyframes stepIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

  .ask{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;font-size:clamp(26px,6.4vw,34px);letter-spacing:-0.01em;line-height:1.2;margin:34px 0 8px}
  .ask-sub{font-size:14px;color:#5A6280;margin-bottom:28px}

  .intent{width:100%;background:rgba(255,255,255,0.025);border:1px solid rgba(146,168,255,0.10);border-radius:18px;color:#EDEFF7;font-size:17px;font-weight:300;line-height:1.5;padding:20px;min-height:110px;resize:none;transition:border-color .4s ease}
  .intent:focus{border-color:rgba(146,168,255,0.24)}
  .intent::placeholder{color:#5A6280}
  .chips{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}
  .chip{font-size:13px;color:#9AA3C2;border:1px solid rgba(146,168,255,0.10);border-radius:100px;padding:9px 16px;transition:all .35s ease}
  .chip:hover{border-color:rgba(146,168,255,0.24);color:#EDEFF7}
  .chip.on{border-color:#5E9BF2;color:#EDEFF7;background:rgba(94,155,242,0.12)}

  .opts{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .opt{text-align:left;border:1px solid rgba(146,168,255,0.10);border-radius:18px;background:rgba(255,255,255,0.025);padding:20px 18px;position:relative;overflow:hidden;transition:all .4s cubic-bezier(0.22,1,0.36,1)}
  .opt:hover{border-color:rgba(146,168,255,0.24);transform:translateY(-2px)}
  .opt.on{border-color:#5E9BF2;background:rgba(94,155,242,0.12)}
  .opt h4{font-weight:600;font-size:15px;margin-bottom:3px}
  .opt .meta{font-size:11px;color:#5E9BF2;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
  .opt p{font-size:12.5px;color:#9AA3C2;line-height:1.5}
  .opt .mark{position:absolute;top:14px;right:14px;width:18px;height:18px;border-radius:50%;border:1px solid rgba(146,168,255,0.24);transition:all .35s ease}
  .opt.on .mark{background:#5E9BF2;border-color:#5E9BF2;box-shadow:0 0 10px rgba(94,155,242,.5)}

  .voice{display:flex;align-items:center;gap:16px;width:100%;text-align:left;border:1px solid rgba(146,168,255,0.10);border-radius:16px;background:rgba(255,255,255,0.025);padding:16px 18px;margin-bottom:11px;transition:all .35s ease;cursor:pointer}
  .voice.on{border-color:#5E9BF2;background:rgba(94,155,242,0.12)}
  .voice:hover{border-color:rgba(146,168,255,0.24)}
  .voice.locked{opacity:.55;cursor:default}
  .voice .vinfo{flex:1}
  .voice h4{font-size:15px;font-weight:600}
  .voice p{font-size:12.5px;color:#9AA3C2}
  .pro{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#3EC1F0;border:1px solid rgba(62,193,240,.4);border-radius:100px;padding:2px 8px;margin-left:8px;vertical-align:middle}
  .pv{width:40px;height:40px;border-radius:50%;flex-shrink:0;border:1px solid rgba(146,168,255,0.24);display:flex;align-items:center;justify-content:center;transition:all .3s ease}
  .pv:hover{background:rgba(94,155,242,0.12)}
  .pv svg{width:13px;height:13px;fill:#9AA3C2}
  .wave{display:flex;align-items:center;gap:2.5px;height:18px}
  .wave i{width:2.5px;border-radius:2px;background:#5E9BF2;height:4px}
  .voice.playing .wave i{animation:wv .9s ease-in-out infinite}
  .wave i:nth-child(2){animation-delay:.12s}.wave i:nth-child(3){animation-delay:.24s}
  .wave i:nth-child(4){animation-delay:.36s}.wave i:nth-child(5){animation-delay:.48s}
  @keyframes wv{0%,100%{height:4px}50%{height:16px}}

  .navrow{display:flex;gap:12px;margin-top:auto;padding-top:34px}
  .back{font-size:13px;color:#5A6280;padding:17px 20px;border:1px solid rgba(146,168,255,0.10);border-radius:100px;transition:all .3s ease}
  .back:hover{color:#9AA3C2;border-color:rgba(146,168,255,0.24)}
  .next{flex:1;font-weight:600;font-size:15px;color:#fff;padding:17px;border-radius:100px;background:linear-gradient(120deg,#6C4BE0 0%,#4A8FE8 52%,#3EC1F0 100%);box-shadow:0 0 0 1px rgba(146,168,255,.15),0 8px 30px rgba(94,155,242,.2);transition:all .4s cubic-bezier(0.22,1,0.36,1);text-align:center;text-decoration:none;display:block}
  .next:disabled{background:rgba(255,255,255,.05);color:#5A6280;box-shadow:none;cursor:default}
  .next:not(:disabled):hover{transform:translateY(-1px)}
  .next.ghosted{background:none;border:1px solid rgba(146,168,255,0.24);box-shadow:none;color:#9AA3C2;font-weight:400}
  .next.full{width:100%}
  .center-btn{display:block;max-width:280px;margin:0 auto}

  .create-stage{align-items:center;justify-content:center;text-align:center}
  .phase{font-family:'Newsreader',Georgia,serif;font-style:italic;font-size:19px;color:#9AA3C2;min-height:30px;margin-top:8px;transition:opacity .5s ease}
  .createlabel{font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#5A6280;margin-top:14px}

  .ritualtext{font-family:'Newsreader',Georgia,serif;font-style:italic;font-size:clamp(22px,5.6vw,28px);line-height:1.5;text-align:center;color:#9AA3C2;padding:40px 6px 24px}
  .ritualtext b{color:#EDEFF7;font-weight:400}

  .player{border:1px solid rgba(146,168,255,0.10);border-radius:26px;overflow:hidden;background:#0A0D1A;margin-top:10px}
  .art{height:190px;position:relative;display:flex;align-items:flex-end;background:radial-gradient(circle at 25% 30%,rgba(108,75,224,.5),transparent 55%),radial-gradient(circle at 75% 65%,rgba(62,193,240,.35),transparent 55%),radial-gradient(circle at 55% 20%,rgba(74,143,232,.3),transparent 50%),#070A14}
  .art .title{padding:20px 22px;width:100%;background:linear-gradient(transparent,rgba(5,7,15,.8))}
  .art .kind{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#3EC1F0;margin-bottom:4px}
  .art h3{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;font-size:21px}
  .controls{display:flex;align-items:center;gap:18px;padding:18px 22px}
  .play{width:54px;height:54px;border-radius:50%;flex-shrink:0;background:linear-gradient(120deg,#6C4BE0 0%,#4A8FE8 52%,#3EC1F0 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(94,155,242,.3);transition:transform .3s cubic-bezier(0.22,1,0.36,1)}
  .play:hover{transform:scale(1.05)}
  .play svg{width:18px;height:18px;fill:#fff}
  .track{flex:1}
  .tmeta{display:flex;justify-content:space-between;font-size:12px;color:#5A6280}

  .feels{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;margin-top:6px}
  .feel{border:1px solid rgba(146,168,255,0.10);border-radius:16px;background:rgba(255,255,255,0.025);padding:18px 8px;font-size:13.5px;color:#9AA3C2;transition:all .35s ease}
  .feel:hover{border-color:rgba(146,168,255,0.24);color:#EDEFF7}
  .feel.on{border-color:#5E9BF2;background:rgba(94,155,242,0.12);color:#EDEFF7}
  .afterword{text-align:center;margin-top:auto;padding-top:34px}
  .voiceline{font-family:'Newsreader',Georgia,serif;font-style:italic;font-size:20px;color:#9AA3C2;margin-bottom:26px;animation:stepIn .6s ease}

  .hint{font-size:13px;color:#5A6280;margin-top:14px}
  .hint.center{text-align:center}
  .hint a{color:#5E9BF2}
  .error{color:#f87171;font-size:13px;margin-top:14px}

  .safety{border:1px solid rgba(146,168,255,0.24);border-radius:18px;padding:22px;margin-top:20px;background:rgba(94,155,242,0.06);animation:stepIn .5s ease}
  .safety.crisis{border-color:rgba(248,113,113,0.35);background:rgba(248,113,113,0.06)}
  .stitle{font-weight:600;font-size:15px;margin-bottom:8px}
  .sbody{font-size:13px;color:#9AA3C2;margin-bottom:16px;line-height:1.7}
  .sline{display:block;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(146,168,255,0.10);text-decoration:none;color:#9AA3C2;font-size:13px;margin-bottom:8px}
  .sline b{color:#EDEFF7;font-weight:600}
  .sdismiss{font-size:13px;color:#5A6280;text-decoration:underline;margin-top:8px}
  .rewrite{border:1px solid rgba(94,155,242,0.3);border-radius:14px;padding:16px;margin-bottom:12px;background:rgba(94,155,242,0.06)}
  .rlabel{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#5E9BF2;margin-bottom:8px}
  .rtext{font-family:'Newsreader',Georgia,serif;font-style:italic;font-size:15px;color:#EDEFF7;margin-bottom:14px}

  .overlay{position:fixed;inset:0;z-index:50;background:rgba(3,5,12,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{width:100%;max-width:400px;background:#0A0D1A;border:1px solid rgba(146,168,255,0.24);border-radius:24px;padding:32px;animation:stepIn .4s cubic-bezier(0.22,1,0.36,1)}
  .mtitle{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;font-size:24px;margin-bottom:8px}
  .msub{font-size:13.5px;color:#9AA3C2;line-height:1.7;margin-bottom:20px}
  .minput{width:100%;padding:15px 16px;border-radius:12px;border:1px solid rgba(146,168,255,0.10);background:rgba(255,255,255,0.025);color:#EDEFF7;font-size:14px;margin-bottom:11px;transition:border-color .3s}
  .minput:focus{border-color:rgba(146,168,255,0.24)}
  .switch{display:block;margin:16px auto 0;font-size:13px;color:#5A6280;text-decoration:underline}

  @media(max-width:420px){.opts{grid-template-columns:1fr}.feels{grid-template-columns:1fr 1fr}}
  @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`
