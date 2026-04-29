// components/SafetyBlock.js
// Drop in: rewire-app/pages/components/SafetyBlock.js
// OR just paste the exports directly into index.js if you prefer one file

import { useState } from 'react'

// ─── COLOURS (matches your existing BASE palette) ──────────────────────────
const C = {
  bg:         '#03050f',
  bgCard:     'rgba(255,255,255,0.04)',
  bgCardHover:'rgba(255,255,255,0.07)',
  border:     'rgba(255,255,255,0.10)',
  borderHover:'rgba(255,255,255,0.18)',
  textPrimary:'rgba(232,244,255,0.92)',
  textMuted:  'rgba(232,244,255,0.55)',
  textFaint:  'rgba(232,244,255,0.35)',
  indigo:     '#6366f1',
  indigoLight:'#a5b4fc',
  red:        '#f87171',
  redBg:      'rgba(248,113,113,0.08)',
  redBorder:  'rgba(248,113,113,0.25)',
  amber:      '#fbbf24',
  amberBg:    'rgba(251,191,36,0.08)',
  amberBorder:'rgba(251,191,36,0.22)',
}

// ─── CRISIS BLOCK ──────────────────────────────────────────────────────────
export function CrisisBlock({ onDismiss }) {
  return (
    <div style={{
      borderRadius: 16,
      padding: '24px',
      background: C.redBg,
      border: `1px solid ${C.redBorder}`,
      marginTop: 20,
    }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, marginBottom: 10, lineHeight: 1.5 }}>
        This sounds like something serious — we want you to be okay.
      </p>
      <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 20, lineHeight: 1.7 }}>
        RewireMode is not a crisis service. Please reach out to someone who can really help right now.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <CrisisLink label="Samaritans" detail="Call or text 116 123 — free, 24/7" href="tel:116123" />
        <CrisisLink label="Shout Crisis Text Line" detail="Text SHOUT to 85258" href="sms:85258?body=SHOUT" />
        <CrisisLink label="Emergency services" detail="Call 999 if you or someone else is in immediate danger" href="tel:999" />
        <CrisisLink label="Mind" detail="mind.org.uk — mental health support" href="https://www.mind.org.uk/need-urgent-help" external />
      </div>

      <button onClick={onDismiss} style={{
        background: 'transparent', border: 'none',
        color: C.textFaint, fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline',
      }}>
        Go back
      </button>
    </div>
  )
}

function CrisisLink({ label, detail, href, external }) {
  return (
    <a href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{
        display: 'block', padding: '12px 16px', borderRadius: 12,
        background: C.bgCard, border: `1px solid ${C.border}`,
        textDecoration: 'none', transition: 'border 0.15s',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: C.textMuted }}>{detail}</div>
    </a>
  )
}

// ─── STANDARD SAFETY BLOCK ─────────────────────────────────────────────────
export function SafetyBlock({ category, suggestedRewrite, onUseRewrite, onDismiss }) {
  const isHate = category === 'hate'

  const message = isHate
    ? "RewireMode is a space of healing and equality. We can't create sessions rooted in hatred or prejudice."
    : "RewireMode can't create sessions around harm, control, illegal activity, or unsafe intentions."

  return (
    <div style={{
      borderRadius: 16,
      padding: '22px',
      background: C.amberBg,
      border: `1px solid ${C.amberBorder}`,
      marginTop: 20,
    }}>
      <p style={{ fontSize: 14, color: C.textPrimary, marginBottom: 12, lineHeight: 1.65 }}>
        {message}
      </p>

      {!isHate && (
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: suggestedRewrite ? 18 : 0, lineHeight: 1.6 }}>
          Try reframing your session around your own peace, confidence, healing, focus, or letting go.
        </p>
      )}

      {suggestedRewrite && !isHate && (
        <SuggestedRewrite rewrite={suggestedRewrite} onUse={onUseRewrite} />
      )}

      <button onClick={onDismiss} style={{
        marginTop: 14, background: 'transparent', border: 'none',
        color: C.textFaint, fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline',
      }}>
        Try something different
      </button>
    </div>
  )
}

function SuggestedRewrite({ rewrite, onUse }) {
  return (
    <div style={{
      borderRadius: 12, padding: '14px 16px',
      background: 'rgba(99,102,241,0.08)',
      border: `1px solid rgba(99,102,241,0.25)`,
      marginBottom: 4,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: C.indigoLight,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
      }}>
        Try this instead
      </div>
      <p style={{ fontSize: 14, color: C.textPrimary, marginBottom: 14, lineHeight: 1.55, fontStyle: 'italic' }}>
        "{rewrite}"
      </p>
      <button onClick={() => onUse(rewrite)} style={{
        padding: '9px 20px', borderRadius: 10,
        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
        border: 'none', color: '#ffffff',
        fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em',
      }}>
        Use this goal →
      </button>
    </div>
  )
}

// ─── HOOK ──────────────────────────────────────────────────────────────────
// useSafetyGate() — drop this into your Home component in index.js
// Returns: { safetyState, checkSafety, clearSafety }
//
// safetyState is null (no block) or:
//   { type: 'crisis' }
//   { type: 'block', category, suggestedRewrite }

export function useSafetyGate() {
  const [safetyState, setSafetyState] = useState(null)

  function clearSafety() { setSafetyState(null) }

  // Returns true = safe to proceed, false = blocked
  async function checkSafety(prompt, userId = null) {
    if (!prompt?.trim()) return true

    // ── Layer 1: instant client-side keyword check ──
    const { clientSafetyCheck } = await import('../../clientFilter')
    const l1 = clientSafetyCheck(prompt)

    if (!l1.safe) {
      if (l1.crisis) {
        setSafetyState({ type: 'crisis' })
        return false
      }
      // Still call Layer 2 to get a suggested rewrite even for L1 blocks
      const l2 = await callClassifier(prompt, userId)
      setSafetyState({
        type: 'block',
        category: l2.category ?? l1.category,
        suggestedRewrite: l2.suggested_rewrite ?? null,
      })
      return false
    }

    // ── Layer 2: Claude server-side classification ──
    const l2 = await callClassifier(prompt, userId)

    if (!l2.safe) {
      if (l2.crisis) {
        setSafetyState({ type: 'crisis' })
      } else {
        setSafetyState({
          type: 'block',
          category: l2.category,
          suggestedRewrite: l2.suggested_rewrite ?? null,
        })
      }
      return false
    }

    return true
  }

  return { safetyState, checkSafety, clearSafety }
}

async function callClassifier(prompt, userId) {
  try {
    const res = await fetch('/api/classify-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userId }),
    })
    if (!res.ok) throw new Error('classifier failed')
    return await res.json()
  } catch {
    // Fail safe — block on any error
    return { safe: false, category: 'classifier_error', crisis: false, suggested_rewrite: null }
  }
}
