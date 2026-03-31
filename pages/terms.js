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
        <title>Terms of Service — RewireMode</title>
        <meta name="description" content="RewireMode Terms of Service" />
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
            <a href="/"><img src={LOGO} alt="RewireMode" style={{ height: '160px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => { e.target.style.display='none' }} /></a>
          </div>
        </nav>

        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 20px 80px', position: 'relative', zIndex: 1 }}>

          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#6366f1', fontWeight: '700', marginBottom: '12px' }}>LEGAL</div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: BASE.text, marginBottom: '10px' }}>Terms of Service</h1>
            <p style={{ fontSize: '13px', color: BASE.textFaint }}>Last updated: March 2026</p>
          </div>

          <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '32px' }}>
            <p style={{ margin: 0 }}>Please read these Terms of Service carefully before using RewireMode. By creating an account or using our service, you agree to be bound by these terms.</p>
          </div>

          <h2>1. About RewireMode</h2>
          <p>RewireMode ("we", "us", "our") is a UK-based platform. Our service provides AI-generated hypnosis and subliminal audio content for personal wellbeing and self-improvement purposes.</p>
          <p>You can contact us at: <a href="mailto:office@rewiremode.com">office@rewiremode.com</a></p>

          <h2>2. Eligibility</h2>
          <p>You must be at least 18 years old to use RewireMode. By creating an account, you confirm that you are 18 or over. Our service is intended for adults only.</p>

          <h2>3. Your Account</h2>
          <p>When you create an account, you are responsible for:</p>
          <ul>
            <li>Keeping your login credentials secure and confidential</li>
            <li>All activity that occurs under your account</li>
            <li>Notifying us immediately of any unauthorised use of your account</li>
            <li>Providing accurate and truthful information</li>
          </ul>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>

          <h2>4. Credits and Payments</h2>
          <h3>Free Plan</h3>
          <p>Free accounts receive 5 credits per week, automatically replenished every Monday. Free accounts may save up to 1 session.</p>

          <h3>Pro Subscription</h3>
          <p>Pro accounts are billed at £14.99 per month. Your subscription renews automatically each month until cancelled. Pro accounts receive 100 credits per month and may save up to 50 sessions.</p>

          <h3>Credit Packs</h3>
          <p>Credits purchased as one-off packs do not expire and are not subject to monthly reset. Credits are non-transferable and have no cash value.</p>

          <h3>Refunds</h3>
          <p>Under the Consumer Contracts Regulations 2013, you have the right to cancel a subscription within 14 days of purchase. However, if you have already used the service within that 14-day period, we may reduce any refund proportionately to reflect the service already provided. To request a refund, contact us at <a href="mailto:office@rewiremode.com">office@rewiremode.com</a>.</p>
          <p>Credit pack purchases are non-refundable once credits have been used.</p>

          <h3>Price Changes</h3>
          <p>We will give you at least 30 days notice before changing subscription prices. If you do not cancel before the price change takes effect, you accept the new price.</p>

          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Share your account or allow others to use it</li>
            <li>Attempt to reverse engineer, copy, or reproduce our AI-generated content at scale</li>
            <li>Use RewireMode for any commercial purpose without our written permission</li>
            <li>Attempt to circumvent or manipulate the credits system</li>
            <li>Use the service in any way that is unlawful or harmful</li>
          </ul>

          <h2>6. Health and Safety Disclaimer</h2>
          <p>RewireMode is designed for general wellbeing and self-improvement purposes only. Our content is not a substitute for professional medical or psychological treatment.</p>
          <p>You should not use RewireMode if you:</p>
          <ul>
            <li>Have been diagnosed with epilepsy or are prone to seizures</li>
            <li>Have a history of psychosis or are currently experiencing psychotic symptoms</li>
            <li>Are under 18 years of age</li>
          </ul>
          <p>If you have any diagnosed mental health conditions, we recommend consulting your healthcare provider before use. Nothing in our sessions constitutes medical advice, diagnosis, or treatment.</p>
          <p>Do not use RewireMode while driving, operating machinery, or in any situation where loss of attention could be dangerous.</p>

          <h2>7. Intellectual Property</h2>
          <p>All content generated by RewireMode, including AI-generated scripts and the platform itself, is owned by or licensed to RewireMode. Sessions generated for your personal use may be downloaded and used for your own private, non-commercial use only.</p>
          <p>You may not redistribute, sell, or commercially exploit any content generated by RewireMode.</p>

          <h2>8. Limitation of Liability</h2>
          <p>To the fullest extent permitted by UK law, RewireMode shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you have paid to us in the 12 months preceding any claim.</p>
          <p>Nothing in these terms limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded under English law.</p>

          <h2>9. Cancellation</h2>
          <p>You may cancel your Pro subscription at any time through your account dashboard. Cancellation takes effect at the end of your current billing period. You will retain access to Pro features until that date.</p>

          <h2>10. Changes to These Terms</h2>
          <p>We may update these terms from time to time. We will notify you of significant changes by email. Continued use of RewireMode after changes take effect constitutes acceptance of the new terms.</p>

          <h2>11. Governing Law</h2>
          <p>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

          <h2>12. Contact</h2>
          <p>If you have any questions about these terms, please contact us at <a href="mailto:office@rewiremode.com">office@rewiremode.com</a>.</p>

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: `1px solid ${BASE.border}`, display: 'flex', gap: '20px', fontSize: '13px' }}>
            <a href="/privacy" style={{ color: '#6366f1' }}>Privacy Policy</a>
            <a href="/" style={{ color: BASE.textFaint }}>Back to RewireMode</a>
          </div>
        </div>
      </div>
    </>
  )
}
