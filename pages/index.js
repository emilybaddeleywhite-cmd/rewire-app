import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { CrisisBlock, SafetyBlock, useSafetyGate } from '../components/SafetyBlock'

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
  walking:    { url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-calm.mp3.mp3',       volume: 0.15, label: 'Ambient walking' },
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
    'Weaving your sleep affirmation layer...',
    'Your brain will continue rewiring as you sleep. Almost ready.',
    'This one takes a little longer. It is worth the wait.',
  ],
  subliminal: [
    'Your subconscious processes over 11 million bits of information per second — far beyond conscious awareness...',
    'Subliminal suggestions bypass the critical faculty and speak directly to the subconscious mind...',
    'Research shows repeated exposure to identity-level statements strengthens neural pathways over time...',
    'The brain cannot distinguish between a vividly imagined experience and a real one...',
    'Writing your affirmations — calibrated to your exact intention, in the language of the subconscious...',
    'Almost ready. 30 minutes of deep subconscious reprogramming incoming.',
  ],
  walking: [
    'Writing your walking session — designed to keep you grounded and aware...',
    'Crafting suggestions that work with your moving body and breath...',
    'Building language patterns that feel like natural thoughts arriving...',
    'Your session will anchor you gently in the present moment...',
    'Almost ready. Keep your eyes open and walk at your own pace.',
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
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────
// Top-level categories shown first, then sub-types of Hypnosis
const HYPNOSIS_TYPES = [
  {
    id: 'reset',
    label: 'Reset Hypnosis',
    emoji: '🧠',
    duration: '5 min',
    credits: 1,
    desc: 'A quick mental reset. Clears stress and recentres you in minutes.',
    hoverDesc: 'You listen actively. A guided voice leads you through induction, deepening, and suggestion.',
    color: '#6366f1', colorB: '#4f46e5',
    grad: 'linear-gradient(135deg,#6366f1,#4338ca)',
    glow: 'rgba(99,102,241,0.25)',
    waveA: '#4338ca', waveB: '#6366f1',
  },
  {
    id: 'sleep',
    label: 'Sleep Hypnosis',
    emoji: '🌙',
    duration: '15 min',
    credits: 3,
    desc: 'A longer session designed to guide you into restful, rewiring sleep.',
    hoverDesc: 'Designed to be listened to as you fall asleep. Lets your subconscious do the work overnight.',
    color: '#a855f7', colorB: '#7c3aed',
    grad: 'linear-gradient(135deg,#a855f7,#6d28d9)',
    glow: 'rgba(168,85,247,0.25)',
    waveA: '#6d28d9', waveB: '#a855f7',
  },
  {
    id: 'walking',
    label: 'Walking Hypnosis',
    emoji: '🚶',
    duration: '5 min',
    credits: 1,
    desc: 'Gentle suggestions designed to be safe while walking. Full awareness maintained.',
    hoverDesc: 'Eyes open and alert. Suggestions arrive as natural thoughts woven through your movement.',
    color: '#10b981', colorB: '#059669',
    grad: 'linear-gradient(135deg,#10b981,#059669)',
    glow: 'rgba(16,185,129,0.25)',
    waveA: '#059669', waveB: '#10b981',
  },
]

const SUBLIMINAL_PRODUCT = {
  id: 'subliminal',
  label: 'Subliminal',
  emoji: '🌊',
  duration: '30 min',
  credits: 3,
  desc: 'Identity-level suggestions layered under music. Play in the background.',
  hoverDesc: 'Suggestions are layered below conscious hearing. Let it run while you work, rest, or sleep.',
  color: '#22d3ee', colorB: '#0891b2',
  grad: 'linear-gradient(135deg,#22d3ee,#0891b2)',
  glow: 'rgba(34,211,238,0.25)',
  waveA: '#0891b2', waveB: '#22d3ee',
}

const GOALS = [
  'Confidence', 'Overthinking', 'Sleep', 'Fear',
  'Success', 'Abundance', 'Self-worth', 'Focus',
]

const BASE = {
  bg: '#03050f',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8f4ff',
  textMuted: 'rgba(232,244,255,0.45)',
  textFaint: 'rgba(232,244,255,0.2)',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'

// ─── FRIENDLY ERRORS ──────────────────────────────────────────────────
function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.'
  if (msg.includes('credits') || msg.includes('Credits')) return "You've run out of credits. Top up to continue."
  if (msg.includes('Audio') || msg.includes('ElevenLabs') || msg.includes('audio')) return 'Audio generation hit a snag. Please try again in a moment.'
  if (msg.includes('script') || msg.includes('Script')) return 'Script generation failed. Try rephrasing your intention.'
  if (msg.includes('limit') || msg.includes('Limit')) return "You've reached your save limit. Upgrade to save more sessions."
  if (msg.includes('Unauthorized') || msg.includes('Forbidden')) return 'Session expired. Please sign in again.'
  if (msg.includes('network') || msg.includes('fetch')) return 'Connection issue. Check your internet and try again.'
  return 'Something went wrong. Please try again.'
}

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
  const p = product || HYPNOSIS_TYPES[0]
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
    </div>
  )
}

