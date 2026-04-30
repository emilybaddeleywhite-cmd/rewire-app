
// ─── MAIN PAGE ────────────────────────────────────────────────────────
export default function Home({ user, profile, refreshProfile }) {
  const isMobile = useIsMobile()
  const [view, setView] = useState('marketing') // 'marketing' | 'app'
  const [view, setView] = useState(user ? 'app' : 'marketing') // 'marketing' | 'app'

  // App state
  const [step, setStep] = useState(0)

        {/* NAV */}
        <nav style={{ position: 'fixed', inset: '0 0 auto', zIndex: 200, height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: `1px solid ${navScrolled ? 'rgba(123,79,224,0.22)' : C.border}`, background: 'rgba(13,15,26,0.82)', backdropFilter: 'blur(18px)', transition: 'border-color 0.3s' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src={LOGO} alt="RewireMode" style={{ height: '32px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => e.target.style.display = 'none'} />
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '18px', fontWeight: '700', letterSpacing: '-0.025em', color: C.textH }}>Rewire<span style={{ color: C.cyanLight }}>Mode</span></span>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={LOGO} alt="RewireMode" style={{ height: '34px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => e.target.style.display = 'none'} />
          </a>
          <div className="hide-mob" style={{ display: 'flex', gap: '28px' }}>
            {[['#how', 'How it works'], ['#why', 'Why RewireMode'], ['#science', 'The science'], ['/faq', 'FAQ']].map(([href, label]) => (
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: isMobile ? '14px 16px' : '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => { resetApp(); setView('marketing') }} style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <img src={LOGO} alt="RewireMode" style={{ height: isMobile ? '34px' : '40px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => e.target.style.display = 'none'} />
              {!isMobile && <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '17px', fontWeight: '800', color: C.textH, letterSpacing: '-0.03em' }}>Rewire<span style={{ color: C.cyanLight }}>Mode</span></span>}
            </button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {profile && (
