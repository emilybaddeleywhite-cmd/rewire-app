import Head from 'next/head'

const BASE = {
  bg: '#03050f',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8f4ff',
  textMuted: 'rgba(232,244,255,0.6)',
  textFaint: 'rgba(232,244,255,0.2)',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — RewireMode</title>
        <meta name="description" content="How RewireMode collects, uses, and protects your personal data." />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <div style={{ minHeight: '100vh', background: BASE.bg, color: BASE.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:4px}
          h2{font-size:18px;color:#6366f1;font-weight:700;margin:32px 0 12px}
          h3{font-size:15px;color:#e8f4ff;font-weight:700;margin:20px 0 8px}
          p{font-size:14px;color:rgba(232,244,255,0.6);line-height:1.8;margin-bottom:12px}
          ul{font-size:14px;color:rgba(232,244,255,0.6);line-height:1.8;margin-bottom:12px;padding-left:20px}
          li{margin-bottom:6px}
          a{color:#6366f1;text-decoration:none}
          .section-divider{border:none;border-top:1px solid rgba(99,102,241,0.12);margin:48px 0}
          .policy-tag{font-size:11px;letter-spacing:0.15em;color:#6366f1;font-weight:700;margin-bottom:12px}
          .policy-title{font-size:28px;font-weight:800;color:#e8f4ff;margin-bottom:8px}
          .policy-date{font-size:13px;color:rgba(232,244,255,0.2);margin-bottom:28px}
          .intro-box{padding:16px 20px;border-radius:12px;background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.15);margin-bottom:28px}
          .intro-box p{margin:0}
          .toc{display:flex;flex-direction:column;gap:8px;padding:20px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);margin-bottom:48px}
          .toc a{font-size:13px;color:rgba(232,244,255,0.5);text-decoration:none;padding:4px 0;transition:color 0.15s}
          .toc a:hover{color:#6366f1}
        `}</style>

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(99,102,241,0.08)', backdropFilter: 'blur(10px)', background: 'rgba(5,10,20,0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 24px 0' }}>
            <a href="/" style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 14px', borderRadius: '8px', border: `1px solid ${BASE.border}` }}>← Back</a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 10px' }}>
            <a href="/"><img src={LOGO} alt="RewireMode" style={{ height: '120px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => { e.target.style.display='none' }} /></a>
          </div>
        </nav>

        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Page header */}
          <div style={{ marginBottom: '40px' }}>
            <div className="policy-tag">LEGAL</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: BASE.text, marginBottom: '10px' }}>Privacy Policy</h1>
            <p style={{ fontSize: '14px', color: BASE.textFaint }}>Last updated: 14th May 2026</p>
          </div>

          {/* Table of contents */}
          <div className="toc">
            <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(232,244,255,0.3)', fontWeight: '700', marginBottom: '4px' }}>ON THIS PAGE</div>
            <a href="#who-we-are">Who We Are</a>
            <a href="#what-we-collect">What We Collect</a>
            <a href="#how-we-use">How We Use Your Data</a>
            <a href="#third-parties">Third Parties</a>
            <a href="#retention">Data Retention</a>
            <a href="#your-rights">Your Rights</a>
            <a href="#cookies">Cookies</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="intro-box">
            <p>RewireMode is committed to protecting your privacy. This policy explains what personal data we collect, why we collect it, and how we handle it. We operate under UK GDPR and the Data Protection Act 2018.</p>
          </div>

          <div id="who-we-are">
            <h2>1. Who We Are</h2>
            <p>RewireMode is an AI-powered hypnotherapy and subliminal audio platform operated from the United Kingdom. For data protection purposes, we are the data controller for personal information collected through rewiremode.com.</p>
            <p>Contact: <a href="mailto:office@rewiremode.com">office@rewiremode.com</a></p>
          </div>

          <div id="what-we-collect">
            <h2>2. What We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li><strong style={{color:'#e8f4ff'}}>Account data</strong> — your name and email address when you register</li>
              <li><strong style={{color:'#e8f4ff'}}>Usage data</strong> — session goals, session types, mood ratings, and generation history</li>
              <li><strong style={{color:'#e8f4ff'}}>Payment data</strong> — processed securely by Stripe; we do not store card details</li>
              <li><strong style={{color:'#e8f4ff'}}>Technical data</strong> — browser type, device type, and basic usage analytics</li>
              <li><strong style={{color:'#e8f4ff'}}>Communications</strong> — emails you send us or feedback submitted through the platform</li>
            </ul>
            <p>We do not collect sensitive health data beyond what you voluntarily enter as a session goal. You are in control of what you type.</p>
          </div>

          <div id="how-we-use">
            <h2>3. How We Use Your Data</h2>
            <p>We use your data to:</p>
            <ul>
              <li>Provide and personalise the RewireMode service</li>
              <li>Process payments and manage your subscription or credits</li>
              <li>Send transactional emails (account confirmation, session errors, billing updates)</li>
              <li>Send weekly credit reset notifications (free plan users)</li>
              <li>Improve the platform and monitor for safety and misuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>We do not use your data for advertising. We do not sell your data to third parties. We do not use your session goals or generated content to train AI models.</p>
          </div>

          <div id="third-parties">
            <h2>4. Third Parties</h2>
            <p>We work with the following trusted services to operate the platform:</p>
            <ul>
              <li><strong style={{color:'#e8f4ff'}}>Supabase</strong> — database and authentication (EU/US data storage)</li>
              <li><strong style={{color:'#e8f4ff'}}>Stripe</strong> — payment processing (PCI-DSS compliant)</li>
              <li><strong style={{color:'#e8f4ff'}}>Anthropic (Claude)</strong> — AI content generation; your session goal is sent to their API to generate your script</li>
              <li><strong style={{color:'#e8f4ff'}}>ElevenLabs</strong> — voice audio generation; your generated script is sent to their API to produce audio</li>
              <li><strong style={{color:'#e8f4ff'}}>Brevo</strong> — transactional email delivery</li>
              <li><strong style={{color:'#e8f4ff'}}>Vercel</strong> — hosting and infrastructure</li>
            </ul>
            <p>Each of these providers operates under their own privacy policies and data processing agreements. We only share the minimum data necessary for each service to function.</p>
          </div>

          <div id="retention">
            <h2>5. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. If you delete your account, your personal data and session history are removed within 30 days, except where we are required to retain certain records for legal or financial compliance purposes (for example, payment records may be retained for up to 7 years under UK law).</p>
          </div>

          <div id="your-rights">
            <h2>6. Your Rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data ("right to be forgotten")</li>
              <li>Object to or restrict processing</li>
              <li>Data portability — receive your data in a structured format</li>
              <li>Withdraw consent at any time where processing is consent-based</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:office@rewiremode.com">office@rewiremode.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.</p>
          </div>

          <div id="cookies">
            <h2>7. Cookies</h2>
            <p>RewireMode uses only essential cookies necessary for the platform to function — specifically for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
          </div>

          <div id="contact">
            <h2>8. Contact</h2>
            <p>For any privacy-related questions or requests: <a href="mailto:office@rewiremode.com">office@rewiremode.com</a></p>
            <p>We aim to respond to all requests within 5 working days.</p>
          </div>

          {/* Footer links */}
          <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: `1px solid ${BASE.border}`, display: 'flex', gap: '20px', fontSize: '13px' }}>
            <a href="/terms" style={{ color: '#6366f1' }}>Terms & Policies</a>
            <a href="/" style={{ color: BASE.textFaint }}>Back to RewireMode</a>
          </div>

        </div>
      </div>
    </>
  )
}
