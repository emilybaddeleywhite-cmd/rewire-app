import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { CrisisBlock, SafetyBlock, useSafetyGate } from '../components/SafetyBlock'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'
const C = {
  purple:'#7B4FE0', purpleLight:'#9B6FF0', purpleDim:'rgba(123,79,224,0.14)',
  cyan:'#29BAEF', cyanLight:'#4DCAF5', cyanDim:'rgba(41,186,239,0.12)',
  grad:'linear-gradient(135deg,#7B4FE0 0%,#4A8FE8 50%,#29BAEF 100%)',
  gradText:'linear-gradient(135deg,#9B6FF0,#29BAEF)',
  bg:'#0d0f1a', bgAlt:'#0a0c16',
  bgCard:'rgba(255,255,255,0.035)', bgCardHover:'rgba(255,255,255,0.06)',
  border:'rgba(123,79,224,0.14)', borderHover:'rgba(123,79,224,0.35)',
  textH:'#ffffff', textBody:'#b8bdd4', textMuted:'#676e8a',
}
const MUSIC = {
  reset:      { url:'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-calm.mp3.mp3',       volume:0.18, label:'Calm ambient' },
  sleep:      { url:'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-sleep.mp3.mp3',      volume:0.15, label:'Sleep ambient' },
  subliminal: { url:'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-subliminal.mp3.mp3', volume:0.20, label:'Subliminal ambient' },
  walking:    { url:'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/music-calm.mp3.mp3',       volume:0.15, label:'Ambient walking' },
}
const LOAD_MESSAGES = {
  reset:      ['Analysing your intention...','Crafting your induction sequence...','Building your personalised suggestion phase...','Layering embedded commands...','This takes 60 to 90 seconds. Your subconscious is worth it.','Almost ready. Something written just for you, right now.'],
  sleep:      ['Writing your induction sequence...','Building your deepener...','Crafting your therapeutic suggestion phase...','Weaving your sleep affirmation layer...','Your brain will continue rewiring as you sleep. Almost ready.','This one takes a little longer. It is worth the wait.'],
  subliminal: ['Your subconscious processes over 11 million bits per second...','Subliminal suggestions bypass the critical faculty...','Research shows repeated exposure strengthens neural pathways...','Writing your affirmations — calibrated to your exact intention...','Almost ready. 30 minutes of deep subconscious reprogramming incoming.'],
  walking:    ['Writing your walking session — designed to keep you grounded...','Crafting suggestions that work with your moving body...','Building language patterns that feel like natural thoughts...','Almost ready. Keep your eyes open and walk at your own pace.'],
}
const VOICES = { hypnosis:[
  { id:'TKePFuDtAVp14EppI8GC', name:'Emily',  gender:'female', desc:'Warm and grounding',  preview:'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Emily_Sample.mp3' },
  { id:'xGDJhCwcqw94ypljc95Z', name:'Callum', gender:'male',   desc:'Calm and measured',   preview:'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice2_Sample.mp3' },
  { id:'KH1SQLVulwP6uG4O3nmT', name:'River',  gender:'male',   desc:'Deep and soothing',   preview:'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice3_Sample.mp3' },
  { id:'OOk3INdXVLRmSaQoAX9D', name:'Serena', gender:'female', desc:'Soft and serene',      preview:'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice4_Sample.mp3' },
]}
const HYPNOSIS_TYPES = [
  { id:'reset',   label:'Reset Hypnosis',   emoji:'🧠', duration:'5 min',  credits:1,  desc:'A quick mental reset. Clears stress and recentres you in minutes.',                         color:C.purple,      colorB:'#4A8FE8',    grad:C.grad,                                          glow:'rgba(123,79,224,0.25)',  waveA:'#4A8FE8',    waveB:C.purple },
  { id:'sleep',   label:'Sleep Hypnosis',   emoji:'🌙', duration:'15 min', credits:3,  desc:'A longer session designed to guide you into restful, rewiring sleep.',                      color:C.purpleLight, colorB:C.purple,     grad:'linear-gradient(135deg,#9B6FF0,#7B4FE0)',       glow:'rgba(155,111,240,0.25)', waveA:C.purple,     waveB:C.purpleLight },
  { id:'walking', label:'Walking Hypnosis', emoji:'🚶', duration:'5 min',  credits:1,  desc:'Gentle suggestions designed to be safe while walking. Full awareness maintained.',          color:C.cyan,        colorB:C.cyanLight,  grad:'linear-gradient(135deg,#29BAEF,#4DCAF5)',       glow:'rgba(41,186,239,0.25)',  waveA:'#4DCAF5',    waveB:C.cyan },
]
const SUBLIMINAL_PRODUCT = { id:'subliminal', label:'Subliminal', emoji:'🌊', duration:'30 min', credits:3, desc:'Identity-level suggestions layered under music. Play in the background.', color:C.cyan, colorB:'#0891b2', grad:'linear-gradient(135deg,#29BAEF,#0891b2)', glow:'rgba(41,186,239,0.25)', waveA:'#0891b2', waveB:C.cyan }
const GOALS = ['Confidence','Overthinking','Sleep','Fear','Success','Abundance','Self-worth','Focus']
const QUIZ_QUESTIONS = [
  { id:'q1', text:'How does your mind tend to get in your own way?', options:[
    { label:"I overthink everything and can't switch off", tags:['Overthinking'] },
    { label:"I doubt myself and hold back", tags:['Confidence','Self-worth'] },
    { label:"I can't focus — I'm constantly distracted", tags:['Focus'] },
    { label:"I feel stuck, like success isn't for me", tags:['Success','Abundance'] },
    { label:"Fear stops me from taking action", tags:['Fear'] },
  ]},
  { id:'q2', text:'Which of these sounds most like you right now?', options:[
    { label:"I wake up anxious before the day's even started", tags:['Overthinking','Fear'] },
    { label:"I know what I need to do but I just can't make myself do it", tags:['Focus','Confidence'] },
    { label:"I compare myself to others and always come up short", tags:['Self-worth','Confidence'] },
    { label:"I work hard but never feel like it's enough", tags:['Abundance','Success'] },
    { label:"I struggle to sleep — my brain won't stop", tags:['Sleep','Overthinking'] },
  ]},
  { id:'q3', text:'What would feel like the biggest win for you?', options:[
    { label:"Waking up calm and clear-headed", tags:['Sleep','Overthinking'] },
    { label:"Walking into a room and owning it", tags:['Confidence'] },
    { label:"Finally believing I deserve good things", tags:['Self-worth','Abundance'] },
    { label:"Finishing what I start without fighting myself", tags:['Focus','Overthinking'] },
    { label:"Saying yes to things that used to terrify me", tags:['Fear','Confidence'] },
  ]},
  { id:'q4', text:"When things go wrong, what's your first instinct?", options:[
    { label:"Replay it obsessively and beat myself up", tags:['Overthinking','Self-worth'] },
    { label:"Assume I'm not good enough", tags:['Self-worth','Confidence'] },
    { label:"Freeze and avoid the situation next time", tags:['Fear','Confidence'] },
    { label:"Lose focus and spiral into distraction", tags:['Focus','Overthinking'] },
    { label:"Feel like success will never really happen for me", tags:['Success','Abundance'] },
  ]},
  { id:'q5', text:'If you could change one thing about how your mind works, what would it be?', options:[
    { label:"Stop the constant mental noise", tags:['Overthinking','Sleep'] },
    { label:"Trust myself more", tags:['Confidence','Self-worth'] },
    { label:"Stop letting fear make my decisions", tags:['Fear'] },
    { label:"Actually follow through on things", tags:['Focus','Success'] },
    { label:"Feel like abundance is possible for me", tags:['Abundance','Success'] },
  ]},
]
const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth} body{-webkit-font-smoothing:antialiased}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}} @keyframes spinR{to{transform:rotate(-360deg)}}
  @keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
  @keyframes orbitSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes nodePulse{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
  @keyframes coreGlow{0%,100%{box-shadow:0 0 40px rgba(123,79,224,0.15)}50%{box-shadow:0 0 60px rgba(123,79,224,0.3)}}
  @keyframes fadeMsg{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
  .reveal{opacity:0;transform:translateY(22px);transition:opacity 0.65s ease,transform 0.65s ease} .reveal.in{opacity:1;transform:none}
  .d1{transition-delay:.08s}.d2{transition-delay:.16s}.d3{transition-delay:.24s}.d4{transition-delay:.32s}
  button{cursor:pointer;border:none;background:none;font-family:inherit} input,textarea{font-family:inherit;outline:none}
  input[type=range]{-webkit-appearance:none;width:100%;height:5px;border-radius:5px;cursor:pointer}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;cursor:pointer}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(123,79,224,0.2);border-radius:4px}
  @media(max-width:900px){.hide-mob{display:none!important}}
  @media(max-width:640px){.two-col{grid-template-columns:1fr!important}.proof-grid{grid-template-columns:1fr 1fr!important}}
