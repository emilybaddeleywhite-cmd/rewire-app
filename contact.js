import Head from 'next/head'
import { useState } from 'react'

const BASE = {
  bg: '#03050f',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8f4ff',
  textMuted: 'rgba(232,244,255,0.6)',
  textFaint: 'rgba(232,244,255,0.2)',
  purple: '#7B4FE0',
  purpleLight: '#9B6FF0',
  grad: 'linear-gradient(135deg,#7B4FE0 0%,#4A8FE8 50%,#29BAEF 100%)',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'

const TOPICS = [
  { key: 'general', label: 'General question' },
  { key: 'billing', label: 'Billing or payment' },
  { key: 'technical', label: 'Technical issue' },
  { key: 'safety', label: 'Safety concern' },
  { key: 'feedback', label: 'Feedback or suggestion' },
  { key: 'other', label: 'Something else' },
]

export default function Contact() {
  const [topic, setTopic] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!name || !email || !message || !topic) {
      setError('Please fill in all fields.')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        setError('Something went wrong. Please email us directly at office@rewiremode.com')
      }
    } catch {
      setError('Something went wrong. Please email us directly at office@rewiremode.com')
    }
    setLoading(false)
  }

  const inp = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: `1px solid ${BASE.border}`,
    background: 'rgba(123,79,224,0.04)',
    color: BASE.text,
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '14px',
    boxSizing: 'border-box',
  }

  return (
    <>
      <Head>
        <title>Contact — RewireMode</title>
        <meta name="description" content="Get in touch with the RewireMode team." />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <div style={{ minHeight: '100vh', background: BASE.bg, color: BASE.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:4px}
          input:focus,textarea:focus,select:focus{border-color:rgba(123,79,224,0.5) !important;box-shadow:0 0 0 3px rgba(123,79,224,0.08)}
          input::placeholder,textarea::placeholder{color:rgba(232,244,255,0.25)}
          select option{background:#0d0f1a;color:#e8f4ff}
        `}</style>

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: `1px solid rgba(99,102,241,0.08)`, backdropFilter: 'blur(10px)', background: 'rgba(5,10,20,0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 24px 0' }}>
            <a href="/" style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 14px', borderRadius: '8px', border: `1px solid ${BASE.border}` }}>← Back</a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 10px' }}>
            <a href="/"><img src={LOGO} alt="RewireMode" style={{ height: '120px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => { e.target.style.display='none' }} /></a>
          </div>
        </nav>

        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: BASE.purple, fontWeight: '700', marginBottom: '12px' }}>GET IN TOUCH</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: BASE.text, marginBottom: '12px' }}>Contact</h1>
            <p style={{ fontSize: '14px', color: BASE.textMuted, lineHeight: 1.7 }}>We read every message. For billing or account issues we aim to respond within one working day. For everything else, within three.</p>
          </div>

          {sent ? (
            <div style={{ padding: '32px', borderRadius: '16px', background: 'rgba(123,79,224,0.06)', border: `1px solid rgba(123,79,224,0.2)`, textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✦</div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: BASE.text, marginBottom: '8px' }}>Message received.</p>
              <p style={{ fontSize: '14px', color: BASE.textMuted, lineHeight: 1.7 }}>We'll get back to you at {email}. If it's urgent, you can also reach us at <a href="mailto:office@rewiremode.com" style={{ color: BASE.purpleLight }}>office@rewiremode.com</a>.</p>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BASE.border}`, borderRadius: '16px', padding: '32px' }}>

              {/* Topic */}
              <label style={{ fontSize: '13px', color: BASE.textMuted, display: 'block', marginBottom: '8px' }}>What's this about?</label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                style={{ ...inp, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Select a topic</option>
                {TOPICS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>

              {/* Name */}
              <label style={{ fontSize: '13px', color: BASE.textMuted, display: 'block', marginBottom: '8px' }}>Your name</label>
              <input
                type="text"
                placeholder="First name is fine"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inp}
              />

              {/* Email */}
              <label style={{ fontSize: '13px', color: BASE.textMuted, display: 'block', marginBottom: '8px' }}>Your email</label>
              <input
                type="email"
                placeholder="So we can reply"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inp}
              />

              {/* Message */}
              <label style={{ fontSize: '13px', color: BASE.textMuted, display: 'block', marginBottom: '8px' }}>Message</label>
              <textarea
                placeholder="Tell us what's on your mind"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
              />

              {error && (
                <p style={{ fontSize: '13px', color: '#ff6b6b', marginBottom: '14px', marginTop: '-4px' }}>{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: '100%', padding: '15px', borderRadius: '12px', background: BASE.grad, color: '#fff', fontSize: '15px', fontWeight: '700', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}
              >
                {loading ? 'Sending...' : 'Send message'}
              </button>

              <p style={{ fontSize: '12px', color: BASE.textFaint, textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
                Or email directly: <a href="mailto:office@rewiremode.com" style={{ color: BASE.purpleLight }}>office@rewiremode.com</a>
              </p>
            </div>
          )}

          {/* Footer links */}
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: `1px solid ${BASE.border}`, display: 'flex', gap: '20px', fontSize: '13px' }}>
            <a href="/faq" style={{ color: BASE.purple }}>FAQ</a>
            <a href="/terms" style={{ color: BASE.purple }}>Terms & Policies</a>
            <a href="/privacy" style={{ color: BASE.purple }}>Privacy Policy</a>
            <a href="/" style={{ color: BASE.textFaint }}>Back to RewireMode</a>
          </div>
        </div>
      </div>
    </>
  )
}
