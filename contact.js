import Head from 'next/head'

const C = {
  bg: '#0d0f1a', bgCard: 'rgba(255,255,255,0.035)',
  border: 'rgba(123,79,224,0.14)',
  purple: '#7B4FE0', purpleLight: '#9B6FF0',
  grad: 'linear-gradient(135deg,#7B4FE0 0%,#4A8FE8 50%,#29BAEF 100%)',
  textH: '#ffffff', textBody: '#b8bdd4', textMuted: '#676e8a',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'

const SOCIALS = [
  {
    label: 'Trustpilot',
    handle: 'rewiremode.com',
    href: 'https://uk.trustpilot.com/review/rewiremode.com',
    color: '#00b67a',
    cta: 'Leave a review',
    desc: 'Enjoyed a session? A review helps others find us.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.9 8.9H24L16.5 14.3L19.4 23.2L12 17.8L4.6 23.2L7.5 14.3L0 8.9H9.1Z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    handle: '@rewiremodeai',
    href: 'https://www.instagram.com/rewiremodeai/',
    color: '#E1306C',
    cta: 'Follow',
    desc: 'Tips, behind-the-scenes and mindset content.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    handle: 'RewireMode',
    href: 'https://www.facebook.com/profile.php?id=61588980175128',
    color: '#1877F2',
    cta: 'Follow',
    desc: 'Updates, community and announcements.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    handle: '@rewiremodeai',
    href: 'https://www.tiktok.com/@rewiremodeai',
    color: '#ffffff',
    cta: 'Follow',
    desc: 'Short-form content on hypnosis and the mind.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.78a4.85 4.85 0 01-1.02-.09z"/>
      </svg>
    ),
  },
]

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact — RewireMode</title>
        <meta name="description" content="Get in touch with RewireMode, or follow us on social media." />
      </Head>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.textBody, fontFamily: "'Inter',sans-serif" }}>

        {/* NAV */}
        <nav style={{ borderBottom: `1px solid ${C.border}`, padding: '18px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
            <img src={LOGO} alt="RewireMode" style={{ height: '28px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => e.target.style.display = 'none'} />
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '16px', fontWeight: '700', color: C.textH, letterSpacing: '-0.02em' }}>RewireMode</span>
          </a>
          <a href="/" style={{ fontSize: '13px', color: C.textMuted, textDecoration: 'none' }}>← Back</a>
        </nav>

        {/* HERO */}
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 36px 0' }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '36px', fontWeight: '800', color: C.textH, marginBottom: '12px', letterSpacing: '-0.03em' }}>
            Get in touch
          </h1>
          <p style={{ fontSize: '16px', color: C.textBody, lineHeight: 1.7, marginBottom: '48px' }}>
            Questions, feedback, or just want to say hi? Email us at{' '}
            <a href="mailto:hello@rewiremode.com" style={{ color: C.purpleLight, textDecoration: 'none', fontWeight: '600' }}>hello@rewiremode.com</a>
            {' '}and we'll get back to you as soon as we can.
          </p>

          {/* SOCIAL LINKS */}
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '18px', fontWeight: '700', color: C.textH, marginBottom: '20px', letterSpacing: '-0.02em' }}>Follow us</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '64px' }}>
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '55'; e.currentTarget.style.background = s.color + '08' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgCard }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: C.textH, marginBottom: '2px' }}>{s.label}</div>
                  <div style={{ fontSize: '13px', color: C.textMuted }}>{s.handle} · {s.desc}</div>
                </div>
                <div style={{ fontSize: '13px', color: s.color, fontWeight: '600', whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${s.color}30`, background: s.color + '0d' }}>
                  {s.cta} →
                </div>
              </a>
            ))}
          </div>

          {/* FOOTER NAV */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '28px', paddingBottom: '48px', display: 'flex', gap: '22px', flexWrap: 'wrap' }}>
            {[['FAQ', '/faq'], ['Pricing', '/pricing'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: '13px', color: C.textMuted, textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