`
function friendlyError(msg){
  if(!msg) return 'Something went wrong. Please try again.'
  if(msg.includes('credits')||msg.includes('Credits')) return "You've run out of credits. Top up to continue."
  if(msg.includes('Audio')||msg.includes('audio')) return 'Audio generation hit a snag. Please try again.'
  if(msg.includes('limit')||msg.includes('Limit')) return "You've reached your save limit. Upgrade to save more."
  if(msg.includes('Unauthorized')||msg.includes('Forbidden')) return 'Session expired. Please sign in again.'
  return 'Something went wrong. Please try again.'
}
function Waveform({active,product}){
  const [heights,setHeights]=useState(Array(32).fill(5))
  useEffect(()=>{
    if(!active){setHeights(Array(32).fill(5));return}
    const iv=setInterval(()=>setHeights(Array(32).fill(0).map((_,i)=>6+Math.abs(Math.sin(Date.now()*0.003+i*0.5))*28+Math.random()*8)),110)
    return()=>clearInterval(iv)
  },[active])
  const p=product||HYPNOSIS_TYPES[0]
  return(<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'3px',height:'54px'}}>{heights.map((h,i)=>(<div key={i} style={{width:'3px',borderRadius:'2px',height:`${h}px`,background:`linear-gradient(to top,${p.waveA},${p.waveB})`,transition:'height 0.11s ease',opacity:active?0.9:0.2}}/>))}</div>)
}
function VoiceCard({voice,selected,onSelect,theme}){
  const aRef=useRef(null);const[prev,setPrev]=useState(false)
  function tp(e){e.stopPropagation();if(!aRef.current)return;if(prev){aRef.current.pause();aRef.current.currentTime=0;setPrev(false)}else{aRef.current.play();setPrev(true)}}
  return(<div onClick={onSelect} style={{padding:'18px 16px',borderRadius:'14px',border:`1px solid ${selected?theme.color+'cc':C.border}`,background:selected?theme.color+'12':C.bgCard,transition:'all 0.2s ease',boxShadow:selected?`0 0 22px ${theme.glow}`:'none',cursor:'pointer'}}>
    <audio ref={aRef} src={voice.preview} onEnded={()=>setPrev(false)}/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
      <div style={{fontSize:'22px'}}>{voice.gender==='female'?'👩':'👨'}</div>
      <button onClick={tp} style={{padding:'4px 10px',borderRadius:'100px',fontSize:'11px',fontWeight:'700',border:`1px solid ${theme.color}55`,background:prev?theme.color+'25':'transparent',color:theme.color,cursor:'pointer'}}>{prev?'⏹ Stop':'▶ Preview'}</button>
    </div>
    <div style={{fontSize:'15px',color:selected?theme.color:C.textH,fontWeight:'700',marginBottom:'3px'}}>{voice.name}</div>
    <div style={{fontSize:'12px',color:C.textBody,marginBottom:'6px'}}>{voice.desc}</div>
    <div style={{fontSize:'10px',color:C.textMuted}}>Free preview · ~15 sec</div>
  </div>)
}
function DisclaimerModal({onAccept}){
  return(<div style={{position:'fixed',inset:0,background:'rgba(10,12,22,0.97)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(12px)'}}>
    <div style={{background:'linear-gradient(145deg,#0f1729,#0a0c16)',border:`1px solid ${C.border}`,borderRadius:'24px',padding:'36px',width:'100%',maxWidth:'460px',maxHeight:'90vh',overflowY:'auto'}}>
      <div style={{textAlign:'center',marginBottom:'24px'}}><div style={{fontSize:'32px',marginBottom:'12px'}}>⚠️</div><h2 style={{fontSize:'20px',color:C.textH,fontWeight:'800',marginBottom:'6px'}}>Before you begin</h2><p style={{fontSize:'13px',color:C.textBody,lineHeight:1.65}}>Please read and accept the following before generating your first session.</p></div>
      <div style={{display:'grid',gap:'12px',marginBottom:'28px'}}>
        {[{icon:'🏥',text:'RewireMode is not medical advice and is not a substitute for professional mental health treatment.'},{icon:'🧠',text:'Not suitable for people with serious mental health conditions including psychosis, epilepsy, or severe dissociative disorders.'},{icon:'🚗',text:'Never use hypnosis sessions while driving, operating machinery, or in any situation requiring your full attention.'},{icon:'✅',text:'Use responsibly. If you experience any distress during a session, stop immediately.'}].map(({icon,text})=>(
          <div key={text} style={{display:'flex',gap:'12px',padding:'14px',borderRadius:'12px',background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`}}><span style={{fontSize:'18px',flexShrink:0}}>{icon}</span><p style={{fontSize:'13px',color:C.textBody,lineHeight:1.6}}>{text}</p></div>
        ))}
      </div>
      <button onClick={onAccept} style={{width:'100%',padding:'16px',borderRadius:'14px',background:C.grad,color:'#fff',fontSize:'15px',fontWeight:'800',border:'none',cursor:'pointer'}}>I understand — continue →</button>
      <p style={{textAlign:'center',fontSize:'11px',color:C.textMuted,marginTop:'12px',lineHeight:1.6}}>By continuing you confirm you have read and understood the above. You will not be shown this again. <a href="/terms" target="_blank" style={{color:C.purpleLight}}>Terms of Service</a></p>
    </div>
  </div>)
}
function AuthModal({onClose,onSuccess}){
  const[mode,setMode]=useState('signup');const[name,setName]=useState('');const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[loading,setLoading]=useState(false);const[error,setError]=useState('');const[success,setSuccess]=useState(false);const[successMsg,setSuccessMsg]=useState('');const[agreed,setAgreed]=useState(false)
  async function gsi(){const{error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});if(error)setError(error.message)}
  async function fp(){if(!email){setError('Enter your email address first.');return};setLoading(true);const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});if(error)setError(error.message);else{setError('');setSuccess(true);setSuccessMsg('Password reset email sent. Check your inbox.')};setLoading(false)}
  async function hs(){
    if(mode==='signup'&&!agreed){setError('Please agree to the Terms of Service.');return}
    if(password.length<6){setError('Password must be at least 6 characters.');return}
    setLoading(true);setError('')
    if(mode==='signup'){const{data,error}=await supabase.auth.signUp({email,password,options:{data:{name}}});if(error)setError(error.message);else if(data.session)onSuccess();else setSuccess(true)}
    else{const{error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else onSuccess()}
    setLoading(false)
  }
  const inp={width:'100%',padding:'14px 16px',borderRadius:'10px',border:`1px solid ${C.border}`,background:'rgba(123,79,224,0.06)',color:C.textH,fontSize:'14px',marginBottom:'12px',fontFamily:'inherit',outline:'none'}
  return(<div style={{position:'fixed',inset:0,background:'rgba(10,12,22,0.94)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(10px)'}}>
    <div style={{background:'linear-gradient(145deg,#0f1729,#0a0c16)',border:`1px solid ${C.border}`,borderRadius:'24px',padding:'40px',width:'100%',maxWidth:'420px',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
      <div style={{textAlign:'center',marginBottom:'28px'}}><img src={LOGO} alt="RewireMode" style={{height:'56px',marginBottom:'16px',objectFit:'contain',mixBlendMode:'lighten'}} onError={e=>e.target.style.display='none'}/><h2 style={{fontSize:'21px',color:C.purpleLight,fontWeight:'700',marginBottom:'6px'}}>{mode==='signup'?'Start rewiring your mind':'Welcome back'}</h2>{mode==='signup'&&<p style={{fontSize:'13px',color:C.textBody}}>5 free credits. No card needed.</p>}</div>
      {success?(<div style={{textAlign:'center'}}><div style={{padding:'20px',borderRadius:'14px',background:'rgba(123,79,224,0.08)',border:`1px solid ${C.border}`,marginBottom:'16px'}}><p style={{color:C.purpleLight,fontSize:'15px',fontWeight:'600',marginBottom:'6px'}}>{successMsg||'Account created.'}</p><p style={{color:C.textBody,fontSize:'13px',lineHeight:1.6}}>Check your email to confirm your account, then sign in below.</p></div><button onClick={()=>{setSuccess(false);setMode('signin')}} style={{width:'100%',padding:'14px',borderRadius:'12px',background:C.grad,color:'#fff',fontSize:'14px',fontWeight:'700',border:'none',cursor:'pointer'}}>Sign In Now →</button></div>):(
      <><button onClick={gsi} style={{width:'100%',padding:'13px',borderRadius:'12px',border:`1px solid ${C.border}`,background:'rgba(255,255,255,0.04)',color:C.textH,fontSize:'14px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'16px'}}><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Continue with Google</button>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}><div style={{flex:1,height:'1px',background:C.border}}/><span style={{fontSize:'12px',color:C.textMuted}}>or</span><div style={{flex:1,height:'1px',background:C.border}}/></div>
      {mode==='signup'&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inp}/>}
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={inp}/>
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6 characters)" type="password" style={{...inp,marginBottom:'4px'}} onKeyDown={e=>e.key==='Enter'&&hs()}/>
      {mode==='signin'&&<p onClick={fp} style={{fontSize:'12px',color:C.purpleLight,cursor:'pointer',textAlign:'right',marginBottom:'12px'}}>Forgot password?</p>}
      {mode==='signup'&&(<div style={{display:'flex',alignItems:'flex-start',gap:'10px',marginBottom:'14px',marginTop:'8px'}}><div onClick={()=>setAgreed(!agreed)} style={{width:'18px',height:'18px',borderRadius:'4px',border:`2px solid ${agreed?C.purple:'rgba(255,255,255,0.2)'}`,background:agreed?C.purple:'transparent',cursor:'pointer',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center'}}>{agreed&&<span style={{color:'#fff',fontSize:'11px',fontWeight:'800'}}>✓</span>}</div><p style={{fontSize:'12px',color:C.textBody,lineHeight:1.6,cursor:'pointer'}} onClick={()=>setAgreed(!agreed)}>I agree to the <a href="/terms" target="_blank" style={{color:C.purpleLight}} onClick={e=>e.stopPropagation()}>Terms of Service</a> and <a href="/privacy" target="_blank" style={{color:C.purpleLight}} onClick={e=>e.stopPropagation()}>Privacy Policy</a></p></div>)}
      {error&&<p style={{color:'#ff6b6b',fontSize:'13px',marginBottom:'12px'}}>{error}</p>}
      <button onClick={hs} disabled={loading} style={{width:'100%',padding:'15px',borderRadius:'12px',background:C.grad,color:'#fff',fontSize:'15px',fontWeight:'700',cursor:'pointer',border:'none',marginBottom:'14px'}}>{loading?'Please wait...':mode==='signup'?'Create My Account →':'Sign In →'}</button>
      <p style={{textAlign:'center',fontSize:'13px',color:C.textBody,cursor:'pointer'}} onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('')}}>{mode==='signup'?'Already have an account? Sign in':"Don't have an account? Sign up free"}</p></>)}
      <button onClick={onClose} style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',color:C.textMuted,fontSize:'22px',cursor:'pointer'}}>×</button>
    </div>
  </div>)
}
function CreditsModal({profile,user,onClose}){
  const[loading,setLoading]=useState(null)
  async function co(pk){setLoading(pk);const res=await fetch('/api/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productKey:pk,userId:user.id,email:user.email})});const d=await res.json();if(d.url)window.location.href=d.url;setLoading(null)}
  return(<div style={{position:'fixed',inset:0,background:'rgba(10,12,22,0.94)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(10px)'}}>
    <div style={{background:'linear-gradient(145deg,#0f1729,#0a0c16)',border:`1px solid ${C.border}`,borderRadius:'24px',padding:'36px',width:'100%',maxWidth:'480px',position:'relative'}}>
      <button onClick={onClose} style={{position:'absolute',top:'16px',right:'16px',color:C.textMuted,fontSize:'22px',background:'none',border:'none',cursor:'pointer'}}>×</button>
      <div style={{textAlign:'center',marginBottom:'24px'}}><h2 style={{fontSize:'20px',color:C.purpleLight,fontWeight:'700',marginBottom:'6px'}}>Top up your credits</h2><p style={{fontSize:'13px',color:C.textBody}}>You have <strong style={{color:C.purpleLight}}>{profile?.credits||0} credits</strong> remaining</p></div>
      {(!profile||profile.plan==='free')&&(<div style={{padding:'20px',borderRadius:'14px',background:'rgba(123,79,224,0.08)',border:`1px solid ${C.border}`,marginBottom:'20px'}}><div style={{fontSize:'15px',color:C.purpleLight,fontWeight:'700',marginBottom:'5px'}}>💎 The smart choice — Go Pro</div><div style={{fontSize:'13px',color:C.textBody,marginBottom:'14px',lineHeight:1.6}}>100 credits a month for £14.99. Daily sessions for less than one coffee a week.</div><a href="/pricing" onClick={onClose} style={{display:'block',padding:'12px',borderRadius:'10px',background:C.grad,color:'#fff',fontSize:'14px',fontWeight:'700',textDecoration:'none',textAlign:'center'}}>Upgrade to Pro →</a></div>)}
      <div style={{fontSize:'11px',letterSpacing:'0.12em',color:C.textMuted,marginBottom:'12px',fontWeight:'600'}}>OR BUY CREDITS</div>
      <div style={{display:'grid',gap:'10px'}}>{[{key:'credits_10',label:'10 Credits',price:'£5',per:'50p each'},{key:'credits_50',label:'50 Credits',price:'£15',per:'30p each'},{key:'credits_100',label:'100 Credits',price:'£25',per:'25p each — best value'}].map(c=>(<button key={c.key} onClick={()=>co(c.key)} disabled={loading===c.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',borderRadius:'12px',border:`1px solid ${C.border}`,background:C.bgCard,cursor:'pointer',width:'100%',fontFamily:'inherit'}}><div style={{textAlign:'left'}}><div style={{fontSize:'14px',color:C.textH,fontWeight:'700'}}>{c.label}</div><div style={{fontSize:'12px',color:C.textMuted}}>{c.per}</div></div><div style={{fontSize:'18px',color:C.purpleLight,fontWeight:'800'}}>{loading===c.key?'...':c.price}</div></button>))}</div>
    </div>
  </div>)
}
function QuizModal({onClose,onSelect}){
  const[qi,setQi]=useState(0);const[ans,setAns]=useState([]);const[res,setRes]=useState(null);const[picked,setPicked]=useState(null)
  function ha(opt){setPicked(opt.label);setTimeout(()=>{const nxt=[...ans,...opt.tags];if(qi<QUIZ_QUESTIONS.length-1){setAns(nxt);setQi(qi+1);setPicked(null)}else{const sc={};nxt.forEach(t=>{sc[t]=(sc[t]||0)+1});setRes(Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t])=>t))}},280)}
  const q=QUIZ_QUESTIONS[qi];const prog=(qi/QUIZ_QUESTIONS.length)*100
  return(<div style={{position:'fixed',inset:0,background:'rgba(10,12,22,0.94)',zIndex:150,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(10px)'}}>
    <div style={{background:'linear-gradient(145deg,#0f1729,#0a0c16)',border:`1px solid ${C.border}`,borderRadius:'24px',padding:'32px',width:'100%',maxWidth:'480px',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
      <button onClick={onClose} style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',color:C.textMuted,fontSize:'22px',cursor:'pointer'}}>×</button>
      {!res?(<><div style={{marginBottom:'24px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}><span style={{fontSize:'11px',color:C.textMuted,letterSpacing:'0.1em'}}>QUESTION {qi+1} OF {QUIZ_QUESTIONS.length}</span><span style={{fontSize:'11px',color:C.purpleLight}}>{Math.round(prog)}%</span></div><div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'100px',overflow:'hidden'}}><div style={{height:'100%',width:`${prog}%`,background:C.grad,borderRadius:'100px',transition:'width 0.4s ease'}}/></div></div>
      <div style={{fontSize:'18px',color:C.textH,fontWeight:'700',marginBottom:'22px',lineHeight:1.45}}>{q.text}</div>
      <div style={{display:'grid',gap:'8px'}}>{q.options.map(opt=>(<button key={opt.label} onClick={()=>ha(opt)} style={{padding:'14px 16px',borderRadius:'12px',textAlign:'left',border:`1px solid ${picked===opt.label?C.purple+'cc':C.border}`,background:picked===opt.label?'rgba(123,79,224,0.18)':C.bgCard,color:picked===opt.label?C.purpleLight:C.textBody,fontSize:'14px',transition:'all 0.18s ease',cursor:'pointer',lineHeight:1.5}}>{opt.label}</button>))}</div>
      <button onClick={()=>onSelect('custom')} style={{width:'100%',marginTop:'10px',padding:'12px',borderRadius:'10px',border:`1px solid ${C.border}`,background:'transparent',color:C.textMuted,fontSize:'12px',cursor:'pointer'}}>I'd rather type my own goal →</button></>)
      :(<><div style={{textAlign:'center',marginBottom:'24px'}}><div style={{fontSize:'32px',marginBottom:'10px'}}>✦</div><div style={{fontSize:'18px',color:C.textH,fontWeight:'700',marginBottom:'8px'}}>Here's what your mind wants to rewire</div><div style={{fontSize:'13px',color:C.textBody}}>Based on your answers — pick one to start with.</div></div>
      <div style={{display:'grid',gap:'10px',marginBottom:'16px'}}>{res.map((tag,i)=>(<button key={tag} onClick={()=>onSelect(tag)} style={{padding:'16px 18px',borderRadius:'14px',textAlign:'left',border:`1px solid ${i===0?C.purple+'88':C.border}`,background:i===0?'rgba(123,79,224,0.12)':C.bgCard,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}><div>{i===0&&<div style={{fontSize:'10px',color:C.purpleLight,fontWeight:'700',letterSpacing:'0.1em',marginBottom:'4px'}}>BEST MATCH</div>}<div style={{fontSize:'15px',color:i===0?C.purpleLight:C.textH,fontWeight:'700'}}>{tag}</div></div><span style={{fontSize:'18px',color:i===0?C.purple:C.textMuted}}>→</span></button>))}</div>
      <button onClick={()=>onSelect('custom')} style={{width:'100%',padding:'12px',borderRadius:'10px',border:`1px solid ${C.border}`,background:'transparent',color:C.textMuted,fontSize:'12px',cursor:'pointer'}}>None of these — I'll type my own</button></>)}
    </div>
  </div>)
}
function FeedbackButton({userId}){
  const[open,setOpen]=useState(false);const[text,setText]=useState('');const[sent,setSent]=useState(false);const[loading,setLoading]=useState(false)
  async function sub(){if(!text.trim())return;setLoading(true);await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({feedback:text,userId})});setSent(true);setLoading(false);setTimeout(()=>{setOpen(false);setSent(false);setText('')},2000)}
  return(<><button onClick={()=>setOpen(true)} style={{fontSize:'11px',color:C.textMuted,background:'none',border:`1px solid ${C.border}`,padding:'6px 14px',borderRadius:'100px',cursor:'pointer'}}>💬 Share feedback</button>
  {open&&(<div style={{position:'fixed',inset:0,background:'rgba(10,12,22,0.88)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(8px)'}}>
    <div style={{background:'linear-gradient(145deg,#0f1729,#0a0c16)',border:`1px solid ${C.border}`,borderRadius:'20px',padding:'32px',width:'100%',maxWidth:'400px',position:'relative'}}>
      <button onClick={()=>setOpen(false)} style={{position:'absolute',top:'14px',right:'14px',background:'none',border:'none',color:C.textMuted,fontSize:'20px',cursor:'pointer'}}>×</button>
      {sent?(<div style={{textAlign:'center',padding:'20px 0'}}><div style={{fontSize:'32px',marginBottom:'12px'}}>✦</div><div style={{color:C.purpleLight,fontWeight:'700',fontSize:'16px'}}>Thank you!</div></div>):(<><div style={{fontSize:'16px',color:C.textH,fontWeight:'700',marginBottom:'6px'}}>Share your feedback</div><div style={{fontSize:'13px',color:C.textBody,marginBottom:'16px'}}>What could be better? What do you love? We read everything.</div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Your thoughts..." rows={4} style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:`1px solid ${C.border}`,background:C.bgCard,color:C.textH,fontSize:'13px',fontFamily:'inherit',outline:'none',resize:'vertical',marginBottom:'12px'}}/><button onClick={sub} disabled={loading||!text.trim()} style={{width:'100%',padding:'13px',borderRadius:'10px',background:text.trim()?C.grad:'rgba(255,255,255,0.05)',color:'#fff',fontSize:'14px',fontWeight:'700',border:'none',cursor:'pointer'}}>{loading?'Sending...':'Send Feedback →'}</button></>)}
    </div>
  </div>)}
  </>)
}


// ─── FOUNDER UPSELL MODAL ─────────────────────────────────────────────
function FounderModal({ user, onClose }) {
  const [loading, setLoading] = useState(false)

  async function goToCheckout() {
    setLoading(true)
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productKey: 'lifetime_founder', userId: user?.id, email: user?.email }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,22,0.94)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(12px)' }}>
      <div style={{ background: 'linear-gradient(145deg,#0f1729,#0a0c16)', border: `1px solid rgba(123,79,224,0.35)`, borderRadius: '24px', padding: '40px 36px', width: '100%', maxWidth: '480px', position: 'relative', boxShadow: '0 0 80px rgba(123,79,224,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: C.textMuted, fontSize: '22px', cursor: 'pointer' }}>×</button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(123,79,224,0.4)', background: 'rgba(123,79,224,0.12)', fontSize: '11px', fontWeight: '700', color: C.purpleLight, letterSpacing: '0.1em', marginBottom: '16px' }}>
            🔒 FOUNDER OFFER · FIRST 1,000 ONLY
          </div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '26px', fontWeight: '800', color: C.textH, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '10px' }}>
            Own RewireMode.<br />
            <span style={{ background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Forever. £99.</span>
          </h2>
          <p style={{ fontSize: '14px', color: C.textBody, lineHeight: 1.65 }}>
            One payment. No subscription. Every feature we ever build — included.
          </p>
        </div>

        {/* Benefits */}
        <div style={{ display: 'grid', gap: '10px', marginBottom: '28px' }}>
          {[
            { icon: '✦', text: '50 credits every month, forever', sub: "That's up to 50 sessions a month, every month" },
            { icon: '🧠', text: 'Every session type, always', sub: 'Reset, Sleep, Walking Hypnosis, Subliminals and anything we add' },
            { icon: '🚀', text: 'Every new feature included', sub: "We're just getting started. You get all of it." },
            { icon: '🔒', text: 'Locked in at £99. Permanently.', sub: 'Pro is £14.99/month. This pays for itself in 7 months.' },
          ].map(b => (
            <div key={b.icon} style={{ display: 'flex', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(123,79,224,0.06)', border: `1px solid ${C.border}`, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: '13px', color: C.textH, fontWeight: '700', marginBottom: '2px' }}>{b.text}</div>
                <div style={{ fontSize: '12px', color: C.textMuted, lineHeight: 1.5 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Urgency bar */}
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,159,67,0.08)', border: '1px solid rgba(255,159,67,0.25)', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#ff9f43', fontWeight: '700' }}>⚡ Limited to the first 1,000 founder members</div>
          <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '3px' }}>Once they're gone, this price is gone. We won't offer it again.</div>
        </div>

        {/* CTA */}
        <button onClick={goToCheckout} disabled={loading}
          style={{ width: '100%', padding: '17px', borderRadius: '14px', background: C.grad, color: '#fff', fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 4px 28px rgba(123,79,224,0.45)', letterSpacing: '-0.01em', marginBottom: '12px' }}>
          {loading ? 'Taking you to checkout...' : 'Claim Founder Lifetime — £99 →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '12px', color: C.textMuted, lineHeight: 1.6 }}>
          Secure checkout via Stripe · One-time payment · No hidden fees
        </p>
        <button onClick={onClose} style={{ display: 'block', width: '100%', marginTop: '10px', padding: '10px', fontSize: '12px', color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
          No thanks, I'll stay on the free plan
        </button>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────
export default function Home({ user, profile, refreshProfile }) {
  const isMobile = useIsMobile()
  const [view, setView] = useState('marketing') // 'marketing' | 'app'

  // App state
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState(null)
  const [product, setProduct] = useState(null)
  const [goal, setGoal] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [mood, setMood] = useState(5)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [script, setScript] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [looping, setLooping] = useState(false)
  const [timer, setTimer] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loadMsgIndex, setLoadMsgIndex] = useState(0)
  const [error, setError] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [saveLimitHit, setSaveLimitHit] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [showFounder, setShowFounder] = useState(false)
  const [streak, setStreak] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [musicVolume, setMusicVolume] = useState(0.18)
  const [navScrolled, setNavScrolled] = useState(false)
  const { safetyState, checkSafety, clearSafety } = useSafetyGate()

  const audioRef = useRef(null)
  const musicRef = useRef(null)
  const timerRef = useRef(null)
  const loadMsgRef = useRef(null)
  const progressRef = useRef(null)
  const wakeLockRef = useRef(null)
  const pendingGenerateRef = useRef(false)

  useEffect(() => { if (user) setView('app') }, [user])
  useEffect(() => { if (profile) setStreak(profile.streak_count || 0) }, [profile])
  useEffect(() => { if (product?.id) setMusicVolume(MUSIC[product.id]?.volume || 0.18) }, [product])
  useEffect(() => { if (musicRef.current) musicRef.current.volume = musicVolume }, [musicVolume])
  useEffect(() => {
    if (product?.id === 'subliminal') { setSelectedVoice(VOICES.hypnosis[0]); setLooping(true) }
    else setLooping(false)
  }, [product?.id])
  useEffect(() => { if (audioRef.current) audioRef.current.loop = looping }, [looping, audioUrl])
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current); clearInterval(progressRef.current); clearInterval(loadMsgRef.current)
      if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null }
    }
  }, [])

  function needsDisclaimer() { try { return !localStorage.getItem('rw_disclaimer_accepted') } catch { return false } }
  function acceptDisclaimer() {
    try { localStorage.setItem('rw_disclaimer_accepted', '1') } catch {}
    setShowDisclaimer(false)
    if (pendingGenerateRef.current) { pendingGenerateRef.current = false; startGenerate() }
  }

  const p = product || HYPNOSIS_TYPES[0]
  const isSubliminal = product?.id === 'subliminal'
  const isWalking = product?.id === 'walking'
  const activeGoal = goal === 'custom' ? customGoal : goal
  const currentMusic = product ? MUSIC[product.id] : null
  const loadMessages = LOAD_MESSAGES[product?.id] || LOAD_MESSAGES.reset
  const currentLoadMsg = loadMessages[loadMsgIndex] || loadMessages[0]
  const moodEmoji = mood<=2?'😔':mood<=4?'😕':mood<=6?'😐':mood<=8?'🙂':'😄'
  const moodLabel = mood<=2?'Really struggling':mood<=4?'Not great':mood<=6?'Getting there':mood<=8?'Pretty good':'Feeling amazing'

  function launchApp() { setView('app'); window.scrollTo(0, 0) }

  async function startGenerate() {
    if (!user) { setShowAuth(true); return }
    if (!profile || profile.credits < (product?.credits || 1)) { setShowCredits(true); return }
    if (needsDisclaimer()) { pendingGenerateRef.current = true; setShowDisclaimer(true); return }
    const isSafe = await checkSafety(activeGoal, user.id)
    if (!isSafe) return
    setStep(5); setProgress(0); setError(''); setAudioUrl(null); setLoadMsgIndex(0)
    setSaveLimitHit(false); setSavedOk(false)
    let prog = 0
    progressRef.current = setInterval(() => { prog += Math.random() * 1.2; if (prog < 88) setProgress(Math.min(prog, 88)) }, 400)
    let msgIdx = 0
    loadMsgRef.current = setInterval(() => { msgIdx = (msgIdx + 1) % loadMessages.length; setLoadMsgIndex(msgIdx) }, 3500)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const scriptRes = await fetch('/api/generate-script', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ goal: activeGoal, productType: product.id, mood, userId: user.id, firstName: firstName.trim() || null }) })
      const scriptData = await scriptRes.json()
      if (!scriptRes.ok) throw new Error(scriptData.error || 'Script generation failed')
      setScript(scriptData.script)
      const audioRes = await fetch('/api/generate-audio', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text: scriptData.script, voiceId: selectedVoice.id, productType: product.id, userId: user.id }) })
      if (!audioRes.ok) throw new Error('Audio generation failed')
      const audioData = await audioRes.json()
      if (audioData.error) throw new Error(audioData.error)
      const url = audioData.audioUrl
      setAudioUrl(url)
      const saveRes = await fetch('/api/save-session', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId: user.id, goal: activeGoal, productType: product.id, script: scriptData.script, audioUrl: url, voiceId: selectedVoice.id, mood, creditCost: scriptData.cost }) })
      const saveData = await saveRes.json()
      if (saveRes.status === 403) setSaveLimitHit(true)
      else if (saveRes.ok) { setSavedOk(true); if (saveData.streak) setStreak(saveData.streak) }
      clearInterval(progressRef.current); clearInterval(loadMsgRef.current)
      setProgress(100); refreshProfile()
      setTimeout(() => {
        setStep(6)
        // Always show to free users every time they generate
        if (!profile || profile.plan === 'free') setTimeout(() => setShowFounder(true), 1800)
      }, 400)
    } catch (err) {
      clearInterval(progressRef.current); clearInterval(loadMsgRef.current)
      setError(friendlyError(err.message)); setStep(6)
    }
  }

  async function togglePlay() {
    if (!audioRef.current) return
    if (!playing) {
      audioRef.current.volume = isSubliminal ? 0.02 : 1.0
      audioRef.current.loop = looping
      audioRef.current.play()
      if (musicRef.current) { musicRef.current.volume = musicVolume; musicRef.current.loop = true; musicRef.current.play().catch(() => {}) }
      setPlaying(true)
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
      try { if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen') } catch (e) {}
    } else {
      audioRef.current.pause()
      if (musicRef.current) musicRef.current.pause()
      setPlaying(false); clearInterval(timerRef.current)
      if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null }
    }
  }

  function replaySession() {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    if (musicRef.current) musicRef.current.currentTime = 0
    if (!playing) togglePlay()
  }

  function handleAudioEnd() {
    if (looping) return
    if (musicRef.current) {
      let vol = musicRef.current.volume
      const fade = setInterval(() => { vol = Math.max(0, vol - 0.02); if (musicRef.current) musicRef.current.volume = vol; if (vol <= 0) { clearInterval(fade); if (musicRef.current) musicRef.current.pause() } }, 150)
    }
    setPlaying(false); clearInterval(timerRef.current)
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null }
  }

  function resetApp() {
    clearInterval(timerRef.current); clearInterval(progressRef.current); clearInterval(loadMsgRef.current)
    if (audioRef.current) audioRef.current.pause()
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0 }
    if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null }
    setStep(0); setCategory(null); setProduct(null); setGoal(''); setCustomGoal(''); setScript(''); setFirstName('')
    setPlaying(false); setLooping(false); setTimer(0); setProgress(0); setMood(5)
    setSelectedVoice(null); setAudioUrl(null); setError(''); setLoadMsgIndex(0)
    setSaveLimitHit(false); setSavedOk(false)
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── MARKETING VIEW ────────────────────────────────────────────────
  if (view === 'marketing') return (
    <>
      <Head>
        <title>RewireMode — Personalised Hypnosis & Subliminal Audio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Personalised hypnosis and subliminal audio designed to support focus, relaxation, and positive mental patterns through repetition." />
      </Head>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.textBody, fontFamily: "'DM Sans',system-ui,sans-serif", overflowX: 'hidden' }}>
        <style>{GS}</style>
        {/* Grid bg */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(123,79,224,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(123,79,224,0.04) 1px,transparent 1px)`, backgroundSize: '72px 72px', WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 0%,black 30%,transparent 80%)', maskImage: 'radial-gradient(ellipse 90% 80% at 50% 0%,black 30%,transparent 80%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* NAV */}
        <nav style={{ position: 'fixed', inset: '0 0 auto', zIndex: 200, height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: `1px solid ${navScrolled ? 'rgba(123,79,224,0.22)' : C.border}`, background: 'rgba(13,15,26,0.82)', backdropFilter: 'blur(18px)', transition: 'border-color 0.3s' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src={LOGO} alt="RewireMode" style={{ height: '48px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => e.target.style.display = 'none'} />
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '18px', fontWeight: '700', letterSpacing: '-0.025em', color: C.textH }}>Rewire<span style={{ color: C.cyanLight }}>Mode</span></span>
          </a>
          <div className="hide-mob" style={{ display: 'flex', gap: '28px' }}>
            {[['#how', 'How it works'], ['#why', 'Why RewireMode'], ['#science', 'The science'], ['/faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '14px', color: C.textMuted, textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {user ? (
              <>
                <button onClick={() => window.location.href = '/dashboard'} style={{ fontSize: '13px', color: C.textBody, padding: '8px 16px', borderRadius: '100px', border: `1px solid ${C.border}` }}>Dashboard</button>
                <button onClick={launchApp} style={{ fontSize: '13px', fontWeight: '600', padding: '9px 20px', borderRadius: '100px', background: C.grad, color: '#fff', boxShadow: '0 4px 20px rgba(123,79,224,0.3)' }}>Create session</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuth(true)} style={{ fontSize: '13px', color: C.textBody, padding: '8px 16px', borderRadius: '100px', border: `1px solid ${C.border}` }}>Sign in</button>
                <button onClick={() => setShowAuth(true)} style={{ fontSize: '13px', fontWeight: '600', padding: '9px 20px', borderRadius: '100px', background: C.grad, color: '#fff', boxShadow: '0 4px 20px rgba(123,79,224,0.3)' }}>Start free</button>
              </>
            )}
          </div>
        </nav>

        {/* HERO */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '130px 36px 90px', overflow: 'hidden', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '700px', background: 'radial-gradient(ellipse at 50% 0%,rgba(123,79,224,0.13) 0%,rgba(41,186,239,0.05) 45%,transparent 70%)', pointerEvents: 'none' }} />
          {[{ w: 280, h: 280, top: '12%', left: '5%', bg: 'rgba(123,79,224,0.09)', del: '0s', dur: '12s' }, { w: 200, h: 200, top: '28%', right: '7%', bg: 'rgba(41,186,239,0.09)', del: '-4s', dur: '9s' }, { w: 140, h: 140, bottom: '18%', left: '14%', bg: 'rgba(123,79,224,0.07)', del: '-7s', dur: '10s' }].map((o, i) => (
            <div key={i} style={{ position: 'absolute', width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom, borderRadius: '50%', background: `radial-gradient(circle,${o.bg},transparent 70%)`, animation: `orbFloat ${o.dur} ease-in-out infinite`, animationDelay: o.del, pointerEvents: 'none' }} />
          ))}
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 18px', borderRadius: '100px', border: '1px solid rgba(123,79,224,0.28)', background: 'rgba(123,79,224,0.08)', fontSize: '12px', fontWeight: '500', color: C.purpleLight, letterSpacing: '0.04em', marginBottom: '30px', animation: 'fadeUp 0.7s ease both' }}>
            Built by a qualified hypnotherapist
          </div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(42px,6.5vw,76px)', fontWeight: '800', lineHeight: '1.02', letterSpacing: '-0.045em', color: C.textH, maxWidth: '800px', margin: '0 auto 22px', animation: 'fadeUp 0.7s ease 0.08s both' }}>
            Rewire your mind.<br />
            <span style={{ background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>One session at a time.</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,18px)', color: C.textBody, maxWidth: '520px', margin: '0 auto 10px', fontWeight: '300', lineHeight: 1.7, animation: 'fadeUp 0.7s ease 0.16s both' }}>
            Personalised hypnosis and subliminal audio designed to support focus, relaxation, and positive mental patterns through repetition.
          </p>
          <p style={{ fontSize: '15px', color: C.textMuted, maxWidth: '460px', margin: '0 auto 40px', lineHeight: 1.7, animation: 'fadeUp 0.7s ease 0.22s both' }}>
            Create sessions tailored to your goals, your words, and your pace.
          </p>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.7s ease 0.28s both', marginBottom: '48px' }}>
            <button onClick={user ? launchApp : () => setShowAuth(true)}
              style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: '600', fontSize: '16px', borderRadius: '100px', padding: '14px 34px', background: C.grad, color: '#fff', border: 'none', boxShadow: '0 4px 24px rgba(123,79,224,0.38)', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(123,79,224,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(123,79,224,0.38)' }}>
              Create your first session
            </button>
            <a href="#how" style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: '500', fontSize: '15px', borderRadius: '100px', padding: '13px 28px', background: 'transparent', color: C.textBody, border: `1px solid ${C.border}`, textDecoration: 'none' }}>See how it works</a>
          </div>
          {/* Proof strip */}
          <div className="proof-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1px', background: C.border, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden', maxWidth: '640px', width: '100%', animation: 'fadeUp 0.7s ease 0.36s both' }}>
            {[{ val: '90s', lbl: 'Average generation time' }, { val: '4+', lbl: 'Clinical voice models' }, { val: '100%', lbl: 'Unique per session' }, { val: 'Free', lbl: 'To start — no card needed' }].map(({ val, lbl }) => (
              <div key={lbl} style={{ background: C.bg, padding: '18px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '22px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '3px', background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{val}</div>
                <div style={{ fontSize: '11px', color: C.textMuted, lineHeight: 1.4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ padding: '108px 0', borderTop: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 36px' }}>
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
              <div>
                <span className="reveal" style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.purpleLight, marginBottom: '14px' }}>How it works</span>
                <h2 className="reveal d1" style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(28px,3.8vw,44px)', fontWeight: '800', letterSpacing: '-0.035em', color: C.textH, lineHeight: 1.08, marginBottom: '16px' }}>You choose how you listen</h2>
                <p className="reveal d2" style={{ fontSize: '16px', color: C.textBody, lineHeight: 1.7, maxWidth: '500px', fontWeight: '300', marginBottom: '36px' }}>RewireMode combines guided hypnosis, repeated suggestion, and optional subliminal layering to help reinforce the mental patterns you want to build.</p>
                {[{ icon: '🧠', title: 'Hypnosis', desc: 'Guided sessions designed to help you enter a state of focused attention, with personalised suggestion woven throughout.', delay: 'd1' }, { icon: '🌊', title: 'Subliminal', desc: 'Background affirmations designed to gently reinforce your intentions — beneath music, below conscious awareness.', delay: 'd2' }, { icon: '🔀', title: 'Combined mode', desc: 'Layered listening for both conscious and background input. Engage actively while subliminal reinforcement runs in parallel.', delay: 'd3' }].map(m => (
                  <div key={m.title} className={`reveal ${m.delay}`} style={{ display: 'flex', gap: '16px', padding: '22px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', marginBottom: '14px', transition: 'all 0.25s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.bgCardHover; e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.transform = 'translateX(4px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.bgCard; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = '' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, background: C.purpleDim, border: `1px solid ${C.border}` }}>{m.icon}</div>
                    <div><div style={{ fontFamily: "'Sora',sans-serif", fontSize: '15px', fontWeight: '600', color: C.textH, marginBottom: '5px' }}>{m.title}</div><div style={{ fontSize: '13px', color: C.textBody, lineHeight: 1.6 }}>{m.desc}</div></div>
                  </div>
                ))}
              </div>
              {/* Steps card */}
              <div className="reveal d2">
                <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '36px', boxShadow: '0 40px 80px rgba(0,0,0,0.45)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,79,224,0.1),transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '4px' }}>From intention to audio</div>
                  <div style={{ fontSize: '13px', color: C.textMuted, marginBottom: '24px' }}>Three steps. Under 90 seconds.</div>
                  {[{ n: '01', title: 'Choose your goal', desc: 'Pick a focus area or describe exactly what you want to work on. Select your session type and voice.' }, { n: '02', title: 'Generate your session', desc: 'Your script is written in real time and voiced by a clinical voice model. Nothing is pre-recorded or templated.' }, { n: '03', title: 'Listen and rewire', desc: 'Play with ambient music. Save to your library. Repeat. Consistency is what creates change.' }].map((s, i) => (
                    <div key={s.n} style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', padding: '20px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: C.purpleDim, border: '1px solid rgba(123,79,224,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora',sans-serif", fontSize: '15px', fontWeight: '700', color: C.purpleLight, flexShrink: 0 }}>{s.n}</div>
                      <div><div style={{ fontFamily: "'Sora',sans-serif", fontSize: '15px', fontWeight: '600', color: C.textH, marginBottom: '4px' }}>{s.title}</div><div style={{ fontSize: '13px', color: C.textBody, lineHeight: 1.6 }}>{s.desc}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY REWIREMODE */}
        <section id="why" style={{ padding: '108px 0', background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 36px' }}>
            <div className="reveal" style={{ maxWidth: '620px', marginBottom: '56px' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.purpleLight, marginBottom: '14px' }}>Why RewireMode</span>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(28px,3.8vw,44px)', fontWeight: '800', letterSpacing: '-0.035em', color: C.textH, lineHeight: 1.08, marginBottom: '16px' }}>Not all mental input is equal.</h2>
              <p style={{ fontSize: '16px', color: C.textBody, lineHeight: 1.7, fontWeight: '300' }}>Your brain responds more strongly to what feels personal, repeated, and focused. RewireMode is built around those principles.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px', marginBottom: '52px' }}>
              {[{ icon: '🎯', title: 'Personalised suggestions', desc: "Generic affirmations don't work. Sessions are written for your specific goal, in your exact words, calibrated to your current mood.", delay: '' }, { icon: '🔁', title: 'Repetition by design', desc: 'Repetition is how the brain forms new patterns. RewireMode is built for daily use, not one-off sessions.', delay: 'd1' }, { icon: '🎛', title: 'Flexible listening modes', desc: 'Active hypnosis, background subliminals, or both combined. Fits your routine, not the other way around.', delay: 'd2' }, { icon: '📅', title: 'Designed for consistency', desc: 'A library of your own sessions, built over time. The longer you use it, the more effective it becomes.', delay: 'd3' }].map(w => (
                <div key={w.title} className={`reveal ${w.delay}`} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '30px 26px', position: 'relative', overflow: 'hidden', transition: 'all 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.bgCardHover; e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.querySelector('.tb').style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.bgCard; e.currentTarget.style.borderColor = C.border; e.currentTarget.querySelector('.tb').style.opacity = '0' }}>
                  <div className="tb" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: C.grad, opacity: 0, transition: 'opacity 0.3s', borderRadius: '16px 16px 0 0' }} />
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.purpleDim, border: '1px solid rgba(123,79,224,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '18px' }}>{w.icon}</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '16px', fontWeight: '600', color: C.textH, marginBottom: '8px', letterSpacing: '-0.01em' }}>{w.title}</div>
                  <div style={{ fontSize: '13px', color: C.textBody, lineHeight: 1.65 }}>{w.desc}</div>
                </div>
              ))}
            </div>
            <div className="reveal" style={{ padding: '28px 32px', background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.purple}`, borderRadius: '16px', maxWidth: '580px' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '17px', color: C.textH, fontWeight: '500', lineHeight: 1.5, marginBottom: '8px' }}>"Not magic. Not mind control.<br />Just your brain doing what it's designed to do."</div>
              <div style={{ fontSize: '13px', color: C.textMuted }}>— RewireMode</div>
            </div>
          </div>
        </section>

        {/* SCIENCE */}
        <section id="science" style={{ padding: '108px 0', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 36px' }}>
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
              <div>
                <span className="reveal" style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.purpleLight, marginBottom: '14px' }}>The science, simply explained</span>
                <h2 className="reveal d1" style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(28px,3.8vw,44px)', fontWeight: '800', letterSpacing: '-0.035em', color: C.textH, lineHeight: 1.08, marginBottom: '16px' }}>Your brain is constantly adapting.</h2>
                <p className="reveal d2" style={{ fontSize: '16px', color: C.textBody, lineHeight: 1.7, fontWeight: '300', marginBottom: '32px' }}>This is known as neuroplasticity. RewireMode is designed around the principles that research shows can support this process.</p>
                {[{ icon: '🔬', title: 'Focused attention and suggestion', desc: 'Hypnosis is a state of focused attention where the brain becomes more responsive to suggestion. Brain imaging research shows changes in attention networks during hypnosis.', delay: 'd1' }, { icon: '🔁', title: 'Neuroplasticity and repetition', desc: 'Consistent exposure to the same thoughts or patterns can reinforce them over time. Repetition is a key mechanism in learning, habit formation, and behavioural change.', delay: 'd2' }, { icon: '🎯', title: 'Personal relevance', desc: 'The brain responds more strongly to information that feels personally meaningful. Personalised content is more likely to be processed deeply.', delay: 'd3' }, { icon: '🌊', title: 'Subliminal processing', desc: 'Research suggests the brain can process some information outside conscious awareness. Subliminal cues may influence thoughts and behaviour when they align with existing goals.', delay: 'd4' }].map(s => (
                  <div key={s.title} className={`reveal ${s.delay}`} style={{ display: 'flex', gap: '16px', padding: '22px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', marginBottom: '14px', transition: 'all 0.25s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.bgCardHover; e.currentTarget.style.borderColor = C.borderHover }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.bgCard; e.currentTarget.style.borderColor = C.border }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: C.purpleDim, border: '1px solid rgba(123,79,224,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>{s.icon}</div>
                    <div><div style={{ fontFamily: "'Sora',sans-serif", fontSize: '14px', fontWeight: '600', color: C.textH, marginBottom: '5px' }}>{s.title}</div><div style={{ fontSize: '13px', color: C.textBody, lineHeight: 1.65 }}>{s.desc}</div></div>
                  </div>
                ))}
              </div>
              {/* Orbit diagram */}
              <div className="reveal d2">
                <div style={{ position: 'relative', height: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[{ w: 340, h: 340, border: 'rgba(123,79,224,0.15)', dur: '24s', dir: 'normal' }, { w: 240, h: 240, border: 'rgba(74,143,232,0.18)', dur: '16s', dir: 'reverse' }, { w: 150, h: 150, border: 'rgba(41,186,239,0.22)', dur: '10s', dir: 'normal' }].map((r, i) => (
                    <div key={i} style={{ position: 'absolute', width: r.w, height: r.h, borderRadius: '50%', border: `1px solid ${r.border}`, animation: `orbitSpin ${r.dur} linear infinite`, animationDirection: r.dir }} />
                  ))}
                  <div style={{ position: 'relative', zIndex: 2, width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%,rgba(123,79,224,0.5),rgba(41,186,239,0.2))', border: '1px solid rgba(123,79,224,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', animation: 'coreGlow 3.5s ease-in-out infinite' }}>🧠</div>
                  {[{ top: '40px', left: 'calc(50% + 140px)', bg: C.purple }, { top: 'calc(50% + 130px)', left: '60px', bg: C.cyan }, { bottom: '50px', left: 'calc(50% + 100px)', bg: C.purpleLight }, { top: 'calc(50% - 120px)', right: '55px', bg: C.cyan }].map((n, i) => (
                    <div key={i} style={{ position: 'absolute', width: '10px', height: '10px', borderRadius: '50%', background: n.bg, boxShadow: `0 0 12px ${n.bg}`, top: n.top, left: n.left, bottom: n.bottom, right: n.right, animation: 'nodePulse 2.8s ease-in-out infinite', animationDelay: `${i * 0.7}s` }} />
                  ))}
                  {[{ label: 'Theta state', pos: { top: '14px', left: '50%', transform: 'translateX(-50%)' } }, { label: 'Subconscious', pos: { bottom: '14px', left: '50%', transform: 'translateX(-50%)' } }, { label: 'Suggestion', pos: { left: '8px', top: '50%', transform: 'translateY(-50%)' } }, { label: 'Rewire', pos: { right: '8px', top: '50%', transform: 'translateY(-50%)' } }].map(l => (
                    <div key={l.label} style={{ position: 'absolute', background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '100px', padding: '6px 16px', fontSize: '11px', fontWeight: '600', color: C.purpleLight, whiteSpace: 'nowrap', letterSpacing: '0.04em', ...l.pos }}>{l.label}</div>
                  ))}
                </div>
                <div className="reveal d3" style={{ padding: '22px 24px', background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '16px', marginTop: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '12px' }}>A balanced approach</div>
                  <div style={{ fontSize: '13px', color: C.textBody, lineHeight: 1.7 }}>RewireMode brings together <strong style={{ color: C.textH }}>focused attention</strong>, <strong style={{ color: C.textH }}>repetition</strong>, and <strong style={{ color: C.textH }}>personal relevance</strong> to support gradual, consistent change.</div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: C.textMuted, fontStyle: 'italic' }}>Your brain is always adapting. RewireMode is designed to help you guide that process.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DISCLAIMER STRIP */}
        <div style={{ padding: '32px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.bgAlt }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '760px', margin: '0 auto', padding: '0 36px' }}>
            <span style={{ fontSize: '20px', opacity: 0.6 }}>ℹ️</span>
            <p style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.6, fontStyle: 'italic' }}>
              <strong style={{ color: C.textBody, fontStyle: 'normal' }}>RewireMode is a wellbeing tool, not a medical treatment.</strong> It is not a substitute for professional mental health care. If you have a medical or psychological condition, please consult a professional before use. Do not use hypnosis sessions while driving or operating machinery.
            </p>
          </div>
        </div>

        {/* FINAL CTA */}
        <section style={{ padding: '130px 0 110px', textAlign: 'center', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '900px', height: '500px', background: 'radial-gradient(ellipse,rgba(123,79,224,0.09),transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto', padding: '0 36px' }}>
            <h2 className="reveal" style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(32px,5vw,58px)', fontWeight: '800', letterSpacing: '-0.04em', color: C.textH, maxWidth: '660px', margin: '0 auto 18px', lineHeight: 1.06 }}>
              Your brain is already{' '}
              <span style={{ background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>adapting.</span>
            </h2>
            <p className="reveal d1" style={{ fontSize: '17px', color: C.textBody, maxWidth: '400px', margin: '0 auto 46px', fontWeight: '300', lineHeight: 1.65 }}>What are you going to tell it?</p>
            <button className="reveal d2" onClick={user ? launchApp : () => setShowAuth(true)}
              style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: '600', fontSize: '17px', borderRadius: '100px', padding: '17px 46px', background: C.grad, color: '#fff', border: 'none', boxShadow: '0 4px 28px rgba(123,79,224,0.4)', transition: 'all 0.25s ease', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(123,79,224,0.55)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 28px rgba(123,79,224,0.4)' }}>
              Create your first session
            </button>
            <div className="reveal d3" style={{ marginTop: '18px', fontSize: '12px', color: C.textMuted, letterSpacing: '0.02em' }}>5 free credits · No card required · Cancel anytime</div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${C.border}`, padding: '36px 0' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <img src={LOGO} alt="RewireMode" style={{ height: '26px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => e.target.style.display = 'none'} />
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '15px', fontWeight: '700', color: C.textBody, letterSpacing: '-0.02em' }}>RewireMode</span>
            </div>
            <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap' }}>
              {[['FAQ', '/faq'], ['Pricing', '/pricing'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Contact', '/contact']].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: '13px', color: C.textMuted, textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: C.textMuted }}>Built by a qualified hypnotherapist · © 2025 RewireMode</div>
          </div>
        </footer>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setView('app') }} />}
      <script dangerouslySetInnerHTML={{ __html: `(function(){var e=document.querySelectorAll('.reveal');var o=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{threshold:0.1,rootMargin:'0px 0px -36px 0px'});e.forEach(function(el){o.observe(el)})})();` }} />
    </>
  )

  // ── APP VIEW ──────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>RewireMode — Create Your Session</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.textH, fontFamily: "'DM Sans',system-ui,sans-serif", overflowX: 'hidden' }}>
        <style>{GS}</style>
        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd} loop={looping} />}
        {currentMusic && <audio ref={musicRef} src={currentMusic.url} loop preload="auto" />}

        {/* BG */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,79,224,0.08) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'orbFloat 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(41,186,239,0.06) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'orbFloat 10s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(123,79,224,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(123,79,224,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* NAV */}
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(10px)', background: 'rgba(13,15,26,0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '8px 14px 0' : '8px 20px 0', flexWrap: 'wrap', gap: '6px' }}>
            <button onClick={() => { resetApp(); setView('marketing') }} style={{ fontSize: '12px', color: C.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${C.border}` }}>← Home</button>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {profile && (
                <>
                  {streak > 0 && !isMobile && <div style={{ fontSize: '12px', color: C.textMuted }}>🔥 {streak} day{streak !== 1 ? 's' : ''}</div>}
                  <div onClick={() => setShowCredits(true)} style={{ fontSize: '12px', color: C.purpleLight, fontWeight: '600', padding: '5px 10px', borderRadius: '100px', border: '1px solid rgba(123,79,224,0.25)', background: 'rgba(123,79,224,0.06)', cursor: 'pointer' }}>✦ {profile.credits}</div>
                  <button onClick={() => window.location.href = '/dashboard'} style={{ fontSize: '11px', color: C.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${C.border}` }}>{isMobile ? '⚙' : 'Dashboard'}</button>
                </>
              )}
              <a href="/faq" style={{ fontSize: '11px', color: C.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, textDecoration: 'none' }}>FAQ</a>
              {!user && <button onClick={() => setShowAuth(true)} style={{ fontSize: '12px', color: C.purpleLight, padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(123,79,224,0.3)', background: 'rgba(123,79,224,0.06)', fontWeight: '600' }}>Sign In</button>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 24px 12px' }}>
            <img src={LOGO} alt="RewireMode" style={{ height: isMobile ? '70px' : '110px', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => e.target.style.display = 'none'} />
          </div>
        </nav>

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: isMobile ? '24px 14px 60px' : '44px 20px 80px', position: 'relative', zIndex: 1 }}>
          {step > 0 && step < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: step >= i ? '24px' : '8px', height: '8px', borderRadius: '100px', background: step >= i ? p.grad : C.border, transition: 'all 0.3s ease', boxShadow: step >= i ? `0 0 8px ${p.color}66` : 'none' }} />
              ))}
            </div>
          )}

          {/* STEP 0 */}
          {step === 0 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(26px,5vw,40px)', fontWeight: '800', letterSpacing: '-0.03em', color: C.textH, marginBottom: '12px', lineHeight: 1.1 }}>
                  Rewire your mind.<br />
                  <span style={{ background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>One session at a time.</span>
                </h1>
                <p style={{ fontSize: '15px', color: C.textBody, maxWidth: '420px', margin: '0 auto' }}>Personalised hypnosis and subliminal audio, generated in real time for you.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '12px 16px', borderRadius: '12px', background: C.bgCard, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '16px' }}>👤</span>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name (optional — we'll weave it into your script)" style={{ flex: 1, background: 'none', border: 'none', color: C.textH, fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: C.textMuted, marginBottom: '12px', fontWeight: '700' }}>WHAT ARE YOU READY TO REWRITE?</div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                {GOALS.map(g => (
                  <button key={g} onClick={() => setGoal(g)} style={{ padding: '11px 8px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: `1px solid ${goal === g ? C.purple : 'rgba(255,255,255,0.1)'}`, background: goal === g ? 'rgba(123,79,224,0.2)' : 'rgba(255,255,255,0.03)', color: goal === g ? C.purpleLight : C.textBody, transition: 'all 0.18s ease', boxShadow: goal === g ? '0 0 20px rgba(123,79,224,0.25)' : 'none' }}>{g}</button>
                ))}
              </div>
              <button onClick={() => setGoal('custom')} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', textAlign: 'left', border: `1px solid ${goal === 'custom' ? C.purple + 'cc' : C.border}`, background: goal === 'custom' ? 'rgba(123,79,224,0.08)' : C.bgCard, color: goal === 'custom' ? C.purpleLight : C.textMuted, fontSize: '13px', marginBottom: '8px' }}>✍️ What do you want to rewire?</button>
              {goal === 'custom' && (
                <textarea autoFocus value={customGoal} onChange={e => setCustomGoal(e.target.value)} placeholder="e.g. stop self-sabotaging, feel calm under pressure, believe I'm enough..." style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(123,79,224,0.25)', background: 'rgba(123,79,224,0.04)', color: C.textH, fontSize: '14px', lineHeight: '1.65', resize: 'vertical', minHeight: '80px', marginBottom: '8px' }} />
              )}
              <button onClick={() => setShowQuiz(true)} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', textAlign: 'left', border: '1px solid rgba(123,79,224,0.2)', background: 'rgba(123,79,224,0.04)', color: `${C.purpleLight}bb`, fontSize: '13px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🔍 Not sure? Find out what to rewire</span>
                <span style={{ fontSize: '11px', color: C.textMuted }}>5 quick questions →</span>
              </button>
              <div style={{ fontSize: '13px', color: C.textH, fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>Choose how you want to rewire your mind today</div>
              {!category && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <button onClick={() => setCategory('hypnosis')} style={{ padding: '24px 16px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(123,79,224,0.3)', background: 'rgba(123,79,224,0.08)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧠</div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '16px', color: C.purpleLight, fontWeight: '800', marginBottom: '6px' }}>Hypnosis</div>
                    <div style={{ fontSize: '12px', color: C.textBody, lineHeight: 1.55 }}>You listen actively. A guided voice leads your mind into theta state.</div>
                  </button>
                  <button onClick={() => { setCategory('subliminal'); setProduct(SUBLIMINAL_PRODUCT) }} style={{ padding: '24px 16px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(41,186,239,0.3)', background: 'rgba(41,186,239,0.06)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌊</div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '16px', color: C.cyanLight, fontWeight: '800', marginBottom: '6px' }}>Subliminals</div>
                    <div style={{ fontSize: '12px', color: C.textBody, lineHeight: 1.55 }}>Play in the background. Suggestions layered under music below conscious hearing.</div>
                  </button>
                </div>
              )}
              {category === 'hypnosis' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <button onClick={() => { setCategory(null); setProduct(null) }} style={{ fontSize: '12px', color: C.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${C.border}` }}>← Back</button>
                    <div style={{ fontSize: '12px', color: C.textMuted, fontWeight: '600', letterSpacing: '0.08em' }}>CHOOSE YOUR SESSION</div>
                  </div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {HYPNOSIS_TYPES.map(pr => (
                      <button key={pr.id} onClick={() => setProduct(pr)} style={{ padding: '18px 20px', borderRadius: '16px', textAlign: 'left', border: `1px solid ${product?.id === pr.id ? pr.color + 'cc' : C.border}`, background: product?.id === pr.id ? pr.color + '12' : C.bgCard, transition: 'all 0.2s ease', boxShadow: product?.id === pr.id ? `0 0 28px ${pr.glow}` : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '28px', flexShrink: 0 }}>{pr.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '15px', color: product?.id === pr.id ? pr.color : C.textH, fontWeight: '700', marginBottom: '4px' }}>{pr.label}</div>
                          <div style={{ fontSize: '12px', color: C.textBody, lineHeight: 1.5, marginBottom: '8px' }}>{pr.desc}</div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: C.textMuted }}>{pr.duration}</span>
                            <span style={{ fontSize: '11px', color: pr.color, background: pr.color + '18', padding: '2px 8px', borderRadius: '100px', fontWeight: '600' }}>✦ {pr.credits}</span>
                          </div>
                        </div>
                        {product?.id === pr.id && <div style={{ fontSize: '18px', color: pr.color, flexShrink: 0 }}>✓</div>}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {category === 'subliminal' && (
                <div style={{ padding: '16px 20px', borderRadius: '14px', border: `1px solid ${SUBLIMINAL_PRODUCT.color}cc`, background: SUBLIMINAL_PRODUCT.color + '12', display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px' }}>{SUBLIMINAL_PRODUCT.emoji}</div>
                    <div>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '14px', color: SUBLIMINAL_PRODUCT.color, fontWeight: '700' }}>{SUBLIMINAL_PRODUCT.label}</div>
                      <div style={{ fontSize: '11px', color: C.textMuted }}>{SUBLIMINAL_PRODUCT.duration} · ✦ {SUBLIMINAL_PRODUCT.credits} credits</div>
                    </div>
                  </div>
                  <button onClick={() => { setCategory(null); setProduct(null) }} style={{ fontSize: '11px', color: C.textMuted, padding: '5px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, flexShrink: 0 }}>Change</button>
                </div>
              )}
              <button onClick={() => activeGoal.trim() && product && setStep(1)} disabled={!activeGoal.trim() || !product} style={{ width: '100%', padding: '18px', borderRadius: '14px', background: activeGoal.trim() && product ? p.grad : 'rgba(255,255,255,0.06)', color: activeGoal.trim() && product ? '#fff' : C.textMuted, fontSize: '16px', fontWeight: '800', transition: 'all 0.25s ease', marginTop: '24px', marginBottom: '20px', letterSpacing: '0.02em', boxShadow: activeGoal.trim() && product ? `0 6px 32px ${p.glow}` : 'none', border: activeGoal.trim() && product ? 'none' : `1px solid rgba(255,255,255,0.06)` }}>
                {activeGoal.trim() && product ? 'Next →' : 'Select your intention and session type'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: C.textMuted }}>
                {[['How does it work?', '/faq'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([l, h]) => (
                  <a key={l} href={h} style={{ color: C.textMuted, textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: MOOD */}
          {step === 1 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: C.textMuted, marginBottom: '14px', fontWeight: '600' }}>HOW ARE YOU FEELING RIGHT NOW?</div>
                <div style={{ fontSize: '54px', marginBottom: '10px' }}>{moodEmoji}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '19px', color: p.color, fontWeight: '700', marginBottom: '5px' }}>{moodLabel}</div>
                <div style={{ fontSize: '13px', color: C.textBody }}>Your script is calibrated to meet you where you are</div>
              </div>
              <div style={{ padding: '24px', background: C.bgCard, border: `1px solid ${p.color}22`, borderRadius: '16px', marginBottom: '20px', boxShadow: `0 0 20px ${p.glow}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: C.textMuted }}>Really struggling</span>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '24px', fontWeight: '800', color: p.color }}>{mood}</span>
                  <span style={{ fontSize: '12px', color: C.textMuted }}>Feeling amazing</span>
                </div>
                <style>{`input[type=range].ms{background:linear-gradient(to right,${p.color},${p.colorB}44)} input[type=range].ms::-webkit-slider-thumb{background:${p.color};border:2px solid #fff;box-shadow:0 0 10px ${p.color}}`}</style>
                <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="ms" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(0)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={() => setStep(isSubliminal ? 4 : 2)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: `0 4px 20px ${p.glow}` }}>Next →</button>
              </div>
            </div>
          )}

          {/* STEP 2: NAME */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: C.textMuted, marginBottom: '12px', fontWeight: '600' }}>MAKE IT PERSONAL</div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: '15px', color: C.textH, fontWeight: '600', marginBottom: '8px' }}>What's your first name?</p>
                <p style={{ fontSize: '13px', color: C.textBody, lineHeight: 1.6 }}>Optional. If you share it, your name will be woven naturally into your session.</p>
              </div>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name (optional)" autoFocus onKeyDown={e => e.key === 'Enter' && setStep(3)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${p.color}33`, background: 'rgba(255,255,255,0.03)', color: C.textH, fontSize: '16px', marginBottom: '20px', textAlign: 'center' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: `0 4px 20px ${p.glow}` }}>{firstName.trim() ? `Continue as ${firstName.trim()} →` : 'Skip →'}</button>
              </div>
            </div>
          )}

          {/* STEP 3: VOICE */}
          {step === 3 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: C.textMuted, marginBottom: '12px', fontWeight: '600' }}>CHOOSE YOUR VOICE</div>
                <p style={{ fontSize: '13px', color: C.textBody }}>Preview each voice before you choose. This voice guides your entire session.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {VOICES.hypnosis.map(v => (<VoiceCard key={v.id} voice={v} selected={selectedVoice?.id === v.id} onSelect={() => setSelectedVoice(v)} theme={p} />))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={() => selectedVoice && setStep(4)} disabled={!selectedVoice} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: selectedVoice ? p.grad : 'rgba(255,255,255,0.05)', color: selectedVoice ? '#fff' : C.textMuted, fontSize: '15px', fontWeight: '700', boxShadow: selectedVoice ? `0 4px 20px ${p.glow}` : 'none' }}>Next →</button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRM */}
          {step === 4 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}><div style={{ fontSize: '11px', letterSpacing: '0.15em', color: C.textMuted, fontWeight: '600' }}>YOUR SESSION</div></div>
              <div style={{ padding: '24px', borderRadius: '18px', background: C.bgCard, border: `1px solid ${p.color}33`, marginBottom: '20px', boxShadow: `0 0 30px ${p.glow}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '32px' }}>{product?.emoji}</div>
                  <div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '16px', color: p.color, fontWeight: '700' }}>{product?.label}</div>
                    <div style={{ fontSize: '12px', color: C.textBody }}>{product?.duration} · {MUSIC[product?.id]?.label}</div>
                  </div>
                </div>
                {[['Intention', activeGoal], ['Voice', isSubliminal ? 'Emily (default for subliminal)' : selectedVoice?.name], ['Mood', `${mood}/10 — ${moodLabel}`]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                    <span style={{ color: C.textBody }}>{k}</span><span style={{ color: C.textH, fontWeight: '500' }}>{v}</span>
                  </div>
                ))}
                {isWalking && (
                  <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(41,186,239,0.06)', border: '1px solid rgba(41,186,239,0.2)', marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', color: C.cyanLight, lineHeight: 1.6 }}>⚠️ Designed for walking outdoors. Your awareness stays fully active throughout. Do not use while driving.</div>
                  </div>
                )}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '14px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: C.textBody }}>Cost</span>
                  <span style={{ color: p.color, fontWeight: '700', fontSize: '15px' }}>✦ {product?.credits} credit{product?.credits > 1 ? 's' : ''}</span>
                </div>
                {profile && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: C.textMuted }}>Your balance</span>
                    <span style={{ fontSize: '12px', color: C.textMuted }}>✦ {profile.credits} remaining</span>
                  </div>
                )}
              </div>
              {error && <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(isSubliminal ? 1 : 3)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={startGenerate} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#fff', fontSize: '15px', fontWeight: '800', boxShadow: `0 4px 24px ${p.glow}`, letterSpacing: '0.02em' }}>
                  {user ? '✦ Generate My Audio' : '✦ Sign Up Free and Generate'}
                </button>
              </div>
              {safetyState?.type === 'crisis' && <CrisisBlock onDismiss={clearSafety} />}
              {safetyState?.type === 'block' && <SafetyBlock category={safetyState.category} suggestedRewrite={safetyState.suggestedRewrite} onUseRewrite={(r) => { setGoal('custom'); setCustomGoal(r); clearSafety() }} onDismiss={clearSafety} />}
            </div>
          )}

          {/* STEP 5: LOADING */}
          {step === 5 && (
            <div style={{ animation: 'fadeUp 0.5s ease both', textAlign: 'center', padding: isMobile ? '20px 0' : '40px 0' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 32px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${p.color}33`, borderTopColor: p.color, animation: 'spin 1.4s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: `1px solid ${p.colorB}44`, borderBottomColor: p.colorB, animation: 'spinR 2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{product?.emoji}</div>
              </div>
              <div style={{ minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', padding: '0 20px' }}>
                <div key={loadMsgIndex} style={{ fontSize: isMobile ? '14px' : '15px', color: p.color, fontWeight: '600', animation: 'fadeMsg 3.5s ease both', maxWidth: '420px', lineHeight: 1.6, textAlign: 'center' }}>{currentLoadMsg}</div>
              </div>
              <p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '36px' }}>Your session is built fresh every time. This takes 60 to 90 seconds.</p>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '100px', height: '4px', overflow: 'hidden', marginBottom: '10px', maxWidth: '400px', margin: '0 auto 10px' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: p.grad, borderRadius: '100px', transition: 'width 0.8s ease', boxShadow: `0 0 10px ${p.color}` }} />
              </div>
              <div style={{ fontSize: '11px', color: C.textMuted, fontFamily: 'monospace' }}>{Math.round(progress)}%</div>
            </div>
          )}

          {/* STEP 6: RESULT */}
          {step === 6 && (
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>
              {error ? (
                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,80,80,0.2)', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚠️</div>
                  <div style={{ fontSize: '14px', color: '#ff8a80', marginBottom: '16px' }}>{error}</div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={resetApp} style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: C.textH, fontSize: '13px', fontWeight: '600' }}>Try Again</button>
                    <button onClick={async () => { await fetch('/api/report-bug', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error, userId: user?.id, productType: product?.id, goal: activeGoal }) }); alert('Bug reported. Thank you!') }} style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8a80', fontSize: '13px', fontWeight: '600' }}>🐛 Report Bug</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px', padding: '24px', borderRadius: '18px', background: p.color + '08', border: `1px solid ${p.color}33`, boxShadow: `0 0 40px ${p.glow}` }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{product?.emoji}</div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '20px', color: p.color, fontWeight: '800', marginBottom: '5px' }}>Your {product?.label} is ready</div>
                    <div style={{ fontSize: '12px', color: C.textBody }}>{isSubliminal ? 'Emily' : selectedVoice?.name} · {MUSIC[product?.id]?.label} · Mood {mood}/10</div>
                    {savedOk && <div style={{ marginTop: '10px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>✓ Saved to your library · <a href="/dashboard" style={{ color: '#34d399' }}>View library →</a></div>}
                  </div>
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px 24px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: p.color, marginBottom: '12px', fontWeight: '600' }}>YOUR SCRIPT</div>
                    <div style={{ fontSize: '15px', lineHeight: '2', color: C.textBody, whiteSpace: 'pre-wrap', fontFamily: "'Georgia',serif" }}>{script}</div>
                  </div>
                  <div style={{ background: C.bgCard, border: `1px solid ${p.color}22`, borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
                    <Waveform active={playing} product={product} />
                    {playing && (
                      <>
                        <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '14px' }}>
                          <div style={{ fontSize: '12px', color: p.color, fontFamily: 'monospace', marginBottom: '3px' }}>{fmt(timer)} — Session in progress</div>
                          <div style={{ fontSize: '11px', color: C.textMuted, fontStyle: 'italic' }}>{isSubliminal ? 'Relax and let the music wash over you.' : isWalking ? 'Keep your eyes open. Walk at your own pace.' : 'Close your eyes. Breathe slowly. Let the words reach you.'}</div>
                        </div>
                        {!isSubliminal && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', color: C.textMuted, whiteSpace: 'nowrap' }}>🎵 Music</span>
                            <style>{`input[type=range].mv{background:linear-gradient(to right,${p.color},${p.color}33)} input[type=range].mv::-webkit-slider-thumb{background:${p.color};border:none;width:14px;height:14px}`}</style>
                            <input type="range" min="0" max="0.4" step="0.01" value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} className="mv" style={{ flex: 1, height: '3px' }} />
                            <span style={{ fontSize: '11px', color: C.textMuted, whiteSpace: 'nowrap' }}>{Math.round(musicVolume * 250)}%</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <button onClick={togglePlay} disabled={!audioUrl} style={{ flex: 1, padding: isMobile ? '14px' : '15px', borderRadius: '12px', background: audioUrl ? p.grad : 'rgba(255,255,255,0.04)', color: '#fff', fontSize: isMobile ? '14px' : '15px', fontWeight: '800', boxShadow: audioUrl && !playing ? `0 4px 20px ${p.glow}` : 'none' }}>{playing ? '⏸ Pause' : '▶ Play'}</button>
                    <button onClick={replaySession} title="Replay from start" style={{ padding: '14px 16px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '14px' }}>↩</button>
                    <button onClick={resetApp} title="New session" style={{ padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: isMobile ? '11px' : '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{isMobile ? '+' : 'New'}</button>
                  </div>
                  {isSubliminal && (
                    <button onClick={() => { const n = !looping; setLooping(n); if (audioRef.current) audioRef.current.loop = n }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${looping ? SUBLIMINAL_PRODUCT.color + '44' : C.border}`, background: looping ? SUBLIMINAL_PRODUCT.color + '10' : 'transparent', color: looping ? SUBLIMINAL_PRODUCT.color : C.textMuted, fontSize: '13px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {looping ? '🔁 Loop On — tap to turn off' : '↩ Loop Off — tap to turn on'}
                    </button>
                  )}
                  {saveLimitHit && (
                    <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,159,67,0.08)', border: '1px solid rgba(255,159,67,0.25)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#ff9f43' }}>⚠️ Your session played but could not be saved — you have reached your free plan limit.</div>
                      <a href="/pricing" style={{ fontSize: '12px', color: '#ff9f43', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,159,67,0.4)', padding: '5px 10px', borderRadius: '8px' }}>Upgrade →</a>
                    </div>
                  )}
                  <div style={{ padding: '13px 16px', borderRadius: '12px', background: C.bgCard, border: `1px solid ${C.border}`, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: C.textBody }}>🔥 <strong style={{ color: p.color }}>{streak} day{streak !== 1 ? 's' : ''}</strong> in Rewrite Mode</div>
                    {profile && <div style={{ fontSize: '13px', color: p.color, fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowCredits(true)}>✦ {profile.credits} credits</div>}
                  </div>
                  {(!profile || profile.plan === 'free') && (
                    <div style={{ padding: '16px 18px', borderRadius: '14px', border: '1px solid rgba(123,79,224,0.25)', background: 'rgba(123,79,224,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: C.purpleLight, marginBottom: '3px', fontWeight: '700' }}>💎 Go Pro — £14.99/month</div>
                        <div style={{ fontSize: '11px', color: C.textBody, lineHeight: 1.6 }}>100 credits/mo · Save 50 sessions · Daily sessions for less than a coffee a week</div>
                      </div>
                      <button onClick={() => window.location.href = '/pricing'} style={{ padding: '9px 16px', borderRadius: '10px', background: C.grad, color: '#fff', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: '700' }}>Upgrade →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '52px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
            {[['Terms', '/terms'], ['Privacy', '/privacy'], ['FAQ', '/faq'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([l, h]) => (
              <a key={l} href={h} style={{ color: C.textMuted, textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
          {user && <div style={{ textAlign: 'center', marginTop: '16px' }}><FeedbackButton userId={user?.id} /></div>}
        </div>
      </div>

      {showDisclaimer && <DisclaimerModal onAccept={acceptDisclaimer} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setView('app') }} />}
      {showCredits && user && <CreditsModal profile={profile} user={user} onClose={() => setShowCredits(false)} />}
      {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} onSelect={(g) => { if (g === 'custom') setGoal('custom'); else setGoal(g); setShowQuiz(false) }} />}
      {showFounder && user && <FounderModal user={user} onClose={() => setShowFounder(false)} />}
    </>
  )
}
