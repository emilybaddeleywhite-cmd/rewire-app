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
