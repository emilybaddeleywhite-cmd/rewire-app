import { useState, useEffect, useRef } from "react";
import Head from "next/head";
 
// ─── STREAK ──────────────────────────────────────────────────────────
function getStreak() {
  try {
    const s = JSON.parse(localStorage.getItem("hx_streak") || "{}");
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.last === today) return s.count || 1;
    if (s.last === yesterday) return s.count || 1;
    return 0;
  } catch { return 0; }
}
function incrementStreak() {
  try {
    const s = JSON.parse(localStorage.getItem("hx_streak") || "{}");
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let count = 1;
    if (s.last === today) count = s.count || 1;
    else if (s.last === yesterday) count = (s.count || 0) + 1;
    localStorage.setItem("hx_streak", JSON.stringify({ last: today, count }));
    return count;
  } catch { return 1; }
}
 
// ─── DATA ─────────────────────────────────────────────────────────────
const GOALS = [
  "I want to be confident",
  "I want to stop overthinking",
  "I want to build a successful business",
  "I want to attract abundance",
  "I want to sleep deeply",
  "I want to let go of fear",
];
 
const TONES = [
  { id: "calm",      label: "Deep Calm", emoji: "🌊", desc: "Slow, oceanic, grounding" },
  { id: "confident", label: "Powerful",  emoji: "⚡", desc: "Bold, commanding, energising" },
  { id: "sleep",     label: "Sleep",     emoji: "🌙", desc: "Soft, drifting, weightless" },
  { id: "hype",      label: "HYPE UP",   emoji: "🔥", desc: "Coach mode. Let's GO." },
];
 
const MOMENTS = [
  { id: "meeting",  emoji: "💼", label: "Big meeting" },
  { id: "workout",  emoji: "💪", label: "Workout" },
  { id: "sales",    emoji: "📞", label: "Sales call" },
  { id: "convo",    emoji: "😰", label: "Difficult conversation" },
  { id: "launch",   emoji: "🚀", label: "Launch / presentation" },
];
 
// ─── THEMES ───────────────────────────────────────────────────────────
const HYPE_THEME = {
  bg: "#080510", orb1: "rgba(180,30,255,0.12)", orb2: "rgba(255,60,0,0.1)",
  accent: "#e040fb", btnGrad: "linear-gradient(135deg,#e040fb 0%,#ff6d00 100%)",
  btnText: "#fff", waveA: "#e040fb", waveB: "#ff6d00",
  cardBg: "rgba(255,255,255,0.03)", cardBorder: "rgba(224,64,251,0.18)",
  label: "#e040fb", tagBg: "rgba(224,64,251,0.035)", tagBorder: "rgba(224,64,251,0.15)",
  progressGrad: "linear-gradient(to right,#e040fb,#ff6d00)",
};
const BASE_THEME = {
  bg: "#0d0a06", orb1: "rgba(140,95,30,0.13)", orb2: "rgba(60,35,100,0.1)",
  accent: "#c8a96e", btnGrad: "linear-gradient(135deg,#c8a96e 0%,#9a7040 100%)",
  btnText: "#0d0a06", waveA: "#9a7040", waveB: "#f5e4b0",
  cardBg: "rgba(255,255,255,0.028)", cardBorder: "rgba(200,169,110,0.16)",
  label: "#c8a96e", tagBg: "rgba(200,169,110,0.035)", tagBorder: "rgba(200,169,110,0.1)",
  progressGrad: "linear-gradient(to right,#9a7040,#f5e4b0)",
};
 
