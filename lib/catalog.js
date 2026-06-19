// lib/catalog.js
// Shared product catalog — one source of truth for every page
// (homepage, /rewire, /challenge, /pricing).
// Voice IDs are real ElevenLabs IDs; URLs are live Supabase assets.
//
// PRICING MODEL (no credits): the 7-Day Rewire is free and built from the
// two free session types (Reset + Walking). Sleep + Subliminal unlock with
// Unlimited. Gating is by perceived value, not by generation cost.

export const VOICES = [
  { id: 'TKePFuDtAVp14EppI8GC', name: 'Emily',  gender: 'female', desc: 'Warm and grounding', preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Emily_Sample.mp3',  free: true },
  { id: 'xGDJhCwcqw94ypljc95Z', name: 'Callum', gender: 'male',   desc: 'Calm and measured',  preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice2_Sample.mp3', proOnly: true },
  { id: 'KH1SQLVulwP6uG4O3nmT', name: 'River',  gender: 'male',   desc: 'Deep and soothing',  preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice3_Sample.mp3', proOnly: true },
  { id: 'OOk3INdXVLRmSaQoAX9D', name: 'Serena', gender: 'female', desc: 'Soft and serene',    preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice4_Sample.mp3', proOnly: true },
]

// Session types. tier: 'free'  -> available on the free 7-Day Rewire
//                tier: 'unlimited' -> unlocks with an Unlimited subscription
// Free types are listed first so UIs naturally present them first.
export const EXPERIENCES = [
  { id: 'reset',      name: 'Reset',      meta: '5 min · Any moment',     desc: 'A short, deep recalibration. Step out of the noise and return clear.', duration: '5:00',  tier: 'free' },
  { id: 'walking',    name: 'Walking',    meta: 'Eyes open · Outdoors',   desc: 'Alert, present, moving — change woven into every step.',              duration: '5:00',  tier: 'free' },
  { id: 'sleep',      name: 'Sleep',      meta: 'Tonight · In bed',       desc: 'Drift down gently while suggestion works beneath the surface.',        duration: '15:00', tier: 'unlimited' },
  { id: 'subliminal', name: 'Subliminal', meta: 'Background · Anytime',   desc: 'Affirmations beneath the atmosphere, speaking to your subconscious.', duration: '30:00', tier: 'unlimited' },
]

export const FREE_TYPES = ['reset', 'walking']
export const UNLIMITED_TYPES = ['sleep', 'subliminal']

// Single source of truth for access checks. Use on the server-side gate too.
export function isTypeFree(typeId) {
  return FREE_TYPES.includes(typeId)
}
export function canGenerate(typeId, plan) {
  // plan: 'free' | 'unlimited' (treat any paid plan as 'unlimited')
  if (isTypeFree(typeId)) return true
  return plan && plan !== 'free'
}

// Atmospheres (never call it "music" in UI copy)
// One atmosphere per experience is free; the rest unlock with Unlimited.
export const ATMOSPHERES = [
  { id: 'ambient-reset',        name: 'Ambient Drift', desc: 'Soft pads and slow textures.',           url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Ambient%20Reset.mp3',            types: ['reset'],      free: true },
  { id: 'ocean-reset',          name: 'Ocean',         desc: 'Gentle waves, far away.',                url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Ocean%20Water%20reset.mp3',      types: ['reset'],      proOnly: true },
  { id: 'rain-reset',           name: 'Rain',          desc: 'Steady, soft rainfall.',                 url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Rain%20Reset.mp3',               types: ['reset'],      proOnly: true },
  { id: 'nature-walking',       name: 'Forest',        desc: 'Birdsong and stillness.',                url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Nature%20Forest%20Walking.mp3',  types: ['walking'],    free: true },
  { id: 'binaural-walking',     name: 'Binaural',      desc: 'Frequencies that keep you clear.',       url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Binaural%20beats%20Walking.mp3', types: ['walking'],    proOnly: true },
  { id: 'rain-sleep',           name: 'Rain',          desc: 'Deep rainfall for deep sleep.',          url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Rain%20sleep%20music.mp3',       types: ['sleep'],      free: true },
  { id: 'whitenoise-sleep',     name: 'White Noise',   desc: 'A steady blanket of sound.',             url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/White%20Noise%20Sleep.mp3',      types: ['sleep'],      proOnly: true },
  { id: 'ambient-subliminal',   name: 'Ambient Drift', desc: 'Lush textures carrying suggestion.',     url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Ambient%20Subliminal.mp3',       types: ['subliminal'], free: true },
  { id: 'ocean-subliminal',     name: 'Ocean',         desc: 'Flowing water over affirmations.',       url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Ocean%20water%20subliminal.mp3', types: ['subliminal'], proOnly: true },
  { id: 'whitenoise-subliminal',name: 'White Noise',   desc: 'The most neutral carrier.',              url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/white%20noise%20subliminal.mp3', types: ['subliminal'], proOnly: true },
]

export function atmospheresFor(typeId) {
  const tracks = ATMOSPHERES.filter(a => a.types.includes(typeId))
  // Subliminal REQUIRES an atmosphere (the voice is near-silent beneath it).
  if (typeId === 'subliminal') return tracks
  return [...tracks, { id: 'silence', name: 'Silence', desc: 'Just the voice.', url: null, types: [typeId], proOnly: true }]
}

// Creation phases shown while the Rewire is built
export const CREATION_PHASES = [
  'Understanding your intention',
  'Writing your personalised script',
  'Creating affirmations',
  'Preparing voice',
  'Blending atmosphere',
  'Finalising your Rewire',
]

export const LOGO_URL = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'
