import Head from 'next/head'
import { LOGO_URL } from '../lib/catalog'

// ─────────────────────────────────────────────────────────────
//  PASTE YOUR THREE STRIPE PAYMENT LINKS HERE
//  Stripe → Payment Links → New (one per package, one-time, annual price).
//  Turn ON "Collect customer name" so you know which company bought.
//  Until you paste real URLs, the buttons safely fall back to the contact email.
// ─────────────────────────────────────────────────────────────
const STRIPE_LINKS = {
  team:    'PASTE_STRIPE_PAYMENT_LINK_FOR_TEAM_750',
  company: 'PASTE_STRIPE_PAYMENT_LINK_FOR_COMPANY_2500',
  growth:  'PASTE_STRIPE_PAYMENT_LINK_FOR_GROWTH_5000',
}
const CONTACT_EMAIL = 'hello@rewiremode.com'

const PACKAGES = [
  { id: 'team',    name: 'Team',    seats: 'Up to 25 staff',  price: '£750',   perHead: '≈ £30 per person / year', featured: false },
  { id: 'company', name: 'Company', seats: 'Up to 100 staff', price: '£2,500', perHead: '≈ £25 per person / year', featured: true },
  { id: 'growth',  name: 'Growth',  seats: 'Up to 250 staff', price: '£5,000', perHead: '≈ £20 per person / year', featured: false },
]

const INCLUDED = [
  'All four session types — Reset, Walking, Sleep & Subliminal',
  'Personalised 7-day programmes for every person',
  'Unlimited replay of saved sessions',
  'One join code for your whole team',
  'Set up in a day — no IT project',
]

