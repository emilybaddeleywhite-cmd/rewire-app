// lib/catalog.js
// Shared product catalog — extracted from pages/index.js so every page
// (homepage, /rewire, /solstice) reads from one source of truth.
// Voice IDs are real ElevenLabs IDs; URLs are live Supabase assets.

export const VOICES = [
  { id: 'TKePFuDtAVp14EppI8GC', name: 'Emily',  gender: 'female', desc: 'Warm and grounding', preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Emily_Sample.mp3',  free: true },
  { id: 'xGDJhCwcqw94ypljc95Z', name: 'Callum', gender: 'male',   desc: 'Calm and measured',  preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice2_Sample.mp3', proOnly: true },
  { id: 'KH1SQLVulwP6uG4O3nmT', name: 'River',  gender: 'male',   desc: 'Deep and soothing',  preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice3_Sample.mp3', proOnly: true },
  { id: 'OOk3INdXVLRmSaQoAX9D', name: 'Serena', gender: 'female', desc: 'Soft and serene',    preview: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/Voice4_Sample.mp3', proOnly: true },
]

export const EXPERIENCES = [
  { id: 'reset',      name: 'Reset',      meta: '5 min · Any moment',     desc: 'A short, deep recalibration. Step out of the noise and return clear.', credits: 1, duration: '5:00'  },
  { id: 'sleep',      name: 'Sleep',      meta: 'Tonight · In bed',       desc: 'Drift down gently while suggestion works beneath the surface.',        credits: 3, duration: '15:00' },
  { id: 'walking',    name: 'Walking',    meta: 'Eyes open · Outdoors',   desc: 'Alert, present, moving — change woven into every step.',              credits: 1, duration: '5:00'  },
  { id: 'subliminal', name: 'Subliminal', meta: 'Background · Anytime',   desc: 'Affirmations beneath the atmosphere, speaking to your subconscious.', credits: 3, duration: '30:00' },
]

// Atmospheres (never call it "music" in UI copy)
export const ATMOSPHERES = [
  { id: 'ambient-reset',        name: 'Ambient Drift', desc: 'Soft pads and slow textures.',           url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Ambient%20Reset.mp3',            types: ['reset'] },
  { id: 'ocean-reset',          name: 'Ocean',         desc: 'Gentle waves, far away.',                url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Ocean%20Water%20reset.mp3',      types: ['reset'] },
  { id: 'rain-reset',           name: 'Rain',          desc: 'Steady, soft rainfall.',                 url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Rain%20Reset.mp3',               types: ['reset'] },
  { id: 'binaural-walking',     name: 'Binaural',      desc: 'Frequencies that keep you clear.',       url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Binaural%20beats%20Walking.mp3', types: ['walking'] },
  { id: 'nature-walking',       name: 'Forest',        desc: 'Birdsong and stillness.',                url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Nature%20Forest%20Walking.mp3',  types: ['walking'] },
  { id: 'rain-sleep',           name: 'Rain',          desc: 'Deep rainfall for deep sleep.',          url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Rain%20sleep%20music.mp3',       types: ['sleep'] },
  { id: 'whitenoise-sleep',     name: 'White Noise',   desc: 'A steady blanket of sound.',             url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/White%20Noise%20Sleep.mp3',      types: ['sleep'] },
  { id: 'ambient-subliminal',   name: 'Ambient Drift', desc: 'Lush textures carrying suggestion.',     url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Ambient%20Subliminal.mp3',       types: ['subliminal'] },
  { id: 'ocean-subliminal',     name: 'Ocean',         desc: 'Flowing water over affirmations.',       url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/Ocean%20water%20subliminal.mp3', types: ['subliminal'] },
  { id: 'whitenoise-subliminal',name: 'White Noise',   desc: 'The most neutral carrier.',              url: 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/music/white%20noise%20subliminal.mp3', types: ['subliminal'] },
]

export function atmospheresFor(typeId) {
  const tracks = ATMOSPHERES.filter(a => a.types.includes(typeId))
  // Subliminal REQUIRES an atmosphere (the voice is near-silent beneath it).
  if (typeId === 'subliminal') return tracks
  return [...tracks, { id: 'silence', name: 'Silence', desc: 'Just the voice.', url: null, types: [typeId] }]
}

// Creation phases shown while the Rewire is built (vision doc step 6)
export const CREATION_PHASES = [
  'Understanding your intention',
  'Writing your personalised script',
  'Creating affirmations',
  'Preparing voice',
  'Blending atmosphere',
  'Finalising your Rewire',
]

export const LOGO_URL = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'