// ─── COMPONENTS ───────────────────────────────────────────────────────
function WaveformVisualizer({ active, theme }) {
  const [heights, setHeights] = useState(Array(30).fill(5));
  useEffect(() => {
    if (!active) { setHeights(Array(30).fill(5)); return; }
    const iv = setInterval(() => {
      setHeights(Array(30).fill(0).map((_, i) =>
        6 + Math.abs(Math.sin(Date.now() * 0.003 + i * 0.5)) * 26 + Math.random() * 8));
    }, 120);
    return () => clearInterval(iv);
  }, [active]);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", height: "54px" }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: "3px", borderRadius: "2px", height: `${h}px`, background: `linear-gradient(to top,${theme.waveA},${theme.waveB})`, transition: "height 0.12s ease", opacity: active ? 0.9 : 0.22 }} />
      ))}
    </div>
  );
}
 
function TypedText({ text, isHype }) {
  const [shown, setShown] = useState("");
  const [idx, setIdx] = useState(0);
  useEffect(() => { setShown(""); setIdx(0); }, [text]);
  useEffect(() => {
    if (idx >= text.length) return;
    const ch = text[idx];
    const delay = ch === "\n" ? 60 : ch === "." || ch === "!" || ch === "?" ? 45 : isHype ? 9 : 11;
    const t = setTimeout(() => { setShown(p => p + ch); setIdx(p => p + 1); }, delay);
    return () => clearTimeout(t);
  }, [idx, text, isHype]);
  return (
    <div style={{ fontFamily: isHype ? "'Arial Black','Impact',sans-serif" : "'Georgia',serif", fontSize: "14.5px", lineHeight: isHype ? "1.8" : "2.0", color: isHype ? "#f0e8ff" : "#e8dcc8", whiteSpace: "pre-wrap", fontWeight: isHype ? "500" : "normal" }}>
      {shown}{idx < text.length && <span style={{ opacity: 0.4 }}>|</span>}
    </div>
  );
}
 
function StreakBadge({ count }) {
  if (count === 0) return null;
  const icon = count >= 100 ? "🏆" : count >= 30 ? "💎" : count >= 7 ? "⚡" : "🔥";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "13px", color: "#f5e4b0" }}>
      {icon} <strong>{count}</strong> day streak
    </div>
  );
}
 
function MilestoneToast({ count }) {
  const m = { 7: "7 days — you're building something real. ⚡", 30: "30 days. This is who you are now. 💎", 100: "100 DAYS. Absolutely legendary. 🏆" };
  if (!m[count]) return null;
  return (
    <div style={{ padding: "14px 18px", borderRadius: "12px", marginBottom: "16px", background: "linear-gradient(135deg,rgba(200,169,110,0.15),rgba(200,169,110,0.05))", border: "1px solid rgba(200,169,110,0.3)", fontSize: "14px", color: "#f5e4b0", textAlign: "center", fontStyle: "italic" }}>
      {m[count]}
    </div>
  );
}
 
