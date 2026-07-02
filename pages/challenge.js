// pages/challenge.js
// The 7-Day Rewire. Loads a challenge by ?id=, shows the streak tracker, builds
// the toolkit for the goal (Reset + Walking free; Sleep + Subliminal gated to
// Unlimited). Each session is created through a setup sheet that lets you choose
// a voice and an atmosphere and then read the script — mirroring /rewire — and
// plays sessions (reusing the proven voice+atmosphere mixing), logging each
// listen so the streak advances on PLAY, not generation.
// Receives user/profile from _app.js, exactly like the dashboard.

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import NeuralField from '../components/NeuralField'
import { LOGO_URL, EXPERIENCES, VOICES, atmospheresFor, CREATION_PHASES, isTypeFree } from '../lib/catalog'

const ORDER = ['reset', 'walking', 'sleep', 'subliminal']

// Solstice offer runs through 25 Jun. Ends midnight 26 Jun BST (UK) = 23:00 UTC on the 25th.
const SOLSTICE_END = Date.parse('2026-06-25T23:00:00Z')

export default function Challenge({ user, profile, loading: authLoading }) {
  const [challengeId, setChallengeId] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [sessions, setSessions] = useState([])
  const [daysListened, setDaysListened] = useState([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [genType, setGenType] = useState(null)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [playingId, setPlayingId] = useState(null)
  const [paywall, setPaywall] = useState(null)

  // ── setup sheet (voice + atmosphere chooser) ──
  const [setupType, setSetupType] = useState(null)
  const [setupVoice, setSetupVoice] = useState(null)
  const [setupAtmo, setSetupAtmo] = useState(null)
  const [previewingId, setPreviewingId] = useState(null)

  // ── script panel + checkout ──
  const [openScript, setOpenScript] = useState(null)
  const [checkoutBusy, setCheckoutBusy] = useState(null)
  const [now, setNow] = useState(SOLSTICE_END) // avoids hydration mismatch; real value set on mount
  const [genStatus, setGenStatus] = useState(null) // { isSubscribed, trialEligible, amountLabel, hasUnusedCredit }

  const audioRef = useRef(null)
  const musicRef = useRef(null)
  const previewRef = useRef(null)
  const phaseRef = useRef(null)

  const isPaid = !!(profile?.plan && profile.plan !== 'free')
  const solsticeLive = now < SOLSTICE_END

  useEffect(() => {
    setChallengeId(new URLSearchParams(window.location.search).get('id'))
    setNow(Date.now())
  }, [])

  useEffect(() => {
    if (user && challengeId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, challengeId])

  useEffect(() => () => {
    clearInterval(phaseRef.current)
    audioRef.current?.pause(); musicRef.current?.pause(); previewRef.current?.pause()
  }, [])

  function localDate(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  function prevDay(ymd) {
    const d = new Date(ymd + 'T00:00:00'); d.setDate(d.getDate() - 1); return localDate(d)
  }
  function computeStreak(daysAsc) {
    const set = new Set(daysAsc)
    if (!set.size) return 0
    let cur = localDate()
    if (!set.has(cur)) cur = prevDay(cur)
    let n = 0
    while (set.has(cur)) { n++; cur = prevDay(cur) }
    return n
  }
  function pathFromSession(s) {
    if (s.audio_path) return s.audio_path
    if (!s.audio_url) return null
    try { const m = new URL(s.audio_url).pathname.match(/\/audio\/(.+)$/); return m ? decodeURIComponent(m[1]) : null }
    catch { return null }
  }

  async function load() {
    setLoading(true)
    const { data: ch } = await supabase.from('challenges').select('*').eq('id', challengeId).single()
    setChallenge(ch || null)

    const { data: rows } = await supabase.from('sessions').select('*').eq('challenge_id', challengeId).order('created_at')
    const paths = [...new Set((rows || []).map(pathFromSession).filter(Boolean))]
    const urlByPath = {}
    if (paths.length) {
      const { data: signed } = await supabase.storage.from('audio').createSignedUrls(paths, 60 * 60 * 24)
      if (signed) signed.forEach(s => { if (s.signedUrl && !s.error) urlByPath[s.path] = s.signedUrl })
    }
    setSessions((rows || []).map(s => ({ ...s, playUrl: urlByPath[pathFromSession(s)] || s.audio_url || null })))

    const { data: plays } = await supabase.from('session_plays').select('played_on').eq('user_id', user.id).eq('challenge_id', challengeId)
    const days = [...new Set((plays || []).map(p => p.played_on))].sort()
    setDaysListened(days)
    setStreak(computeStreak(days))
    setLoading(false)
  }

  function sessionOfType(t) { return sessions.find(s => s.product_type === t) }

  // ── open the voice + atmosphere chooser for a type ──
  function openSetup(t) {
    if (genType || sessionOfType(t)) return
    const v = VOICES.find(x => x.free) || VOICES[0]
    const tracks = atmospheresFor(t)
    const a = tracks.find(x => x.free) || tracks[0]
    setSetupVoice(v); setSetupAtmo(a); setSetupType(t)
  }

  // ── voice preview (static sample mp3s — no API cost) ──
  function togglePreview(v, e) {
    e?.stopPropagation()
    if (previewingId === v.id) { previewRef.current?.pause(); setPreviewingId(null); return }
    if (previewRef.current) previewRef.current.pause()
    previewRef.current = new Audio(v.preview)
    previewRef.current.play().catch(() => {})
    previewRef.current.onended = () => setPreviewingId(null)
    setPreviewingId(v.id)
  }

  // ── generation: ONE generation per type, cached. No regeneration. ──
  async function generate(typeId, voice, atmo) {
    if (!challenge || genType || sessionOfType(typeId)) return
    if (!isTypeFree(typeId) && !isPaid) {
      // Check for an already-purchased credit before blocking — someone who
      // paid for this type must be let straight through, never shown the
      // paywall again. Without this check, a credit holder tapping "create"
      // gets sent to the paywall every single time, with no way through.
      let credited = false
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const r = await fetch('/api/generation-status', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ userId: user.id, productType: typeId }),
        })
        const d = await r.json()
        credited = !!d.hasUnusedCredit
      } catch (e) { /* fall through to the paywall on any error */ }
      if (!credited) { setSetupType(null); setPaywall(typeId); return }
    }
    previewRef.current?.pause(); setPreviewingId(null)
    setSetupType(null)
    setGenType(typeId); setPhaseIdx(0)
    let pi = 0
    phaseRef.current = setInterval(() => { pi = Math.min(pi + 1, CREATION_PHASES.length - 1); setPhaseIdx(pi) }, 4000)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const v = voice || VOICES.find(x => x.free) || VOICES[0]
      const tracks = atmospheresFor(typeId)
      const a = atmo || tracks.find(x => x.free) || tracks[0]

      const sr = await fetch('/api/generate-script', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goal: challenge.goal, productType: typeId, mood: 5, userId: user.id, firstName: null }),
      })
      const sd = await sr.json()
      if (!sr.ok) throw new Error(sd.error || 'Could not write the script')

      const ar = await fetch('/api/generate-audio', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: sd.script, voiceId: v.id, productType: typeId, userId: user.id }),
      })
      const ad = await ar.json()
      if (!ar.ok) throw new Error(ad.error || 'Could not create the audio')

      await fetch('/api/save-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: user.id, goal: challenge.goal, productType: typeId, script: sd.script,
          audioUrl: ad.audioUrl, audioPath: ad.audioPath || null, voiceId: v.id, mood: 5,
          musicUrl: a?.url || null, challengeId,
        }),
      })
      clearInterval(phaseRef.current); setGenType(null); load()
    } catch (e) {
      clearInterval(phaseRef.current); setGenType(null)
      alert(e.message || 'Something went wrong. Please try again.')
    }
  }

  // ── in-place Stripe checkout (email already known from signup) ──
  async function checkout(planKey) {
    if (!user) { window.location.href = '/pricing'; return }
    setCheckoutBusy(planKey)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ plan: planKey, userId: user.id, email: user.email }),
      })
      const d = await r.json()
      if (d.url) { window.location.href = d.url; return }
      throw new Error(d.error || 'Could not open checkout')
    } catch (e) {
      setCheckoutBusy(null)
      alert(e.message || 'Could not open checkout. Please try again.')
    }
  }

  // ── one-time purchase of a single generation (£1 first ever, £2/£3 after) ──
  async function buyGeneration(type) {
    if (!user) { window.location.href = '/pricing'; return }
    setCheckoutBusy('gen-' + type)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/create-generation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: user.id, email: user.email, productType: type, redirectPath: '/challenge?id=' + challengeId }),
      })
      const d = await r.json()
      if (d.url) { window.location.href = d.url; return }
      throw new Error(d.error || 'Could not open checkout')
    } catch (e) {
      setCheckoutBusy(null)
      alert(e.message || 'Could not open checkout. Please try again.')
    }
  }

  // ── fetch the correct price/eligibility whenever the paywall opens ──
  useEffect(() => {
    if (!paywall || !user) { setGenStatus(null); return }
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const r = await fetch('/api/generation-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ userId: user.id, productType: paywall }),
        })
        setGenStatus(await r.json())
      } catch (e) { setGenStatus(null) }
    })()
  }, [paywall, user])

  async function play(s) {
    if (playingId === s.id) {
      audioRef.current?.pause()
      if (musicRef.current) { musicRef.current.pause(); musicRef.current.src = '' }
      setPlayingId(null)
      return
    }
    if (audioRef.current) audioRef.current.pause()
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.src = '' }
    const isSub = s.product_type === 'subliminal'
    setPlayingId(s.id)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = s.playUrl || s.audio_url
        audioRef.current.volume = isSub ? 0.001 : 1.0
        audioRef.current.loop = isSub
        audioRef.current.play().catch(() => setPlayingId(null))
      }
      if (s.music_url && musicRef.current) {
        musicRef.current.src = s.music_url
        musicRef.current.volume = isSub ? 0.22 : 0.18
        musicRef.current.loop = true
        musicRef.current.play().catch(() => {})
      }
    }, 50)

    // log the listen — this is what advances the streak
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/log-listen', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: user.id, challengeId, clientDate: localDate() }),
      })
      const d = await r.json()
      if (r.ok && typeof d.streak === 'number') { setStreak(d.streak); if (d.daysListened) setDaysListened(d.daysListened) }
    } catch (_) { /* listening still works even if logging hiccups */ }
  }

  const litDays = Math.min(7, daysListened.length)
  const completed = (challenge?.completed_at) || litDays >= 7 || streak >= 7

  if (authLoading || (loading && user)) return <Shell><p className="quiet center" style={{ padding: '80px 0' }}>Opening your Rewire…</p></Shell>
  if (!user) return <Shell><div className="empty"><p className="serif" style={{ fontSize: 22 }}>Sign in to continue your Rewire.</p><a className="cta" href="/rewire" style={{ marginTop: 18 }}>Sign in</a></div></Shell>
  if (!challenge) return <Shell><div className="empty"><p className="serif" style={{ fontSize: 22 }}>This Rewire couldn&rsquo;t be found.</p><a className="cta" href="/dashboard" style={{ marginTop: 18 }}>Back to your account</a></div></Shell>

  const setupExp = setupType ? EXPERIENCES.find(e => e.id === setupType) : null
  const setupTracks = setupType ? atmospheresFor(setupType) : []

  return (
    <Shell>
      <Head><title>Your 7-Day Rewire — RewireMode</title></Head>

      <div className="head">
        <div className="eyebrow">Your 7-Day Rewire</div>
        <h1 className="serif grad">{challenge.goal}</h1>
      </div>

      {/* tracker */}
      <div className="panel">
        <div className="orbs">
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <div key={n} className={`day ${n <= litDays ? 'done' : ''} ${n === litDays + 1 ? 'next' : ''}`}>{n}</div>
          ))}
        </div>
        <p className="streakline serif">
          {streak > 0 ? `Day ${litDays} — a ${streak}-day streak. Beautifully done.` : 'Listen to a session today to begin your streak.'}
        </p>
        <p className="quiet center">Listen to at least one session a day. The more you return, the deeper it settles.</p>
      </div>

      {/* toolkit */}
      <div className="eyebrow" style={{ marginTop: 34, marginBottom: 14 }}>Your sessions</div>
      <div className="grid">
        {ORDER.map(t => {
          const exp = EXPERIENCES.find(e => e.id === t)
          const s = sessionOfType(t)
          const isPlaying = s && playingId === s.id
          const creating = genType === t
          return (
            <div key={t} className="card">
              <div className="cname">{exp.name}</div>
              <div className="cmeta">{exp.meta}</div>
              <p className="cdesc">{exp.desc}</p>
              {s ? (
                <>
                  <button className="cbtn play" onClick={() => play(s)}>{isPlaying ? '❚❚ Pause' : '▶ Play'}</button>
                  <button className="scriptbtn" onClick={() => setOpenScript(openScript === s.id ? null : s.id)}>
                    {openScript === s.id ? 'Hide the words ↑' : 'Read the words ↓'}
                  </button>
                  {openScript === s.id && (
                    <div className="scriptbox"><p>{s.script}</p></div>
                  )}
                </>
              ) : creating ? (
                <button className="cbtn" disabled>✦ {CREATION_PHASES[phaseIdx]}…</button>
              ) : (
                <button className="cbtn" onClick={() => openSetup(t)} disabled={!!genType}>Create this session</button>
              )}
            </div>
          )
        })}
      </div>

      {!isPaid && (
        <div className="upsell">
          <p>Each session is personalised just for you. Go <a href="/pricing">Unlimited</a> for every type, every goal, forever.</p>
        </div>
      )}


      {/* day 7 */}
      {completed && (
        <div className="share">
          <div className="eyebrow" style={{ color: '#5E9BF2' }}>7 days complete</div>
          <div className="bigserif serif grad">{challenge.goal}</div>
          <p className="quiet" style={{ marginTop: 12 }}>You showed up for seven days. That is how a mind rewires.</p>
          <a className="cta" href="/dashboard" style={{ marginTop: 20 }}>Back to your account</a>
        </div>
      )}

      {/* ── SETUP SHEET · choose voice + atmosphere, then create ── */}
      {setupType && setupExp && (
        <div className="sheetwrap" onClick={() => { previewRef.current?.pause(); setPreviewingId(null); setSetupType(null) }}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="eyebrow">{setupExp.name} · {setupExp.meta}</div>
            <h3 className="serif" style={{ fontSize: 22, marginTop: 8 }}>Shape this session</h3>

            <div className="setlabel">Choose your voice</div>
            {VOICES.map(v => {
              const vlocked = v.proOnly && !isPaid
              return (
                <div key={v.id}
                  className={`setrow ${setupVoice?.id === v.id ? 'on' : ''} ${vlocked ? 'locked' : ''}`}
                  onClick={() => { if (!vlocked) setSetupVoice(v) }}>
                  <div className="vi">
                    <h5>{v.name}{vlocked && <span className="pro">Pro</span>}</h5>
                    <small>{v.desc}</small>
                  </div>
                  <button className="setpv" aria-label={`Preview ${v.name}`} onClick={e => togglePreview(v, e)}>
                    {previewingId === v.id
                      ? <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                      : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                  </button>
                </div>
              )
            })}
            {VOICES.some(v => v.proOnly) && !isPaid && (
              <p className="quiet" style={{ marginTop: 4 }}>More voices unlock with <a href="/pricing" style={{ color: '#5E9BF2' }}>Unlimited</a>.</p>
            )}

            <div className="setlabel">Choose your atmosphere</div>
            <div className="atmgrid">
              {setupTracks.map(a => {
                const alocked = a.proOnly && !isPaid
                return (
                  <button key={a.id}
                    className={`atmo ${setupAtmo?.id === a.id ? 'on' : ''} ${alocked ? 'locked' : ''}`}
                    onClick={() => { if (!alocked) setSetupAtmo(a) }}>
                    <h5>{a.name}{alocked && <span className="pro">Pro</span>}</h5>
                    <small>{a.desc}</small>
                  </button>
                )
              })}
            </div>

            <button className="cta" style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 18 }}
              onClick={() => generate(setupType, setupVoice, setupAtmo)}>
              Create this session
            </button>
            <button className="sheetdismiss" onClick={() => { previewRef.current?.pause(); setPreviewingId(null); setSetupType(null) }}>Not now</button>
          </div>
        </div>
      )}

      {/* ── PAYWALL · in-place checkout for gated sessions ── */}
      {paywall && (
        <div className="sheetwrap" onClick={() => setPaywall(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="eyebrow" style={{ color: '#E2A24A' }}>🔒 {EXPERIENCES.find(e => e.id === paywall)?.name}</div>
            <h3 className="serif" style={{ fontSize: 23, marginTop: 10 }}>
              {genStatus?.hasUnusedCredit ? 'You already paid for this' : 'Unlock this session'}
            </h3>
            <p className="quiet" style={{ marginTop: 8, lineHeight: 1.7 }}>
              Every session is personalised and generated just for you, which costs real money to create — so each one is either purchased individually or included with Unlimited.
            </p>

            <div className="planbtns">
              {genStatus?.hasUnusedCredit ? (
                <button className="planbtn best" onClick={() => setPaywall(null)}>
                  Continue — tap the session again to create it
                </button>
              ) : (
                <button className="planbtn best" disabled={!!checkoutBusy} onClick={() => buyGeneration(paywall)}>
                  {checkoutBusy === 'gen-' + paywall
                    ? 'Opening…'
                    : genStatus
                    ? `Get this for ${genStatus.amountLabel}`
                    : 'Get this session'}
                  <small>{genStatus?.trialEligible ? 'your first one — just this once' : 'one-time purchase, this session only'}</small>
                </button>
              )}
              <div className="feat2" style={{ marginTop: 14 }}>✦ Or go Unlimited — every type, every goal, forever</div>
              <button className="planbtn" disabled={!!checkoutBusy} onClick={() => checkout('annual')}>
                {checkoutBusy === 'annual' ? 'Opening…' : 'Annual — £89/year'}
                <small>just £7.42/mo, billed yearly</small>
              </button>
              <button className="planbtn" disabled={!!checkoutBusy} onClick={() => checkout('monthly')}>
                {checkoutBusy === 'monthly' ? 'Opening…' : 'Monthly — £14.99/mo'}
                <small>billed monthly · cancel anytime</small>
              </button>
            </div>
            <button className="sheetdismiss" onClick={() => setPaywall(null)}>Not now</button>
          </div>
        </div>
      )}

      <audio ref={audioRef} onEnded={() => { if (playingId) { const s = sessions.find(x => x.id === playingId); if (!(s && s.product_type === 'subliminal')) { setPlayingId(null); musicRef.current?.pause() } } }} />
      <audio ref={musicRef} />
    </Shell>
  )
}

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
          <a className="navlink" href="/dashboard">Your account</a>
        </nav>
        {children}
      </div>
    </>
  )
}

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#05070F;color:#EDEFF7;font-family:'Sora','Segoe UI',system-ui,sans-serif;font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  a{text-decoration:none;color:inherit}
  button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
  .shell{position:relative;z-index:1;max-width:620px;margin:0 auto;padding:0 22px 80px;min-height:100svh}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:22px 0 10px}
  .navlogo{height:42px;mix-blend-mode:lighten;display:block}
  .navlink{font-size:13px;color:#5E9BF2;border:1px solid rgba(146,168,255,0.24);border-radius:100px;padding:9px 18px}
  .serif{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;letter-spacing:-0.01em}
  .grad{color:transparent;background:linear-gradient(100deg,#A9C4FF,#7E9DFF 55%,#9C86F0);-webkit-background-clip:text;background-clip:text}
  .quiet{color:#5A6280;font-size:13px}
  .center{text-align:center}
  .eyebrow{font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#5E9BF2}
  .head{text-align:center;margin:34px 0 26px}
  .head h1{font-size:clamp(26px,6vw,38px);margin-top:12px}
  .panel{border:1px solid rgba(146,168,255,0.10);border-radius:24px;background:radial-gradient(ellipse at 50% 0%,rgba(108,75,216,.08),transparent 65%),#0A0D1A;padding:26px 24px;text-align:center}
  .orbs{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}
  .day{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:1px solid rgba(146,168,255,0.10);color:#5A6280;background:rgba(255,255,255,0.02)}
  .day.done{border-color:transparent;background:linear-gradient(120deg,#6C4BE0,#4A8FE8 52%,#3EC1F0);color:#fff;box-shadow:0 4px 16px rgba(94,155,242,.3)}
  .day.next{border-color:#5E9BF2;color:#A9C4FF}
  .streakline{font-size:16px;margin-top:18px;color:#cdd6f4}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .card{border:1px solid rgba(146,168,255,0.10);border-radius:20px;background:rgba(255,255,255,0.025);padding:20px}
  .card.locked{background:rgba(255,255,255,0.012)}
  .cname{font-weight:600;font-size:16px;color:#EDEFF7}
  .cmeta{font-size:11px;color:#5E9BF2;letter-spacing:.06em;text-transform:uppercase;margin-top:4px}
  .cdesc{font-size:13px;color:#9AA3C2;line-height:1.55;margin-top:10px;min-height:54px}
  .cbtn{display:block;width:100%;text-align:center;margin-top:8px;padding:12px;border-radius:12px;font-size:13px;font-weight:600;border:1px solid rgba(146,168,255,0.18);color:#EDEFF7;background:rgba(94,155,242,0.06)}
  .cbtn.play{background:linear-gradient(120deg,#6C4BE0,#4A8FE8 52%,#3EC1F0);color:#fff;border:none}
  .cbtn.lock{color:#E2A24A;border-color:rgba(226,162,74,.32);background:rgba(226,162,74,.05)}
  .cbtn:disabled{opacity:.7;cursor:default}
  .scriptbtn{display:block;width:100%;text-align:center;margin-top:8px;padding:9px;border-radius:11px;font-size:12px;color:#9AA3C2;border:1px solid rgba(146,168,255,0.12);background:none}
  .scriptbtn:hover{color:#EDEFF7;border-color:rgba(146,168,255,0.24)}
  .scriptbox{margin-top:10px;border:1px solid rgba(146,168,255,0.10);border-radius:14px;background:rgba(255,255,255,0.02);padding:14px 16px;max-height:240px;overflow-y:auto}
  .scriptbox p{font-size:13px;color:#cdd6f4;line-height:1.75;white-space:pre-wrap;font-family:'Newsreader',Georgia,serif;font-style:italic}
  .upsell{text-align:center;margin-top:24px}
  .upsell p{font-size:13px;color:#5A6280}
  .upsell a{color:#5E9BF2}
  .share{margin-top:30px;text-align:center;border:1px solid rgba(146,168,255,0.24);border-radius:24px;padding:32px 24px;background:radial-gradient(120% 80% at 50% 0%,rgba(108,75,216,.2),transparent 60%),#0A0D1A}
  .bigserif{font-size:30px;margin-top:8px}
  .cta{display:inline-block;font-weight:600;font-size:14px;color:#fff;padding:15px 28px;border-radius:100px;background:linear-gradient(120deg,#6C4BE0 0%,#4A8FE8 52%,#3EC1F0 100%);text-align:center}
  .empty{text-align:center;padding:80px 20px}
  @media(max-width:520px){.grid{grid-template-columns:1fr}}
  @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}

  .sheetwrap{position:fixed;inset:0;z-index:60;background:rgba(3,5,12,.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;overflow-y:auto}
  .sheet{width:100%;max-width:620px;background:linear-gradient(180deg,#0C0F1C,#070912);border:1px solid rgba(146,168,255,.24);border-bottom:none;border-radius:26px 26px 0 0;padding:28px 24px 34px;animation:sheetup .35s cubic-bezier(.22,1,.36,1)}
  @keyframes sheetup{from{transform:translateY(40px);opacity:.4}to{transform:translateY(0);opacity:1}}
  .feat2{font-size:14px;color:#9AA3C2;margin-bottom:9px}
  .sheetdismiss{display:block;width:100%;margin-top:12px;font-size:13px;color:#5A6280;text-align:center}

  .setlabel{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#5E9BF2;margin:20px 0 10px}
  .setrow{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid rgba(146,168,255,0.10);border-radius:14px;background:rgba(255,255,255,0.025);padding:13px 15px;margin-bottom:9px;transition:all .3s ease;cursor:pointer}
  .setrow.on{border-color:#5E9BF2;background:rgba(94,155,242,0.12)}
  .setrow.locked{opacity:.5;cursor:default}
  .setrow .vi{flex:1}
  .setrow h5{font-size:14px;font-weight:600;color:#EDEFF7}
  .setrow small{font-size:12px;color:#9AA3C2}
  .setpv{width:34px;height:34px;border-radius:50%;flex-shrink:0;border:1px solid rgba(146,168,255,0.24);display:flex;align-items:center;justify-content:center}
  .setpv:hover{background:rgba(94,155,242,0.12)}
  .setpv svg{width:11px;height:11px;fill:#9AA3C2}
  .pro{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#3EC1F0;border:1px solid rgba(62,193,240,.4);border-radius:100px;padding:2px 7px;margin-left:7px;vertical-align:middle}
  .atmgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
  .atmo{text-align:left;border:1px solid rgba(146,168,255,0.10);border-radius:14px;background:rgba(255,255,255,0.025);padding:13px 14px;transition:all .3s ease}
  .atmo.on{border-color:#5E9BF2;background:rgba(94,155,242,0.12)}
  .atmo.locked{opacity:.5;cursor:default}
  .atmo h5{font-size:13px;font-weight:600;color:#EDEFF7}
  .atmo small{display:block;font-size:11px;color:#9AA3C2;margin-top:2px}

  .planbtns{display:flex;flex-direction:column;gap:9px;margin-top:18px}
  .planbtn{display:block;width:100%;text-align:center;padding:14px;border-radius:14px;font-size:14px;font-weight:600;border:1px solid rgba(146,168,255,0.18);color:#EDEFF7;background:rgba(94,155,242,0.06);transition:all .3s ease}
  .planbtn:disabled{opacity:.7;cursor:default}
  .planbtn.best{background:linear-gradient(120deg,#6C4BE0,#4A8FE8 52%,#3EC1F0);color:#fff;border:none}
  .planbtn.gold{border-color:rgba(226,162,74,.45);color:#E2A24A;background:rgba(226,162,74,.06)}
  .planbtn small{display:block;font-weight:400;font-size:11px;color:inherit;opacity:.85;margin-top:3px;letter-spacing:.01em}
`
