// components/NeuralField.js
// The ambient neural constellation — the brand's living background.
// Slow, sparse, intentional. Respects prefers-reduced-motion.
//
// Props:
//   intensity: 'landing' (brighter, with firing pulses) | 'ambient' (dimmer, default)
//   opacity:   overall canvas opacity (default 0.55)

import { useEffect, useRef } from 'react'

export default function NeuralField({ intensity = 'ambient', opacity = 0.55 }) {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const x = c.getContext('2d')
    const bright = intensity === 'landing'
    let W, H, nodes = [], pulses = [], last = 0, raf

    function size() {
      const dpr = window.devicePixelRatio || 1
      W = c.width = window.innerWidth * dpr
      H = c.height = window.innerHeight * dpr
      c.style.width = window.innerWidth + 'px'
      c.style.height = window.innerHeight + 'px'
      const count = Math.min(bright ? 70 : 46, Math.floor(window.innerWidth / (bright ? 22 : 30)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * (bright ? 0.07 : 0.05) * dpr,
        vy: (Math.random() - 0.5) * (bright ? 0.07 : 0.05) * dpr,
        r: (Math.random() * 1 + 0.5) * dpr,
      }))
    }
    size()
    window.addEventListener('resize', size)

    const dpr = window.devicePixelRatio || 1
    const LINK = (bright ? 150 : 130) * dpr
    const lineAlpha = bright ? 0.14 : 0.08
    const dotAlpha = bright ? 0.5 : 0.35

    function frame(t) {
      const dt = Math.min(t - last, 50); last = t
      x.clearRect(0, 0, W, H)
      for (const n of nodes) {
        n.x += n.vx * dt; n.y += n.vy * dt
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < LINK) {
          x.strokeStyle = `rgba(146,168,255,${(1 - d / LINK) * lineAlpha})`
          x.lineWidth = dpr * 0.5
          x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke()
          if (bright && Math.random() < 0.00012 * dt && pulses.length < 5) pulses.push({ a, b, p: 0 })
        }
      }
      for (const n of nodes) {
        x.fillStyle = `rgba(169,196,255,${dotAlpha})`
        x.beginPath(); x.arc(n.x, n.y, n.r, 0, 7); x.fill()
      }
      pulses = pulses.filter(p => p.p < 1)
      for (const p of pulses) {
        p.p += dt * 0.0009
        const px = p.a.x + (p.b.x - p.a.x) * p.p, py = p.a.y + (p.b.y - p.a.y) * p.p
        const g = x.createRadialGradient(px, py, 0, px, py, 9 * dpr)
        g.addColorStop(0, 'rgba(77,141,255,0.9)'); g.addColorStop(1, 'rgba(77,141,255,0)')
        x.fillStyle = g; x.beginPath(); x.arc(px, py, 9 * dpr, 0, 7); x.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size) }
  }, [intensity])

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, opacity, pointerEvents: 'none' }} aria-hidden="true" />
}
