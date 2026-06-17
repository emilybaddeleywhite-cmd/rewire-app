// components/LogoWeave.js
// The creation animation: the RewireMode mark draws itself together,
// pathway by pathway, violet → blue → cyan — then breathes while the
// real generation completes. No spinners, ever.
//
// Geometry traced directly from the real RewireMode logo: a six-node crown
// (W) with two triangular "ears" and a single crossing diagonal through the
// centre. Coordinates are measured node centres mapped into the viewBox.

import { useEffect, useRef } from 'react'

// Six ring nodes (matches the logo's six circles), left → right.
const N = {
  A: [53, 154],  // far left
  B: [124, 96],  // left peak
  C: [208, 36],  // centre top (tallest)
  D: [265, 224], // centre bottom (lowest)
  E: [318, 96],  // right peak
  F: [367, 154], // far right
}
// Left valley — a bare vertex where the strokes meet (no ring, like the logo).
const LV = [146, 187]

// Drawn in order, left → right. The LV→E diagonal crosses C→D in the centre.
const EDGES = [
  { from: N.A, to: N.B },
  { from: N.A, to: LV },
  { from: N.B, to: LV },
  { from: LV, to: N.C },
  { from: N.C, to: N.D },
  { from: LV, to: N.E },   // crossing diagonal
  { from: N.D, to: N.E },
  { from: N.E, to: N.F },
  { from: N.F, to: N.D },
]

// Rings appear shortly after the strokes that reach them.
const NODE_AT = [
  { n: N.A, i: 0 }, { n: N.B, i: 1 }, { n: N.C, i: 3 },
  { n: N.D, i: 4 }, { n: N.E, i: 6 }, { n: N.F, i: 7 },
]

const STAG = 0.32, DUR = 0.8, RING_R = 11, RING_W = 5.5, STROKE_W = 8
const GRAD = 'url(#rwGrad)'

export default function LogoWeave({ width = 'min(360px, 82vw)' }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const NS = 'http://www.w3.org/2000/svg'
    svg.innerHTML = ''

    // gradient: violet (left) → blue → cyan (right), across the whole mark
    const defs = document.createElementNS(NS, 'defs')
    const grad = document.createElementNS(NS, 'linearGradient')
    grad.setAttribute('id', 'rwGrad')
    grad.setAttribute('gradientUnits', 'userSpaceOnUse')
    grad.setAttribute('x1', '40'); grad.setAttribute('y1', '0')
    grad.setAttribute('x2', '380'); grad.setAttribute('y2', '0')
    ;[['0%', '#6C4BE0'], ['52%', '#4A8FE8'], ['100%', '#3EC1F0']].forEach(([o, c]) => {
      const s = document.createElementNS(NS, 'stop')
      s.setAttribute('offset', o); s.setAttribute('stop-color', c)
      grad.appendChild(s)
    })
    defs.appendChild(grad)
    svg.appendChild(defs)

    const group = document.createElementNS(NS, 'g')
    svg.appendChild(group)

    EDGES.forEach((e, i) => {
      const l = document.createElementNS(NS, 'line')
      l.setAttribute('x1', e.from[0]); l.setAttribute('y1', e.from[1])
      l.setAttribute('x2', e.to[0]); l.setAttribute('y2', e.to[1])
      l.setAttribute('stroke', GRAD); l.setAttribute('stroke-width', STROKE_W)
      l.setAttribute('stroke-linecap', 'round')
      const len = Math.hypot(e.to[0] - e.from[0], e.to[1] - e.from[1])
      l.style.strokeDasharray = len
      l.style.strokeDashoffset = len
      l.style.transition = `stroke-dashoffset ${DUR}s ${0.4 + i * STAG}s cubic-bezier(0.22,1,0.36,1)`
      group.appendChild(l)
      requestAnimationFrame(() => requestAnimationFrame(() => { l.style.strokeDashoffset = 0 }))
    })

    NODE_AT.forEach(({ n, i }) => {
      const halo = document.createElementNS(NS, 'circle')
      halo.setAttribute('cx', n[0]); halo.setAttribute('cy', n[1]); halo.setAttribute('r', RING_R + 9)
      halo.setAttribute('fill', 'none'); halo.setAttribute('stroke', GRAD)
      halo.setAttribute('stroke-width', '1'); halo.setAttribute('opacity', '0')
      const ring = document.createElementNS(NS, 'circle')
      ring.setAttribute('cx', n[0]); ring.setAttribute('cy', n[1]); ring.setAttribute('r', RING_R)
      ring.setAttribute('fill', '#05070F'); ring.setAttribute('stroke', GRAD)
      ring.setAttribute('stroke-width', RING_W)
      ring.style.opacity = 0
      ring.style.transformOrigin = `${n[0]}px ${n[1]}px`
      ring.style.transform = 'scale(0.4)'
      ring.style.transition = `opacity .5s ${0.55 + i * STAG}s ease, transform .7s ${0.55 + i * STAG}s cubic-bezier(0.22,1,0.36,1)`
      halo.style.transition = `opacity .6s ${0.7 + i * STAG}s ease`
      group.appendChild(halo); group.appendChild(ring)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        ring.style.opacity = 1; ring.style.transform = 'scale(1)'; halo.style.opacity = 0.35
      }))
    })

    // Once fully formed, the mark breathes — the honest "still creating" state.
    const formTime = (0.4 + EDGES.length * STAG + DUR) * 1000
    const t = setTimeout(() => {
      if (typeof group.animate === 'function') {
        group.animate(
          [
            { filter: 'drop-shadow(0 0 8px rgba(94,155,242,0.25))' },
            { filter: 'drop-shadow(0 0 18px rgba(94,155,242,0.55))' },
            { filter: 'drop-shadow(0 0 8px rgba(94,155,242,0.25))' },
          ],
          { duration: 3600, iterations: Infinity, easing: 'ease-in-out' }
        )
      }
    }, formTime)
    return () => clearTimeout(t)
  }, [])

  return <svg ref={svgRef} viewBox="0 0 420 260" style={{ width, height: 'auto', display: 'block' }} aria-label="Your Rewire is being created" />
}