// ─── FEEDBACK BUTTON ──────────────────────────────────────────────────
function FeedbackButton({ userId }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!text.trim()) return
    setLoading(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: text, userId }),
    })
    setSent(true)
    setLoading(false)
    setTimeout(() => { setOpen(false); setSent(false); setText('') }, 2000)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ fontSize: '11px', color: BASE.textFaint, background: 'none', border: `1px solid ${BASE.border}`, padding: '6px 14px', borderRadius: '100px', cursor: 'pointer' }}>
        💬 Share feedback
      </button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,5,15,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'linear-gradient(145deg,#071020,#04071a)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: BASE.textMuted, fontSize: '20px', cursor: 'pointer' }}>×</button>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
                <div style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '16px' }}>Thank you for your feedback!</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '16px', color: BASE.text, fontWeight: '700', marginBottom: '6px' }}>Share your feedback</div>
                <div style={{ fontSize: '13px', color: BASE.textMuted, marginBottom: '16px' }}>What could be better? What do you love? We read everything.</div>
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Your thoughts..." rows={4}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', color: BASE.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: '12px' }} />
                <button onClick={submit} disabled={loading || !text.trim()}
                  style={{ width: '100%', padding: '13px', borderRadius: '10px', background: text.trim() ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'rgba(255,255,255,0.05)', color: text.trim() ? '#fff' : BASE.textFaint, fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                  {loading ? 'Sending...' : 'Send Feedback →'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── DISCLAIMER MODAL ─────────────────────────────────────────────────
function DisclaimerModal({ onAccept }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,5,15,0.95)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(12px)' }}>
      <div style={{ background: 'linear-gradient(145deg,#071020,#04071a)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', color: BASE.text, fontWeight: '800', marginBottom: '6px' }}>Before you begin</h2>
          <p style={{ fontSize: '13px', color: BASE.textMuted, lineHeight: 1.65 }}>Please read and accept the following before generating your first session.</p>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '28px' }}>
          {[
            { icon: '🏥', text: 'RewireMode is not medical advice and is not a substitute for professional mental health treatment.' },
            { icon: '🧠', text: 'Not suitable for people with serious mental health conditions including psychosis, epilepsy, or severe dissociative disorders.' },
            { icon: '🚗', text: 'Never use hypnosis sessions while driving, operating machinery, or in any situation requiring your full attention.' },
            { icon: '✅', text: 'Use responsibly. If you experience any distress during a session, stop immediately.' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${BASE.border}` }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
              <p style={{ fontSize: '13px', color: BASE.textMuted, lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        <button onClick={onAccept}
          style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', fontSize: '15px', fontWeight: '800', border: 'none', cursor: 'pointer', letterSpacing: '0.02em', boxShadow: '0 4px 24px rgba(99,102,241,0.35)' }}>
          I understand — continue →
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: BASE.textFaint, marginTop: '12px', lineHeight: 1.6 }}>
          By continuing you confirm you have read and understood the above. You will not be shown this again.{' '}
          <a href="/terms" target="_blank" style={{ color: '#6366f1' }}>Terms of Service</a>
        </p>
      </div>
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
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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
    else { setError(''); setSuccess(true); setSuccessMsg('Password reset email sent. Check your inbox.') }
    setLoading(false)
  }

  async function handleSubmit() {
    if (mode === 'signup' && !agreedToTerms) { setError('Please agree to the Terms of Service to continue.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (error) setError(error.message)
      else if (data.session) { onSuccess() }
      else { setSuccess(true) }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onSuccess()
    }
    setLoading(false)
  }

  const inp = { width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)', color: '#e8f4ff', fontSize: '14px', marginBottom: '12px', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", outline: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'linear-gradient(145deg,#071020,#04071a)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 0 60px rgba(99,102,241,0.15)', maxHeight: '90vh', overflowY: 'auto', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src={LOGO} alt="RewireMode" style={{ height: '60px', marginBottom: '16px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => { e.target.style.display='none' }} />
          <h2 style={{ fontSize: '21px', color: '#6366f1', fontWeight: '700', marginBottom: '6px' }}>
            {mode === 'signup' ? 'Start rewiring your mind' : 'Welcome back'}
          </h2>
          {mode === 'signup' && <p style={{ fontSize: '13px', color: BASE.textMuted }}>5 free credits. No card needed.</p>}
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>✦</div>
              <p style={{ color: '#6366f1', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>{successMsg || 'Account created.'}</p>
              <p style={{ color: BASE.textMuted, fontSize: '13px', lineHeight: 1.6 }}>Check your email to confirm your account, then sign in below.</p>
            </div>
            <button onClick={() => { setSuccess(false); setMode('signin') }} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#03050f', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
              Sign In Now →
            </button>
          </div>
        ) : (
          <>
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
              <p onClick={handleForgotPassword} style={{ fontSize: '12px', color: '#6366f1', cursor: 'pointer', textAlign: 'right', marginBottom: '12px' }}>Forgot password?</p>
            )}
            {mode === 'signup' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px', marginTop: '8px' }}>
                <div onClick={() => setAgreedToTerms(!agreedToTerms)} style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${agreedToTerms ? '#6366f1' : 'rgba(255,255,255,0.2)'}`, background: agreedToTerms ? '#6366f1' : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}>
                  {agreedToTerms && <span style={{ color: '#03050f', fontSize: '12px', fontWeight: '800' }}>✓</span>}
                </div>
                <p style={{ fontSize: '12px', color: BASE.textMuted, lineHeight: 1.6, cursor: 'pointer' }} onClick={() => setAgreedToTerms(!agreedToTerms)}>
                  I agree to the <a href="/terms" target="_blank" style={{ color: '#6366f1' }} onClick={e => e.stopPropagation()}>Terms of Service</a> and <a href="/privacy" target="_blank" style={{ color: '#6366f1' }} onClick={e => e.stopPropagation()}>Privacy Policy</a>
                </p>
              </div>
            )}
            {error && <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#03050f', fontSize: '15px', fontWeight: '700', cursor: 'pointer', border: 'none', marginBottom: '14px', letterSpacing: '0.02em' }}>
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
      <div style={{ background: 'linear-gradient(145deg,#071020,#04071a)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', position: 'relative', boxShadow: '0 0 60px rgba(99,102,241,0.1)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: BASE.textMuted, fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>✦</div>
          <h2 style={{ fontSize: '20px', color: '#6366f1', fontWeight: '700', marginBottom: '6px' }}>Top up your credits</h2>
          <p style={{ fontSize: '13px', color: BASE.textMuted }}>You have <strong style={{ color: '#6366f1' }}>{profile?.credits || 0} credits</strong> remaining</p>
        </div>

        {(!profile || profile.plan === 'free') && (
          <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', color: '#a855f7', fontWeight: '700', marginBottom: '5px' }}>💎 The smart choice — Go Pro</div>
            <div style={{ fontSize: '13px', color: BASE.textMuted, marginBottom: '4px', lineHeight: 1.6 }}>100 credits a month for £14.99. Daily sessions for less than the price of one coffee a week.</div>
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
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', color: BASE.text, fontWeight: '700' }}>{c.label}</div>
                <div style={{ fontSize: '12px', color: BASE.textFaint }}>{c.per}</div>
              </div>
              <div style={{ fontSize: '18px', color: '#6366f1', fontWeight: '800' }}>{loading === c.key ? '...' : c.price}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── QUIZ MODAL ───────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 'q1', text: 'How does your mind tend to get in your own way?',
    options: [
      { label: "I overthink everything and can't switch off", tags: ['Overthinking'] },
      { label: "I doubt myself and hold back", tags: ['Confidence', 'Self-worth'] },
      { label: "I can't focus — I'm constantly distracted", tags: ['Focus'] },
      { label: "I feel stuck, like success isn't for me", tags: ['Success', 'Abundance'] },
      { label: "Fear stops me from taking action", tags: ['Fear'] },
    ],
  },
  {
    id: 'q2', text: 'Which of these sounds most like you right now?',
    options: [
      { label: "I wake up anxious before the day's even started", tags: ['Overthinking', 'Fear'] },
      { label: "I know what I need to do but I just can't make myself do it", tags: ['Focus', 'Confidence'] },
      { label: "I compare myself to others and always come up short", tags: ['Self-worth', 'Confidence'] },
      { label: "I work hard but never feel like it's enough", tags: ['Abundance', 'Success'] },
      { label: "I struggle to sleep — my brain won't stop", tags: ['Sleep', 'Overthinking'] },
    ],
  },
  {
    id: 'q3', text: 'What would feel like the biggest win for you?',
    options: [
      { label: "Waking up calm and clear-headed", tags: ['Sleep', 'Overthinking'] },
      { label: "Walking into a room and owning it", tags: ['Confidence'] },
      { label: "Finally believing I deserve good things", tags: ['Self-worth', 'Abundance'] },
      { label: "Finishing what I start without fighting myself", tags: ['Focus', 'Overthinking'] },
      { label: "Saying yes to things that used to terrify me", tags: ['Fear', 'Confidence'] },
    ],
  },
  {
    id: 'q4', text: "When things go wrong, what's your first instinct?",
    options: [
      { label: "Replay it obsessively and beat myself up", tags: ['Overthinking', 'Self-worth'] },
      { label: "Assume I'm not good enough", tags: ['Self-worth', 'Confidence'] },
      { label: "Freeze and avoid the situation next time", tags: ['Fear', 'Confidence'] },
      { label: "Lose focus and spiral into distraction", tags: ['Focus', 'Overthinking'] },
      { label: "Feel like success will never really happen for me", tags: ['Success', 'Abundance'] },
    ],
  },
  {
    id: 'q5', text: 'If you could change one thing about how your mind works, what would it be?',
    options: [
      { label: "Stop the constant mental noise", tags: ['Overthinking', 'Sleep'] },
      { label: "Trust myself more", tags: ['Confidence', 'Self-worth'] },
      { label: "Stop letting fear make my decisions", tags: ['Fear'] },
      { label: "Actually follow through on things", tags: ['Focus', 'Success'] },
      { label: "Feel like abundance is possible for me", tags: ['Abundance', 'Success'] },
    ],
  },
]

function QuizModal({ onClose, onSelect }) {
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [results, setResults] = useState(null)
  const [picked, setPicked] = useState(null)

  function handleAnswer(option) {
    setPicked(option.label)
    setTimeout(() => {
      const next = [...answers, ...option.tags]
      if (qIndex < QUIZ_QUESTIONS.length - 1) {
        setAnswers(next); setQIndex(qIndex + 1); setPicked(null)
      } else {
        const scores = {}
        next.forEach(tag => { scores[tag] = (scores[tag] || 0) + 1 })
        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
        setResults(sorted.slice(0, 3).map(([tag]) => tag))
      }
    }, 280)
  }

  const q = QUIZ_QUESTIONS[qIndex]
  const progress = (qIndex / QUIZ_QUESTIONS.length) * 100

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,5,15,0.92)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
      <div style={{ background: 'linear-gradient(145deg,#071020,#04071a)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: BASE.textMuted, fontSize: '22px', cursor: 'pointer' }}>×</button>
        {!results ? (
          <>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: BASE.textFaint, letterSpacing: '0.1em' }}>QUESTION {qIndex + 1} OF {QUIZ_QUESTIONS.length}</span>
                <span style={{ fontSize: '11px', color: '#6366f1' }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6366f1,#a855f7)', borderRadius: '100px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
            <div style={{ fontSize: '18px', color: BASE.text, fontWeight: '700', marginBottom: '22px', lineHeight: 1.45 }}>{q.text}</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {q.options.map(opt => (
                <button key={opt.label} onClick={() => handleAnswer(opt)}
                  style={{ padding: '14px 16px', borderRadius: '12px', textAlign: 'left', border: `1px solid ${picked === opt.label ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.08)'}`, background: picked === opt.label ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)', color: picked === opt.label ? '#a5b4fc' : BASE.textMuted, fontSize: '14px', transition: 'all 0.18s ease', cursor: 'pointer', lineHeight: 1.5 }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => onSelect('custom')} style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: BASE.textFaint, fontSize: '12px', cursor: 'pointer' }}>
              I'd rather type my own goal →
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>✦</div>
              <div style={{ fontSize: '18px', color: BASE.text, fontWeight: '700', marginBottom: '8px' }}>Here's what your mind wants to rewire</div>
              <div style={{ fontSize: '13px', color: BASE.textMuted }}>Based on your answers — pick one to start with.</div>
            </div>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
              {results.map((tag, i) => (
                <button key={tag} onClick={() => onSelect(tag)}
                  style={{ padding: '16px 18px', borderRadius: '14px', textAlign: 'left', border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`, background: i === 0 ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    {i === 0 && <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '4px' }}>BEST MATCH</div>}
                    <div style={{ fontSize: '15px', color: i === 0 ? '#a5b4fc' : BASE.text, fontWeight: '700' }}>{tag}</div>
                  </div>
                  <span style={{ fontSize: '18px', color: i === 0 ? '#6366f1' : BASE.textFaint }}>→</span>
                </button>
              ))}
            </div>
            <button onClick={() => onSelect('custom')} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: BASE.textFaint, fontSize: '12px', cursor: 'pointer' }}>
              None of these — I'll type my own
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function Home({ user, profile, refreshProfile }) {
  const isMobile = useIsMobile()

  // Steps: 0=select, 1=mood, 2=name, 3=voice, 4=confirm, 5=loading, 6=result
  const [step, setStep] = useState(0)

  // Category selection: null | 'hypnosis' | 'subliminal'
  const [category, setCategory] = useState(null)
  const [product, setProduct] = useState(null)

  const [goal, setGoal] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [mood, setMood] = useState(5)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [script, setScript] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [looping, setLooping] = useState(false)
  const [timer, setTimer] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loadMsgIndex, setLoadMsgIndex] = useState(0)
  const [error, setError] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [saveLimitHit, setSaveLimitHit] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [streak, setStreak] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [musicVolume, setMusicVolume] = useState(0.18)
  const { safetyState, checkSafety, clearSafety } = useSafetyGate()

  const audioRef = useRef(null)
  const musicRef = useRef(null)
  const timerRef = useRef(null)
  const loadMsgRef = useRef(null)
  const progressRef = useRef(null)
  const wakeLockRef = useRef(null)
  const pendingGenerateRef = useRef(false)

  // ── Disclaimer: check localStorage ──
  useEffect(() => {
    // No disclaimer check here — shown only when user tries to generate
  }, [])

  function needsDisclaimer() {
    try { return !localStorage.getItem('rw_disclaimer_accepted') } catch { return false }
  }
  function acceptDisclaimer() {
    try { localStorage.setItem('rw_disclaimer_accepted', '1') } catch {}
    setShowDisclaimer(false)
    if (pendingGenerateRef.current) {
      pendingGenerateRef.current = false
      startGenerate()
    }
  }

  useEffect(() => { if (profile) setStreak(profile.streak_count || 0) }, [profile])
  useEffect(() => { if (product?.id) setMusicVolume(MUSIC[product.id]?.volume || 0.18) }, [product])
  useEffect(() => { if (musicRef.current) musicRef.current.volume = musicVolume }, [musicVolume])

  // Auto-select Emily for subliminal, set loop ON
  useEffect(() => {
    if (product?.id === 'subliminal') {
      setSelectedVoice(VOICES.hypnosis[0])
      setLooping(true)
    } else {
      setLooping(false)
    }
  }, [product?.id])

  // Sync loop state to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = looping
  }, [looping, audioUrl])

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(progressRef.current)
      clearInterval(loadMsgRef.current)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [])

  const p = product || HYPNOSIS_TYPES[0]
  const isSubliminal = product?.id === 'subliminal'
  const isWalking = product?.id === 'walking'
  const activeGoal = goal === 'custom' ? customGoal : goal
  const currentMusic = product ? MUSIC[product.id] : null
  const loadMessages = LOAD_MESSAGES[product?.id] || LOAD_MESSAGES.reset
  const currentLoadMsg = loadMessages[loadMsgIndex] || loadMessages[0]

  const moodEmoji = mood <= 2 ? '😔' : mood <= 4 ? '😕' : mood <= 6 ? '😐' : mood <= 8 ? '🙂' : '😄'
  const moodLabel = mood <= 2 ? 'Really struggling' : mood <= 4 ? 'Not great' : mood <= 6 ? 'Getting there' : mood <= 8 ? 'Pretty good' : 'Feeling amazing'

  async function startGenerate() {
    if (!user) { setShowAuth(true); return }
    if (!profile || profile.credits < (product?.credits || 1)) { setShowCredits(true); return }

    if (needsDisclaimer()) {
      pendingGenerateRef.current = true
      setShowDisclaimer(true)
      return
    }

    const isSafe = await checkSafety(activeGoal, user.id)
    if (!isSafe) return

    setStep(5); setProgress(0); setError(''); setAudioUrl(null); setLoadMsgIndex(0)
    setSaveLimitHit(false); setSavedOk(false)

    let prog = 0
    progressRef.current = setInterval(() => {
      prog += Math.random() * 1.2
      if (prog < 88) setProgress(Math.min(prog, 88))
    }, 400)

    let msgIdx = 0
    loadMsgRef.current = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadMessages.length
      setLoadMsgIndex(msgIdx)
    }, 3500)

    try {
      // Get the user's current session token for authenticated API calls
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const scriptRes = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ goal: activeGoal, productType: product.id, mood, userId: user.id, firstName: firstName.trim() || null }),
      })
      const scriptData = await scriptRes.json()
      if (!scriptRes.ok) throw new Error(scriptData.error || 'Script generation failed')
      setScript(scriptData.script)

      const audioRes = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: scriptData.script, voiceId: selectedVoice.id, productType: product.id, userId: user.id }),
      })
      if (!audioRes.ok) throw new Error('Audio generation failed')
      const audioData = await audioRes.json()
      if (audioData.error) throw new Error(audioData.error)
      const url = audioData.audioUrl
      setAudioUrl(url)

      const saveRes = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, goal: activeGoal, productType: product.id, script: scriptData.script, audioUrl: url, voiceId: selectedVoice.id, mood, creditCost: scriptData.cost }),
      })
      const saveData = await saveRes.json()

      if (saveRes.status === 403) {
        setSaveLimitHit(true)
      } else if (!saveRes.ok) {
        console.error('Save failed silently:', saveData.error)
        // Non-blocking: audio still plays, user is informed
      } else {
        setSavedOk(true)
        if (saveData.streak) setStreak(saveData.streak)
      }

      clearInterval(progressRef.current)
      clearInterval(loadMsgRef.current)
      setProgress(100)
      refreshProfile()
      setTimeout(() => setStep(6), 400)
    } catch (err) {
      clearInterval(progressRef.current)
      clearInterval(loadMsgRef.current)
      setError(friendlyError(err.message))
      setStep(6)
    }
  }

  async function togglePlay() {
    if (!audioRef.current) return
    if (!playing) {
      audioRef.current.volume = isSubliminal ? 0.02 : 1.0
      audioRef.current.loop = looping
      audioRef.current.play()
      if (musicRef.current) { musicRef.current.volume = musicVolume; musicRef.current.loop = true; musicRef.current.play().catch(() => {}) }
      setPlaying(true)
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch (e) {}
    } else {
      audioRef.current.pause()
      if (musicRef.current) musicRef.current.pause()
      setPlaying(false)
      clearInterval(timerRef.current)
      if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null }
    }
  }

  function replaySession() {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    if (musicRef.current) musicRef.current.currentTime = 0
    if (!playing) togglePlay()
  }

  function handleAudioEnd() {
    if (looping) return // audio element handles looping natively
    if (musicRef.current) {
      let vol = musicRef.current.volume
      const fade = setInterval(() => {
        vol = Math.max(0, vol - 0.02)
        if (musicRef.current) musicRef.current.volume = vol
        if (vol <= 0) { clearInterval(fade); if (musicRef.current) musicRef.current.pause() }
      }, 150)
    }
    setPlaying(false); clearInterval(timerRef.current)
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null }
  }

  function reset() {
    clearInterval(timerRef.current); clearInterval(progressRef.current); clearInterval(loadMsgRef.current)
    if (audioRef.current) audioRef.current.pause()
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0 }
    if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null }
    setStep(0); setCategory(null); setProduct(null); setGoal(''); setCustomGoal(''); setScript(''); setFirstName('')
    setPlaying(false); setLooping(false); setTimer(0); setProgress(0); setMood(5)
    setSelectedVoice(null); setAudioUrl(null); setError(''); setLoadMsgIndex(0)
    setSaveLimitHit(false); setSavedOk(false)
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <>
      <Head>
        <title>RewireMode — Custom AI Hypnosis Platform</title>
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
          @keyframes fadeMsg{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
          button{cursor:pointer;border:none;background:none;font-family:inherit}
          input,textarea{font-family:inherit;outline:none}
          input[type=range]{-webkit-appearance:none;width:100%;height:5px;border-radius:5px;cursor:pointer}
          input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;cursor:pointer}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:4px}
        `}</style>

        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd} loop={looping} />}
        {currentMusic && <audio ref={musicRef} src={currentMusic.url} loop preload="auto" />}

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,50,220,0.08) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 10s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(99,102,241,0.08)', backdropFilter: 'blur(10px)', background: 'rgba(5,10,20,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: isMobile ? '8px 12px 0' : '8px 16px 0', gap: '6px', flexWrap: 'wrap' }}>
            {profile && (
              <>
                {streak > 0 && !isMobile && <div style={{ fontSize: '12px', color: BASE.textMuted }}>🔥 {streak} day{streak !== 1 ? 's' : ''}</div>}
                <div onClick={() => setShowCredits(true)} style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600', padding: '5px 10px', borderRadius: '100px', border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)', cursor: 'pointer' }}>✦ {profile.credits}</div>
                <button onClick={() => window.location.href = '/dashboard'} style={{ fontSize: '11px', color: BASE.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${BASE.border}` }}>{isMobile ? '⚙' : 'Dashboard'}</button>
              </>
            )}
            <a href="/faq" style={{ fontSize: '11px', color: BASE.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${BASE.border}`, textDecoration: 'none' }}>FAQ</a>
            {!user && <button onClick={() => setShowAuth(true)} style={{ fontSize: '12px', color: '#6366f1', padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)', fontWeight: '600' }}>Sign In</button>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px 24px 12px' }}>
            <img src={LOGO} alt="RewireMode" style={{ height: isMobile ? '80px' : '120px', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'lighten' }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
            <span style={{ display: 'none', fontSize: '28px', fontWeight: '900', background: 'linear-gradient(135deg,#6366f1,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>REWIRE MODE</span>
          </div>
        </nav>

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: isMobile ? '24px 14px 60px' : '44px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '40px', animation: 'fadeUp 0.8s ease both' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 14px' : '8px 20px', borderRadius: '100px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.12)', fontSize: isMobile ? '9px' : '11px', letterSpacing: '0.12em', color: '#a5b4fc', marginBottom: '16px', fontWeight: '700', textAlign: 'center' }}>
              <span>◈ CUSTOM AI HYPNOSIS PLATFORM ◈</span>
              <span>BUILT BY A QUALIFIED HYPNOTHERAPIST</span>
            </div>
            <h1 style={{ fontSize: 'clamp(30px,6vw,52px)', fontWeight: '900', lineHeight: '1.05', letterSpacing: '-0.03em', marginBottom: '16px', background: 'linear-gradient(135deg,#ffffff 0%,#a5b4fc 30%,#22d3ee 60%,#c4b5fd 100%)', backgroundSize: '300% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 5s linear infinite' }}>
              Rewire your mind.<br />Rewrite your reality.
            </h1>
            <p style={{ color: 'rgba(232,244,255,0.75)', fontSize: isMobile ? '14px' : '16px', lineHeight: '1.75', maxWidth: '500px', margin: '0 auto 20px', fontWeight: '400' }}>
              Not a meditation app. Not a wellness app.<br />
              Clinical-grade subconscious reprogramming, generated in real time for you.
            </p>
            {!user && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '100px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)', fontSize: '12px', color: '#22d3ee', fontWeight: '600' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22d3ee', display: 'inline-block', boxShadow: '0 0 8px #22d3ee' }} />
                Start free — 5 credits, no card required
              </div>
            )}
          </div>

          {/* Video — step 0 only */}
          {step === 0 && (
            <div style={{ marginBottom: '36px', animation: 'fadeUp 0.8s ease 0.1s both', position: 'relative' }}>
              <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 0 40px rgba(99,102,241,0.15)' }}>
                <video id="hero-video" src="https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/RewireMode%20home%20page%20video%20%20(1).mp4" autoPlay muted loop playsInline style={{ width: '100%', display: 'block' }} />
              </div>
              <button onClick={() => { const v = document.getElementById('hero-video'); v.muted = !v.muted; const btn = document.getElementById('mute-btn'); btn.innerText = v.muted ? '🔇' : '🔊' }} id="mute-btn"
                style={{ position: 'absolute', bottom: '14px', right: '14px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '100px', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 10 }}>
                🔇
              </button>
            </div>
          )}

          {/* Step dots — steps 1–4 */}
          {step > 0 && step < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: step >= i ? '24px' : '8px', height: '8px', borderRadius: '100px', background: step >= i ? p.grad : BASE.border, transition: 'all 0.3s ease', boxShadow: step >= i ? `0 0 8px ${p.color}66` : 'none' }} />
              ))}
            </div>
          )}

          {/* ── STEP 0: SELECT ── */}
          {step === 0 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>

              {/* Goal selection */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, marginBottom: '14px', fontWeight: '700' }}>WHAT ARE YOU READY TO REWRITE?</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '12px 16px', borderRadius: '10px', background: BASE.bgCard, border: `1px solid ${BASE.border}` }}>
                  <span style={{ fontSize: '16px' }}>👤</span>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name (optional — we'll weave it into your script)"
                    style={{ flex: 1, background: 'none', border: 'none', color: BASE.text, fontSize: '13px', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  {GOALS.map(g => (
                    <button key={g} onClick={() => setGoal(g)}
                      style={{ padding: '11px 8px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: `1px solid ${goal === g ? '#6366f1' : 'rgba(255,255,255,0.12)'}`, background: goal === g ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: goal === g ? '#a5b4fc' : BASE.textMuted, transition: 'all 0.18s ease', boxShadow: goal === g ? '0 0 20px rgba(99,102,241,0.3)' : 'none' }}>
                      {g}
                    </button>
                  ))}
                </div>
                <button onClick={() => setGoal('custom')}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', textAlign: 'left', border: `1px solid ${goal === 'custom' ? '#6366f1cc' : BASE.border}`, background: goal === 'custom' ? 'rgba(99,102,241,0.08)' : BASE.bgCard, color: goal === 'custom' ? '#6366f1' : BASE.textMuted, fontSize: '13px', marginBottom: '8px' }}>
                  ✍️ What do you want to rewire?
                </button>
                {goal === 'custom' && (
                  <textarea autoFocus value={customGoal} onChange={e => setCustomGoal(e.target.value)}
                    placeholder="e.g. stop self-sabotaging, feel calm under pressure, believe I'm enough..."
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.04)', color: BASE.text, fontSize: '14px', lineHeight: '1.65', resize: 'vertical', minHeight: '80px', marginBottom: '8px' }} />
                )}
                <button onClick={() => setShowQuiz(true)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', textAlign: 'left', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', color: 'rgba(165,180,252,0.7)', fontSize: '13px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🔍 Not sure? Find out what to rewire</span>
                  <span style={{ fontSize: '11px', color: 'rgba(165,180,252,0.4)' }}>5 quick questions →</span>
                </button>
              </div>

              {/* Session type — two-category layout */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '13px', color: BASE.text, fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
                  Choose how you want to rewire your mind today
                </div>

                {/* Top-level: Hypnosis or Subliminals */}
                {!category && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <button onClick={() => setCategory('hypnosis')}
                      style={{ padding: '24px 16px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)', transition: 'all 0.2s ease' }}>
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧠</div>
                      <div style={{ fontSize: '16px', color: '#a5b4fc', fontWeight: '800', marginBottom: '6px' }}>Hypnosis</div>
                      <div style={{ fontSize: '12px', color: BASE.textMuted, lineHeight: 1.55 }}>You listen actively. A guided voice leads your mind into theta state.</div>
                    </button>
                    <button onClick={() => { setCategory('subliminal'); setProduct(SUBLIMINAL_PRODUCT) }}
                      style={{ padding: '24px 16px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.06)', transition: 'all 0.2s ease' }}>
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌊</div>
                      <div style={{ fontSize: '16px', color: '#22d3ee', fontWeight: '800', marginBottom: '6px' }}>Subliminals</div>
                      <div style={{ fontSize: '12px', color: BASE.textMuted, lineHeight: 1.55 }}>Play in the background. Suggestions layered under music below conscious hearing.</div>
                    </button>
                  </div>
                )}

                {/* Hypnosis sub-types */}
                {category === 'hypnosis' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <button onClick={() => { setCategory(null); setProduct(null) }} style={{ fontSize: '12px', color: BASE.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${BASE.border}` }}>← Back</button>
                      <div style={{ fontSize: '12px', color: BASE.textMuted, fontWeight: '600', letterSpacing: '0.08em' }}>CHOOSE YOUR SESSION</div>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {HYPNOSIS_TYPES.map(pr => (
                        <button key={pr.id} onClick={() => setProduct(pr)}
                          title={pr.hoverDesc}
                          style={{ padding: '18px 20px', borderRadius: '16px', textAlign: 'left', border: `1px solid ${product?.id === pr.id ? pr.color + 'cc' : BASE.border}`, background: product?.id === pr.id ? pr.color + '12' : BASE.bgCard, transition: 'all 0.2s ease', boxShadow: product?.id === pr.id ? `0 0 28px ${pr.glow}` : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontSize: '28px', flexShrink: 0 }}>{pr.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '15px', color: product?.id === pr.id ? pr.color : BASE.text, fontWeight: '700', marginBottom: '4px' }}>{pr.label}</div>
                            <div style={{ fontSize: '12px', color: BASE.textMuted, lineHeight: 1.5, marginBottom: '8px' }}>{pr.desc}</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: BASE.textFaint }}>{pr.duration}</span>
                              <span style={{ fontSize: '11px', color: pr.color, background: pr.color + '18', padding: '2px 8px', borderRadius: '100px', fontWeight: '600' }}>✦ {pr.credits}</span>
                            </div>
                          </div>
                          {product?.id === pr.id && <div style={{ fontSize: '18px', color: pr.color, flexShrink: 0 }}>✓</div>}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Subliminal selected — show confirmation chip */}
                {category === 'subliminal' && (
                  <div style={{ padding: '16px 20px', borderRadius: '14px', border: `1px solid ${SUBLIMINAL_PRODUCT.color}cc`, background: SUBLIMINAL_PRODUCT.color + '12', display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>{SUBLIMINAL_PRODUCT.emoji}</div>
                      <div>
                        <div style={{ fontSize: '14px', color: SUBLIMINAL_PRODUCT.color, fontWeight: '700' }}>{SUBLIMINAL_PRODUCT.label}</div>
                        <div style={{ fontSize: '11px', color: BASE.textMuted }}>{SUBLIMINAL_PRODUCT.duration} · ✦ {SUBLIMINAL_PRODUCT.credits} credits</div>
                      </div>
                    </div>
                    <button onClick={() => { setCategory(null); setProduct(null) }} style={{ fontSize: '11px', color: BASE.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${BASE.border}`, flexShrink: 0 }}>Change</button>
                  </div>
                )}
              </div>

              <button onClick={() => activeGoal.trim() && product && setStep(1)} disabled={!activeGoal.trim() || !product}
                style={{ width: '100%', padding: '18px', borderRadius: '14px', background: activeGoal.trim() && product ? p.grad : 'rgba(255,255,255,0.06)', color: activeGoal.trim() && product ? '#ffffff' : BASE.textFaint, fontSize: '16px', fontWeight: '800', transition: 'all 0.25s ease', marginBottom: '20px', letterSpacing: '0.02em', boxShadow: activeGoal.trim() && product ? `0 6px 32px ${p.glow}` : 'none', border: activeGoal.trim() && product ? 'none' : `1px solid rgba(255,255,255,0.06)` }}>
                {activeGoal.trim() && product ? 'Next →' : 'Select your intention and session type'}
              </button>

              {/* Science strip */}
              <div style={{ padding: isMobile ? '16px' : '20px 22px', borderRadius: '14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#a5b4fc', fontWeight: '700', marginBottom: '10px' }}>THE SCIENCE</div>
                <p style={{ fontSize: '13px', color: BASE.textMuted, lineHeight: '1.75' }}>
                  During hypnosis, your brain enters theta state — the same brainwave frequency present during deep sleep. In this state, the critical faculty quiets and the subconscious becomes receptive. New neural pathways form. Old beliefs dissolve. This is neuroplasticity, and it is how RewireMode creates lasting change, not just temporary relief.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {['Milton Model', 'Ericksonian Hypnotherapy', 'NLP', 'Neuroplasticity', 'Somatic Anchoring'].map(tag => (
                    <span key={tag} style={{ fontSize: '11px', color: '#a5b4fc', background: 'rgba(99,102,241,0.12)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(99,102,241,0.25)', fontWeight: '600' }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: BASE.textFaint }}>
                <a href="/faq" style={{ color: BASE.textFaint, textDecoration: 'none' }}>How does it work?</a>
                <span>·</span>
                <a href="/pricing" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Pricing</a>
                <span>·</span>
                <a href="/contact" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Contact</a>
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
                <button onClick={() => setStep(isSubliminal ? 4 : 2)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#03050f', fontSize: '15px', fontWeight: '700', boxShadow: `0 4px 20px ${p.glow}` }}>Next →</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: NAME ── */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.textMuted, marginBottom: '12px', fontWeight: '600' }}>MAKE IT PERSONAL</div>
                <p style={{ fontSize: '15px', color: BASE.text, fontWeight: '600', marginBottom: '8px' }}>What's your first name?</p>
                <p style={{ fontSize: '13px', color: BASE.textMuted, lineHeight: 1.6 }}>Optional. If you share it, your name will be woven naturally into your session.</p>
              </div>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name (optional)" autoFocus
                onKeyDown={e => e.key === 'Enter' && setStep(3)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${p.color}33`, background: 'rgba(255,255,255,0.03)', color: BASE.text, fontSize: '16px', marginBottom: '20px', textAlign: 'center', letterSpacing: '0.02em' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#03050f', fontSize: '15px', fontWeight: '700', boxShadow: `0 4px 20px ${p.glow}` }}>
                  {firstName.trim() ? `Continue as ${firstName.trim()} →` : 'Skip →'}
                </button>
              </div>
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
                {VOICES.hypnosis.map(v => (
                  <VoiceCard key={v.id} voice={v} selected={selectedVoice?.id === v.id} onSelect={() => setSelectedVoice(v)} theme={p} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={() => selectedVoice && setStep(4)} disabled={!selectedVoice}
                  style={{ flex: 1, padding: '15px', borderRadius: '12px', background: selectedVoice ? p.grad : 'rgba(255,255,255,0.05)', color: selectedVoice ? '#03050f' : BASE.textFaint, fontSize: '15px', fontWeight: '700', boxShadow: selectedVoice ? `0 4px 20px ${p.glow}` : 'none' }}>Next →</button>
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
                  ['Voice', isSubliminal ? 'Emily (default for subliminal)' : selectedVoice?.name],
                  ['Mood', `${mood}/10 — ${moodLabel}`],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                    <span style={{ color: BASE.textMuted }}>{k}</span>
                    <span style={{ color: BASE.text, fontWeight: '500' }}>{v}</span>
                  </div>
                ))}

                {/* Walking warning */}
                {isWalking && (
                  <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#34d399', lineHeight: 1.6 }}>⚠️ Designed for walking outdoors. Your awareness stays fully active throughout. Do not use while driving.</div>
                  </div>
                )}

                <div style={{ borderTop: `1px solid ${BASE.border}`, paddingTop: '14px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: BASE.textMuted }}>Cost</span>
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
                <button onClick={() => setStep(isSubliminal ? 1 : 3)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={startGenerate}
                  style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#03050f', fontSize: '15px', fontWeight: '800', boxShadow: `0 4px 24px ${p.glow}`, letterSpacing: '0.02em' }}>
                  {user ? '✦ Generate My Audio' : '✦ Sign Up Free and Generate'}
                </button>
              </div>

              {safetyState?.type === 'crisis' && <CrisisBlock onDismiss={clearSafety} />}
              {safetyState?.type === 'block' && (
                <SafetyBlock category={safetyState.category} suggestedRewrite={safetyState.suggestedRewrite}
                  onUseRewrite={(rewrite) => { setGoal('custom'); setCustomGoal(rewrite); clearSafety() }}
                  onDismiss={clearSafety} />
              )}
            </div>
          )}

          {/* ── STEP 5: LOADING ── */}
          {step === 5 && (
            <div style={{ animation: 'fadeUp 0.5s ease both', textAlign: 'center', padding: isMobile ? '20px 0' : '40px 0' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 32px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${p.color}33`, borderTopColor: p.color, animation: 'spin 1.4s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: `1px solid ${p.colorB}44`, borderBottomColor: p.colorB, animation: 'spinR 2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{product?.emoji}</div>
              </div>
              <div style={{ minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', padding: '0 20px' }}>
                <div key={loadMsgIndex} style={{ fontSize: isMobile ? '14px' : '15px', color: p.color, fontWeight: '600', animation: 'fadeMsg 3.5s ease both', maxWidth: '420px', lineHeight: 1.6, textAlign: 'center' }}>
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
              {error ? (
                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,80,80,0.2)', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚠️</div>
                  <div style={{ fontSize: '14px', color: '#ff8a80', marginBottom: '16px' }}>{error}</div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={reset} style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: BASE.text, fontSize: '13px', fontWeight: '600' }}>Try Again</button>
                    <button onClick={async () => {
                      await fetch('/api/report-bug', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error, userId: user?.id, productType: product?.id, goal: activeGoal }) })
                      alert('Bug reported. Thank you!')
                    }} style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8a80', fontSize: '13px', fontWeight: '600' }}>🐛 Report Bug</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px', padding: '24px', borderRadius: '18px', background: p.color + '08', border: `1px solid ${p.color}33`, boxShadow: `0 0 40px ${p.glow}` }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{product?.emoji}</div>
                    <div style={{ fontSize: '20px', color: p.color, fontWeight: '800', marginBottom: '5px' }}>Your {product?.label} is ready</div>
                    <div style={{ fontSize: '12px', color: BASE.textMuted }}>{isSubliminal ? 'Emily' : selectedVoice?.name} · {MUSIC[product?.id]?.label} · Mood {mood}/10</div>
                    {savedOk && <div style={{ marginTop: '10px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>✓ Saved to your library · <a href="/dashboard" style={{ color: '#34d399' }}>View library →</a></div>}
                  </div>

                  <div style={{ background: BASE.bgCard, border: `1px solid ${BASE.border}`, borderRadius: '16px', padding: '22px 24px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: p.color, marginBottom: '12px', fontWeight: '600' }}>YOUR SCRIPT</div>
                    <div style={{ fontSize: '15px', lineHeight: '2', color: BASE.textMuted, whiteSpace: 'pre-wrap', fontFamily: "'Georgia',serif" }}>{script}</div>
                  </div>

                  <div style={{ background: BASE.bgCard, border: `1px solid ${p.color}22`, borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
                    <Waveform active={playing} product={product} />
                    {playing && (
                      <>
                        <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '14px' }}>
                          <div style={{ fontSize: '12px', color: p.color, fontFamily: 'monospace', marginBottom: '3px' }}>{fmt(timer)} — Session in progress</div>
                          <div style={{ fontSize: '11px', color: BASE.textFaint, fontStyle: 'italic' }}>
                            {isSubliminal ? 'Relax and let the music wash over you.' : isWalking ? 'Keep your eyes open. Walk at your own pace.' : 'Close your eyes. Breathe slowly. Let the words reach you.'}
                          </div>
                        </div>
                        {!isSubliminal && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', color: BASE.textFaint, whiteSpace: 'nowrap' }}>🎵 Music</span>
                            <style>{`input[type=range].mv{background:linear-gradient(to right,${p.color},${p.color}33)} input[type=range].mv::-webkit-slider-thumb{background:${p.color};border:none;width:14px;height:14px}`}</style>
                            <input type="range" min="0" max="0.4" step="0.01" value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} className="mv" style={{ flex: 1, height: '3px' }} />
                            <span style={{ fontSize: '11px', color: BASE.textFaint, whiteSpace: 'nowrap' }}>{Math.round(musicVolume * 250)}%</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Controls row */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <button onClick={togglePlay} disabled={!audioUrl}
                      style={{ flex: 1, padding: isMobile ? '14px' : '15px', borderRadius: '12px', background: audioUrl ? p.grad : 'rgba(255,255,255,0.04)', color: '#ffffff', fontSize: isMobile ? '14px' : '15px', fontWeight: '800', boxShadow: audioUrl && !playing ? `0 4px 20px ${p.glow}` : 'none' }}>
                      {playing ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button onClick={replaySession} title="Replay from start"
                      style={{ padding: '14px 16px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: '14px' }}>↩</button>
                    <button onClick={reset} title="New session"
                      style={{ padding: '14px', borderRadius: '12px', border: `1px solid ${BASE.border}`, color: BASE.textMuted, fontSize: isMobile ? '11px' : '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{isMobile ? '+' : 'New'}</button>
                  </div>

                  {/* Loop toggle for subliminal */}
                  {isSubliminal && (
                    <button onClick={() => {
                      const newLoop = !looping
                      setLooping(newLoop)
                      if (audioRef.current) audioRef.current.loop = newLoop
                    }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${looping ? SUBLIMINAL_PRODUCT.color + '44' : BASE.border}`, background: looping ? SUBLIMINAL_PRODUCT.color + '10' : 'transparent', color: looping ? SUBLIMINAL_PRODUCT.color : BASE.textMuted, fontSize: '13px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {looping ? '🔁 Loop On — tap to turn off' : '↩ Loop Off — tap to turn on'}
                    </button>
                  )}

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
            YOUR MIND IS READY TO BE REWIRED
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
            <a href="/terms" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Terms</a>
            <a href="/privacy" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Privacy</a>
            <a href="/faq" style={{ color: BASE.textFaint, textDecoration: 'none' }}>FAQ</a>
            <a href="/pricing" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Pricing</a>
            <a href="/contact" style={{ color: BASE.textFaint, textDecoration: 'none' }}>Contact</a>
          </div>
          {user && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <FeedbackButton userId={user?.id} />
            </div>
          )}
        </div>
      </div>

      {showDisclaimer && <DisclaimerModal onAccept={acceptDisclaimer} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); if (step === 4) startGenerate() }} />}
      {showCredits && user && <CreditsModal profile={profile} user={user} onClose={() => setShowCredits(false)} />}
      {showQuiz && (
        <QuizModal onClose={() => setShowQuiz(false)} onSelect={(selectedGoal) => {
          if (selectedGoal === 'custom') { setGoal('custom') } else { setGoal(selectedGoal) }
          setShowQuiz(false)
        }} />
      )}
    </>
  )
}
