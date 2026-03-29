import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const BASE = {
  bg: '#050a14',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8f4ff',
  textMuted: 'rgba(232,244,255,0.45)',
  textFaint: 'rgba(232,244,255,0.2)',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png.png'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleReset() {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setDone(true)
    setLoading(false)
  }

  return (
    <>
      <Head><title>Reset Password — RewireMode</title></Head>
      <div style={{ minHeight: '100vh', background: BASE.bg, color: BASE.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0} button{cursor:pointer;font-family:inherit} input{font-family:inherit;outline:none}`}</style>

        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,150,255,0.08) 0%,transparent 65%)', filter: 'blur(60px)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <a href="/">
              <img src={LOGO} alt="RewireMode" style={{ height: '160px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => { e.target.style.display='none' }} />
            </a>
          </div>

          <div style={{ background: 'linear-gradient(145deg,#0a1628,#060e1c)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '24px', padding: '40px', boxShadow: '0 0 60px rgba(0,150,255,0.1)' }}>
            {done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>✦</div>
                <h2 style={{ fontSize: '20px', color: '#00d4ff', fontWeight: '700', marginBottom: '10px' }}>Password updated</h2>
                <p style={{ fontSize: '14px', color: BASE.textMuted, marginBottom: '24px', lineHeight: 1.6 }}>Your password has been changed. You can now sign in.</p>
                <a href="/" style={{ display: 'block', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: '#050a14', fontSize: '14px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
                  Back to RewireMode →
                </a>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '21px', color: '#00d4ff', fontWeight: '700', marginBottom: '6px' }}>Set a new password</h2>
                  <p style={{ fontSize: '13px', color: BASE.textMuted }}>Choose something memorable and secure.</p>
                </div>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 6 characters)" type="password"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.04)', color: BASE.text, fontSize: '14px', marginBottom: '12px' }} />
                <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" type="password"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.04)', color: BASE.text, fontSize: '14px', marginBottom: '8px' }}
                  onKeyDown={e => e.key === 'Enter' && handleReset()} />
                {error && <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
                <button onClick={handleReset} disabled={loading}
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'linear-gradient(135deg,#00d4ff,#0088cc)', color: '#050a14', fontSize: '15px', fontWeight: '700', border: 'none', marginTop: '8px' }}>
                  {loading ? 'Updating...' : 'Update Password →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
