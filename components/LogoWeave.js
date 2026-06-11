// components/LogoWeave.js
// The creation animation: the RewireMode mark draws itself together,
// pathway by pathway, violet → blue → cyan — then breathes while the
// real generation completes. No spinners, ever.

import { useEffect, useRef } from 'react'

const RINGS = { A: [52, 168], B: [124, 92], C: [218, 40], D: [294, 216], E: [332, 92], F: [386, 160] }
const SHARP = { v1: [168, 208], v2: [262, 152] }
const EDGES = [
  { from: RINGS.A, to: RINGS.B, c: '#6C4BE0' },
  { from: RINGS.B, to: SHARP.v1, c: '#664FE2' },
  { from: SHARP.v1, to: RINGS.C, c: '#5B6BE5' },
  { from: RINGS.C, to: SHARP.v2, c: '#4F82E7' },
  { from: RINGS.C, to: RINGS.D, c: '#4A8FE8' },
  { from: SHARP.v2, to: RINGS.E, c: '#44A8EC' },
  { from: RINGS.D, to: RINGS.E, c: '#41B4EE' },
  { from: RINGS.E, to: RINGS.F, c: '#3EC1F0' },
]
const NODE_AT = [
  { n: RINGS.A, i: 0, c: '#6C4BE0' }, { n: RINGS.B, i: 0, c: '#6850E1' },
  { n: RINGS.C, i: 2, c: '#5B6BE5' }, { n: RINGS.D, i: 4, c: '#46A0EA' },
  { n: RINGS.E, i: 5, c: '#41B4EE' }, { n: RINGS.F, i: 7, c: '#3EC1F0' },
]
const STAG = 0.52, DUR = 1.0, RING_R = 10, RING_W = 4.5

export default function LogoWeave({ width = 'min(360px, 82vw)' }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const NS = 'http://www.w3.org/2000/svg'
    svg.innerHTML = ''
    const group = document.createElementNS(NS, 'g')
    svg.appendChild(group)

    EDGES.forEach((e, i) => {
      const l = document.createElementNS(NS, 'line')
      l.setAttribute('x1', e.from[0]); l.setAttribute('y1', e.from[1])
      l.setAttribute('x2', e.to[0]); l.setAttribute('y2', e.to[1])
      l.setAttribute('stroke', e.c); l.setAttribute('stroke-width', '7')
      l.setAttribute('stroke-linecap', 'round')
      const len = Math.hypot(e.to[0] - e.from[0], e.to[1] - e.from[1])
      l.style.strokeDasharray = len
      l.style.strokeDashoffset = len
      l.style.transition = `stroke-dashoffset ${DUR}s ${0.4 + i * STAG}s cubic-bezier(0.22,1,0.36,1)`
      group.appendChild(l)
      requestAnimationFrame(() => requestAnimationFrame(() => { l.style.strokeDashoffset = 0 }))
    })

    NODE_AT.forEach(({ n, i, c }) => {
      const halo = document.createElementNS(NS, 'circle')
      halo.setAttribute('cx', n[0]); halo.setAttribute('cy', n[1]); halo.setAttribute('r', RING_R + 9)
      halo.setAttribute('fill', 'none'); halo.setAttribute('stroke', c)
      halo.setAttribute('stroke-width', '1'); halo.setAttribute('opacity', '0')
      const ring = document.createElementNS(NS, 'circle')
      ring.setAttribute('cx', n[0]); ring.setAttribute('cy', n[1]); ring.setAttribute('r', RING_R)
      ring.setAttribute('fill', '#05070F'); ring.setAttribute('stroke', c)
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
