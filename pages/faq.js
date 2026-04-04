import Head from 'next/head'
import { useState } from 'react'

const BASE = {
  bg: '#03050f',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8f4ff',
  textMuted: 'rgba(232,244,255,0.45)',
  textFaint: 'rgba(232,244,255,0.2)',
}

const LOGO = 'https://zlxyxfsgzgippsqffovv.supabase.co/storage/v1/object/public/assets/logo.png'

const FAQS = [
  {
    category: 'About RewireMode',
    questions: [
      {
        q: 'What exactly is RewireMode?',
        a: `RewireMode is the custom AI hypnosis platform. Every session is generated in real time, written specifically for your intention, your mood, and your moment. Not pre-recorded scripts. Not generic meditations. Personalised clinical-grade hypnotherapy, on demand.`,
      },
      {
        q: 'Who built this?',
        a: `RewireMode was created by a qualified hypnotherapist trained in the Milton Model, Ericksonian hypnotherapy, and NLP — the same methodologies used in clinical practice. Every session follows the same structure as a real one-to-one session: induction, deepener, therapeutic suggestion, and return. The AI writes the words. The clinical framework is human.`,
      },
      {
        q: 'How is RewireMode different from other hypnosis apps?',
        a: `Most hypnosis apps give you the same pre-recorded session every time. RewireMode generates a new script in real time based on your specific intention and mood. Other AI hypnosis tools are built by tech companies. RewireMode is the only platform where the clinical methodology comes from a practising qualified hypnotherapist. That means the structure, the language patterns, and the techniques are the same ones used in a real therapy room.`,
      },
      {
        q: 'How is this different from a meditation app?',
        a: `Meditation asks you to observe your mind. Hypnosis speaks directly to your subconscious. During hypnosis, your brain enters theta state, the same brainwave frequency present during deep sleep, where your critical faculty quiets and new neural pathways can form. It is not relaxation. It is reprogramming.`,
      },
    ],
  },
  {
    category: 'The Science',
    questions: [
      {
        q: 'Is AI hypnosis actually effective?',
        a: `Yes. The effectiveness of hypnosis comes from the structure and language of the script, not who writes it. RewireMode uses the same proven techniques used in clinical practice: embedded commands, presuppositions, somatic anchoring, future pacing, and identity-level suggestion. What matters is that the framework is sound, and that you are consistent.`,
      },
      {
        q: 'How does hypnosis work in the brain?',
        a: `During hypnosis, your brain shifts into theta state, a brainwave frequency of 4 to 8 Hz associated with deep sleep, vivid imagination, and subconscious receptivity. In this state, the amygdala quiets, the critical faculty softens, and the subconscious becomes open to new suggestion. Neuroimaging studies published in journals including Cerebral Cortex have shown that hypnosis produces measurable changes in brain connectivity, particularly in areas governing emotional regulation, self-awareness, and behaviour. These are not temporary effects. They are structural changes.`,
      },
      {
        q: 'What is neuroplasticity and why does it matter?',
        a: `Neuroplasticity is your brain's ability to reorganise itself by forming new neural connections throughout life. It means that deeply ingrained thought patterns, emotional responses, and limiting beliefs are not permanent. They are patterns. And patterns can be changed. Hypnosis creates the optimal conditions for neuroplastic change. When the brain is in theta state, it is more receptive to forming new pathways. Repetition strengthens those pathways over time. That is why daily use of RewireMode compounds. Each session builds on the last.`,
      },
      {
        q: 'What is a subliminal session?',
        a: `A subliminal session layers identity-level suggestions quietly under music. While you listen passively, or even while you sleep, your subconscious receives repeated positive suggestion. Research into subliminal processing shows that the brain continues to process stimuli below conscious awareness. Repeated exposure to identity-level statements gradually strengthens the neural pathways associated with those beliefs, shifting them from something you are trying to believe into something you simply are.`,
      },
      {
        q: 'How long until I notice results?',
        a: `Some people notice a shift after one session. Lasting change typically comes with repetition. Neuroscience shows it takes between 21 and 66 days of consistent practice to form stable new neural pathways. The sessions compound. A single session opens the door. Daily sessions walk you through it. That is why RewireMode tracks your streak.`,
      },
    ],
  },
  {
    category: 'Safety',
    questions: [
      {
        q: 'Is hypnosis safe?',
        a: `Completely. You are always fully in control. You cannot be made to do anything against your will, and you cannot get stuck in hypnosis. Clinical hypnotherapy has been used safely for over 200 years and is endorsed by medical bodies including the British Medical Association. RewireMode sessions follow the same ethical guidelines used in clinical practice.`,
      },
      {
        q: 'Will I be unconscious or lose control?',
        a: `No. Hypnosis is not sleep and it is not unconsciousness. You remain aware of everything that happens. You are simply in a state of heightened focus and relaxed receptivity, similar to being completely absorbed in a book or film. If anything felt wrong, you would simply open your eyes and be fully present.`,
      },
      {
        q: 'Is it suitable for everyone?',
        a: `RewireMode is designed for general wellbeing, mindset work, sleep, and performance. It is not a replacement for medical or psychological treatment. If you have a diagnosed mental health condition, please speak with your healthcare provider before use. Sessions are not suitable for those with epilepsy or a history of psychosis.`,
      },
    ],
  },
  {
    category: 'Using RewireMode',
    questions: [
      {
        q: 'What are the four session types?',
        a: `Reset Hypnosis is a 5-minute daily session for subconscious rewiring. It follows a clinical structure: induction, deepener, therapeutic suggestion, and gentle return. Sleep Hypnosis is a 15-minute session that guides you into deep sleep while your subconscious continues receiving therapeutic suggestion throughout the night. Subliminal is a 30-minute passive listening session, identity-level affirmations layered quietly under music. Hype Coach is a 5-minute high-energy session for immediate state change before something big.`,
      },
      {
        q: 'What is a Hype Coach session?',
        a: `A Hype Coach session is high-energy identity activation. It is designed for the moments before something important: a meeting, a sales call, a workout, a difficult conversation. It uses rapid NLP techniques to shift your mental and emotional state and anchor confidence in under 5 minutes. It is not hypnosis. It is performance priming.`,
      },
      {
        q: 'Can I use RewireMode every day?',
        a: `Yes, and we encourage it. Neuroplasticity is driven by repetition. The more consistently you use RewireMode, the stronger the new neural pathways become. Daily use is how change moves from something you feel in a session to something that is simply part of who you are.`,
      },
      {
        q: 'How should I listen for best results?',
        a: `Use headphones wherever possible. Find a quiet place where you will not be disturbed. For hypnosis and sleep sessions, close your eyes and allow yourself to follow the voice. You do not need to concentrate hard. Simply let the words land. For subliminal sessions, you can listen while working, resting, or falling asleep. The session works whether you are actively listening or not.`,
      },
      {
        q: 'What are credits?',
        a: `Each session uses credits based on its length. Reset Hypnosis and Hype Coach sessions (5 minutes) cost 1 credit. Sleep Hypnosis and Subliminal sessions (15 to 30 minutes) cost 3 credits. Free accounts receive 5 credits per week. Pro accounts receive 100 credits per month.`,
      },
    ],
  },
]

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${BASE.border}` }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: '15px', color: open ? '#6366f1' : BASE.text, fontWeight: '600', lineHeight: 1.4, transition: 'color 0.2s ease' }}>{question}</span>
        <span style={{ fontSize: '20px', color: '#6366f1', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease', lineHeight: 1 }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: '20px', fontSize: '14px', color: BASE.textMuted, lineHeight: '1.8' }}>{answer}</div>
      )}
    </div>
  )
}

export default function FAQ({ user, profile }) {
  return (
    <>
      <Head>
        <title>FAQ — RewireMode</title>
        <meta name="description" content="Everything you need to know about AI hypnosis, how RewireMode works, and the science behind subconscious reprogramming." />
      </Head>
      <div style={{ minHeight: '100vh', background: BASE.bg, color: BASE.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
          @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
          button{cursor:pointer;font-family:inherit}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:4px}
        `}</style>

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,50,220,0.07) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'pulse 10s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(99,102,241,0.08)', backdropFilter: 'blur(10px)', background: 'rgba(5,10,20,0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 24px 0' }}>
            <div />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {profile && <div style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600', padding: '5px 12px', borderRadius: '100px', border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)' }}>✦ {profile.credits} credits</div>}
              <a href="/dashboard" style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 14px', borderRadius: '8px', border: `1px solid ${BASE.border}`, textDecoration: 'none' }}>Dashboard</a>
              <a href="/" style={{ fontSize: '12px', color: BASE.textMuted, padding: '6px 14px', borderRadius: '8px', border: `1px solid ${BASE.border}`, textDecoration: 'none' }}>← Back</a>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 10px' }}>
            <a href="/">
              <img src={LOGO} alt="RewireMode" style={{ height: '120px', objectFit: 'contain', mixBlendMode: 'lighten' }} onError={e => { e.target.style.display='none' }} />
            </a>
          </div>
        </nav>

        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeUp 0.6s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', fontSize: '11px', letterSpacing: '0.15em', color: '#6366f1', marginBottom: '20px', fontWeight: '600' }}>
              ◈ QUESTIONS ANSWERED
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: '800', marginBottom: '16px', background: 'linear-gradient(135deg,#ffffff 0%,#6366f1 50%,#a855f7 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite' }}>
              Everything you need to know
            </h1>
            <p style={{ color: BASE.textMuted, fontSize: '15px', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
              AI hypnosis, the science behind it, how RewireMode works, and whether it is right for you.
            </p>
          </div>

          {/* FAQ sections */}
          {FAQS.map((section, si) => (
            <div key={si} style={{ marginBottom: '48px', animation: `fadeUp 0.6s ease ${0.1 * si}s both` }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#6366f1', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(99,102,241,0.15)' }} />
                {section.category.toUpperCase()}
                <div style={{ flex: 1, height: '1px', background: 'rgba(99,102,241,0.15)' }} />
              </div>
              <div style={{ padding: '0 4px' }}>
                {section.questions.map((item, qi) => (
                  <FAQItem key={qi} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div style={{ marginTop: '56px', padding: '36px', borderRadius: '20px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center', animation: 'fadeUp 0.6s ease 0.4s both' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>✦</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: BASE.text, marginBottom: '10px' }}>Ready to start rewiring?</h2>
            <p style={{ fontSize: '14px', color: BASE.textMuted, marginBottom: '24px', lineHeight: 1.7 }}>
              Your first session is free. No card required. Generated in real time for you.
            </p>
            <a href="/" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#03050f', fontSize: '15px', fontWeight: '800', textDecoration: 'none', letterSpacing: '0.02em' }}>
              Start Free →
            </a>
          </div>

          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: BASE.textFaint }}>
            Still have a question? Email us at office@rewiremode.com
          </p>
        </div>
      </div>
    </>
  )
}
