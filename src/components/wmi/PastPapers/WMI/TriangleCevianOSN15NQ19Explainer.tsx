// OSN-15-SD-NAS-Q19 — animated angle-chase explainer
//
// Reuses PT vertex coords from the Illustration as shared layout constants.
// Beats animate angle arcs and colour highlights beat-by-beat (useBeatControl).
//
// Beat 0 — intro:     static figure, state conditions
// Beat 1 — name-β:   arc β at B (orange), arc ∠CAB at A (blue)
// Beat 2 — angle-C:  also show arc ∠ACB at C (purple)
// Beat 3 — isosceles: highlight equal arcs at A (∠CAD) and D (∠CDA) in teal
// Beat 4 — result:   arc ∠BAD at A in green

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PT, SVG_W, SVG_H } from './TriangleCevianOSN15NQ19Illustration'
import { buildCevianOSN15NQ19Steps } from './triangleCevianOSN15NQ19Steps'

// ── colours ───────────────────────────────────────────────────────────────
const INK    = '#1F2937'
const BLUE   = '#2563EB'
const ORANGE = '#EA580C'
const PURPLE = '#7C3AED'
const TEAL   = '#0D9488'
const GREEN  = '#10B981'
const TICK   = '#DC2626'

// ── arc helper ────────────────────────────────────────────────────────────
/**
 * SVG arc path (A command) between two angles in degrees from +x-axis.
 * In SVG (y-down) increasing angle goes clockwise → use sweep=1 for clockwise.
 */
function arcPath(cx: number, cy: number, r: number, a1deg: number, a2deg: number, sweep = 1) {
  const r2d = Math.PI / 180
  const x1 = cx + r * Math.cos(a1deg * r2d)
  const y1 = cy + r * Math.sin(a1deg * r2d)
  const x2 = cx + r * Math.cos(a2deg * r2d)
  const y2 = cy + r * Math.sin(a2deg * r2d)
  const large = Math.abs(a2deg - a1deg) > 180 ? 1 : 0
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

// Pre-computed angles (degrees from +x, y-down SVG coords) for the β=45° figure:
// A=(130,75), B=(30,175), C=(230,175), D=(89,175)
//
//   At B:  BC→0°, BA→−45°
//   At A:  AC→45°, AD→≈112.3°, AB→135°
//   At C:  CD→180°, CA→225°
//   At D:  DC→0°, DA→≈−67.7°(=292.3°) i.e. DA is at 180°+arctan(100/41)≈247.7° from D…
//          From D=(89,175) to A=(130,75): Δx=41,Δy=−100 → atan2(−100,41)≈−67.7°
const ANG = {
  // at A
  AC: 45,      // direction from A to C
  AD: 112.3,   // direction from A to D
  AB: 135,     // direction from A to B
  // at B
  BC:   0,     // direction from B to C
  BA: -45,     // direction from B to A
  // at C
  CD: 180,     // direction from C to D
  CA: 225,     // direction from C to A (= 180+45)
  // at D
  DC:   0,     // direction from D to C
  DA: -67.7,   // direction from D to A
} as const

// ── tick mark (static, reused) ────────────────────────────────────────────
function TickMark({ x1, y1, x2, y2, len = 6 }: { x1: number; y1: number; x2: number; y2: number; len?: number }) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1; const dy = y2 - y1
  const d = Math.sqrt(dx * dx + dy * dy)
  const px = -dy / d; const py = dx / d
  return (
    <line x1={mx + px * len} y1={my + py * len} x2={mx - px * len} y2={my - py * len}
      stroke={TICK} strokeWidth={2} strokeLinecap="round" />
  )
}

// ── default export ────────────────────────────────────────────────────────

