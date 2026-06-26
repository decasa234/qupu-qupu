// OSN-24-SD-NAS-TEORI1-Q11 — animated explainer.
// Reuses geometry constants from the illustration (VERTS, VERTEX_A/B/C, makeAngleArc).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  VERTS,
  VERTEX_A,
  VERTEX_B,
  VERTEX_C,
  makeAngleArc,
} from './OctagonAngleOSN24NT1Q11Illustration'
import { buildOctagonAngleSteps } from './octagonAngleOSN24NT1Q11Steps'

const GREEN = '#16A34A'
const BLUE = '#1E40AF'
const AMBER = '#D97706'

export default function OctagonAngleOSN24NT1Q11Explainer(props: ExplainerProps) {
  const { lang = 'id', step, playing, onStepCount, onStepChange, onPlayEnd } = props

  const story = useMemo(
    () => buildOctagonAngleSteps((lang ?? 'id') as 'en' | 'id'),
    [lang],
  )
  const { steps, finalIndex } = story
  const beat = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: steps.map((s) => s.hold),
  })
  const b = steps[beat] ?? steps[finalIndex]
  const isResult = b.showResult

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: BLUE, color: BLUE }

  // Geometry
  const poly = VERTS.map(([x, y]) => `${x},${y}`).join(' ')
  const [Ax, Ay] = VERTEX_A // v7: upper-left
  const [Bx, By] = VERTEX_B // v4: bottom
  const [Cx, Cy] = VERTEX_C // v2: right
  const arcMarkPath = makeAngleArc(VERTEX_C, VERTEX_A, VERTEX_B, 20)

  // Highlighted path from A → v6 → v5 → B (3 edges, not through C)
  const [v6x, v6y] = VERTS[6] // left (180°)
  const [v5x, v5y] = VERTS[5] // lower-left (225°)
  const edgePts = `${Ax},${Ay} ${v6x},${v6y} ${v5x},${v5y} ${Bx},${By}`

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="flex flex-col items-center gap-3">
        {/* Figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="white" />

          {/* Octagon */}
          <polygon points={poly} fill="#FEF3C7" stroke={AMBER} strokeWidth={2.5} />

          {/* Triangle ACB sides */}
          <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke="#475569" strokeWidth={1.5} />
          <line x1={Cx} y1={Cy} x2={Ax} y2={Ay} stroke="#475569" strokeWidth={1.5} />
          <line x1={Cx} y1={Cy} x2={Bx} y2={By} stroke="#475569" strokeWidth={1.5} />

          {/* Beat 1+: highlighted 3 edges from A to B not through C */}
          <AnimatePresence>
            {b.showEdges && (
              <motion.polyline
                key="edges"
                points={edgePts}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          {/* Beat 1: "3 × 45°" label near the highlighted edges */}
          <AnimatePresence>
            {b.showEdges && (
              <motion.text
                key="arcLabel"
                x={40}
                y={175}
                fontSize={11}
                fontWeight="bold"
                fill="#92400E"
                textAnchor="middle"
                dominantBaseline="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {lang === 'id' ? '3 langkah' : '3 steps'}
              </motion.text>
            )}
          </AnimatePresence>

          {/* Beat 2: inscribed-angle formula in SVG */}
          <AnimatePresence>
            {b.showFormula && (
              <motion.text
                key="formula"
                x={SVG_W / 2}
                y={SVG_H - 16}
                fontSize={12}
                fontWeight="bold"
                fill="#7C3AED"
                textAnchor="middle"
                dominantBaseline="middle"
                initial={{ opacity: 0, y: SVG_H - 8 }}
                animate={{ opacity: 1, y: SVG_H - 16 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {lang === 'id' ? '∠ACB = busur ÷ 2' : '∠ACB = arc ÷ 2'}
              </motion.text>
            )}
          </AnimatePresence>

          {/* Angle arc at C (always shown) */}
          <path d={arcMarkPath} fill="none" stroke={GREEN} strokeWidth={2} />

          {/* Angle label at C: "?" or result */}
          <AnimatePresence mode="wait">
            {isResult ? (
              <motion.text
                key="answer"
                x={213}
                y={148}
                fontSize={12}
                fontWeight="bold"
                fill={GREEN}
                textAnchor="middle"
                dominantBaseline="middle"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                67,5°
              </motion.text>
            ) : (
              <motion.text
                key="unknown"
                x={215}
                y={147}
                fontSize={11}
                fontWeight="bold"
                fill={GREEN}
                textAnchor="middle"
                dominantBaseline="middle"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                ?
              </motion.text>
            )}
          </AnimatePresence>

          {/* Vertex labels */}
          <text x={Ax - 16} y={Ay - 10} fontSize={14} fontWeight="bold" fill={BLUE} textAnchor="middle">
            A
          </text>
          <text x={Bx} y={By + 22} fontSize={14} fontWeight="bold" fill={BLUE} textAnchor="middle">
            B
          </text>
          <text x={Cx + 16} y={Cy + 5} fontSize={14} fontWeight="bold" fill={BLUE} textAnchor="middle">
            C
          </text>
        </svg>

        {/* Equation pill */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {b.equation !== '' && (
              <motion.span
                key={b.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {b.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {b.caption}
        </div>
      </div>
    </div>
  )
}
