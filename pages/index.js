import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

// ─── MOBILE DETECTION ─────────────────────────────────────────────────
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

// ─── MUSIC TRACKS ─────────────────────────────────────────────────────
const MUSIC = {
  reset:      { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-calm.mp3.mp3',       volume: 0.18, label: 'Calm ambient' },
  sleep:      { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-sleep.mp3.mp3',      volume: 0.15, label: 'Sleep ambient' },
  subliminal: { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-subliminal.mp3.mp3', volume: 0.20, label: 'Subliminal ambient' },
  hype:       { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-hype.mp3.mp3',       volume: 0.22, label: 'Motivational' },
}

// ─── LOADING MESSAGES ─────────────────────────────────────────────────
const LOAD_MESSAGES = {
  reset: [
    'Analysing your intention and identifying the core belief to rewrite...',
    'Crafting your induction sequence using Ericksonian language patterns...',
    'Building your personalised suggestion phase...',
    'Layering embedded commands and future pacing into your script...',
    'This takes 60 to 90 seconds. Your subconscious is worth it.',
    'Almost ready. Something written just for you, right now.',
  ],
  sleep: [
    'Writing your induction sequence — guiding you into theta state...',
    'Building your deepener — progressive relaxation, body heaviness...',
    'Crafting your therapeutic suggestion phase...',
    'Writing your subliminal affirmation layer...',
    'Your brain will continue rewiring as you sleep. Almost ready.',
    'This one takes a little longer. It is worth the wait.',
  ],
  subliminal: [
    'Identifying the core beliefs to overwrite...',
    'Writing 60 identity-level affirmations calibrated to your intention...',
    'Structuring your 30-minute subconscious reprogramming session...',
    'Layering affirmations for maximum repetition and variation...',
    'This takes a little longer. Your session is being built properly.',
    'Almost ready. 30 minutes of subconscious rewiring incoming.',
  ],
  hype: [
    'Analysing what is holding you back right now...',
    'Building your identity activation sequence...',
    'Crafting language designed to cut through resistance...',
    'Layering NLP techniques for rapid state change...',
    'This takes 60 to 90 seconds. Get ready.',
    'Almost there. Your coach is warming up.',
  ],
}

// ─── VOICES ───────────────────────────────────────────────────────────
const VOICES = {
  hypnosis: [
    { id: 'TKePFuDtAVp14EppI8GC', name: 'Emily',  gender: 'female', desc: 'Warm and grounding',  preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Emily_Sample.mp3' },
    { id: 'xGDJhCwcqw94ypljc95Z', name: 'Callum', gender: 'male',   desc: 'Calm and measured',   preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice2_Sample.mp3' },
    { id: 'KH1SQLVulwP6uG4O3nmT', name: 'River',  gender: 'male',   desc: 'Deep and soothing',   preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice3_Sample.mp3' },
    { id: 'OOk3INdXVLRmSaQoAX9D', name: 'Serena', gender: 'female', desc: 'Soft and serene',      preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice4_Sample.mp3' },
  ],
  hype: [
    { id: 'VlUmeC1Uzj3NnwiVR9K9', name: 'Ace',   gender: 'male',   desc: 'Sharp and direct',     preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Coach1_Sample.mp3' },
    { id: '85o4S4rAEvTIDGtpFNUq', name: 'Blaze', gender: 'male',   desc: 'Bold and high energy', preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Coach2_Sample.mp3' },
    { id: '5IDurXorjffl4cXSosCI', name: 'Nova',  gender: 'female', desc: 'Fierce and powerful',  preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Coach3_Sample.mp3' },
    { id: 'ZF6FPAbjXT4488VcRRnw', name: 'Storm', gender: 'female', desc: 'Commanding and fierce', preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Coach4_Sample.mp3' },
  ],
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'reset', label: 'Reset Hypnosis', emoji: '🧠', duration: '5 min', credits: 1,
    desc: 'Induction · Deepener · Suggestion · Release',
    color: '#00d4ff', colorB: '#0088cc',
    grad: 'linear-gradient(135deg,#00d4ff,#0066aa)',
    glow: 'rgba(0,212,255,0.25)',
    waveA: '#0066aa', waveB: '#00d4ff',
  },
  {
    id: 'sleep', label: 'Sleep Hypnosis', emoji: '🌙', duration: '15 min', credits: 3,
    desc: 'Induction · Deepener · Suggestion · Subliminal affirmations',
    color: '#a855f7', colorB: '#7c3aed',
    grad: 'linear-gradient(135deg,#a855f7,#6d28d9)',
    glow: 'rgba(168,85,247,0.25)',
    waveA: '#6d28d9', waveB: '#a855f7',
  },
  {
    id: 'subliminal', label: 'Subliminal', emoji: '🌊', duration: '30 min', credits: 3,
    desc: 'Identity-level suggestions layered under music',
    color: '#00ff88', colorB: '#00cc66',
    grad: 'linear-gradient(135deg,#00ff88,#00aa55)',
    glow: 'rgba(0,255,136,0.25)',
    waveA: '#00aa55', waveB: '#00ff88',
  },
  {
    id: 'hype', label: 'Hype Coach', emoji: '🔥', duration: '5 min', credits: 1,
    desc: 'NLP state change · Identity activation · Performance priming',
    color: '#60a5fa', colorB: '#a855f7',
    grad: 'linear-gradient(135deg,#3b82f6,#a855f7)',
    glow: 'rgba(96,165,250,0.25)',
    waveA: '#3b82f6', waveB: '#a855f7',
  },
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
  { id: 'launch',  emoji: '🚀', label: 'Launch or presentation' },
]

const BASE = {
  bg: '#050a14',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8f4ff',
  textMuted: 'rgba(232,244,255,0.45)',
  textFaint: 'rgba(232,244,255,0.2)',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png.png'

// ─── WAVEFORM ─────────────────────────────────────────────────────────
function Waveform({ active, product }) {
  const [heights, setHeights] = useState(Array(32).fill(5))
  useEffect(() => {
    if (!active) { setHeights(Array(32).fill(5)); return }
    const iv = setInterval(() => {
      setHeights(Array(32).fill(0).map((_, i) => 6 + Math.abs(Math.sin(Date.now() * 0.003 + i * 0.5)) * 28 + Math.random() * 8))
    }, 110)
    return () => clearInterval(iv)
  }, [active])
  const p = product || PRODUCTS[0]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', height: '54px' }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: '3px', borderRadius: '2px', height: `${h}px`, background: `linear-gradient(to top,${p.waveA},${p.waveB})`, transition: 'height 0.11s ease', opacity: active ? 0.9 : 0.2 }} />
      ))}
    </div>
  )
}

// ─── VOICE CARD ────────────────────────────────────────────────────────
function VoiceCard({ voice, selected, onSelect, theme }) {
  const audioRef = useRef(null)
  const [previewing, setPreviewing] = useState(false)

  function togglePreview(e) {
    e.stopPropagation()
    if (!audioRef.current) return
    if (previewing) {
      audioRef.current.pause(); audioRef.current.currentTime = 0; setPreviewing(false)
    } else {
      audioRef.current.play(); setPreviewing(true)
    }
  }

  return (
    <div onClick={onSelect} style={{ padding: '18px 16px', borderRadius: '14px', textAlign: 'left', border: `1px solid ${selected ? theme.color + 'cc' : BASE.border}`, background: selected ? theme.color + '12' : BASE.bgCard, transition: 'all 0.2s ease', boxShadow: selected ? `0 0 22px ${theme.glow}` : 'none', cursor: 'pointer' }}>
      <audio ref={audioRef} src={voice.preview} onEnded={() => setPreviewing(false)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '22px' }}>{voice.gender === 'female' ? '👩' : '👨'}</div>
        <button onClick={togglePreview} style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', border: `1px solid ${theme.color}55`, background: previewing ? theme.color + '25' : 'transparent', color: theme.color, cursor: 'pointer', letterSpacing: '0.03em' }}>
          {previewing ? '⏹ Stop' : '▶ Preview'}
        </button>
      </div>
      <div style={{ fontSize: '15px', color: selected ? theme.color : BASE.text, fontWeight: '700', marginBottom: '3px' }}>{voice.name}</div>
      <div style={{ fontSize: '12px', color: BASE.textMuted, marginBottom: '6px' }}>{voice.desc}</div>
      <div style={{ fontSize: '10px', color: BASE.textFaint }}>Free preview · ~15 sec</div>
      {previewing && (
        <div style={{ height: '2px', borderRadius: '2px', background: `${theme.color}25`, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg,transparent,${theme.color},transparent)`, animation: 'shimmer 1.5s linear infinite', backgroundSize: '200% auto' }} />
        </div>
      )}
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
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) setError(error.message)
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email address first.'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) setError(error.message)
    else setError(''); setSuccess(true); setSuccessMsg('Password reset email sent. Check your inbox.')
    setLoading(false)
  }

  async function handleSubmit() {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (error) setError(error.message)
      else if (data.session) {
        // Auto-signed in (email confirmation off)
        onSuccess()
      } else {
        setSuccess(true)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onSuccess()
    }
    setLoading(false)
  }

  const inp = { width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.04)', color: BASE.text, fontSize: '14px', marginBottom: '12px', fontFamily: 'inherit', outline: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'linear-gradient(145deg,#0a1628,#060e1c)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 0 60px rgba(0,150,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src={LOGO} alt="RewireMode" style={{ height: '50px', marginBottom: '16px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => { e.target.style.display='none' }} />
          <h2 style={{ fontSize: '21px', color: '#00d4ff', fontWeight: '700', marginBottom: '6px' }}>
            {mode === 'signup' ? 'Start rewiring your mind' : 'Welcome back'}
          </h2>
          {mode === 'signup' && <p style={{ fontSize: '13px', color: BASE.textMuted }}>5 free credits. No card needed. Generated for you in real time.</p>}
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', marginBottom: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>✦</div>
              <p style={{ color: '#00d4ff', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>{successMsg || 'Account created.'}</p>
              <p style={{ color: BASE.textMuted, fontSize: '13px', lineHeight: 1.6 }}>Check your email, then sign in below.</p>
            </div>
            <button onClick={() => { setSuccess(false); setMode('signin') }} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: '#050a14', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
              Sign In Now →
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign In */}
            <button onClick={handleGoogleSignIn} style={{ width: '100%', padding: '13px', borderRadius: '12px', border: `1px solid ${BASE.border}`, background: 'rgba(255,255,255,0.04)', color: BASE.text, fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: BASE.border }} />
              <span style={{ fontSize: '12px', color: BASE.textFaint }}>or</span>
              <div style={{ flex: 1, height: '1px', background: BASE.border }} />
            </div>

            {mode === 'signup' && <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp} />}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={inp} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)" type="password" style={{ ...inp, marginBottom: '4px' }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            {mode === 'signin' && (
              <p onClick={handleForgotPassword} style={{ fontSize: '12px', color: '#00d4ff', cursor: 'pointer', textAlign: 'right', marginBottom: '12px' }}>Forgot password?</p>
            )}
            {error && <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: '#050a14', fontSize: '15px', fontWeight: '700', cursor: 'pointer', border: 'none', marginBottom: '14px', letterSpacing: '0.02em' }}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create My Account →' : 'Sign In →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: BASE.textMuted, cursor: 'pointer' }} onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }}>
              {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up free"}
            </p>
          </>
        )}
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: BASE.textMuted, fontSize: '22px', cursor: 'pointer' }}>×</button>
      </div>
    </div>
  )
}

// ─── CREDITS MODAL ────────────────────────────────────────────────────
function CreditsModal({ profile, user, onClose }) {
  const [loading, setLoading] = useState(null)

  async function checkout(productKey) {
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'linear-gradient(145deg,#0a1628,#060e1c)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', position: 'relative', boxShadow: '0 0 60px rgba(0,150,255,0.1)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: BASE.textMuted, fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>✦</div>
          <h2 style={{ fontSize: '20px', color: '#00d4ff', fontWeight: '700', marginBottom: '6px' }}>Top up your credits</h2>
          <p style={{ fontSize: '13px', color: BASE.textMuted }}>You have <strong style={{ color: '#00d4ff' }}>{profile?.credits || 0} credits</strong> remaining</p>
        </div>

        {(!profile || profile.plan === 'free') && (
          <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', color: '#a855f7', fontWeight: '700', marginBottom: '5px' }}>💎 The smart choice — Go Pro</div>
            <div style={{ fontSize: '13px', color: BASE.textMuted, marginBottom: '4px', lineHeight: 1.6 }}>100 credits a month for £14.99. Daily sessions for less than the price of one coffee a week.</div>
            <div style={{ fontSize: '12px', color: BASE.textFaint, marginBottom: '14px' }}>Most people who try RewireMode once, want it every day.</div>
            <a href="/pricing" onClick={onClose} style={{ display: 'block', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#a855f7,#6d28d9)', color: '#fff', fontSize: '14px', fontWeight: '700', textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 16px rgba(168,85,247,0.3)' }}>
              Upgrade to Pro →
            </a>
          </div>
        )}

        <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: BASE.textMuted, marginBottom: '12px', fontWeight: '600' }}>OR BUY CREDITS</div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {[
            { key: 'credits_10',  label: '10 Credits', price: '£5',  per: '50p each' },
            { key: 'credits_50',  label: '50 Credits', price: '£15', per: '30p each' },
            { key: 'credits_100', label: '100 Credits', price: '£25', per: '25p each — best value' },
          ].map(c => (
            <button key={c.key} onClick={() => checkout(c.key)} disabled={loading === c.key}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.04)', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', color: BASE.text, fontWeight: '700' }}>{c.label}</div>
                <div style={{ fontSize: '12px', color: BASE.textFaint }}>{c.per}</div>
              </div>
              <div style={{ fontSize: '18px', color: '#00d4ff', fontWeight: '800' }}>{loading === c.key ? '...' : c.price}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function Home({ user, profile, refreshProfile }) {
  const isMobile = useIsMobile()
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
  const [loadMsgIndex, setLoadMsgIndex] = useState(0)
  const [error, setError] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [saveLimitHit, setSaveLimitHit] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bonusCredits, setBonusCredits] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [musicVolume, setMusicVolume] = useState(0.18)
  const audioRef = useRef(null)
  const musicRef = useRef(null)
  const timerRef = useRef(null)
  const loadMsgRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => { if (profile) setStreak(profile.streak_count || 0) }, [profile])
  useEffect(() => { if (product?.id) setMusicVolume(MUSIC[product.id]?.volume || 0.18) }, [product])
  useEffect(() => { if (musicRef.current) musicRef.current.volume = musicVolume }, [musicVolume])

  const p = product || PRODUCTS[0]
  const isHype = product?.id === 'hype'
  const activeGoal = goal === 'custom' ? customGoal : goal
  const voices = VOICES[isHype ? 'hype' : 'hypnosis']
  const currentMusic = product ? MUSIC[product.id] : null
  const loadMessages = LOAD_MESSAGES[product?.id] || LOAD_MESSAGES.reset
  const currentLoadMsg = loadMessages[loadMsgIndex] || loadMessages[0]

  const moodEmoji = mood <= 2 ? '😔' : mood <= 4 ? '😕' : mood <= 6 ? '😐' : mood <= 8 ? '🙂' : '😄'
  const moodLabel = mood <= 2 ? 'Really struggling' : mood <= 4 ? 'Not great' : mood <= 6 ? 'Getting there' : mood <= 8 ? 'Pretty good' : 'Feeling amazing'

  async function startGenerate() {
    if (!user) { setShowAuth(true); return }
    if (!profile || profile.credits < (product?.credits || 1)) {
      setShowCredits(true); return
    }
    setStep(5); setProgress(0); setError(''); setAudioUrl(null); setLoadMsgIndex(0)

    // Smooth progress bar
    let prog = 0
    progressRef.current = setInterval(() => {
      prog += Math.random() * 1.2
      if (prog < 88) setProgress(Math.min(prog, 88))
    }, 400)

    // Rotating messages
    let msgIdx = 0
    loadMsgRef.current = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadMessages.length
      setLoadMsgIndex(msgIdx)
    }, 3500)

    try {
      const scriptRes = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: activeGoal, productType: product.id, mood, moment, userId: user.id, firstName: firstName.trim() || null }),
      })
      const scriptData = await scriptRes.json()
      if (!scriptRes.ok) throw new Error(scriptData.error)
      setScript(scriptData.script)

      const audioRes = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scriptData.script, voiceId: selectedVoice.id, productType: product.id }),
      })
      if (!audioRes.ok) throw new Error('Audio generation failed')
      const blob = await audioRes.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      const saveRes = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, goal: activeGoal, productType: product.id, script: scriptData.script, audioUrl: url, voiceId: selectedVoice.id, mood, moment }),
      })
      const saveData = await saveRes.json()
      if (saveData.bonusCredits > 0) setBonusCredits(saveData.bonusCredits)
      if (saveData.streak) setStreak(saveData.streak)
      // Session limit reached is non-fatal — audio still plays, just not saved
      if (saveRes.status === 403) setSaveLimitHit(true)

      clearInterval(progressRef.current)
      clearInterval(loadMsgRef.current)
      setProgress(100)
      refreshProfile()
      setTimeout(() => setStep(6), 400)
    } catch (err) {
      clearInterval(progressRef.current)
      clearInterval(loadMsgRef.current)
      setError(err.message)
      setStep(6)
    }
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (!playing) {
      audioRef.current.play()
      if (musicRef.current) { musicRef.current.volume = musicVolume; musicRef.current.loop = true; musicRef.current.play().catch(() => {}) }
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
      let vol = musicRef.current.volume
      const fade = setInterval(() => {
        vol = Math.max(0, vol - 0.02)
        if (musicRef.current) musicRef.current.volume = vol
        if (vol <= 0) { clearInterval(fade); if (musicRef.current) musicRef.current.pause() }
      }, 150)
    }
    setPlaying(false); clearInterval(timerRef.current)
  }

  function reset() {
    clearInterval(timerRef.current); clearInterval(progressRef.current); clearInterval(loadMsgRef.current)
    if (audioRef.current) audioRef.current.pause()
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0 }
    setStep(0); setProduct(null); setGoal(''); setCustomGoal(''); setScript(''); setFirstName('')
    setPlaying(false); setTimer(0); setProgress(0); setMood(5)
    setMoment(null); setSelectedVoice(null); setAudioUrl(null); setError(''); setBonusCredits(0); setLoadMsgIndex(0); setSaveLimitHit(false); setFirstName('')
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <>
      <Head>
        <title>RewireMode — The world's first AI hypnosis platform built by a qualified hypnotherapist</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Personalised hypnosis, subliminal and performance audio generated in real time. Built by a qualified hypnotherapist." />
      </Head>

      <div style={{ minHeight: '100vh', background: BASE.bg, color: BASE.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", overflow: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes spinR{to{transform:rotate(-360deg)}}
          @keyframes pulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.08);opacity:1}}
          @keyframes hypePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
          @keyframes fadeMsg{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
          button{cursor:pointer;border:none;background:none;font-family:inherit}
          input,textarea{font-family:inherit;outline:none}
          input[type=range]{-webkit-appearance:none;width:100%;height:5px;border-radius:5px;cursor:pointer}
          input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;cursor:pointer}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:4px}
        `}</style>

        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd} />}
        {currentMusic && <audio ref={musicRef} src={currentMusic.url} loop preload="auto" />}

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,150,255,0.08) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,50,220,0.08) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 10s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', top: '40%', left: '60%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,220,100,0.05) 0%,transparent 65%)', filter: 'blur(50px)', animation: 'pulse 6s ease-in-out infinite 1s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,150,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,150,255,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(0,212,255,0.08)', backdropFilter: 'blur(10px)', background: 'rgba(5,10,20,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px 16px 0', gap: '8px', flexWrap: 'wrap' }}>
            {profile && (
              <>
                {streak > 0 && <div style={{ fontSize: '12px', color: BASE.textMuted }}>🔥 {streak} day{streak !== 1 ? 's' : ''}</div>}
                <div onClick={() => setShowCredits(true)} style={{ fontSize: '13px', color: '#00d4ff', fontWeight: '600', padding: '5px 12px', borderRadius: '100px', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.06)', cursor: 'pointer' }}>✦ {profile.credits} credits</div>
                <button onClick={() => window.location.href = '/dashboard'} style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 12px', borderRadius: '8px', border: `1px solid ${BASE.border}` }}>Dashboard</button>
              </>
            )}
            <a href="/faq" style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 12px', borderRadius: '8px', border: `1px solid ${BASE.border}`, textDecoration: 'none' }}>FAQ</a>
            {!user && <button onClick={() => setShowAuth(true)} style={{ fontSize: '13px', color: '#00d4ff', padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.06)', fontWeight: '600' }}>Sign In</button>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 24px 10px' }}>
            <img src={LOGO} alt="RewireMode" style={{ height: isMobile ? '80px' : '120px', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'lighten' }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
            <span style={{ display: 'none', fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>REWIRE MODE</span>
          </div>
        </nav>

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '44px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '44px', animation: 'fadeUp 0.8s ease both' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 20px', borderRadius: '100px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.06)', fontSize: '11px', letterSpacing: '0.15em', color: '#00d4ff', marginBottom: '20px', fontWeight: '600', textAlign: 'center' }}>
              <span>◈ THE WORLD'S FIRST AI HYPNOSIS AND SUBLIMINAL PLATFORM ◈</span>
              <span>BUILT BY A QUALIFIED HYPNOTHERAPIST</span>
            </div>
            <h1 style={{ fontSize: 'clamp(26px,5.5vw,44px)', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '16px', background: 'linear-gradient(135deg,#ffffff 0%,#00d4ff 35%,#00ff88 65%,#a855f7 100%)', backgroundSize: '300% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 5s linear infinite' }}>
              Rewire your mind.<br />Rewrite your reality.
            </h1>
            <p style={{ color: BASE.textMuted, fontSize: '15px', lineHeight: '1.75', maxWidth: '500px', margin: '0 auto 16px' }}>
              Not a meditation app. Not a wellness app.<br />
              Clinical-grade subconscious reprogramming, generated in real time for you.
            </p>
            {!user && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BASE.border}`, fontSize: '12px', color: BASE.textMuted }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', display: 'inline-block', boxShadow: '0 0 8px #00ff88' }} />
                Start free — 5 credits, no card required
              </div>
            )}
          </div>

          {/* Science strip */}
          {step === 0 && (
            <div style={{ padding: '20px 22px', borderRadius: '14px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', marginBottom: '36px', animation: 'fadeUp 0.8s ease 0.1s both' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#00d4ff', fontWeight: '700', marginBottom: '10px' }}>THE SCIENCE</div>
              <p style={{ fontSize: '13px', color: BASE.textMuted, lineHeight: '1.75' }}>
                During hypnosis, your brain enters theta state — the same brainwave frequency present during deep sleep. In this state, the critical faculty quiets and the subconscious becomes receptive. New neural pathways form. Old beliefs dissolve. This is neuroplasticity, and it is how RewireMode creates lasting change, not just temporary relief.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {['Milton Model', 'Ericksonian Hypnotherapy', 'NLP', 'Neuroplasticity', 'Somatic Anchoring'].map(tag => (
                  <span key={tag} style={{ fontSize: '11px', color: '#00d4ff', background: 'rgba(0,212,255,0.08)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(0,212,255,0.15)', fontWeight: '600' }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Step dots */}
          {step > 0 && step < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ width: step >= i ? '24px' : '8px', height: '8px', borderRadius: '100px', background: step >= i ? p.grad : BASE.border, transition: 'all 0.3s ease', boxShadow: step >= i ? `0 0 8px ${p.color}66` : 'none' }} />
              ))}
            </div>
          )}

          {/* ── STEP 0: SELECT ── */}
          {step === 0 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, marginBottom: '14px', fontWeight: '600' }}>WHAT ARE YOU READY TO REWRITE?</div>

                {/* Optional name field */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '12px 16px', borderRadius: '10px', background: BASE.bgCard, border: `1px solid ${BASE.border}` }}>
                  <span style={{ fontSize: '16px' }}>👤</span>
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Your first name (optional — we'll weave it into your script)"
                    style={{ flex: 1, background: 'none', border: 'none', color: BASE.text, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  {GOALS.map(g => (
                    <button key={g} onClick={() => setGoal(g)}
                      style={{ padding: '11px 8px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: `1px solid ${goal === g ? '#00d4ffcc' : BASE.border}`, background: goal === g ? 'rgba(0,212,255,0.15)' : BASE.bgCard, color: goal === g ? '#00d4ff' : BASE.textMuted, transition: 'all 0.18s ease', boxShadow: goal === g ? '0 0 16px rgba(0,212,255,0.2)' : 'none' }}>
                      {g}
                    </button>
                  ))}
                </div>
                <button onClick={() => setGoal('custom')}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', textAlign: 'left', border: `1px solid ${goal === 'custom' ? '#00d4ffcc' : BASE.border}`, background: goal === 'custom' ? 'rgba(0,212,255,0.08)' : BASE.bgCard, color: goal === 'custom' ? '#00d4ff' : BASE.textMuted, fontSize: '13px', marginBottom: '8px' }}>
                  ✍️ Something else — enter your intention...
                </button>
                {goal === 'custom' && (
                  <textarea autoFocus value={customGoal} onChange={e => setCustomGoal(e.target.value)} placeholder="Describe what you want to rewrite..."
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.04)', color: BASE.text, fontSize: '14px', lineHeight: '1.65', resize: 'vertical', minHeight: '80px', marginBottom: '8px' }} />
                )}
              </div>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, marginBottom: '14px', fontWeight: '600' }}>CHOOSE YOUR SESSION TYPE</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  {PRODUCTS.map(pr => (
                    <button key={pr.id} onClick={() => setProduct(pr)}
                      style={{ padding: '20px 18px', borderRadius: '16px', textAlign: 'left', border: `1px solid ${product?.id === pr.id ? pr.color + 'cc' : BASE.border}`, background: product?.id === pr.id ? pr.color + '12' : BASE.bgCard, transition: 'all 0.2s ease', boxShadow: product?.id === pr.id ? `0 0 28px ${pr.glow}` : 'none' }}>
                      <div style={{ fontSize: '26px', marginBottom: '10px' }}>{pr.emoji}</div>
                      <div style={{ fontSize: '14px', color: product?.id === pr.id ? pr.color : BASE.text, fontWeight: '700', marginBottom: '5px' }}>{pr.label}</div>
                      <div style={{ fontSize: '11px', color: BASE.textMuted, marginBottom: '10px', lineHeight: 1.5 }}>{pr.desc}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: BASE.textFaint }}>{pr.duration}</span>
                        <span style={{ fontSize: '11px', color: pr.color, background: pr.color + '18', padding: '2px 10px', borderRadius: '100px', fontWeight: '600' }}>✦ {pr.credits} credit{pr.credits > 1 ? 's' : ''}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => activeGoal.trim() && product && setStep(1)} disabled={!activeGoal.trim() || !product}
                style={{ width: '100%', padding: '17px', borderRadius: '14px', background: activeGoal.trim() && product ? p.grad : 'rgba(255,255,255,0.05)', color: activeGoal.trim() && product ? '#050a14' : BASE.textFaint, fontSize: '15px', fontWeight: '700', transition: 'all 0.25s ease', marginBottom: '14px', letterSpacing: '0.02em', boxShadow: activeGoal.trim() && product ? `0 4px 24px ${p.glow}` : 'none' }}>
                {activeGoal.trim() && product ? 'Next →' : 'Select your intention and session type'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: BASE.textFaint }}>
                <a href="/faq" style={{ color: BASE.textFaint, textDecoration: 'none' }}>How does it work?</a>
                <span>·</span>
                <a href="/pricing" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Pricing</a>
                <span>·</span>
                <span>Built by a qualified hypnotherapist</span>
              </div>
            </div>
          )}

          {/* ── STEP 1: MOOD ── */}
          {step === 1 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, marginBottom: '14px', fontWeight: '600' }}>HOW ARE YOU FEELING RIGHT NOW?</div>
                <div style={{ fontSize: '54px', marginBottom: '10px' }}>{moodEmoji}</div>
                <div style={{ fontSize: '19px', color: p.color, fontWeight: '700', marginBottom: '5px' }}>{moodLabel}</div>
                <div style={{ fontSize: '13px', color: BASE.textMuted }}>Your script is calibrated to meet you where you are</div>
              </div>
              <div style={{ padding: '24px', background: BASE.bgCard, border: `1px solid ${p.color}22`, borderRadius: '16px', marginBottom: '20px', boxShadow: `0 0 20px ${p.glow}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: BASE.textMuted }}>Really struggling</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: p.color, textShadow: `0 0 20px ${p.color}` }}>{mood}</span>
                  <span style={{ fontSize: '12px', color: BASE.textMuted }}>Feeling amazing</span>
                </div>
                <style>{`input[type=range].ms{background:linear-gradient(to right,${p.color},${p.colorB}44)} input[type=range].ms::-webkit-slider-thumb{background:${p.color};border:2px solid #fff;box-shadow:0 0 10px ${p.color}}`}</style>
                <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="ms" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(0)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={() => setStep(product?.id === 'hype' ? 2 : 2.5)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#050a14', fontSize: '15px', fontWeight: '700', boxShadow: `0 4px 20px ${p.glow}` }}>Next →</button>
              </div>
            </div>
          )}

          {/* ── STEP 2.5: FIRST NAME (OPTIONAL) ── */}
          {step === 2.5 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, marginBottom: '12px', fontWeight: '600' }}>MAKE IT PERSONAL</div>
                <p style={{ fontSize: '15px', color: BASE.text, fontWeight: '600', marginBottom: '8px' }}>What's your first name?</p>
                <p style={{ fontSize: '13px', color: BASE.textMuted, lineHeight: 1.6 }}>Optional. If you share it, your name will be woven naturally into your session.</p>
              </div>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Your first name (optional)"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && setStep(product?.id === 'hype' ? 2 : 3)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${p.color}33`, background: 'rgba(255,255,255,0.03)', color: BASE.text, fontSize: '16px', marginBottom: '20px', textAlign: 'center', letterSpacing: '0.02em' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={() => setStep(product?.id === 'hype' ? 2 : 3)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#050a14', fontSize: '15px', fontWeight: '700', boxShadow: `0 4px 20px ${p.glow}` }}>
                  {firstName.trim() ? `Continue as ${firstName.trim()} →` : 'Skip →'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: MOMENT (HYPE) ── */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, marginBottom: '12px', fontWeight: '600' }}>WHAT ARE YOU ABOUT TO DO?</div>
                <p style={{ fontSize: '13px', color: BASE.textMuted }}>Your session will be written for this exact moment.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {MOMENTS.map(m => (
                  <button key={m.id} onClick={() => setMoment(m.id === moment ? null : m.id)}
                    style={{ padding: '18px 12px', borderRadius: '13px', textAlign: 'center', border: `1px solid ${moment === m.id ? p.color + 'cc' : BASE.border}`, background: moment === m.id ? p.color + '12' : BASE.bgCard, color: moment === m.id ? p.color : BASE.textMuted, transition: 'all 0.18s ease', boxShadow: moment === m.id ? `0 0 20px ${p.glow}` : 'none' }}>
                    <div style={{ fontSize: '26px', marginBottom: '8px' }}>{m.emoji}</div>
                    <div style={{ fontSize: '13px', fontWeight: moment === m.id ? '700' : '500' }}>{m.label}</div>
                  </button>
                ))}
                <button onClick={() => { setMoment(null); setStep(3) }}
                  style={{ padding: '18px 12px', borderRadius: '13px', textAlign: 'center', border: `1px solid ${BASE.border}`, background: BASE.bgCard, color: BASE.textFaint, fontSize: '13px' }}>
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>✨</div>Just hype me up
                </button>
              </div>
              {moment && <button onClick={() => setStep(3)} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: p.grad, color: '#050a14', fontSize: '15px', fontWeight: '800', marginBottom: '10px', boxShadow: `0 4px 20px ${p.glow}` }}>Next →</button>}
              <button onClick={() => setStep(2.5)} style={{ width: '100%', padding: '13px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>← Back</button>
            </div>
          )}

          {/* ── STEP 3: VOICE ── */}
          {step === 3 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, marginBottom: '12px', fontWeight: '600' }}>CHOOSE YOUR VOICE</div>
                <p style={{ fontSize: '13px', color: BASE.textMuted }}>Preview each voice before you choose. This voice guides your entire session.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {voices.map(v => (
                  <VoiceCard key={v.id} voice={v} selected={selectedVoice?.id === v.id} onSelect={() => setSelectedVoice(v)} theme={p} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(product?.id === 'hype' ? 2 : 2.5)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={() => selectedVoice && setStep(4)} disabled={!selectedVoice}
                  style={{ flex: 1, padding: '15px', borderRadius: '12px', background: selectedVoice ? p.grad : 'rgba(255,255,255,0.05)', color: selectedVoice ? '#050a14' : BASE.textFaint, fontSize: '15px', fontWeight: '700', boxShadow: selectedVoice ? `0 4px 20px ${p.glow}` : 'none' }}>Next →</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: CONFIRM ── */}
          {step === 4 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, fontWeight: '600' }}>YOUR SESSION</div>
              </div>
              <div style={{ padding: '24px', borderRadius: '18px', background: BASE.bgCard, border: `1px solid ${p.color}33`, marginBottom: '20px', boxShadow: `0 0 30px ${p.glow}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${BASE.border}` }}>
                  <div style={{ fontSize: '32px' }}>{product?.emoji}</div>
                  <div>
                    <div style={{ fontSize: '16px', color: p.color, fontWeight: '700' }}>{product?.label}</div>
                    <div style={{ fontSize: '12px', color: BASE.textMuted }}>{product?.duration} · {MUSIC[product?.id]?.label}</div>
                  </div>
                </div>
                {[
                  ['Intention', activeGoal],
                  ['Voice', selectedVoice?.name],
                  ['Mood', `${mood}/10 — ${moodLabel}`],
                  moment && ['Moment', MOMENTS.find(m => m.id === moment)?.label],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                    <span style={{ color: BASE.textMuted }}>{k}</span>
                    <span style={{ color: BASE.text, fontWeight: '500' }}>{v}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${BASE.border}`, paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: BASE.textMuted }}>Cost <span style={{ fontSize: '11px', color: BASE.textFaint }}>(Reset/Hype = 1 credit · Sleep/Subliminal = 3)</span></span>
                  <span style={{ color: p.color, fontWeight: '700', fontSize: '15px' }}>✦ {product?.credits} credit{product?.credits > 1 ? 's' : ''}</span>
                </div>
                {profile && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: BASE.textMuted }}>Your balance</span>
                    <span style={{ fontSize: '12px', color: BASE.textMuted }}>✦ {profile.credits} remaining</span>
                  </div>
                )}
              </div>
              {error && <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(3)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={startGenerate}
                  style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#050a14', fontSize: '15px', fontWeight: '800', boxShadow: `0 4px 24px ${p.glow}`, animation: isHype ? 'hypePulse 1.8s ease-in-out infinite' : 'none', letterSpacing: '0.02em' }}>
                  {user ? (isHype ? '🔥 Generate My Audio' : '✦ Generate My Audio') : '✦ Sign Up Free and Generate'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: LOADING ── */}
          {step === 5 && (
            <div style={{ animation: 'fadeUp 0.5s ease both', textAlign: 'center', padding: '40px 0' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 32px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${p.color}33`, borderTopColor: p.color, animation: 'spin 1.4s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: `1px solid ${p.colorB}44`, borderBottomColor: p.colorB, animation: 'spinR 2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{product?.emoji}</div>
              </div>

              <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', overflow: 'hidden' }}>
                <div key={loadMsgIndex} style={{ fontSize: '15px', color: p.color, fontWeight: '600', animation: 'fadeMsg 3.5s ease both', maxWidth: '420px', lineHeight: 1.5, textAlign: 'center' }}>
                  {currentLoadMsg}
                </div>
              </div>

              <p style={{ fontSize: '12px', color: BASE.textFaint, marginBottom: '36px' }}>
                Your session is built fresh every time. This takes 60 to 90 seconds.
              </p>

              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '100px', height: '4px', overflow: 'hidden', marginBottom: '10px', maxWidth: '400px', margin: '0 auto 10px' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: p.grad, borderRadius: '100px', transition: 'width 0.8s ease', boxShadow: `0 0 10px ${p.color}` }} />
              </div>
              <div style={{ fontSize: '11px', color: BASE.textFaint, fontFamily: 'monospace' }}>{Math.round(progress)}%</div>
            </div>
          )}

          {/* ── STEP 6: RESULT ── */}
          {step === 6 && (
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>
              {bonusCredits > 0 && (
                <div style={{ padding: '14px', borderRadius: '12px', marginBottom: '16px', background: `${p.color}12`, border: `1px solid ${p.color}44`, textAlign: 'center', fontSize: '14px', color: p.color, fontWeight: '600' }}>
                  🎉 Streak bonus! +{bonusCredits} credits — {streak} day streak!
                </div>
              )}

              {error ? (
                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,80,80,0.2)', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚠️</div>
                  <div style={{ fontSize: '14px', color: '#ff8a80', marginBottom: '14px' }}>{error}</div>
                  <button onClick={reset} style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: BASE.text, fontSize: '13px', fontWeight: '600' }}>Try Again</button>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px', padding: '24px', borderRadius: '18px', background: p.color + '08', border: `1px solid ${p.color}33`, boxShadow: `0 0 40px ${p.glow}` }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{product?.emoji}</div>
                    <div style={{ fontSize: '20px', color: p.color, fontWeight: '800', marginBottom: '5px' }}>Your {product?.label} is ready</div>
                    <div style={{ fontSize: '12px', color: BASE.textMuted }}>{selectedVoice?.name} · {currentMusic?.label} · Mood {mood}/10</div>
                  </div>

                  <div style={{ background: BASE.bgCard, border: `1px solid ${BASE.border}`, borderRadius: '16px', padding: '22px 24px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: p.color, marginBottom: '12px', fontWeight: '600' }}>YOUR SCRIPT</div>
                    <div style={{ fontSize: '15px', lineHeight: '2', color: 'rgba(232,244,255,0.75)', whiteSpace: 'pre-wrap', fontFamily: "'Georgia',serif" }}>{script}</div>
                  </div>

                  <div style={{ background: BASE.bgCard, border: `1px solid ${p.color}22`, borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
                    <Waveform active={playing} product={product} />
                    {playing && (
                      <>
                        <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '14px' }}>
                          <div style={{ fontSize: '12px', color: p.color, fontFamily: 'monospace', marginBottom: '3px' }}>{fmt(timer)} — {isHype ? 'Performance priming in progress' : 'Session in progress'}</div>
                          <div style={{ fontSize: '11px', color: BASE.textFaint, fontStyle: 'italic' }}>
                            {isHype ? 'Feel it. Believe it. Own it.' : 'Close your eyes. Breathe slowly. Let the words reach you.'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: BASE.textFaint, whiteSpace: 'nowrap' }}>🎵 Music volume</span>
                          <style>{`input[type=range].mv{background:linear-gradient(to right,${p.color},${p.color}33)} input[type=range].mv::-webkit-slider-thumb{background:${p.color};border:none;width:14px;height:14px}`}</style>
                          <input type="range" min="0" max="0.4" step="0.01" value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} className="mv" style={{ flex: 1, height: '3px' }} />
                          <span style={{ fontSize: '11px', color: BASE.textFaint, whiteSpace: 'nowrap' }}>{Math.round(musicVolume * 250)}%</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                    <button onClick={togglePlay} disabled={!audioUrl}
                      style={{ flex: 1, padding: '15px', borderRadius: '12px', background: audioUrl ? p.grad : 'rgba(255,255,255,0.04)', color: '#050a14', fontSize: '15px', fontWeight: '800', boxShadow: audioUrl && !playing ? `0 4px 20px ${p.glow}` : 'none', animation: !playing && isHype && audioUrl ? 'hypePulse 1.8s ease-in-out infinite' : 'none' }}>
                      {playing ? '⏸ Pause' : (isHype ? '🔥 Play Audio' : '▶ Play Audio')}
                    </button>
                    {audioUrl && (
                      <a href={audioUrl} download="rewiremode-session.mp3"
                        style={{ padding: '15px 16px', borderRadius: '12px', border: `1px solid ${p.color}44`, color: p.color, fontSize: '14px', display: 'flex', alignItems: 'center', textDecoration: 'none', fontWeight: '600', gap: '6px' }} title="Download audio">
                        ⬇ <span style={{ fontSize: '11px' }}>Save</span>
                      </a>
                    )}
                    <button onClick={reset} title="Start a new session" style={{ padding: '15px 16px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '12px', fontWeight: '600' }}>New session</button>
                  </div>

                  {saveLimitHit && (
                    <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,159,67,0.08)', border: '1px solid rgba(255,159,67,0.25)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#ff9f43' }}>⚠️ Your session played but could not be saved — you have reached your free plan limit.</div>
                      <a href="/pricing" style={{ fontSize: '12px', color: '#ff9f43', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,159,67,0.4)', padding: '5px 10px', borderRadius: '8px' }}>Upgrade →</a>
                    </div>
                  )}

                  <div style={{ padding: '13px 16px', borderRadius: '12px', background: BASE.bgCard, border: `1px solid ${BASE.border}`, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: BASE.textMuted }}>
                      🔥 <strong style={{ color: p.color }}>{streak} day{streak !== 1 ? 's' : ''}</strong> in Rewrite Mode
                    </div>
                    {profile && <div style={{ fontSize: '13px', color: p.color, fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowCredits(true)}>✦ {profile.credits} credits</div>}
                  </div>

                  {(!profile || profile.plan === 'free') && (
                    <div style={{ padding: '16px 18px', borderRadius: '14px', border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#a855f7', marginBottom: '3px', fontWeight: '700' }}>💎 Go Pro — £14.99/month</div>
                        <div style={{ fontSize: '11px', color: BASE.textMuted, lineHeight: 1.6 }}>100 credits/mo · Save 50 sessions · Daily sessions for less than a coffee a week</div>
                      </div>
                      <button onClick={() => window.location.href = '/pricing'}
                        style={{ padding: '9px 16px', borderRadius: '10px', background: 'linear-gradient(135deg,#a855f7,#6d28d9)', color: '#fff', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: '700' }}>
                        Upgrade →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '52px', fontSize: '11px', color: BASE.textFaint, letterSpacing: '0.12em', fontWeight: '500' }}>
            ✦ STAY IN REWRITE MODE ✦
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
            <a href="/terms" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Terms</a>
            <a href="/privacy" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Privacy</a>
            <a href="/faq" style={{ color: BASE.textFaint, textDecoration: 'none' }}>FAQ</a>
            <a href="mailto:office@rewiremode.com" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); if (step === 4) startGenerate() }} />}
      {showCredits && user && <CreditsModal profile={profile} user={user} onClose={() => setShowCredits(false)} />}
    </>
  )
}