export default function TriangleCevianOSN15NQ19Explainer({
  lang = 'id',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const { A, B, C, D } = PT
  const storyboard = useMemo(() => buildCevianOSN15NQ19Steps(lang), [lang])
  const { steps, finalIndex } = storyboard
  const holds = useMemo(() => steps.map((s) => s.hold), [steps])

  const beatIndex = useBeatControl(finalIndex, {
    step, playing, onStepCount, onStepChange, onPlayEnd,
    holds,
  })

  const beat = steps[Math.min(beatIndex, finalIndex)]
  const triPts = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(300, SVG_W)} style={{ display: 'block' }}>
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* base triangle */}
        <polygon points={triPts} fill="#EFF6FF" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        {/* cevian AD */}
        <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} stroke={INK} strokeWidth={2} />

        {/* equal-side ticks */}
        <TickMark x1={A.x} y1={A.y} x2={C.x} y2={C.y} />
        <TickMark x1={C.x} y1={C.y} x2={D.x} y2={D.y} />

        {/* ── animated angle arcs ── */}
        <AnimatePresence>

          {/* β at B (orange) */}
          {beat.showBeta && (
            <motion.path key="beta"
              d={arcPath(B.x, B.y, 24, ANG.BA, ANG.BC)}
              fill="none" stroke={ORANGE} strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* ∠CAB at A (blue) — full arc from AC to AB */}
          {beat.showAlpha && (
            <motion.path key="alpha"
              d={arcPath(A.x, A.y, 26, ANG.AC, ANG.AB)}
              fill="none" stroke={BLUE} strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* ∠ACB at C (purple) */}
          {beat.showGammaC && (
            <motion.path key="gammaC"
              d={arcPath(C.x, C.y, 24, ANG.CD, ANG.CA)}
              fill="none" stroke={PURPLE} strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* isosceles: ∠CAD at A and ∠CDA at D (teal arcs) */}
          {beat.showIsosceles && (
            <>
              <motion.path key="cad"
                d={arcPath(A.x, A.y, 32, ANG.AC, ANG.AD)}
                fill="none" stroke={TEAL} strokeWidth={2.5} strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.path key="cda"
                d={arcPath(D.x, D.y, 22, ANG.DA, ANG.DC)}
                fill="none" stroke={TEAL} strokeWidth={2.5} strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
              {/* double-tick on equal arcs label */}
              <motion.text key="iso-lbl"
                x={A.x - 18} y={A.y + 38}
                fontSize={11} fill={TEAL} fontWeight={700}
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                22.5°+β
              </motion.text>
            </>
          )}

          {/* ∠BAD at A (green) — the answer */}
          {beat.showResult && (
            <>
              <motion.path key="bad"
                d={arcPath(A.x, A.y, 28, ANG.AD, ANG.AB)}
                fill="none" stroke={GREEN} strokeWidth={3} strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.text key="bad-lbl"
                x={A.x - 22} y={A.y + 52}
                fontSize={13} fill={GREEN} fontWeight={800}
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ delay: 0.35 }}
              >
                22.5°
              </motion.text>
            </>
          )}
        </AnimatePresence>

        {/* vertex labels */}
        {(['A', 'B', 'D', 'C'] as const).map((v) => {
          const offsets: Record<string, { dx: number; dy: number }> = {
            A: { dx: 0, dy: -10 },
            B: { dx: -12, dy: 5 },
            D: { dx: 0, dy: 16 },
            C: { dx: 12, dy: 5 },
          }
          const p = PT[v]
          const o = offsets[v]
          return (
            <text key={v}
              x={p.x + o.dx} y={p.y + o.dy}
              textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {v}
            </text>
          )
        })}
      </svg>

      {/* equation + caption */}
      <AnimatePresence mode="wait">
        <motion.div key={beat.phase}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-1 px-3"
        >
          {beat.equation && (
            <p className={`font-mono text-sm font-bold ${beat.result ? 'text-emerald-600' : 'text-blue-700'}`}>
              {beat.equation}
            </p>
          )}
          <p className="text-center text-sm text-gray-600">{beat.caption}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
