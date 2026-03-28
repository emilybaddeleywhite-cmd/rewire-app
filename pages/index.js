import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

// ─── MUSIC TRACKS ─────────────────────────────────────────────────────
const MUSIC = {
  reset:      { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-calm.mp3.mp3',       volume: 0.18, label: 'Calm ambient' },
  sleep:      { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-sleep.mp3.mp3',      volume: 0.15, label: 'Sleep ambient' },
  subliminal: { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-subliminal.mp3.mp3', volume: 0.20, label: 'Subliminal ambient' },
  hype:       { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-hype.mp3.mp3',       volume: 0.22, label: 'Motivational' },
}

// ─── VOICES ───────────────────────────────────────────────────────────
const VOICES = {
  hypnosis: [
    { id: 'TKePFuDtAVp14EppI8GC', name: 'Emily',   gender: 'female', desc: 'Warm & grounding' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  gender: 'female', desc: 'Soft & soothing' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi',    gender: 'female', desc: 'Clear & calming' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  gender: 'male',   desc: 'Deep & resonant' },
  ],
  hype: [
    { id: 'Fc5CaIGWKvLHapoOSM2K', name: 'Coach Alex', gender: 'male',   desc: 'High energy' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold',     gender: 'male',   desc: 'Powerful & bold' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',       gender: 'male',   desc: 'Authoritative' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli',       gender: 'female', desc: 'Fierce & fired up' },
  ],
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 'reset',      label: 'Reset Hypnosis', emoji: '🧠', duration: '5 min',  credits: 1, desc: 'Induction · Deepener · Suggestion · Release',             color: '#c8a96e' },
  { id: 'sleep',      label: 'Sleep Hypnosis', emoji: '🌙', duration: '15 min', credits: 3, desc: 'Deep sleep induction · Theta state · Subliminal layer',    color: '#7b6fc7' },
  { id: 'subliminal', label: 'Subliminal',     emoji: '🌊', duration: '30 min', credits: 3, desc: 'Affirmations layered under music · Identity reprogramming', color: '#4a9eff' },
  { id: 'hype',       label: 'Hype Coach',     emoji: '🔥', duration: '5 min',  credits: 1, desc: 'High energy · Coach tone · Identity reinforcement',         color: '#e040fb' },
]

const GOALS = [
  'Confidence', 'Overthinking', 'Sleep', 'Fear',
  'Success', 'Abundance', 'Self-worth', 'Focus',
]

const MOMENTS = [
  { id: 'meeting', emoji: '💼', label: 'Big meeting' },
  { id: 'workout', emoji: '💪', label: 'Workout' },
  { id: 'sales',   emoji: '📞', label: 'Sales call' },
  { id: 'convo',   emoji: '😰', label: 'Difficult conversation' },
  { id: 'launch',  emoji: '🚀', label: 'Launch / presentation' },
]

// ─── THEMES ───────────────────────────────────────────────────────────
function getTheme(productId) {
  const themes = {
    reset:      { bg: '#0d0a06', accent: '#c8a96e', grad: 'linear-gradient(135deg,#c8a96e,#9a7040)', waveA: '#9a7040', waveB: '#f5e4b0', orb1: 'rgba(140,95,30,0.13)', orb2: 'rgba(60,35,100,0.1)' },
    sleep:      { bg: '#080612', accent: '#7b6fc7', grad: 'linear-gradient(135deg,#7b6fc7,#4a3fa0)', waveA: '#4a3fa0', waveB: '#b0a8f5', orb1: 'rgba(80,60,180,0.15)', orb2: 'rgba(30,15,80,0.15)' },
    subliminal: { bg: '#060d18', accent: '#4a9eff', grad: 'linear-gradient(135deg,#4a9eff,#1a5fcc)', waveA: '#1a5fcc', waveB: '#a0ccff', orb1: 'rgba(30,80,180,0.15)', orb2: 'rgba(10,40,100,0.15)' },
    hype:       { bg: '#080510', accent: '#e040fb', grad: 'linear-gradient(135deg,#e040fb,#ff6d00)', waveA: '#e040fb', waveB: '#ff6d00', orb1: 'rgba(180,30,255,0.12)', orb2: 'rgba(255,60,0,0.1)' },
  }
  return themes[productId] || themes.reset
}

// ─── WAVEFORM ─────────────────────────────────────────────────────────
function Waveform({ active, theme }) {
  const [heights, setHeights] = useState(Array(30).fill(5))
  useEffect(() => {
    if (!active) { setHeights(Array(30).fill(5)); return }
    const iv = setInterval(() => {
      setHeights(Array(30).fill(0).map((_, i) => 6 + Math.abs(Math.sin(Date.now() * 0.003 + i * 0.5)) * 26 + Math.random() * 8))
    }, 120)
    return () => clearInterval(iv)
  }, [active])
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', height: '54px' }}>
      {heights.map((h, i) => <div key={i} style={{ width: '3px', borderRadius: '2px', height: `${h}px`, background: `linear-gradient(to top,${theme.waveA},${theme.waveB})`, transition: 'height 0.12s ease', opacity: active ? 0.9 : 0.22 }} />)}
    </div>
  )
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true); setError('')
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (error) setError(error.message)
      else setMessage('Account created! You can now sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onSuccess()
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#0d0a06', border: '1px solid rgba(200,169,110,0.2)', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>✦</div>
          <h2 style={{ fontSize: '22px', color: '#f0d89a', fontFamily: 'Georgia,serif', fontWeight: '400', marginBottom: '6px' }}>
            {mode === 'signup' ? 'Enter Rewrite Mode' : 'Welcome back'}
          </h2>
          {mode === 'signup' && <p style={{ fontSize: '13px', color: 'rgba(232,220,200,0.45)' }}>Start with 5 free credits — no card needed</p>}
        </div>
        {message ? (
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)', textAlign: 'center', color: '#f0d89a', fontSize: '14px', marginBottom: '14px' }}>
            {message}<br /><br />
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setMode('signin')}>Sign in now →</span>
          </div>
        ) : (
          <>
            {mode === 'signup' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(200,169,110,0.2)', background: 'rgba(255,255,255,0.03)', color: '#e8dcc8', fontSize: '14px', marginBottom: '12px', fontFamily: 'Georgia,serif', outline: 'none' }} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(200,169,110,0.2)', background: 'rgba(255,255,255,0.03)', color: '#e8dcc8', fontSize: '14px', marginBottom: '12px', fontFamily: 'Georgia,serif', outline: 'none' }} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(200,169,110,0.2)', background: 'rgba(255,255,255,0.03)', color: '#e8dcc8', fontSize: '14px', marginBottom: '8px', fontFamily: 'Georgia,serif', outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            {error && <p style={{ color: '#ff8a80', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'linear-gradient(135deg,#c8a96e,#9a7040)', color: '#0d0a06', fontSize: '15px', fontWeight: '700', cursor: 'pointer', border: 'none', fontFamily: 'Georgia,serif', marginBottom: '14px' }}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Start Rewriting →' : 'Sign In →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(232,220,200,0.4)', cursor: 'pointer' }} onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }}>
              {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up free"}
            </p>
          </>
        )}
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(232,220,200,0.4)', fontSize: '20px', cursor: 'pointer' }}>×</button>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function Home({ user, profile, refreshProfile }) {
  const [step, setStep] = useState(0)
  const [product, setProduct] = useState(null)
  const [goal, setGoal] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [mood, setMood] = useState(5)
  const [moment, setMoment] = useState(null)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [script, setScript] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [timer, setTimer] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loadMsg, setLoadMsg] = useState('')
  const [error, setError] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bonusCredits, setBonusCredits] = useState(0)
  const [musicVolume, setMusicVolume] = useState(0.18)
  const audioRef = useRef(null)
  const musicRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { if (profile) setStreak(profile.streak_count || 0) }, [profile])

  useEffect(() => {
    if (product?.id) setMusicVolume(MUSIC[product.id]?.volume || 0.18)
  }, [product])

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = musicVolume
  }, [musicVolume])

  const theme = getTheme(product?.id)
  const isHype = product?.id === 'hype'
  const activeGoal = goal === 'custom' ? customGoal : goal
  const voices = VOICES[isHype ? 'hype' : 'hypnosis']
  const currentMusic = product ? MUSIC[product.id] : null

  const moodEmoji = mood <= 2 ? '😔' : mood <= 4 ? '😕' : mood <= 6 ? '😐' : mood <= 8 ? '🙂' : '😄'
  const moodLabel = mood <= 2 ? 'Really struggling' : mood <= 4 ? 'Not great' : mood <= 6 ? 'Getting there' : mood <= 8 ? 'Pretty good' : 'Feeling amazing'

  async function startGenerate() {
    if (!user) { setShowAuth(true); return }
    if (!profile || profile.credits < (product?.credits || 1)) {
      setError('Not enough credits. Please top up to continue.'); return
    }
    setStep(5); setProgress(0); setError(''); setAudioUrl(null)
    try {
      setLoadMsg(isHype ? 'Building your battle speech... 💪' : 'Crafting your script...')
      setProgress(15)
      const scriptRes = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: activeGoal, productType: product.id, mood, moment, userId: user.id }),
      })
      const scriptData = await scriptRes.json()
      if (!scriptRes.ok) throw new Error(scriptData.error)
      setScript(scriptData.script)
      setProgress(55)
      setLoadMsg(isHype ? 'Generating your coach audio... 🔥' : 'Generating your audio...')
      setProgress(65)
      const audioRes = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scriptData.script, voiceId: selectedVoice.id, productType: product.id }),
      })
      if (!audioRes.ok) throw new Error('Audio generation failed')
      const blob = await audioRes.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setProgress(90)
      const saveRes = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, goal: activeGoal, productType: product.id, script: scriptData.script, audioUrl: url, voiceId: selectedVoice.id, mood, moment }),
      })
      const saveData = await saveRes.json()
      if (saveData.bonusCredits > 0) setBonusCredits(saveData.bonusCredits)
      if (saveData.streak) setStreak(saveData.streak)
      setProgress(100)
      refreshProfile()
      setStep(6)
    } catch (err) {
      setError(err.message)
      setStep(6)
    }
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (!playing) {
      audioRef.current.play()
      if (musicRef.current) {
        musicRef.current.volume = musicVolume
        musicRef.current.loop = true
        musicRef.current.play().catch(() => {})
      }
      setPlaying(true)
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    } else {
      audioRef.current.pause()
      if (musicRef.current) musicRef.current.pause()
      setPlaying(false)
      clearInterval(timerRef.current)
    }
  }

  function handleAudioEnd() {
    if (musicRef.current) {
      const startVol = musicRef.current.volume
      let vol = startVol
      const fadeOut = setInterval(() => {
        vol = Math.max(0, vol - 0.02)
        if (musicRef.current) musicRef.current.volume = vol
        if (vol <= 0) { clearInterval(fadeOut); if (musicRef.current) musicRef.current.pause() }
      }, 150)
    }
    setPlaying(false)
    clearInterval(timerRef.current)
  }

  function reset() {
    clearInterval(timerRef.current)
    if (audioRef.current) audioRef.current.pause()
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0 }
    setStep(0); setProduct(null); setGoal(''); setCustomGoal(''); setScript('')
    setPlaying(false); setTimer(0); setProgress(0); setMood(5)
    setMoment(null); setSelectedVoice(null); setAudioUrl(null); setError(''); setBonusCredits(0)
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <>
      <Head>
        <title>Rewrite Mode — Rewire your mind. Rewrite your reality.</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Personalised hypnosis, subliminal and hype audio. On demand." />
      </Head>

      <div style={{ minHeight: '100vh', background: theme.bg, color: '#e8dcc8', fontFamily: "'Palatino Linotype','Book Antiqua',Georgia,serif", overflow: 'hidden', transition: 'background 0.8s ease' }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes spinR{to{transform:rotate(-360deg)}}
          @keyframes pulseOrb{0%,100%{opacity:0.5}50%{opacity:0.85}}
          @keyframes hypePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
          button{cursor:pointer;border:none;background:none;font-family:inherit}
          input,textarea{font-family:inherit;outline:none}
          input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:6px;cursor:pointer}
          input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;cursor:pointer}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(200,169,110,0.25);border-radius:4px}
        `}</style>

        {/* Hidden audio elements */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd} />}
        {currentMusic && <audio ref={musicRef} src={currentMusic.url} loop preload="auto" />}

        {/* BG */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-25%', left: '-15%', width: '650px', height: '650px', borderRadius: '50%', background: `radial-gradient(circle,${theme.orb1} 0%,transparent 65%)`, filter: 'blur(70px)', animation: 'pulseOrb 7s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '550px', height: '550px', borderRadius: '50%', background: `radial-gradient(circle,${theme.orb2} 0%,transparent 65%)`, filter: 'blur(60px)', animation: 'pulseOrb 9s ease-in-out infinite 2s' }} />
        </div>

        {/* Nav */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '16px', letterSpacing: '0.1em', color: theme.accent, fontWeight: '600' }}>REWRITE MODE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {profile && (
              <>
                {streak > 0 && <div style={{ fontSize: '12px', color: 'rgba(232,220,200,0.5)' }}>🔥 {streak} day{streak !== 1 ? 's' : ''}</div>}
                <div style={{ fontSize: '13px', color: theme.accent, fontWeight: '600' }}>✦ {profile.credits} credits</div>
                <button onClick={() => window.location.href = '/dashboard'} style={{ fontSize: '12px', color: 'rgba(232,220,200,0.5)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>Dashboard</button>
              </>
            )}
            {!user && (
              <button onClick={() => setShowAuth(true)} style={{ fontSize: '13px', color: theme.accent, padding: '8px 16px', borderRadius: '10px', border: `1px solid ${theme.accent}44` }}>Sign In</button>
            )}
          </div>
        </div>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeUp 0.8s ease both' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.28em', color: theme.accent, marginBottom: '14px', fontFamily: 'monospace', opacity: 0.8 }}>✦  SUBCONSCIOUS REPROGRAMMING  ✦</div>
            <h1 style={{ fontSize: 'clamp(28px,6vw,48px)', fontWeight: '400', lineHeight: '1.13', letterSpacing: '-0.022em', marginBottom: '14px', background: `linear-gradient(135deg,#f5e4b0 0%,${theme.accent} 45%,#e8dcc8 75%,#f5e4b0 100%)`, backgroundSize: '300% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite' }}>
              Rewire your mind.<br />Rewrite your reality.
            </h1>
            <p style={{ color: 'rgba(232,220,200,0.42)', fontSize: '14px', lineHeight: '1.7' }}>
              Built on principles of neuroplasticity.<br />Your brain rewires through repetition and hypnotic suggestion.
            </p>
            {!user && (
              <div style={{ marginTop: '16px', display: 'inline-flex', gap: '8px', alignItems: 'center', padding: '8px 16px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'rgba(232,220,200,0.4)' }}>
                Thousands already in Rewrite Mode &nbsp;·&nbsp; Start free — 5 credits, no card
              </div>
            )}
          </div>

          {/* Step dots */}
          {step > 0 && step < 6 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ width: step >= i ? '24px' : '8px', height: '8px', borderRadius: '100px', background: step >= i ? theme.accent : 'rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          )}

          {/* STEP 0 */}
          {step === 0 && (
            <div style={{ animation: 'fadeUp 0.55s ease both' }}>
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: theme.accent, marginBottom: '16px', fontFamily: 'monospace' }}>WHAT ARE YOU READY TO REWRITE?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  {GOALS.map(g => (
                    <button key={g} onClick={() => setGoal(g)} style={{ padding: '10px 8px', borderRadius: '10px', fontSize: '13px', border: `1px solid ${goal === g ? theme.accent + '99' : 'rgba(255,255,255,0.08)'}`, background: goal === g ? theme.accent + '15' : 'rgba(255,255,255,0.02)', color: goal === g ? theme.accent : 'rgba(232,220,200,0.5)', transition: 'all 0.18s ease' }}>{g}</button>
                  ))}
                </div>
                <button onClick={() => setGoal('custom')} style={{ width: '100%', padding: '12px', borderRadius: '10px', textAlign: 'left', border: `1px solid ${goal === 'custom' ? theme.accent + '99' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(255,255,255,0.02)', color: 'rgba(232,220,200,0.4)', fontSize: '13px', marginBottom: '8px' }}>
                  ✍️  Something else — enter your intention...
                </button>
                {goal === 'custom' && (
                  <textarea autoFocus value={customGoal} onChange={e => setCustomGoal(e.target.value)} placeholder="Describe what you want to rewrite..."
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.accent}44`, background: 'rgba(255,255,255,0.03)', color: '#e8dcc8', fontSize: '14px', lineHeight: '1.65', resize: 'vertical', minHeight: '80px', marginBottom: '8px' }} />
                )}
              </div>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: theme.accent, marginBottom: '14px', fontFamily: 'monospace' }}>CHOOSE YOUR SESSION TYPE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {PRODUCTS.map(p => (
                    <button key={p.id} onClick={() => setProduct(p)} style={{ padding: '18px 16px', borderRadius: '14px', textAlign: 'left', border: `1px solid ${product?.id === p.id ? p.color + '99' : 'rgba(255,255,255,0.08)'}`, background: product?.id === p.id ? p.color + '12' : 'rgba(255,255,255,0.02)', transition: 'all 0.18s ease' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{p.emoji}</div>
                      <div style={{ fontSize: '14px', color: product?.id === p.id ? p.color : '#e8dcc8', fontWeight: '600', marginBottom: '3px' }}>{p.label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(232,220,200,0.4)', marginBottom: '6px', lineHeight: 1.4 }}>{p.desc}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(232,220,200,0.35)' }}>{p.duration}</span>
                        <span style={{ fontSize: '11px', color: p.color, background: p.color + '18', padding: '2px 8px', borderRadius: '100px' }}>✦ {p.credits} credit{p.credits > 1 ? 's' : ''}</span>
                        <span style={{ fontSize: '10px', color: 'rgba(232,220,200,0.25)' }}>🎵 {MUSIC[p.id]?.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => activeGoal.trim() && product && setStep(1)} disabled={!activeGoal.trim() || !product} style={{ width: '100%', padding: '17px', borderRadius: '13px', background: activeGoal.trim() && product ? theme.grad : 'rgba(255,255,255,0.04)', color: activeGoal.trim() && product ? (isHype ? '#fff' : '#0d0a06') : 'rgba(232,220,200,0.2)', fontSize: '15px', fontWeight: '700', transition: 'all 0.25s ease', marginBottom: '12px' }}>
                {activeGoal.trim() && product ? 'Next →' : 'Select your intention and session type'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(232,220,200,0.2)', lineHeight: 1.6 }}>Based on neuroplasticity — repetition strengthens neural pathways</p>
            </div>
          )}

          {/* STEP 1: MOOD */}
          {step === 1 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: theme.accent, marginBottom: '14px', fontFamily: 'monospace' }}>HOW ARE YOU FEELING RIGHT NOW?</div>
                <div style={{ fontSize: '52px', marginBottom: '10px' }}>{moodEmoji}</div>
                <div style={{ fontSize: '18px', color: theme.accent, marginBottom: '5px' }}>{moodLabel}</div>
                <div style={{ fontSize: '12px', color: 'rgba(232,220,200,0.38)' }}>Your script is calibrated to where you are</div>
              </div>
              <div style={{ padding: '22px 20px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.accent}22`, borderRadius: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(232,220,200,0.4)' }}>Really struggling</span>
                  <span style={{ fontSize: '22px', fontWeight: '800', color: theme.accent }}>{mood}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(232,220,200,0.4)' }}>Feeling amazing</span>
                </div>
                <style>{`input[type=range].ms{background:linear-gradient(to right,${theme.accent},${isHype ? '#ff6d00' : '#f5e4b0'})} input[type=range].ms::-webkit-slider-thumb{background:${theme.accent};border:2px solid #fff}`}</style>
                <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="ms" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(0)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${theme.accent}22`, color: 'rgba(232,220,200,0.4)', fontSize: '14px' }}>← Back</button>
                <button onClick={() => setStep(product?.id === 'hype' ? 2 : 3)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: theme.grad, color: isHype ? '#fff' : '#0d0a06', fontSize: '15px', fontWeight: '700' }}>Next →</button>
              </div>
            </div>
          )}

          {/* STEP 2: MOMENT (HYPE) */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: theme.accent, marginBottom: '12px', fontFamily: 'monospace' }}>WHAT ARE YOU ABOUT TO DO?</div>
                <p style={{ fontSize: '13px', color: 'rgba(232,220,200,0.42)' }}>Your script will be written for this exact moment.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '14px' }}>
                {MOMENTS.map(m => (
                  <button key={m.id} onClick={() => setMoment(m.id === moment ? null : m.id)} style={{ padding: '17px 12px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${moment === m.id ? theme.accent + '99' : theme.accent + '22'}`, background: moment === m.id ? theme.accent + '15' : 'rgba(255,255,255,0.02)', color: moment === m.id ? theme.accent : 'rgba(232,220,200,0.6)', transition: 'all 0.18s ease' }}>
                    <div style={{ fontSize: '24px', marginBottom: '7px' }}>{m.emoji}</div>
                    <div style={{ fontSize: '13px', fontWeight: moment === m.id ? '800' : '500' }}>{m.label}</div>
                  </button>
                ))}
                <button onClick={() => { setMoment(null); setStep(3) }} style={{ padding: '17px 12px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${theme.accent}15`, background: 'rgba(255,255,255,0.015)', color: 'rgba(232,220,200,0.35)', fontSize: '13px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '7px' }}>✨</div>Just hype me up
                </button>
              </div>
              {moment && <button onClick={() => setStep(3)} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: theme.grad, color: '#fff', fontSize: '15px', fontWeight: '800', marginBottom: '10px' }}>Next →</button>}
              <button onClick={() => setStep(1)} style={{ width: '100%', padding: '13px', borderRadius: '12px', border: `1px solid ${theme.accent}22`, color: 'rgba(232,220,200,0.4)', fontSize: '14px' }}>← Back</button>
            </div>
          )}

          {/* STEP 3: VOICE */}
          {step === 3 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: theme.accent, marginBottom: '12px', fontFamily: 'monospace' }}>CHOOSE YOUR VOICE</div>
                <p style={{ fontSize: '13px', color: 'rgba(232,220,200,0.42)' }}>This voice will guide your entire session.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {voices.map(v => (
                  <button key={v.id} onClick={() => setSelectedVoice(v)} style={{ padding: '18px 16px', borderRadius: '13px', textAlign: 'left', border: `1px solid ${selectedVoice?.id === v.id ? theme.accent + '99' : theme.accent + '22'}`, background: selectedVoice?.id === v.id ? theme.accent + '12' : 'rgba(255,255,255,0.02)', transition: 'all 0.18s ease' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{v.gender === 'female' ? '👩' : '👨'}</div>
                    <div style={{ fontSize: '15px', color: selectedVoice?.id === v.id ? theme.accent : '#e8dcc8', fontWeight: '600', marginBottom: '3px' }}>{v.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(232,220,200,0.4)' }}>{v.desc}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(product?.id === 'hype' ? 2 : 1)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${theme.accent}22`, color: 'rgba(232,220,200,0.4)', fontSize: '14px' }}>← Back</button>
                <button onClick={() => selectedVoice && setStep(4)} disabled={!selectedVoice} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: selectedVoice ? theme.grad : 'rgba(255,255,255,0.04)', color: selectedVoice ? (isHype ? '#fff' : '#0d0a06') : 'rgba(232,220,200,0.2)', fontSize: '15px', fontWeight: '700' }}>Next →</button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRM */}
          {step === 4 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: theme.accent, marginBottom: '12px', fontFamily: 'monospace' }}>YOUR SESSION</div>
              </div>
              <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.accent}22`, marginBottom: '20px' }}>
                {[
                  ['Intention', activeGoal],
                  ['Session', `${product?.emoji} ${product?.label}`],
                  ['Duration', product?.duration],
                  ['Voice', selectedVoice?.name],
                  ['Music', currentMusic?.label],
                  ['Mood', `${mood}/10`],
                  moment && ['Moment', MOMENTS.find(m => m.id === moment)?.label],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                    <span style={{ color: 'rgba(232,220,200,0.4)' }}>{k}</span>
                    <span style={{ color: '#e8dcc8' }}>{v}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${theme.accent}22`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(232,220,200,0.4)' }}>Cost</span>
                  <span style={{ color: theme.accent, fontWeight: '600' }}>✦ {product?.credits} credit{product?.credits > 1 ? 's' : ''}</span>
                </div>
                {profile && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(232,220,200,0.4)' }}>Your balance</span>
                    <span style={{ fontSize: '13px', color: 'rgba(232,220,200,0.6)' }}>✦ {profile.credits} credits</span>
                  </div>
                )}
              </div>
              {error && <p style={{ color: '#ff8a80', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(3)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${theme.accent}22`, color: 'rgba(232,220,200,0.4)', fontSize: '14px' }}>← Back</button>
                <button onClick={startGenerate} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: theme.grad, color: isHype ? '#fff' : '#0d0a06', fontSize: '15px', fontWeight: '800', animation: isHype ? 'hypePulse 1.8s ease-in-out infinite' : 'none' }}>
                  {user ? (isHype ? '🔥 GENERATE MY AUDIO' : '✦ Generate My Audio') : '✦ Sign Up Free & Generate'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: LOADING */}
          {step === 5 && (
            <div style={{ animation: 'fadeUp 0.5s ease both', textAlign: 'center', padding: '20px 0' }}>
              {isHype
                ? <div style={{ fontSize: '64px', marginBottom: '22px', animation: 'hypePulse 0.8s ease-in-out infinite' }}>🔥</div>
                : <div style={{ position: 'relative', width: '76px', height: '76px', margin: '0 auto 28px' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${theme.accent}33`, borderTopColor: theme.accent, animation: 'spin 1.5s linear infinite' }} />
                    <div style={{ position: 'absolute', inset: '11px', borderRadius: '50%', border: `1px solid ${theme.accent}22`, borderBottomColor: theme.accent + '88', animation: 'spinR 2.2s linear infinite' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✦</div>
                  </div>
              }
              <div style={{ fontSize: '17px', color: theme.accent, marginBottom: '8px' }}>{loadMsg}</div>
              <div style={{ fontSize: '13px', color: 'rgba(232,220,200,0.38)', marginBottom: '32px' }}>
                {progress < 55 ? 'Writing your personalised script...' : 'Converting to audio in your chosen voice...'}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '100px', height: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: theme.grad, borderRadius: '100px', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: '11px', color: theme.accent + '88', fontFamily: 'monospace' }}>{progress}%</div>
            </div>
          )}

          {/* STEP 6: RESULT */}
          {step === 6 && (
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>
              {bonusCredits > 0 && (
                <div style={{ padding: '14px', borderRadius: '12px', marginBottom: '16px', background: `${theme.accent}18`, border: `1px solid ${theme.accent}44`, textAlign: 'center', fontSize: '14px', color: theme.accent }}>
                  🎉 Streak bonus! +{bonusCredits} credits — {streak} day streak!
                </div>
              )}
              {error ? (
                <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                  <div style={{ fontSize: '14px', color: '#ff8a80', marginBottom: '12px' }}>{error}</div>
                  <button onClick={reset} style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#e8dcc8', fontSize: '13px' }}>Try Again</button>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{product?.emoji}</div>
                    <div style={{ fontSize: '19px', color: theme.accent, fontWeight: isHype ? '800' : '400', marginBottom: '5px' }}>Your {product?.label} is ready</div>
                    <div style={{ fontSize: '12px', color: 'rgba(232,220,200,0.35)' }}>
                      {selectedVoice?.name} · {currentMusic?.label} · Mood {mood}/10
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.028)', border: `1px solid ${theme.accent}22`, borderRadius: '15px', padding: '22px 24px', marginBottom: '14px', maxHeight: '220px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: theme.accent, marginBottom: '12px', fontFamily: 'monospace' }}>◆ YOUR SCRIPT</div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: '14px', lineHeight: '1.9', color: '#e8dcc8', whiteSpace: 'pre-wrap' }}>{script}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.022)', border: `1px solid ${theme.accent}18`, borderRadius: '13px', padding: '16px 20px', marginBottom: '12px' }}>
                    <Waveform active={playing} theme={theme} />
                    {playing && (
                      <>
                        <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', color: theme.accent + 'bb', fontFamily: 'monospace', marginBottom: '3px' }}>{fmt(timer)} — {isHype ? 'Coach session 💪' : 'Session in progress'}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(232,220,200,0.28)', fontStyle: 'italic' }}>
                            {isHype ? 'Feel it. Believe it. OWN it.' : 'Close your eyes. Breathe slowly. Let the words reach you.'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(232,220,200,0.3)', whiteSpace: 'nowrap' }}>🎵 Music</span>
                          <style>{`input[type=range].mv{background:linear-gradient(to right,${theme.accent},${theme.accent}44)} input[type=range].mv::-webkit-slider-thumb{background:${theme.accent};border:none;width:14px;height:14px}`}</style>
                          <input type="range" min="0" max="0.4" step="0.01" value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} className="mv" style={{ flex: 1, height: '3px' }} />
                          <span style={{ fontSize: '11px', color: 'rgba(232,220,200,0.3)', whiteSpace: 'nowrap' }}>{Math.round(musicVolume * 250)}%</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <button onClick={togglePlay} disabled={!audioUrl} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: audioUrl ? theme.grad : 'rgba(255,255,255,0.04)', color: isHype ? '#fff' : '#0d0a06', fontSize: '15px', fontWeight: '800', animation: !playing && isHype && audioUrl ? 'hypePulse 1.8s ease-in-out infinite' : 'none' }}>
                      {playing ? '⏸ Pause' : (isHype ? '🔥 PLAY AUDIO' : '▶ Play Audio')}
                    </button>
                    {audioUrl && (
                      <a href={audioUrl} download="rewrite-session.mp3" style={{ padding: '15px 16px', borderRadius: '12px', border: `1px solid ${theme.accent}44`, color: theme.accent, fontSize: '18px', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Download voice audio">⬇</a>
                    )}
                    <button onClick={reset} style={{ padding: '15px 16px', borderRadius: '12px', border: `1px solid ${theme.accent}22`, color: 'rgba(232,220,200,0.4)', fontSize: '14px' }}>↩</button>
                  </div>

                  <div style={{ padding: '13px 16px', borderRadius: '11px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${theme.accent}18`, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(232,220,200,0.5)' }}>
                      🔥 <strong style={{ color: theme.accent }}>{streak} day{streak !== 1 ? 's' : ''}</strong> in Rewrite Mode
                    </div>
                    {profile && <div style={{ fontSize: '13px', color: theme.accent }}>✦ {profile.credits} credits left</div>}
                  </div>

                  {(!profile || profile.plan === 'free') && (
                    <div style={{ padding: '16px 18px', borderRadius: '12px', border: `1px solid ${theme.accent}22`, background: `${theme.accent}05`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: theme.accent, marginBottom: '3px', fontWeight: '600' }}>💎 Go Pro — £14.99/month</div>
                        <div style={{ fontSize: '11px', color: 'rgba(232,220,200,0.35)', lineHeight: 1.6 }}>100 credits/mo · Save 50 sessions · Best value</div>
                      </div>
                      <button onClick={() => window.location.href = '/pricing'} style={{ padding: '9px 14px', borderRadius: '9px', background: theme.grad, color: isHype ? '#fff' : '#0d0a06', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: '700' }}>
                        Upgrade →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '48px', fontSize: '10px', color: 'rgba(232,220,200,0.12)', letterSpacing: '0.15em', fontFamily: 'monospace' }}>
            ✦  STAY IN REWRITE MODE  ✦
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); if (step === 4) startGenerate() }} />}
    </>
  )
}
