// pages/dashboard.js
// Your Rewire — the personal subconscious library, in the new design system.
// Preserves every existing feature: filtered library, mixed playback (voice +
// atmosphere, subliminal near-silent loop), rename, delete (incl. storage file),
// billing portal, upgrade, sign out, account deletion, feedback.
// Receives user/profile/refreshProfile from _app.js exactly as before.

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import NeuralField from '../components/NeuralField'
import { LOGO_URL } from '../lib/catalog'

const TYPE_META = {
  reset:      { label: 'Reset',      art: 'radial-gradient(circle at 30% 30%, rgba(74,143,232,.55), transparent 60%), radial-gradient(circle at 70% 70%, rgba(108,75,224,.35), transparent 60%), #070A14' },
  sleep:      { label: 'Sleep',      art: 'radial-gradient(circle at 30% 30%, rgba(108,75,224,.55), transparent 60%), radial-gradient(circle at 70% 70%, rgba(74,143,232,.3), transparent 60%), #070A14' },
  walking:    { label: 'Walking',    art: 'radial-gradient(circle at 30% 30%, rgba(62,193,240,.5), transparent 60%), radial-gradient(circle at 70% 70%, rgba(74,143,232,.35), transparent 60%), #070A14' },
  subliminal: { label: 'Subliminal', art: 'radial-gradient(circle at 30% 30%, rgba(62,193,240,.45), transparent 60%), radial-gradient(circle at 70% 70%, rgba(108,75,224,.4), transparent 60%), #070A14' },
  hype:       { label: 'Session',    art: 'radial-gradient(circle at 30% 30%, rgba(94,155,242,.45), transparent 60%), #070A14' }, // legacy
}
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'reset', label: 'Reset' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'walking', label: 'Walking' },
  { id: 'subliminal', label: 'Subliminal' },
]

