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
        <meta name="description" content="RewireMode Privacy Policy" />
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
          table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px}
          th{text-align:left;padding:10px 12px;color:#6366f1;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08)}
          td{padding:10px 12px;color:rgba(232,244,255,0.6);border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:top;line-height:1.7}
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

          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#6366f1', fontWeight: '700', marginBottom: '12px' }}>LEGAL</div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: BASE.text, marginBottom: '10px' }}>Privacy Policy</h1>
            <p style={{ fontSize: '13px', color: BASE.textFaint }}>Last updated: April 2026</p>
          </div>

          <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '32px' }}>
            <p style={{ margin: 0 }}>This Privacy Policy explains how RewireMode collects, uses, and protects your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
          </div>

          <h2>1. Who We Are</h2>
          <p>RewireMode is a UK-based platform. We are the data controller for the personal data we collect through this service.</p>
          <p>Contact: <a href="mailto:office@rewiremode.com">office@rewiremode.com</a></p>

          <h2>2. What Data We Collect</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Why we collect it</th>
                <th>Legal basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Email address, name</td>
                <td>Account creation and communication</td>
                <td>Contract performance</td>
              </tr>
              <tr>
                <td>Session data (intentions, mood, voice choice)</td>
                <td>To generate your personalised audio session</td>
                <td>Contract performance</td>
              </tr>
              <tr>
                <td>Payment information</td>
                <td>Processing subscription and credit purchases</td>
                <td>Contract performance</td>
              </tr>
              <tr>
                <td>Usage data (session history, streak, credits)</td>
                <td>To provide and improve the service</td>
                <td>Legitimate interests</td>
              </tr>
              <tr>
                <td>Technical data (IP address, browser, device)</td>
                <td>Security and performance monitoring</td>
                <td>Legitimate interests</td>
              </tr>
            </tbody>
          </table>
          <p>We do not collect any special category data (such as health data) beyond what you voluntarily input as your session intention.</p>

          <h2>3. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Generate personalised hypnosis and subliminal audio sessions</li>
            <li>Process payments and manage your subscription</li>
            <li>Send transactional emails (account confirmation, password reset)</li>
            <li>Track your streak and award bonus credits</li>
            <li>Improve the quality and performance of our service</li>
            <li>Comply with our legal obligations</li>
          </ul>
          <p>We do not use your data for advertising, and we do not sell your data to third parties.</p>

          <h2>3a. How Your Session Prompts Are Handled</h2>
          <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '24px' }}>
            <p style={{ margin: '0 0 12px' }}>Because RewireMode processes sensitive personal goals and intentions, we want to be explicit about exactly how your session data is used.</p>
            <ul>
              <li><strong style={{ color: BASE.text }}>Your goal / intention</strong> is sent to the Anthropic API (Claude) to generate your personalised script. It is processed in real time and is not stored by Anthropic for model training under our enterprise agreement.</li>
              <li><strong style={{ color: BASE.text }}>Your mood score and optional moment context</strong> are used solely to adjust the tone of your script. They are not stored in any analytics or profiling system.</li>
              <li><strong style={{ color: BASE.text }}>Your session script</strong> is stored in your account so you can replay your saved sessions. You can delete any saved session from your dashboard at any time, which permanently removes both the session record and the associated audio file.</li>
              <li><strong style={{ color: BASE.text }}>Your prompts are never used to train AI models.</strong> RewireMode does not use your session data — goals, scripts, or audio — to train, fine-tune, or evaluate any AI model, including our own or any third-party model.</li>
              <li><strong style={{ color: BASE.text }}>Your prompts are never sold or shared</strong> with advertisers, data brokers, or any third party beyond the processors listed in Section 4 below.</li>
              <li><strong style={{ color: BASE.text }}>Safety screening</strong> — before each session is generated, your goal is screened by an automated safety classifier. If a goal is flagged, only the category of the flag and a timestamp are logged — no prompt text is stored in the safety log. This is privacy by design.</li>
            </ul>
          </div>

          <h2>4. Who We Share Data With</h2>
          <p>We share your data only with the following trusted service providers, who process it on our behalf:</p>
          <ul>
            <li><strong style={{ color: BASE.text }}>Supabase</strong> — authentication and database hosting (EU servers)</li>
            <li><strong style={{ color: BASE.text }}>Stripe</strong> — payment processing. Stripe is PCI-DSS compliant. We never store your card details.</li>
            <li><strong style={{ color: BASE.text }}>Anthropic (Claude)</strong> — AI script generation. Your session intention and mood are sent to generate your script. No identifying information is sent.</li>
            <li><strong style={{ color: BASE.text }}>ElevenLabs</strong> — text-to-speech audio generation. Your generated script is sent to produce your audio.</li>
            <li><strong style={{ color: BASE.text }}>Resend</strong> — transactional email delivery</li>
            <li><strong style={{ color: BASE.text }}>Vercel</strong> — website hosting</li>
          </ul>
          <p>All providers are required to handle your data securely and in accordance with applicable data protection law.</p>

          <h2>5. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or financial compliance purposes (for example, transaction records which we retain for 7 years in line with UK tax law).</p>
          <p>Generated audio sessions are stored only if you choose to save them. You can delete saved sessions from your dashboard at any time.</p>

          <h2>6. Your Rights Under UK GDPR</h2>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong style={{ color: BASE.text }}>Right of access</strong> — you can request a copy of the data we hold about you</li>
            <li><strong style={{ color: BASE.text }}>Right to rectification</strong> — you can ask us to correct inaccurate data</li>
            <li><strong style={{ color: BASE.text }}>Right to erasure</strong> — you can ask us to delete your data ("right to be forgotten")</li>
            <li><strong style={{ color: BASE.text }}>Right to restriction</strong> — you can ask us to limit how we use your data</li>
            <li><strong style={{ color: BASE.text }}>Right to data portability</strong> — you can request your data in a machine-readable format</li>
            <li><strong style={{ color: BASE.text }}>Right to object</strong> — you can object to processing based on legitimate interests</li>
            <li><strong style={{ color: BASE.text }}>Rights related to automated decision-making</strong> — our AI generation does not make decisions with legal or similarly significant effects</li>
          </ul>
          <p>To exercise any of these rights, email us at <a href="mailto:office@rewiremode.com">office@rewiremode.com</a>. We will respond within 30 days.</p>

          <h2>7. Cookies</h2>
          <p>RewireMode uses only essential cookies required for authentication and session management. We do not use tracking cookies or advertising cookies. No cookie consent banner is required for essential cookies under UK law.</p>

          <h2>8. Data Security</h2>
          <p>We take reasonable technical and organisational measures to protect your data, including encrypted connections (HTTPS), secure database hosting, and access controls. However, no internet transmission is completely secure, and we cannot guarantee absolute security.</p>

          <h2>9. International Transfers</h2>
          <p>Some of our service providers (including Anthropic and ElevenLabs) are based in the United States. Where data is transferred outside the UK, we ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the UK Information Commissioner's Office (ICO).</p>

          <h2>10. Children's Privacy</h2>
          <p>RewireMode is not intended for anyone under the age of 18. We do not knowingly collect data from children. If you believe a child has created an account, please contact us and we will delete it promptly.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by displaying a notice on our website. The date at the top of this page shows when it was last updated.</p>

          <h2>12. Complaints</h2>
          <p>If you are unhappy with how we handle your data, you have the right to complain to the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a> or by calling 0303 123 1113.</p>
          <p>We would appreciate the opportunity to resolve any concerns directly first — please contact us at <a href="mailto:office@rewiremode.com">office@rewiremode.com</a>.</p>

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: `1px solid ${BASE.border}`, display: 'flex', gap: '20px', fontSize: '13px' }}>
            <a href="/terms">Terms of Service</a>
            <a href="/" style={{ color: BASE.textFaint }}>Back to RewireMode</a>
          </div>
        </div>
      </div>
    </>
  )
}