// ─── MAIN ──────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [tone, setTone] = useState("calm");
  const [mood, setMood] = useState(5);
  const [moment, setMoment] = useState(null);
  const [script, setScript] = useState("");
  const [progress, setProgress] = useState(0);
  const [loadMsg, setLoadMsg] = useState("");
  const [loadPhase, setLoadPhase] = useState("script");
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [newStreak, setNewStreak] = useState(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
 
  useEffect(() => { setStreak(getStreak()); }, []);
 
  const isHype = tone === "hype";
  const theme = isHype ? HYPE_THEME : BASE_THEME;
  const activeGoal = goal === "custom" ? customGoal : goal;
  const selectedTone = TONES.find(t => t.id === tone);
  const C = (h, b) => isHype ? h : b;
 
  const moodEmoji = mood <= 2 ? "😔" : mood <= 4 ? "😕" : mood <= 6 ? "😐" : mood <= 8 ? "🙂" : "😄";
  const moodLabel = mood <= 2 ? "Really struggling" : mood <= 4 ? "Not great" : mood <= 6 ? "Getting there" : mood <= 8 ? "Pretty good" : "Feeling amazing";
  const moodNote = mood <= 3
    ? C("I see you. We're changing that energy right now. 🔥", "Your script will meet you gently where you are.")
    : mood <= 6
    ? C("Good — there's something to build on. Let's ignite it.", "Your script will meet you here and lift you higher.")
    : mood <= 8
    ? C("You're switched on. Let's take it to full power.", "Great energy. Your script will anchor and deepen this.")
    : C("YOU ARE ON FIRE. Full power mode. 🚀", "You're shining. Your script will seal this at identity level.");
 
  async function startGenerate(useMoment) {
    setStep(3);
    setProgress(0);
    setError("");
    setAudioUrl(null);
    setPlaying(false);
    setTimer(0);
 
    const usedMoment = useMoment !== undefined ? useMoment : moment;
 
    try {
      // Phase 1: Script
      setLoadPhase("script");
      setLoadMsg(C("Building your battle speech... 💪", "Crafting your hypnotic script..."));
      setProgress(15);
 
      const scriptRes = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: activeGoal, tone, mood, moment: usedMoment }),
      });
      const scriptData = await scriptRes.json();
      if (!scriptRes.ok) throw new Error(scriptData.error || "Script generation failed");
      setScript(scriptData.script);
      setProgress(55);
 
      // Phase 2: Audio
      setLoadPhase("audio");
      setLoadMsg(C("Generating your coach audio... 🔥", "Generating your personalised audio..."));
      setProgress(65);
 
      const audioRes = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scriptData.script, isHype }),
      });
      if (!audioRes.ok) {
        const err = await audioRes.json().catch(() => ({}));
        throw new Error(err.error || "Audio generation failed");
      }
      const audioBlob = await audioRes.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setProgress(100);
 
      const c = incrementStreak();
      setStreak(c);
      setNewStreak(c);
      setStep(4);
 
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStep(4);
    }
  }
 
  function togglePlay() {
    if (!audioRef.current) return;
    if (!playing) {
      audioRef.current.play();
      setPlaying(true);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      audioRef.current.pause();
      setPlaying(false);
      clearInterval(timerRef.current);
    }
  }
 
  function handleAudioEnd() {
    setPlaying(false);
    clearInterval(timerRef.current);
  }
 
  function reset() {
    clearInterval(timerRef.current);
    if (audioRef.current) { audioRef.current.pause(); }
    setStep(0); setGoal(""); setCustomGoal(""); setScript("");
    setPlaying(false); setTimer(0); setProgress(0); setMood(5);
    setMoment(null); setNewStreak(null); setAudioUrl(null); setError("");
  }
 
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
 
  return (
    <>
      <Head>
        <title>Rewire — Rewire your mind. Rewrite your story.</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Personalised hypnosis and mindset audio, on demand." />
      </Head>
 
      <div style={{ minHeight: "100vh", background: theme.bg, color: "#e8dcc8", fontFamily: C("'Arial',sans-serif", "'Palatino Linotype','Book Antiqua',Georgia,serif"), overflow: "hidden", transition: "background 0.6s ease" }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes spinR{to{transform:rotate(-360deg)}}
          @keyframes pulseOrb{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:0.85;transform:scale(1.1)}}
          @keyframes hypePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
          button{cursor:pointer;border:none;background:none;font-family:inherit}
          textarea{font-family:inherit} textarea:focus{outline:none}
          input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:6px;outline:none;cursor:pointer}
          input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;cursor:pointer}
          ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(200,169,110,0.25);border-radius:4px}
        `}</style>
 
        {/* Ambient BG */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-25%", left: "-15%", width: "650px", height: "650px", borderRadius: "50%", background: `radial-gradient(circle,${theme.orb1} 0%,transparent 65%)`, filter: "blur(70px)", animation: "pulseOrb 7s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "550px", height: "550px", borderRadius: "50%", background: `radial-gradient(circle,${theme.orb2} 0%,transparent 65%)`, filter: "blur(60px)", animation: "pulseOrb 9s ease-in-out infinite 2s" }} />
        </div>
 
        <div style={{ maxWidth: "660px", margin: "0 auto", padding: "44px 20px 80px", position: "relative", zIndex: 1 }}>
 
          {/* Streak */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px", minHeight: "32px" }}>
            <StreakBadge count={streak} />
          </div>
 
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "38px", animation: "fadeUp 0.8s ease both" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: theme.accent, marginBottom: "14px", fontFamily: "monospace", opacity: 0.8 }}>
              {C("🔥  COACH MODE ACTIVATED  🔥", "✦  SUBCONSCIOUS REPROGRAMMING  ✦")}
            </div>
            <h1 style={{ fontSize: "clamp(30px,7vw,50px)", fontWeight: C("900", "400"), lineHeight: C("1.05", "1.13"), letterSpacing: C("-0.01em", "-0.022em"), marginBottom: "14px", background: C("linear-gradient(135deg,#ff6d00 0%,#e040fb 50%,#ff6d00 100%)", "linear-gradient(135deg,#f5e4b0 0%,#c8a96e 45%,#e8dcc8 75%,#f5e4b0 100%)"), backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite", textTransform: C("uppercase", "none") }}>
              {C("It's your time.\nLet's go.", "Rewire your mind.\nRewrite your story.")}
            </h1>
            <p style={{ color: "rgba(232,220,200,0.42)", fontSize: "14px", lineHeight: "1.7" }}>
              {C("Pick your goal. Get your coach. Feel the energy.", "Personalised hypnosis and mindset audio, on demand.")}
            </p>
          </div>
 
          {/* Step dots */}
          {step < 4 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
              {(isHype ? [0, 1, 2] : [0, 1]).map(i => (
                <div key={i} style={{ width: step > i ? "24px" : "8px", height: "8px", borderRadius: "100px", background: step >= i ? theme.accent : "rgba(255,255,255,0.1)", transition: "all 0.3s ease" }} />
              ))}
            </div>
          )}
 
          {/* ── STEP 0 ── */}
          {step === 0 && (
            <div style={{ animation: "fadeUp 0.55s ease both" }}>
              <div style={{ marginBottom: "22px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: theme.label, marginBottom: "12px", fontFamily: "monospace" }}>
                  {C("WHAT ARE WE WORKING ON?", "WHAT DO YOU WANT TO CHANGE?")}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                  {GOALS.map(g => (
                    <button key={g} onClick={() => setGoal(g)} style={{ padding: "12px 14px", borderRadius: "10px", textAlign: "left", border: `1px solid ${goal === g ? C("rgba(224,64,251,0.6)", "rgba(200,169,110,0.65)") : C("rgba(224,64,251,0.12)", "rgba(200,169,110,0.12)")}`, background: goal === g ? C("rgba(224,64,251,0.08)", "rgba(200,169,110,0.08)") : "rgba(255,255,255,0.016)", color: goal === g ? C("#e040fb", "#f0d89a") : "rgba(232,220,200,0.5)", fontSize: "13px", lineHeight: "1.4", transition: "all 0.18s ease" }}>{g}</button>
                  ))}
                </div>
                <button onClick={() => setGoal("custom")} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", textAlign: "left", border: `1px solid ${goal === "custom" ? C("rgba(224,64,251,0.6)", "rgba(200,169,110,0.65)") : C("rgba(224,64,251,0.12)", "rgba(200,169,110,0.12)")}`, background: goal === "custom" ? C("rgba(224,64,251,0.08)", "rgba(200,169,110,0.08)") : "rgba(255,255,255,0.016)", color: goal === "custom" ? C("#e040fb", "#f0d89a") : "rgba(232,220,200,0.4)", fontSize: "13px", transition: "all 0.18s ease" }}>
                  {C("💪  Tell me exactly what you need...", "✍️  Something else — let me describe it...")}
                </button>
                {goal === "custom" && (
                  <textarea autoFocus value={customGoal} onChange={e => setCustomGoal(e.target.value)}
                    placeholder={C("Be specific. What's the challenge?", "Describe what you want to feel, release, or become...")}
                    style={{ marginTop: "8px", width: "100%", padding: "14px", borderRadius: "10px", border: `1px solid ${C("rgba(224,64,251,0.25)", "rgba(200,169,110,0.25)")}`, background: "rgba(255,255,255,0.03)", color: "#e8dcc8", fontSize: "14px", lineHeight: "1.65", resize: "vertical", minHeight: "80px" }} />
                )}
              </div>
 
              <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: theme.label, marginBottom: "12px", fontFamily: "monospace" }}>CHOOSE YOUR EXPERIENCE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "7px" }}>
                  {TONES.map(t => (
                    <button key={t.id} onClick={() => setTone(t.id)} style={{ padding: "13px 8px", borderRadius: "11px", textAlign: "center", border: `1px solid ${tone === t.id ? (t.id === "hype" ? "rgba(224,64,251,0.7)" : "rgba(200,169,110,0.65)") : (t.id === "hype" ? "rgba(224,64,251,0.2)" : "rgba(200,169,110,0.12)")}`, background: tone === t.id ? (t.id === "hype" ? "rgba(224,64,251,0.1)" : "rgba(200,169,110,0.08)") : (t.id === "hype" ? "rgba(224,64,251,0.03)" : "rgba(255,255,255,0.016)"), transition: "all 0.18s ease", animation: tone === t.id && t.id === "hype" ? "hypePulse 1.5s ease-in-out infinite" : "none" }}>
                      <div style={{ fontSize: "19px", marginBottom: "5px" }}>{t.emoji}</div>
                      <div style={{ fontSize: "10.5px", color: tone === t.id ? (t.id === "hype" ? "#e040fb" : "#f0d89a") : "rgba(232,220,200,0.6)", fontWeight: t.id === "hype" ? "800" : "500", marginBottom: "2px" }}>{t.label}</div>
                      <div style={{ fontSize: "10px", color: "rgba(232,220,200,0.28)", lineHeight: 1.3 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
 
              <button onClick={() => activeGoal.trim() && setStep(1)} disabled={!activeGoal.trim()} style={{ width: "100%", padding: "17px", borderRadius: "13px", background: activeGoal.trim() ? theme.btnGrad : "rgba(255,255,255,0.04)", color: activeGoal.trim() ? theme.btnText : "rgba(232,220,200,0.2)", fontSize: "15px", fontWeight: "800", letterSpacing: C("0.05em", "0.03em"), textTransform: C("uppercase", "none"), transition: "all 0.25s ease" }}>
                {activeGoal.trim() ? C("NEXT →", "Next →") : "Select your intention above"}
              </button>
            </div>
          )}
 
          {/* ── STEP 1: MOOD ── */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.5s ease both" }}>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: theme.label, marginBottom: "14px", fontFamily: "monospace" }}>{C("ENERGY CHECK", "HOW ARE YOU FEELING RIGHT NOW?")}</div>
                <div style={{ fontSize: "52px", marginBottom: "10px" }}>{moodEmoji}</div>
                <div style={{ fontSize: "18px", color: C("#e040fb", "#f0d89a"), fontWeight: C("800", "400"), marginBottom: "5px" }}>{moodLabel}</div>
                <div style={{ fontSize: "12px", color: "rgba(232,220,200,0.38)" }}>Your script is calibrated to this number</div>
              </div>
 
              <div style={{ marginBottom: "20px", padding: "22px 20px", background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", color: "rgba(232,220,200,0.4)" }}>{C("Low energy", "Really struggling")}</span>
                  <span style={{ fontSize: "22px", fontWeight: "800", color: theme.accent }}>{mood}</span>
                  <span style={{ fontSize: "12px", color: "rgba(232,220,200,0.4)" }}>{C("High energy", "Feeling amazing")}</span>
                </div>
                <style>{`input[type=range].ms{background:linear-gradient(to right,${theme.accent},${isHype ? "#ff6d00" : "#f5e4b0"})} input[type=range].ms::-webkit-slider-thumb{background:${theme.accent};border:2px solid #fff;box-shadow:0 0 8px ${theme.accent}55}`}</style>
                <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="ms" style={{ width: "100%" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <div key={n} style={{ fontSize: "10px", color: mood === n ? theme.accent : "rgba(232,220,200,0.2)", fontWeight: mood === n ? "800" : "400" }}>{n}</div>)}
                </div>
              </div>
 
              <div style={{ padding: "14px 16px", borderRadius: "11px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C("rgba(224,64,251,0.1)", "rgba(200,169,110,0.1)")}`, marginBottom: "22px", fontSize: "13px", color: "rgba(232,220,200,0.5)", lineHeight: "1.6", fontStyle: "italic", textAlign: "center" }}>
                {moodNote}
              </div>
 
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setStep(0)} style={{ padding: "15px 18px", borderRadius: "12px", border: `1px solid ${C("rgba(224,64,251,0.16)", "rgba(200,169,110,0.16)")}`, color: "rgba(232,220,200,0.4)", fontSize: "14px" }}>← Back</button>
                <button onClick={() => isHype ? setStep(2) : startGenerate(null)} style={{ flex: 1, padding: "15px", borderRadius: "12px", background: theme.btnGrad, color: theme.btnText, fontSize: "15px", fontWeight: "800", letterSpacing: C("0.05em", "0.03em"), textTransform: C("uppercase", "none") }}>
                  {C("NEXT →", "Generate My Audio →")}
                </button>
              </div>
            </div>
          )}
 
          {/* ── STEP 2: MOMENTS (HYPE) ── */}
          {step === 2 && (
            <div style={{ animation: "fadeUp 0.5s ease both" }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: theme.label, marginBottom: "12px", fontFamily: "monospace" }}>WHAT ARE YOU ABOUT TO DO?</div>
                <p style={{ fontSize: "13px", color: "rgba(232,220,200,0.42)", lineHeight: 1.6 }}>Your script will be written specifically for this moment.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px", marginBottom: "14px" }}>
                {MOMENTS.map(m => (
                  <button key={m.id} onClick={() => setMoment(m.id === moment ? null : m.id)} style={{ padding: "17px 12px", borderRadius: "12px", textAlign: "center", border: `1px solid ${moment === m.id ? "rgba(224,64,251,0.65)" : "rgba(224,64,251,0.15)"}`, background: moment === m.id ? "rgba(224,64,251,0.1)" : "rgba(255,255,255,0.02)", color: moment === m.id ? "#e040fb" : "rgba(232,220,200,0.6)", transition: "all 0.18s ease", animation: moment === m.id ? "hypePulse 1.5s ease-in-out infinite" : "none" }}>
                    <div style={{ fontSize: "24px", marginBottom: "7px" }}>{m.emoji}</div>
                    <div style={{ fontSize: "13px", fontWeight: moment === m.id ? "800" : "500" }}>{m.label}</div>
                  </button>
                ))}
                <button onClick={() => { setMoment(null); startGenerate(null); }} style={{ padding: "17px 12px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(224,64,251,0.1)", background: "rgba(255,255,255,0.015)", color: "rgba(232,220,200,0.35)", fontSize: "13px" }}>
                  <div style={{ fontSize: "24px", marginBottom: "7px" }}>✨</div>Just hype me up
                </button>
              </div>
              {moment && (
                <button onClick={() => startGenerate(moment)} style={{ width: "100%", padding: "16px", borderRadius: "12px", marginBottom: "10px", background: theme.btnGrad, color: "#fff", fontSize: "16px", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", animation: "hypePulse 1.8s ease-in-out infinite" }}>
                  🔥 BUILD MY AUDIO
                </button>
              )}
              <button onClick={() => setStep(1)} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "1px solid rgba(224,64,251,0.16)", color: "rgba(232,220,200,0.4)", fontSize: "14px" }}>← Back</button>
            </div>
          )}
 
          {/* ── STEP 3: LOADING ── */}
          {step === 3 && (
            <div style={{ animation: "fadeUp 0.5s ease both", textAlign: "center", padding: "20px 0" }}>
              {isHype
                ? <div style={{ fontSize: "64px", marginBottom: "22px", animation: "hypePulse 0.8s ease-in-out infinite" }}>🔥</div>
                : <div style={{ position: "relative", width: "76px", height: "76px", margin: "0 auto 28px" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(200,169,110,0.18)", borderTopColor: "#c8a96e", animation: "spin 1.5s linear infinite" }} />
                    <div style={{ position: "absolute", inset: "11px", borderRadius: "50%", border: "1px solid rgba(200,169,110,0.1)", borderBottomColor: "rgba(200,169,110,0.45)", animation: "spinR 2.2s linear infinite" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>✦</div>
                  </div>
              }
              <div style={{ fontSize: "17px", color: C("#e040fb", "#f0d89a"), fontWeight: C("800", "400"), textTransform: C("uppercase", "none"), marginBottom: "8px" }}>{loadMsg}</div>
              <div style={{ fontSize: "13px", color: "rgba(232,220,200,0.38)", marginBottom: "32px" }}>
                {loadPhase === "script"
                  ? C("Writing your personalised battle speech...", "Writing your personalised hypnotic script...")
                  : C("Converting to audio in your coach voice...", "Converting to audio in your hypnosis voice...")}
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "100px", height: C("5px", "3px"), overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: theme.progressGrad, borderRadius: "100px", transition: "width 0.6s ease" }} />
              </div>
              <div style={{ fontSize: "11px", color: C("rgba(224,64,251,0.45)", "rgba(200,169,110,0.45)"), fontFamily: "monospace" }}>{progress}%</div>
            </div>
          )}
 
          {/* ── STEP 4: RESULT ── */}
          {step === 4 && (
            <div style={{ animation: "fadeUp 0.6s ease both" }}>
              <MilestoneToast count={newStreak} />
 
              {error ? (
                <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.2)", marginBottom: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
                  <div style={{ fontSize: "14px", color: "#ff8a80", marginBottom: "12px" }}>{error}</div>
                  <button onClick={reset} style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", color: "#e8dcc8", fontSize: "13px" }}>Try Again</button>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: "center", marginBottom: "22px" }}>
                    <div style={{ fontSize: C("40px", "28px"), marginBottom: "10px", animation: C("hypePulse 1s ease-in-out infinite", "none") }}>{C("🔥", "✦")}</div>
                    <div style={{ fontSize: "19px", color: C("#e040fb", "#f0d89a"), fontWeight: C("800", "400"), textTransform: C("uppercase", "none"), marginBottom: "5px" }}>
                      {C("Your hype audio is ready!", "Your personalised audio is ready")}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(232,220,200,0.35)" }}>
                      {selectedTone?.emoji} {selectedTone?.label} · Mood {mood}/10{moment ? ` · ${MOMENTS.find(m => m.id === moment)?.label}` : ""}
                    </div>
                  </div>
 
                  <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: "15px", padding: "24px 26px", marginBottom: "14px", maxHeight: "280px", overflowY: "auto" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: theme.label, marginBottom: "14px", fontFamily: "monospace" }}>
                      {C("🔥 YOUR COACH SCRIPT", "◆ YOUR PERSONALISED SCRIPT")}
                    </div>
                    <TypedText text={script} isHype={isHype} />
                  </div>
 
                  {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnd} />}
 
                  <div style={{ background: "rgba(255,255,255,0.022)", border: `1px solid ${C("rgba(224,64,251,0.13)", "rgba(200,169,110,0.13)")}`, borderRadius: "13px", padding: "16px 20px", marginBottom: "12px" }}>
                    <WaveformVisualizer active={playing} theme={theme} />
                    {playing && (
                      <div style={{ textAlign: "center", marginTop: "10px" }}>
                        <div style={{ fontSize: "12px", color: C("rgba(224,64,251,0.7)", "rgba(200,169,110,0.65)"), fontFamily: "monospace", marginBottom: "3px" }}>
                          {fmt(timer)} — {C("Coach session in progress 💪", "Session in progress")}
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(232,220,200,0.28)", fontStyle: C("normal", "italic") }}>
                          {C("Feel it. Believe it. OWN it.", "Close your eyes. Breathe slowly. Let the words reach you.")}
                        </div>
                      </div>
                    )}
                  </div>
 
                  <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                    <button onClick={togglePlay} disabled={!audioUrl} style={{ flex: 1, padding: "15px", borderRadius: "12px", background: audioUrl ? theme.btnGrad : "rgba(255,255,255,0.04)", color: audioUrl ? theme.btnText : "rgba(232,220,200,0.3)", fontSize: "15px", fontWeight: "800", letterSpacing: C("0.05em", "0.03em"), textTransform: C("uppercase", "none"), animation: !playing && isHype && audioUrl ? "hypePulse 1.8s ease-in-out infinite" : "none" }}>
                      {playing ? C("⏸ PAUSE", "⏸ Pause") : C("🔥 PLAY MY HYPE AUDIO", "▶ Play My Audio")}
                    </button>
                    {audioUrl && (
                      <a href={audioUrl} download="my-session.mp3" style={{ padding: "15px 16px", borderRadius: "12px", border: `1px solid ${C("rgba(224,64,251,0.3)", "rgba(200,169,110,0.3)")}`, color: theme.accent, fontSize: "18px", display: "flex", alignItems: "center", textDecoration: "none" }} title="Download audio">⬇</a>
                    )}
                    <button onClick={reset} style={{ padding: "15px 16px", borderRadius: "12px", border: `1px solid ${C("rgba(224,64,251,0.16)", "rgba(200,169,110,0.16)")}`, color: "rgba(232,220,200,0.4)", fontSize: "14px" }}>↩</button>
                  </div>
 
                  <div style={{ padding: "13px 16px", borderRadius: "11px", background: "rgba(255,255,255,0.025)", border: `1px solid ${C("rgba(224,64,251,0.1)", "rgba(200,169,110,0.1)")}`, marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "13px", color: "rgba(232,220,200,0.5)" }}>
                      🔥 <strong style={{ color: C("#e040fb", "#f0d89a") }}>{streak} day{streak !== 1 ? "s" : ""}</strong> — come back tomorrow to keep your streak
                    </div>
                    {streak >= 7 && <div style={{ fontSize: "18px" }}>⚡</div>}
                  </div>
 
                  <div style={{ padding: "15px 18px", borderRadius: "12px", border: `1px solid ${theme.tagBorder}`, background: theme.tagBg, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "13px", color: C("#e040fb", "#f0d89a"), marginBottom: "3px", fontWeight: C("700", "400") }}>
                        {C("⚡ Get daily sessions", "🎧 Get the full experience")}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(232,220,200,0.35)", lineHeight: 1.6 }}>Full audio experience · Binaural music · 30-day programme</div>
                    </div>
                    <button style={{ padding: "9px 14px", borderRadius: "9px", background: C("rgba(224,64,251,0.11)", "rgba(200,169,110,0.11)"), border: `1px solid ${C("rgba(224,64,251,0.3)", "rgba(200,169,110,0.22)")}`, color: theme.label, fontSize: "12px", whiteSpace: "nowrap", fontWeight: C("700", "400") }}>
                      Join Waitlist →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
 
          <div style={{ textAlign: "center", marginTop: "48px", fontSize: "10px", color: "rgba(232,220,200,0.12)", letterSpacing: "0.15em", fontFamily: "monospace" }}>
            {C("🔥  YOU'VE GOT THIS  🔥", "✦  REPROGRAMMING THE SUBCONSCIOUS  ✦")}
          </div>
        </div>
      </div>
    </>
  );
}
 