export default function Dashboard({ user, profile, refreshProfile, loading: authLoading }) {
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState(null)
  const [loopingId, setLoopingId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [showAccount, setShowAccount] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const audioRef = useRef(null)
  const musicRef = useRef(null)

  const isPro = profile?.plan === 'pro' || profile?.plan === 'lifetime'

  useEffect(() => { if (user) fetchSessions() }, [user, filter])

  // Resolve the storage path for a session. Prefers the stored audio_path;
  // falls back to extracting it from an older audio_url so existing sessions
  // (saved before audio_path existed) still replay.
  function pathFromSession(s) {
    if (s.audio_path) return s.audio_path
    if (!s.audio_url) return null
    try {
      const m = new URL(s.audio_url).pathname.match(/\/audio\/(.+)$/)
      return m ? decodeURIComponent(m[1]) : null
    } catch { return null }
  }

  async function fetchSessions() {
    setLoading(true)
    let query = supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('product_type', filter)
    const { data } = await query
    const rows = data || []

    // The audio bucket is private, so signed URLs expire. Mint fresh ones from
    // the stored paths on every load — saved sessions then replay indefinitely.
    const paths = [...new Set(rows.map(pathFromSession).filter(Boolean))]
    const urlByPath = {}
    if (paths.length) {
      const { data: signed } = await supabase.storage.from('audio').createSignedUrls(paths, 60 * 60 * 24)
      if (signed) signed.forEach(s => { if (s.signedUrl && !s.error) urlByPath[s.path] = s.signedUrl })
    }
    const withUrls = rows.map(s => ({ ...s, playUrl: urlByPath[pathFromSession(s)] || s.audio_url || null }))

    setSessions(withUrls)
    setLoading(false)
  }

  // ── playback (identical behaviour to the previous dashboard) ────
  function togglePlay(session) {
    const isSubliminal = session.product_type === 'subliminal'
    const musicUrl = session.music_url || null
    if (playingId === session.id) {
      audioRef.current?.pause()
      if (musicRef.current) { musicRef.current.pause(); musicRef.current.src = '' }
      setPlayingId(null)
    } else {
      if (audioRef.current) audioRef.current.pause()
      if (musicRef.current) { musicRef.current.pause(); musicRef.current.src = '' }
      setPlayingId(session.id)
      if (isSubliminal) setLoopingId(session.id)
      const shouldLoop = isSubliminal ? true : loopingId === session.id
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = session.playUrl || session.audio_url
          audioRef.current.volume = isSubliminal ? 0.001 : 1.0
          audioRef.current.loop = shouldLoop
          audioRef.current.play().catch(() => setPlayingId(null))
        }
        if (musicUrl && musicRef.current) {
          musicRef.current.src = musicUrl
          musicRef.current.volume = isSubliminal ? 0.22 : 0.18
          musicRef.current.loop = true
          musicRef.current.play().catch(() => {})
        }
      }, 50)
    }
  }

  function toggleLoop(session) {
    const isSubliminal = session.product_type === 'subliminal'
    const isNowLooping = isSubliminal ? true : loopingId !== session.id
    setLoopingId(isNowLooping ? session.id : null)
    if (audioRef.current && playingId === session.id) audioRef.current.loop = isNowLooping
  }

  async function renameSession(sessionId, newName) {
    if (!newName?.trim()) { setRenamingId(null); return }
    // The rename API requires a Bearer token — the previous dashboard never
    // sent one, so renames were silently failing with 401. Fixed here.
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/rename-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ sessionId, userId: user.id, newName }),
    })
    setRenamingId(null)
    fetchSessions()
  }

  async function deleteSession(session) {
    const path = pathFromSession(session)
    if (path) {
      try { await supabase.storage.from('audio').remove([path]) }
      catch (e) { console.warn('Could not delete audio file from storage:', e) }
    }
    await supabase.from('sessions').delete().eq('id', session.id)
    setConfirmDeleteId(null)
    fetchSessions()
    refreshProfile?.()
  }

  async function manageBilling() {
    setBillingLoading(true)
    const res = await fetch('/api/billing-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert(data.error || 'Could not open billing portal. Please contact support.')
    setBillingLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  // ── signed out / loading ─────────────────────────────────────────
  if (authLoading) return <Shell><p className="quiet center">One moment…</p></Shell>
  if (!user) return (
    <Shell>
      <div className="signedout">
        <p className="serif">Your library is waiting.</p>
        <a className="cta" href="/rewire">Sign in</a>
      </div>
    </Shell>
  )

  const streak = profile?.streak_count || 0

  return (
    <Shell>
      <Head><title>Your Rewires — RewireMode</title></Head>

      {/* HEADER */}
      <div className="welcome">
        <div>
          <div className="eyebrow">Your journey</div>
          <h1 className="serif">Welcome back.</h1>
          {streak > 0
            ? <p className="streakline"><span className="flame">🔥</span> Day {streak} — your mind is rewiring with every session.</p>
            : <p className="streakline quiet">Begin today, and tomorrow becomes Day 2.</p>}
        </div>
        <a className="cta" href="/rewire">Create a Rewire</a>
      </div>

      {/* FILTERS */}
      <div className="chips">
        {FILTERS.map(f => (
          <button key={f.id} className={`chip ${filter === f.id ? 'on' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      {/* LIBRARY */}
      {loading ? (
        <p className="quiet center" style={{ padding: '60px 0' }}>Opening your library…</p>
      ) : sessions.length === 0 ? (
        <div className="empty">
          <p className="serif" style={{ fontSize: 22 }}>Nothing here yet.</p>
          <p className="quiet">Your first Rewire takes five minutes to create — and it&rsquo;s written only for you.</p>
          <a className="cta" href="/rewire" style={{ marginTop: 22 }}>Create your first Rewire</a>
        </div>
      ) : (
        <div className="library">
          {sessions.map(s => {
            const meta = TYPE_META[s.product_type] || TYPE_META.hype
            const isPlaying = playingId === s.id
            const isLooping = loopingId === s.id || s.product_type === 'subliminal'
            return (
              <div key={s.id} className={`row ${isPlaying ? 'live' : ''}`}>
                <button className="art" style={{ background: meta.art }} onClick={() => togglePlay(s)} aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying
                    ? <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                    : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                </button>
                <div className="rinfo" onClick={() => togglePlay(s)}>
                  {renamingId === s.id ? (
                    <input className="rename" autoFocus value={renameValue}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') renameSession(s.id, renameValue); if (e.key === 'Escape') setRenamingId(null) }}
                      onBlur={() => setRenamingId(null)} />
                  ) : (
                    <h3>{s.custom_name || s.goal || 'Untitled Rewire'}</h3>
                  )}
                  <p>{meta.label} · {fmtDate(s.created_at)}{isPlaying ? ' · playing' : ''}</p>
                </div>
                <div className="ractions">
                  <button className={`icon ${isLooping ? 'on' : ''}`} title="Loop" onClick={() => toggleLoop(s)}>
                    <svg viewBox="0 0 24 24" fill="none"><path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4m14-3v1a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button className="icon" title="Rename" onClick={() => { setRenamingId(s.id); setRenameValue(s.custom_name || s.goal || '') }}>
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  {confirmDeleteId === s.id ? (
                    <button className="icon danger on" title="Confirm delete" onClick={() => deleteSession(s)}>Sure?</button>
                  ) : (
                    <button className="icon danger" title="Delete" onClick={() => { setConfirmDeleteId(s.id); setTimeout(() => setConfirmDeleteId(c => c === s.id ? null : c), 3000) }}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* UPGRADE WHISPER (free users only) */}
      {!isPro && sessions.length > 0 && (
        <div className="whisper">
          <p>Unlock every voice, unlimited listening, and your full library with <a href="/pricing">RewireMode Pro</a>.</p>
        </div>
      )}

      {/* ACCOUNT */}
      <div className="account">
        <button className="acc-toggle" onClick={() => setShowAccount(v => !v)}>
          Account & settings {showAccount ? '−' : '+'}
        </button>
        {showAccount && (
          <div className="acc-body">
            <div className="acc-grid">
              <div><span className="quiet">Plan</span><b>{profile?.plan === 'lifetime' ? 'Founder' : isPro ? 'Pro' : 'Free'}</b></div>
              <div><span className="quiet">Credits</span><b>✦ {profile?.credits ?? 0}</b></div>
              <div><span className="quiet">Streak</span><b>{streak} days</b></div>
              <div><span className="quiet">Email</span><b style={{ fontSize: 13 }}>{user.email}</b></div>
            </div>
            <div className="acc-actions">
              {isPro
                ? <button className="quietbtn" disabled={billingLoading} onClick={manageBilling}>{billingLoading ? 'Opening…' : 'Manage billing'}</button>
                : <a className="quietbtn" href="/pricing">Upgrade to Pro</a>}
              <button className="quietbtn" onClick={() => setShowFeedback(true)}>Share feedback</button>
              <button className="quietbtn" onClick={signOut}>Sign out</button>
              <button className="quietbtn danger" onClick={() => setShowDeleteAccount(true)}>Delete account</button>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} onEnded={() => { if (!loopingId) { setPlayingId(null); if (musicRef.current) musicRef.current.pause() } }} />
      <audio ref={musicRef} />

      {showFeedback && <FeedbackModal userId={user.id} onClose={() => setShowFeedback(false)} />}
      {showDeleteAccount && <DeleteAccountModal user={user} onClose={() => setShowDeleteAccount(false)} />}
    </Shell>
  )
}

// ── shell with nav + styles ────────────────────────────────────────
function Shell({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Newsreader:ital,opsz,wght@1,6..72,300;1,6..72,400&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/FLAVICON.png" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <NeuralField intensity="ambient" />
      <div className="shell">
        <nav className="nav">
          <a href="/"><img src={LOGO_URL} alt="RewireMode" className="navlogo" /></a>
          <a className="navlink" href="/rewire">+ New Rewire</a>
        </nav>
        {children}
      </div>
    </>
  )
}

// ── feedback modal (same API, new skin) ────────────────────────────
function FeedbackModal({ userId, onClose }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  async function submit() {
    if (!text.trim()) return
    setBusy(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: text, userId }),
    })
    setSent(true); setBusy(false)
    setTimeout(onClose, 1600)
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {sent ? (
          <p className="serif center" style={{ fontSize: 20 }}>Thank you. We read everything.</p>
        ) : (
          <>
            <h3 className="mtitle">What could be better?</h3>
            <textarea className="mtext" rows={4} placeholder="Your thoughts…" value={text} onChange={e => setText(e.target.value)} />
            <button className="cta full" disabled={busy || !text.trim()} onClick={submit}>{busy ? 'Sending…' : 'Send'}</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── delete account modal (same API contract, new skin) ─────────────
function DeleteAccountModal({ user, onClose }) {
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function handleDelete() {
    if (confirm !== 'DELETE') { setError('Type DELETE to confirm.'); return }
    setBusy(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deletion failed')
      await supabase.auth.signOut()
      window.location.href = '/?deleted=1'
    } catch (err) { setError(err.message); setBusy(false) }
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="mtitle">Delete your account</h3>
        <p className="quiet" style={{ marginBottom: 18, lineHeight: 1.7 }}>
          This permanently deletes your account, every saved Rewire, and all audio. It cannot be undone.
          Type <b style={{ color: '#f87171' }}>DELETE</b> to confirm.
        </p>
        <input className="mtext" style={{ textAlign: 'center', letterSpacing: '0.1em' }} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE" />
        {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>}
        <button className="cta full danger" disabled={busy || confirm !== 'DELETE'} onClick={handleDelete}>
          {busy ? 'Deleting…' : 'Permanently delete my account'}
        </button>
        <button className="switch" onClick={onClose}>Cancel — keep my account</button>
      </div>
    </div>
  )
}

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#05070F;color:#EDEFF7;font-family:'Sora','Segoe UI',system-ui,sans-serif;font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::selection{background:rgba(94,155,242,0.3)}
  a{text-decoration:none;color:inherit}
  button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
  input,textarea{font-family:inherit;outline:none}

  .shell{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:0 22px 80px;min-height:100svh}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:22px 0 10px}
  .navlogo{height:42px;mix-blend-mode:lighten;display:block}
  .navlink{font-size:13px;color:#5E9BF2;border:1px solid rgba(146,168,255,0.24);border-radius:100px;padding:9px 18px;transition:background .3s}
  .navlink:hover{background:rgba(94,155,242,0.12)}

  .serif{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;letter-spacing:-0.01em}
  .quiet{color:#5A6280;font-size:13px}
  .center{text-align:center}
  .eyebrow{font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#5E9BF2;margin-bottom:10px}

  .welcome{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin:36px 0 30px}
  .welcome h1{font-size:clamp(30px,6vw,40px);margin-bottom:8px}
  .streakline{font-size:14px;color:#9AA3C2}
  .flame{margin-right:4px}

  .cta{display:inline-block;font-weight:600;font-size:14px;color:#fff;padding:15px 28px;border-radius:100px;background:linear-gradient(120deg,#6C4BE0 0%,#4A8FE8 52%,#3EC1F0 100%);box-shadow:0 0 0 1px rgba(146,168,255,.15),0 8px 30px rgba(94,155,242,.2);transition:transform .4s cubic-bezier(0.22,1,0.36,1);text-align:center}
  .cta:hover{transform:translateY(-1px)}
  .cta:disabled{background:rgba(255,255,255,.05);color:#5A6280;box-shadow:none;cursor:default}
  .cta.full{width:100%;display:block}
  .cta.danger{background:rgba(248,113,113,0.14);box-shadow:none;border:1px solid rgba(248,113,113,0.4);color:#f87171}

  .chips{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:22px}
  .chip{font-size:13px;color:#9AA3C2;border:1px solid rgba(146,168,255,0.10);border-radius:100px;padding:8px 16px;transition:all .35s}
  .chip:hover{border-color:rgba(146,168,255,0.24);color:#EDEFF7}
  .chip.on{border-color:#5E9BF2;color:#EDEFF7;background:rgba(94,155,242,0.12)}

  .library{display:flex;flex-direction:column;gap:11px}
  .row{display:flex;align-items:center;gap:16px;border:1px solid rgba(146,168,255,0.10);border-radius:18px;background:rgba(255,255,255,0.025);padding:12px 14px;transition:border-color .35s,background .35s}
  .row:hover{border-color:rgba(146,168,255,0.24)}
  .row.live{border-color:#5E9BF2;background:rgba(94,155,242,0.08)}
  .art{width:56px;height:56px;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:transform .3s cubic-bezier(0.22,1,0.36,1)}
  .art:hover{transform:scale(1.05)}
  .art svg{width:18px;height:18px;fill:#fff;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))}
  .rinfo{flex:1;min-width:0;cursor:pointer}
  .rinfo h3{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rinfo p{font-size:12px;color:#5A6280;margin-top:2px}
  .rename{width:100%;background:rgba(94,155,242,0.08);border:1px solid rgba(146,168,255,0.24);border-radius:8px;color:#EDEFF7;font-size:15px;padding:6px 10px}
  .ractions{display:flex;gap:6px;flex-shrink:0}
  .icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#5A6280;border:1px solid transparent;transition:all .3s;font-size:11px}
  .icon svg{width:15px;height:15px}
  .icon:hover{color:#EDEFF7;border-color:rgba(146,168,255,0.24)}
  .icon.on{color:#5E9BF2;border-color:rgba(94,155,242,0.4);background:rgba(94,155,242,0.1)}
  .icon.danger:hover{color:#f87171;border-color:rgba(248,113,113,0.4)}
  .icon.danger.on{color:#f87171;border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.08);width:auto;padding:0 10px;border-radius:100px}

  .empty{text-align:center;padding:70px 20px;border:1px dashed rgba(146,168,255,0.18);border-radius:24px}
  .empty .quiet{max-width:340px;margin:10px auto 0}
  .empty .cta{display:inline-block}

  .whisper{text-align:center;margin-top:30px}
  .whisper p{font-size:13px;color:#5A6280}
  .whisper a{color:#5E9BF2}

  .account{margin-top:60px;border-top:1px solid rgba(146,168,255,0.10);padding-top:24px}
  .acc-toggle{font-size:13px;color:#5A6280;transition:color .3s}
  .acc-toggle:hover{color:#9AA3C2}
  .acc-body{margin-top:20px;animation:fadein .4s ease}
  @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .acc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:22px}
  .acc-grid>div{border:1px solid rgba(146,168,255,0.10);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:4px}
  .acc-grid b{font-weight:600;font-size:15px}
  .acc-actions{display:flex;gap:10px;flex-wrap:wrap}
  .quietbtn{font-size:13px;color:#9AA3C2;border:1px solid rgba(146,168,255,0.10);border-radius:100px;padding:10px 18px;transition:all .3s;display:inline-block}
  .quietbtn:hover{color:#EDEFF7;border-color:rgba(146,168,255,0.24)}
  .quietbtn.danger{color:#7a5560}
  .quietbtn.danger:hover{color:#f87171;border-color:rgba(248,113,113,0.4)}

  .signedout{min-height:60svh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center}
  .signedout .serif{font-size:26px;color:#9AA3C2}

  .overlay{position:fixed;inset:0;z-index:50;background:rgba(3,5,12,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{width:100%;max-width:400px;background:#0A0D1A;border:1px solid rgba(146,168,255,0.24);border-radius:24px;padding:32px;animation:fadein .35s cubic-bezier(0.22,1,0.36,1)}
  .mtitle{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;font-size:23px;margin-bottom:14px}
  .mtext{width:100%;padding:14px 16px;border-radius:12px;border:1px solid rgba(146,168,255,0.10);background:rgba(255,255,255,0.025);color:#EDEFF7;font-size:14px;margin-bottom:14px;resize:vertical;transition:border-color .3s}
  .mtext:focus{border-color:rgba(146,168,255,0.24)}
  .switch{display:block;margin:14px auto 0;font-size:13px;color:#5A6280;text-decoration:underline}

  @media(max-width:560px){
    .welcome{flex-direction:column;align-items:flex-start}
    .welcome .cta{width:100%}
    .ractions .icon:first-child{display:none} /* hide loop on tight screens; subliminals still auto-loop */
  }
  @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`
