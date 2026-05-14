import Head from 'next/head'
import { useState, useEffect } from 'react'

const C = {
  purple:'#7B4FE0', purpleLight:'#9B6FF0',
  cyan:'#29BAEF', cyanLight:'#4DCAF5',
  grad:'linear-gradient(135deg,#7B4FE0 0%,#4A8FE8 50%,#29BAEF 100%)',
  bg:'#0d0f1a', bgAlt:'#0a0c16',
  bgCard:'rgba(255,255,255,0.035)',
  border:'rgba(123,79,224,0.14)',
  textH:'#ffffff', textBody:'#b8bdd4', textMuted:'#676e8a',
}
const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function Pricing({ user, profile }) {
  const [loading, setLoading] = useState(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const buy = params.get('buy')
    if (buy && user) checkout(buy)
  }, [user])

  async function checkout(productKey) {
    if (!user) { window.location.href = '/?signup=true'; return }
    setLoading(productKey)
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productKey, userId: user.id, email: user.email }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  return (
    <>
      <Head>
        <title>Pricing — RewireMode</title>
        <meta name="description" content="Simple, transparent pricing for RewireMode." />
        <link rel="icon" type="image/png" href="https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/FLAVICON.png" />
        <link rel="shortcut icon" href="https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/FLAVICON.png" />
        <link rel="apple-touch-icon" href="https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/FLAVICON.png" />
      </Head>
      <div style={{ minHeight:'100vh', background:C.bg, color:C.textBody, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
          button{cursor:pointer;border:none;background:none;font-family:inherit}
          ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(123,79,224,0.2);border-radius:4px}
        `}</style>

        {/* BG */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(123,79,224,0.08) 0%,transparent 65%)', filter:'blur(60px)', animation:'orbFloat 8s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(41,186,239,0.06) 0%,transparent 65%)', filter:'blur(60px)', animation:'orbFloat 10s ease-in-out infinite 2s' }} />
          <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(123,79,224,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(123,79,224,0.03) 1px,transparent 1px)`, backgroundSize:'60px 60px' }} />
        </div>

        {/* NAV */}
        <nav style={{ position:'relative', zIndex:10, borderBottom:`1px solid ${C.border}`, backdropFilter:'blur(10px)', background:'rgba(13,15,26,0.85)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 24px 0', gap:'10px' }}>
            <a href="/" style={{ fontSize:'12px', color:C.textMuted, padding:'6px 12px', borderRadius:'8px', border:`1px solid ${C.border}`, textDecoration:'none' }}>← Back</a>
            <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              {profile && <div style={{ fontSize:'13px', color:C.purpleLight, fontWeight:'600', padding:'5px 12px', borderRadius:'100px', border:'1px solid rgba(123,79,224,0.25)', background:'rgba(123,79,224,0.06)' }}>✦ {profile.credits} credits</div>}
              <a href="/faq" style={{ fontSize:'12px', color:C.textMuted, padding:'6px 12px', borderRadius:'8px', border:`1px solid ${C.border}`, textDecoration:'none' }}>FAQ</a>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'center', padding:'4px 24px 12px' }}>
            <a href="/"><img src={LOGO} alt="RewireMode" style={{ height: isMobile ? '80px' : '120px', objectFit:'contain', mixBlendMode:'lighten' }} onError={e=>e.target.style.display='none'} /></a>
          </div>
        </nav>

        <div style={{ maxWidth:'900px', margin:'0 auto', padding: isMobile ? '32px 16px 60px' : '60px 20px 80px', position:'relative', zIndex:1 }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'52px', animation:'fadeUp 0.6s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 16px', borderRadius:'100px', border:'1px solid rgba(123,79,224,0.25)', background:'rgba(123,79,224,0.08)', fontSize:'11px', letterSpacing:'0.15em', color:C.purpleLight, marginBottom:'20px', fontWeight:'600' }}>
              ◈ SIMPLE PRICING
            </div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize: isMobile ? '28px' : '42px', fontWeight:'800', marginBottom:'12px', letterSpacing:'-0.035em', background:C.grad, backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Choose your plan
            </h1>
            <p style={{ color:C.textBody, fontSize:'15px', fontWeight:'300' }}>Start free. Upgrade when you're ready. Cancel anytime.</p>
          </div>

          {/* Founder urgency banner */}
          <div style={{ padding:'16px 24px', borderRadius:'14px', background:'rgba(255,159,67,0.07)', border:'1px solid rgba(255,159,67,0.25)', marginBottom:'32px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap', animation:'fadeUp 0.6s ease 0.05s both' }}>
            <div>
              <div style={{ fontSize:'14px', color:'#ff9f43', fontWeight:'700', marginBottom:'3px' }}>⚡ Founder Lifetime offer — this founding round will not reopen</div>
              <div style={{ fontSize:'13px', color:C.textMuted }}>We haven't run a single ad. This is for our early community only. Once this round closes, it closes permanently.</div>
            </div>
            <div style={{ fontSize:'13px', color:'#ff9f43', fontWeight:'700', whiteSpace:'nowrap', background:'rgba(255,159,67,0.12)', border:'1px solid rgba(255,159,67,0.3)', padding:'6px 14px', borderRadius:'100px' }}>Scroll down ↓</div>
          </div>

          {/* Plans: Pro Monthly + Founder Lifetime */}
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'20px', marginBottom:'52px', animation:'fadeUp 0.6s ease 0.1s both' }}>

            {/* Pro Monthly */}
            <div style={{ padding:'36px 32px', borderRadius:'22px', border:`1px solid rgba(123,79,224,0.4)`, background:'rgba(123,79,224,0.06)', position:'relative', boxShadow:'0 0 50px rgba(123,79,224,0.1)' }}>
              <div style={{ fontSize:'12px', color:C.purpleLight, fontWeight:'700', marginBottom:'10px', letterSpacing:'0.1em' }}>PRO MONTHLY</div>
              <div style={{ marginBottom:'6px' }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontSize:'44px', fontWeight:'800', color:C.textH, letterSpacing:'-0.03em' }}>£14.99</span>
                <span style={{ fontSize:'15px', color:C.textMuted, fontWeight:'400', marginLeft:'4px' }}>/month</span>
              </div>
              <div style={{ fontSize:'13px', color:C.purpleLight, marginBottom:'28px', fontWeight:'600' }}>100 credits per month · Cancel anytime</div>
              <div style={{ marginBottom:'30px' }}>
                {[
                  ['✦', '100 credits every month'],
                  ['✦', 'All session types — Reset, Sleep, Walking, Subliminals'],
                  ['✦', 'Save up to 50 sessions to your library'],
                  ['✦', 'Full session history'],
                  ['✦', 'Streak bonus credits'],
                  ['✦', 'Priority audio generation'],
                  ['✦', 'Every new feature as we build it'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display:'flex', alignItems:'flex-start', gap:'10px', fontSize:'14px', color:C.textBody, marginBottom:'12px', lineHeight:1.5 }}>
                    <span style={{ color:C.purpleLight, fontWeight:'700', flexShrink:0 }}>{icon}</span>{text}
                  </div>
                ))}
              </div>
              <button onClick={() => checkout('pro_monthly')} style={{ width:'100%', padding:'16px', borderRadius:'13px', background:C.grad, color:'#fff', fontSize:'15px', fontWeight:'800', boxShadow:'0 4px 24px rgba(123,79,224,0.4)', letterSpacing:'0.01em' }}>
                {loading==='pro_monthly' ? 'Loading...' : 'Start Pro →'}
              </button>
              <p style={{ textAlign:'center', fontSize:'12px', color:C.textMuted, marginTop:'10px' }}>Cancel anytime · No hidden fees · Secure checkout</p>
            </div>

            {/* Founder Lifetime */}
            <div style={{ padding:'36px 32px', borderRadius:'22px', border:'1px solid rgba(255,159,67,0.4)', background:'rgba(255,159,67,0.04)', position:'relative', boxShadow:'0 0 50px rgba(255,159,67,0.08)' }}>
              <div style={{ position:'absolute', top:'-14px', left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#ff9f43,#e67e22)', color:'#fff', fontSize:'11px', fontWeight:'800', padding:'5px 18px', borderRadius:'100px', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>🔒 FOUNDER OFFER · FOUNDING ROUND</div>
              <div style={{ fontSize:'12px', color:'#ff9f43', fontWeight:'700', marginBottom:'10px', letterSpacing:'0.1em' }}>FOUNDER LIFETIME</div>
              <div style={{ marginBottom:'6px' }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontSize:'44px', fontWeight:'800', color:C.textH, letterSpacing:'-0.03em' }}>£99</span>
                <span style={{ fontSize:'15px', color:C.textMuted, fontWeight:'400', marginLeft:'4px' }}>once. forever.</span>
              </div>
              <div style={{ fontSize:'13px', color:'#ff9f43', marginBottom:'28px', fontWeight:'600' }}>50 credits/month · Never pay again</div>
              <div style={{ marginBottom:'16px' }}>
                {[
                  ['✦', '50 credits every month, forever'],
                  ['✦', 'All session types — always'],
                  ['✦', 'Every new feature we ever build — included'],
                  ['✦', 'Full session library'],
                  ['✦', 'One payment. No subscription. No renewal.'],
                  ['✦', 'Pays for itself vs Pro in just 7 months'],
                  ['✦', 'Locked in permanently at £99'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display:'flex', alignItems:'flex-start', gap:'10px', fontSize:'14px', color:C.textBody, marginBottom:'12px', lineHeight:1.5 }}>
                    <span style={{ color:'#ff9f43', fontWeight:'700', flexShrink:0 }}>{icon}</span>{text}
                  </div>
                ))}
              </div>
              <div style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(255,159,67,0.1)', border:'1px solid rgba(255,159,67,0.25)', marginBottom:'20px' }}>
                <div style={{ fontSize:'12px', color:'#ff9f43', lineHeight:1.6 }}>⚡ Once this founding round closes, it closes permanently. We will never offer this price again.</div>
              </div>
              <button onClick={() => checkout('lifetime_founder')} style={{ width:'100%', padding:'16px', borderRadius:'13px', background:'linear-gradient(135deg,#ff9f43,#e67e22)', color:'#fff', fontSize:'15px', fontWeight:'800', boxShadow:'0 4px 24px rgba(255,159,67,0.35)', letterSpacing:'0.01em' }}>
                {loading==='lifetime_founder' ? 'Loading...' : 'Claim Founder Lifetime — £99 →'}
              </button>
              <p style={{ textAlign:'center', fontSize:'12px', color:C.textMuted, marginTop:'10px' }}>One-time payment · No hidden fees · Secure checkout via Stripe</p>
            </div>
          </div>

          {/* What you CAN'T do free - honest comparison */}
          <div style={{ padding:'32px', borderRadius:'20px', background:C.bgAlt, border:`1px solid ${C.border}`, marginBottom:'36px', animation:'fadeUp 0.6s ease 0.15s both' }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:'18px', fontWeight:'700', color:C.textH, marginBottom:'6px' }}>What the free plan doesn't include</div>
            <div style={{ fontSize:'13px', color:C.textMuted, marginBottom:'24px' }}>Free accounts can generate and listen — but here's what's locked.</div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'12px' }}>
              {[
                { icon:'💾', text:'Saving sessions to your library', sub:'Free users can only save 1 session.' },
                { icon:'📚', text:'Full session history', sub:'Access to all your past sessions and scripts.' },
                { icon:'✦', text:'More than 5 credits per week', sub:'Free is 5 credits/week. Pro is 100/month.' },
                { icon:'🔁', text:'Streak bonus credits', sub:'Earn extra credits for daily consistency.' },
                { icon:'⚡', text:'Priority audio generation', sub:'Free users share the queue with everyone.' },
                { icon:'🚀', text:'New features as they launch', sub:'Paid members get everything first.' },
              ].map(f => (
                <div key={f.text} style={{ display:'flex', gap:'12px', padding:'14px', borderRadius:'12px', background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:'18px', flexShrink:0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize:'13px', color:C.textH, fontWeight:'600', marginBottom:'2px' }}>{f.text}</div>
                    <div style={{ fontSize:'12px', color:C.textMuted, lineHeight:1.5 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How credits work */}
          <div style={{ padding:'28px', borderRadius:'20px', background:C.bgCard, border:`1px solid ${C.border}`, marginBottom:'36px', animation:'fadeUp 0.6s ease 0.2s both' }}>
            <div style={{ fontSize:'11px', letterSpacing:'0.15em', color:C.purpleLight, fontWeight:'700', marginBottom:'20px' }}>HOW CREDITS WORK</div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap:'16px' }}>
              {[
                { emoji:'🧠', label:'Reset Hypnosis', credits:'1 credit', duration:'5 min' },
                { emoji:'🚶', label:'Walking Hypnosis', credits:'1 credit', duration:'5 min' },
                { emoji:'🌙', label:'Sleep Hypnosis', credits:'3 credits', duration:'15 min' },
                { emoji:'🌊', label:'Subliminal', credits:'3 credits', duration:'30 min' },
              ].map(s => (
                <div key={s.label} style={{ padding:'16px', borderRadius:'12px', background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}`, textAlign:'center' }}>
                  <div style={{ fontSize:'24px', marginBottom:'8px' }}>{s.emoji}</div>
                  <div style={{ fontSize:'13px', color:C.textH, fontWeight:'600', marginBottom:'4px' }}>{s.label}</div>
                  <div style={{ fontSize:'12px', color:C.purpleLight, fontWeight:'700', marginBottom:'2px' }}>{s.credits}</div>
                  <div style={{ fontSize:'11px', color:C.textMuted }}>{s.duration}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pay as you go */}
          <div style={{ marginBottom:'48px', animation:'fadeUp 0.6s ease 0.25s both' }}>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'22px', fontWeight:'800', color:C.textH, marginBottom:'8px' }}>Or pay as you go</h2>
              <p style={{ fontSize:'14px', color:C.textMuted, fontWeight:'300' }}>No subscription. Buy credits when you need them. They never expire.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap:'14px' }}>
              {[
                { key:'credits_10',  label:'10 Credits', price:'£5',  per:'50p per credit', best:false },
                { key:'credits_50',  label:'50 Credits', price:'£15', per:'30p per credit', best:false },
                { key:'credits_100', label:'100 Credits', price:'£25', per:'25p per credit', best:true },
              ].map(c => (
                <div key={c.key} style={{ padding:'24px 20px', borderRadius:'18px', border:`1px solid ${c.best ? 'rgba(123,79,224,0.4)' : C.border}`, background:c.best ? 'rgba(123,79,224,0.06)' : C.bgCard, textAlign:'center', position:'relative', boxShadow:c.best ? '0 0 30px rgba(123,79,224,0.08)' : 'none' }}>
                  {c.best && <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:C.grad, color:'#fff', fontSize:'10px', fontWeight:'800', padding:'4px 14px', borderRadius:'100px', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>BEST VALUE</div>}
                  <div style={{ fontSize:'17px', color:C.textH, fontWeight:'700', marginBottom:'6px' }}>{c.label}</div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:'32px', color:C.purpleLight, fontWeight:'800', marginBottom:'4px' }}>{c.price}</div>
                  <div style={{ fontSize:'12px', color:C.textMuted, marginBottom:'20px' }}>{c.per}</div>
                  <button onClick={() => checkout(c.key)} style={{ width:'100%', padding:'12px', borderRadius:'10px', background:c.best ? C.grad : 'rgba(123,79,224,0.08)', border:c.best ? 'none' : `1px solid rgba(123,79,224,0.25)`, color:c.best ? '#fff' : C.purpleLight, fontSize:'14px', fontWeight:'700' }}>
                    {loading===c.key ? 'Loading...' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ padding:'32px', borderRadius:'20px', background:C.bgCard, border:`1px solid ${C.border}`, marginBottom:'32px', animation:'fadeUp 0.6s ease 0.3s both' }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'18px', fontWeight:'800', color:C.textH, marginBottom:'24px' }}>Common questions</h3>
            {[
              ['What is a credit?', 'One credit generates one Reset Hypnosis or Walking Hypnosis session (5 minutes). Sleep Hypnosis and Subliminal sessions use 3 credits each due to their length.'],
              ['What happens to the Founder Lifetime offer?', 'Once this founding round closes, it closes permanently. We will not offer it again at any price.'],
              ['Can I cancel the monthly plan anytime?', 'Yes. Cancel from your dashboard at any time. You keep access until the end of the billing period.'],
              ['Do unused credits roll over?', 'Monthly subscription credits reset each month. Pay-as-you-go credit packs never expire.'],
              ['Is my payment secure?', 'All payments are processed securely by Stripe. We never store your card details.'],
            ].map(([q, a]) => (
              <div key={q} style={{ marginBottom:'20px', paddingBottom:'20px', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ fontSize:'14px', color:C.textH, fontWeight:'700', marginBottom:'6px' }}>{q}</div>
                <div style={{ fontSize:'13px', color:C.textBody, lineHeight:1.7 }}>{a}</div>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div style={{ textAlign:'center', animation:'fadeUp 0.6s ease 0.35s both' }}>
            <p style={{ fontSize:'13px', color:C.textMuted, marginBottom:'16px' }}>Built by a qualified hypnotherapist · Powered by Claude AI · Voices by ElevenLabs</p>
            <div style={{ display:'flex', justifyContent:'center', gap:'24px', flexWrap:'wrap' }}>
              {['🔒 Secure checkout', '↩ Cancel monthly anytime', '✦ Credits never expire', '🎧 Instant generation'].map(t => (
                <span key={t} style={{ fontSize:'12px', color:C.textMuted }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