export default function Teams() {
  function buy(pkg) {
    const link = STRIPE_LINKS[pkg.id]
    if (link && link.startsWith('http')) { window.location.href = link; return }
    // Fallback until a real link is pasted: route to email so no click is lost.
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('RewireMode for Teams — ' + pkg.name + ' (' + pkg.seats + ')')}`
  }

  return (
    <>
      <Head>
        <title>RewireMode for Teams — personalised hypnotherapy for your staff</title>
        <meta name="description" content="Personalised hypnotherapy for sleep, stress and focus, built by a qualified hypnotherapist. One flat annual price for your whole team." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Newsreader:ital,opsz,wght@1,6..72,300;1,6..72,400&display=swap" rel="stylesheet" />
      </Head>

      <div className="wrap">
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          .wrap{min-height:100vh;background:#05070F;color:#9AA3C2;font-family:'Sora','Segoe UI',system-ui,sans-serif;font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
          .wrap a{text-decoration:none;color:inherit}
          .wrap button{cursor:pointer;border:none;background:none;font-family:inherit;color:inherit}
          .orb{position:fixed;border-radius:50%;filter:blur(80px);z-index:0;pointer-events:none}
          .orb.a{top:-16%;right:-12%;width:560px;height:560px;background:radial-gradient(circle,rgba(108,75,224,.16),transparent 66%)}
          .orb.b{bottom:-18%;left:-14%;width:480px;height:480px;background:radial-gradient(circle,rgba(62,193,240,.10),transparent 66%)}
          .nav{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto;padding:22px 24px 0}
          .navlogo{height:42px;mix-blend-mode:lighten}
          .nav .tag{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#5A6280;font-weight:600}
          .container{position:relative;z-index:2;max-width:1000px;margin:0 auto;padding:20px 24px 40px}
          .eyebrow{font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:#5E9BF2;font-weight:600}
          .hero{margin-top:60px;max-width:760px}
          .hero h1{font-family:'Newsreader',Georgia,serif;font-style:italic;font-weight:300;font-size:clamp(32px,5.4vw,50px);line-height:1.14;letter-spacing:-.01em;color:#EDEFF7;margin-top:18px}
          .hero h1 em{font-style:italic;color:transparent;background:linear-gradient(100deg,#A9C4FF,#7E9DFF 55%,#9C86F0);-webkit-background-clip:text;background-clip:text}
          .hero .sub{margin-top:22px;font-size:17px;line-height:1.65;color:#9AA3C2;max-width:640px}
          .stats{margin-top:56px;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid rgba(146,168,255,.10);border-bottom:1px solid rgba(146,168,255,.10)}
          .stat{padding:26px 22px 26px 0}
          .stat + .stat{padding-left:24px;border-left:1px solid rgba(146,168,255,.10)}
          .stat .n{font-size:36px;font-weight:700;letter-spacing:-.02em;line-height:1;color:#EDEFF7}
          .stat .n.grad{color:transparent;background:linear-gradient(120deg,#4A8FE8,#3EC1F0);-webkit-background-clip:text;background-clip:text}
          .stat .l{margin-top:13px;font-size:13px;line-height:1.5;color:#9AA3C2}
          .src{margin-top:14px;font-size:11px;color:#5A6280}
          .k{font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:#5E9BF2;font-weight:600}
          .pitch{margin-top:60px;max-width:800px}
          .pitch p{margin-top:20px;font-size:18px;line-height:1.62;color:#9AA3C2}
          .pitch p strong{font-weight:600;color:#EDEFF7}
          .packages{margin-top:26px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
          .pkg{position:relative;border:1px solid rgba(146,168,255,.12);border-radius:20px;padding:28px 24px;display:flex;flex-direction:column;background:rgba(255,255,255,.02)}
          .pkg.feat{border-color:rgba(94,155,242,.5);box-shadow:0 0 54px rgba(74,143,232,.12)}
          .flag{position:absolute;top:-11px;left:24px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#05070F;background:linear-gradient(90deg,#4A8FE8,#3EC1F0);padding:4px 12px;border-radius:20px}
          .pkg .pname{font-size:14px;font-weight:600;color:#5E9BF2}
          .pkg .pseats{margin-top:4px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#5A6280;font-weight:600}
          .pkg .pprice{margin-top:18px;font-size:38px;font-weight:700;letter-spacing:-.02em;line-height:1;color:#EDEFF7}
          .pkg .pprice span{font-size:14px;font-weight:400;color:#9AA3C2;letter-spacing:0}
          .pkg .phead{margin-top:8px;font-size:13px;color:#9AA3C2}
          .buy{margin-top:24px;display:block;text-align:center;padding:15px;border-radius:12px;background:linear-gradient(120deg,#6C4BE0,#4A8FE8 52%,#3EC1F0);color:#05070F;font-size:15px;font-weight:700;transition:transform .2s,box-shadow .2s}
          .buy:hover{transform:translateY(-1px);box-shadow:0 10px 30px rgba(74,143,232,.3)}
          .included{margin-top:30px;border:1px solid rgba(146,168,255,.10);border-radius:16px;padding:22px 24px}
          .included h4{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#5A6280;font-weight:600;margin-bottom:14px}
          .included ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 28px}
          .included li{font-size:14px;line-height:1.45;color:#EDEFF7;font-weight:300;padding-left:22px;position:relative}
          .included li:before{content:'';position:absolute;left:0;top:8px;width:9px;height:9px;border-radius:50%;background:linear-gradient(120deg,#4A8FE8,#3EC1F0)}
          .custom{margin-top:20px;border:1px solid rgba(146,168,255,.10);border-radius:16px;padding:24px 26px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
          .custom h4{font-size:17px;font-weight:600;color:#EDEFF7}
          .custom p{margin-top:5px;font-size:14px;color:#9AA3C2}
          .email{display:inline-block;padding:13px 26px;border-radius:50px;border:1px solid rgba(94,155,242,.5);color:#5E9BF2;font-size:14px;font-weight:600;white-space:nowrap}
          .email:hover{background:rgba(94,155,242,.1)}
          .reassure{margin-top:18px;font-size:13px;color:#5A6280;line-height:1.6;max-width:760px}
          .footer{margin-top:60px;border-top:1px solid rgba(146,168,255,.10);text-align:center;padding:44px 24px 60px}
          .footer .links a{margin:0 12px;font-size:13px;color:#9AA3C2}
          .footer .links a:hover{color:#EDEFF7}
          .footer .fine{margin-top:16px;font-size:12px;color:#5A6280}
          @media (max-width:780px){
            .hero{margin-top:40px}
            .stats{grid-template-columns:1fr}
            .stat{padding:22px 0;border-left:0!important;padding-left:0!important}
            .stat + .stat{border-top:1px solid rgba(146,168,255,.10)}
            .packages{grid-template-columns:1fr}
            .included ul{grid-template-columns:1fr}
            .custom{flex-direction:column;align-items:flex-start}
          }
        `}</style>

        <div className="orb a" /><div className="orb b" />

        <nav className="nav">
          <a href="/"><img src={LOGO_URL} alt="RewireMode" className="navlogo" onError={e => { e.target.style.display = 'none' }} /></a>
          <span className="tag">For Teams</span>
        </nav>

        <div className="container">
          <div className="hero">
            <span className="eyebrow">The hidden cost</span>
            <h1>The people you can least afford to lose are usually the ones <em>quietly burning out.</em></h1>
            <p className="sub">
              Most wellbeing perks never reach them. The person lying awake at 3am, or the one wound tight before
              every deadline, doesn’t open a generic meditation app. RewireMode does — personalised hypnotherapy
              built around each person’s own goal, by a qualified hypnotherapist.
            </p>
          </div>

          <div className="stats">
            <div className="stat"><div className="n">£51bn</div><div className="l">What poor mental health costs UK employers every year, through absence, turnover and lost output.</div></div>
            <div className="stat"><div className="n">£24bn</div><div className="l">Lost to presenteeism alone — people at their desks, but nowhere near their best.</div></div>
            <div className="stat"><div className="n grad">£4.70</div><div className="l">Returned for every £1 invested in workplace mental health support.</div></div>
          </div>
          <div className="src">Source: Deloitte, ‘Mental Health and Employers’, UK, 2024.</div>

          <div className="pitch">
            <span className="k">What your team gets</span>
            <p>
              Each person tells us their goal — sleep, stress, focus, a habit they want to break — and we build them a
              <strong> personalised session for it</strong>, wrapped in a guided 7-day programme that makes it stick.
              Grounded in real clinical method, because it’s <strong>built and led by a qualified hypnotherapist</strong> —
              not another app nobody opens.
            </p>
          </div>

          <div style={{ marginTop: 40 }}>
            <span className="k">Choose your plan</span>
            <div className="packages">
              {PACKAGES.map(p => (
                <div key={p.id} className={`pkg${p.featured ? ' feat' : ''}`}>
                  {p.featured && <span className="flag">Most popular</span>}
                  <span className="pname">{p.name}</span>
                  <span className="pseats">{p.seats}</span>
                  <div className="pprice">{p.price}<span> / year</span></div>
                  <div className="phead">{p.perHead}</div>
                  <button className="buy" onClick={() => buy(p)}>Buy {p.name} →</button>
                </div>
              ))}
            </div>

            <div className="included">
              <h4>Every plan includes</h4>
              <ul>{INCLUDED.map(i => <li key={i}>{i}</li>)}</ul>
            </div>

            <div className="custom">
              <div>
                <h4>More than 250 people, or need something tailored?</h4>
                <p>Multi-site teams, custom seat counts and bespoke onboarding — let’s build the right fit.</p>
              </div>
              <a className="email" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('RewireMode for Teams — custom plan enquiry')}`}>Email us about a custom plan</a>
            </div>

            <p className="reassure">
              One flat annual price for your whole team. After checkout you’ll receive a single join code to share with
              your staff — most teams are up and running the same day. Questions before you buy? Email {CONTACT_EMAIL}.
            </p>
          </div>
        </div>

        <footer className="footer">
          <div className="links">
            <a href="/">Home</a>
            <a href="/pricing">Pricing</a>
            <a href="/faq">FAQ</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="fine">RewireMode — Rewire your mind. Rewrite your story. · Built by a qualified hypnotherapist</div>
        </footer>
      </div>
    </>
  )
}
