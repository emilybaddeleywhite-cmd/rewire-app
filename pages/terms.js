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

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms & Policies — RewireMode</title>
        <meta name="description" content="RewireMode Terms & Conditions, Medical Disclaimer, and AI Ethics Policy" />
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
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: BASE.text, marginBottom: '10px' }}>Terms & Policies</h1>
            <p style={{ fontSize: '14px', color: BASE.textFaint }}>Last updated: 30th April 2026</p>
          </div>

          {/* Table of contents */}
          <div className="toc">
            <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(232,244,255,0.3)', fontWeight: '700', marginBottom: '4px' }}>ON THIS PAGE</div>
            <a href="#terms">Terms & Conditions</a>
            <a href="#medical">Medical & Legal Disclaimer</a>
            <a href="#ai-ethics">AI Ethics & Safety Policy</a>
          </div>

          {/* ── SECTION 1: TERMS & CONDITIONS ─────────────────────────── */}
          <div id="terms">
            <div className="policy-tag">01 — TERMS & CONDITIONS</div>
            <div className="policy-title">Terms & Conditions</div>
            <div className="policy-date">Last updated: 30th April 2026</div>

            <div className="intro-box">
              <p>Welcome to RewireMode ("we", "our", "us"). By accessing or using rewiremode.com, you agree to these Terms. If you do not agree, please do not use the platform.</p>
            </div>

            <h2>1. What RewireMode Is</h2>
            <p>RewireMode provides AI-generated hypnosis and subliminal audio content designed for relaxation, mindset support, and personal development. We do not provide medical, psychological, or clinical treatment.</p>

            <h2>2. Eligibility</h2>
            <p>You must be 18 years or older, or have parent/guardian consent. You agree to use the platform responsibly and lawfully.</p>

            <h2>3. Your Account</h2>
            <p>When you create an account, you are responsible for:</p>
            <ul>
              <li>Keeping your login credentials secure and confidential</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorised use</li>
              <li>Providing accurate and truthful information</li>
            </ul>

            <h2>4. User Responsibility</h2>
            <p>You agree that you are responsible for how you use the content, will not rely on RewireMode as a substitute for professional advice, and will seek qualified help where appropriate.</p>

            <h2>5. Prohibited Use</h2>
            <p>You may NOT use RewireMode to create or request content that:</p>
            <ul>
              <li>Encourages harm to yourself or others</li>
              <li>Promotes illegal activity</li>
              <li>Attempts to manipulate or control another person</li>
              <li>Contains abusive, hateful, or dangerous material</li>
            </ul>
            <p>We reserve the right to block content, suspend accounts, and remove access without notice.</p>

            <h2>6. Health & Safety</h2>
            <p>You agree not to use audio while driving or operating machinery, to stop use if you feel discomfort, and to consult a professional if you have medical or mental health concerns.</p>

            <h2>7. AI-Generated Content</h2>
            <p>RewireMode uses artificial intelligence to generate content. You acknowledge that content is automatically generated, outputs may vary, and results are not guaranteed.</p>

            <h2>8. Payments & Subscriptions</h2>
            <ul>
              <li>Subscriptions renew automatically unless cancelled</li>
              <li>Credits are non-transferable and non-refundable</li>
              <li>We may change pricing with notice</li>
              <li>Under the Consumer Contracts Regulations 2013, you have the right to cancel within 14 days of purchase</li>
            </ul>

            <h2>9. Intellectual Property</h2>
            <p>All platform content, branding, and systems belong to RewireMode. You may not copy, resell, or redistribute without written express permission.</p>

            <h2>10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, RewireMode is not liable for any outcomes from use of the platform, any indirect or consequential damages, or any reliance placed on generated content. Nothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any liability that cannot be excluded under English law.</p>

            <h2>11. Termination</h2>
            <p>We may suspend or terminate access if terms are violated or misuse is detected.</p>

            <h2>12. Governing Law</h2>
            <p>These terms are governed by the laws of England and Wales.</p>

            <h2>13. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of RewireMode after changes take effect constitutes acceptance.</p>

            <h2>14. Contact</h2>
            <p>For questions, contact: <a href="mailto:office@rewiremode.com">office@rewiremode.com</a></p>
          </div>

          <hr className="section-divider" />

          {/* ── SECTION 2: MEDICAL & LEGAL DISCLAIMER ─────────────────── */}
          <div id="medical">
            <div className="policy-tag">02 — MEDICAL & LEGAL DISCLAIMER</div>
            <div className="policy-title">Medical & Legal Disclaimer</div>
            <div className="policy-date">Last updated: 30th April 2026</div>

            <div className="intro-box">
              <p>RewireMode provides AI-generated hypnosis and subliminal audio for general well-being and personal development purposes only.</p>
            </div>

            <h2>Not Medical Advice</h2>
            <p>This platform does NOT provide medical advice, does NOT diagnose conditions, and does NOT treat mental or physical health disorders. Always consult a qualified professional — such as a GP or licensed therapist — for medical concerns.</p>

            <h2>Not a Substitute for Professional Care</h2>
            <p>RewireMode is not a replacement for therapy, counselling, psychiatric care, or medical treatment.</p>

            <h2>Individual Results Vary</h2>
            <p>Responses to hypnosis and subliminal audio differ between individuals. We do not guarantee specific outcomes, behavioural changes, or results of any kind.</p>

            <h2>Use at Your Own Risk</h2>
            <p>By using this platform, you accept full responsibility for your use of the content.</p>

            <h2>Safety Warning</h2>
            <p>Do NOT use audio while driving, while operating machinery, or in any situation requiring full attention.</p>

            <h2>Mental Health Notice</h2>
            <p>If you are experiencing severe anxiety, depression, trauma, or suicidal thoughts, please seek immediate professional support. RewireMode is not appropriate as a primary intervention for serious mental health conditions.</p>

            <h2>Contact</h2>
            <p>For concerns: <a href="mailto:office@rewiremode.com">office@rewiremode.com</a></p>
          </div>

          <hr className="section-divider" />

          {/* ── SECTION 3: AI ETHICS & SAFETY ─────────────────────────── */}
          <div id="ai-ethics">
            <div className="policy-tag">03 — AI ETHICS & SAFETY POLICY</div>
            <div className="policy-title">AI Ethics & Safety Policy</div>
            <div className="policy-date">Last updated: 30th April 2026</div>

            <div className="intro-box">
              <p>At RewireMode, safety, responsibility, and user well-being are core to how we build and operate.</p>
            </div>

            <h2>1. Purpose of the Platform</h2>
            <p>RewireMode is designed to support positive mental states, encourage personal growth, and promote relaxation and focus. It is NOT designed for harm, manipulation, or control.</p>

            <h2>2. Safety-First Design</h2>
            <p>We actively prevent the creation of content that includes harm to self or others, coercion or manipulation, illegal or dangerous behaviour, or exploitative or abusive themes.</p>

            <h2>3. AI Safeguards</h2>
            <p>Our system includes prompt filtering, content moderation, and safety rules embedded in generation. If content violates guidelines, it will be blocked and a safer alternative may be suggested.</p>

            <h2>4. User Accountability</h2>
            <p>Users are responsible for the prompts they enter and how they use generated content. Misuse may result in restricted access or account suspension.</p>

            <h2>5. Transparency</h2>
            <p>We are clear that content is AI-generated, it is not human therapy, and it should not replace professional support.</p>

            <h2>6. Continuous Improvement</h2>
            <p>We are committed to improving safety systems, monitoring misuse, and updating policies as technology evolves.</p>

            <h2>7. Ethical Boundaries</h2>
            <p>RewireMode will never support content that seeks to control others, promotes harm, or exploits vulnerability.</p>

            <h2>8. Contact & Reporting</h2>
            <p>If you encounter unsafe content or have concerns: <a href="mailto:office@rewiremode.com">office@rewiremode.com</a></p>
          </div>

          {/* Footer links */}
          <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: `1px solid ${BASE.border}`, display: 'flex', gap: '20px', fontSize: '13px' }}>
            <a href="/privacy" style={{ color: '#6366f1' }}>Privacy Policy</a>
            <a href="/" style={{ color: BASE.textFaint }}>Back to RewireMode</a>
          </div>

        </div>
      </div>
    </>
  )
}
