// PolygonSidesTIMO22P1Q18Explainer — TIMO 2022 Heat Primary-1 Q18
// Animates counting each of the 18 sides, one beat per side.
//
// Beat scheme (see polygonSidesTIMO22P1Q18Steps.ts):
//   0. intro  — polygon shown, no markings.
//   1–18. side-N — highlight side N (red), keep counted sides (blue).
//   19. result  — all 18 sides green; answer = 18.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  PolygonShape,
  VERTICES,
  SVG_W,
  SVG_H,
  COLOR,
} from './PolygonSidesTIMO22P1Q18Illustration'
import { buildPolygonSidesTIMO22P1Q18Steps } from './polygonSidesTIMO22P1Q18Steps'
import type { Lang } from './polygonSidesTIMO22P1Q18Steps'

const GREEN   = '#10B981'
const ORANGE  = '#F59E0B'
const CURRENT = '#EF4444'
const DONE    = '#93C5FD'
const INK     = COLOR.LABEL

/**
 * Midpoint of edge i (0-based) plus a 20px offset along the outward
 * edge normal (derived from clockwise polygon winding).
 * Normal = rotate edge direction 90° CW → (dy, -dx).
 */
function edgeLabelPos(i: number): { x: number; y: number } {
  const n = VERTICES.length
  const a = VERTICES[i]
  const b = VERTICES[(i + 1) % n]
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  // Outward normal for CW polygon
  const nx = dy
  const ny = -dx
  const len = Math.sqrt(nx * nx + ny * ny) || 1
  const r = 20
  return { x: mx + (nx / len) * r, y: my + (ny / len) * r }
}

// Pre-compute all 18 label positions (SSR-safe, constant)
const LABEL_POS = Array.from({ length: 18 }, (_, i) => edgeLabelPos(i))

export default function PolygonSidesTIMO22P1Q18Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const steps = useMemo(
    () => buildPolygonSidesTIMO22P1Q18Steps(lang as Lang),
    [lang],
  )
  const finalIndex = steps.length - 1
  const holds = useMemo(() => steps.map((s) => s.hold || 1600), [steps])

  const beat = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds,
  })

  const current = steps[beat] ?? steps[0]
  const { highlightSide, count, caption, result } = current
  const n = VERTICES.length // 18

  // Which sides to render and in what color
  const isAllResult = highlightSide === 18

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* SVG */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        xmlns="http://www.w3.org/2000/svg"
      >
        <PolygonShape />

        <AnimatePresence>
          {Array.from({ length: n }, (_, i) => {
            const isDone    = !isAllResult && highlightSide >= 0 && i < highlightSide
            const isCurrent = !isAllResult && highlightSide === i
            const visible   = isAllResult || isDone || isCurrent
            if (!visible) return null

            const a = VERTICES[i]
            const b = VERTICES[(i + 1) % n]
            const color = isAllResult ? GREEN : isCurrent ? CURRENT : DONE
            const sw    = isCurrent || isAllResult ? 4.5 : 3
            const lp    = LABEL_POS[i]

            return (
              <motion.g
                key={`side-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ transformOrigin: `${(a.x + b.x) / 2}px ${(a.y + b.y) / 2}px` }}
              >
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={color}
                  strokeWidth={sw}
                  strokeLinecap="round"
                />
                <circle cx={lp.x} cy={lp.y} r={10} fill={color} />
                <text
                  x={lp.x}
                  y={lp.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#fff"
                >
                  {i + 1}
                </text>
              </motion.g>
            )
          })}
        </AnimatePresence>
      </svg>

      {/* Running count badge */}
      <AnimatePresence mode="wait">
        {count > 0 && (
          <motion.div
            key={`count-${count}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <span className="text-base font-semibold" style={{ color: INK }}>
              {lang === 'en' ? 'Sides counted:' : 'Sisi terhitung:'}
            </span>
            <span
              className="text-xl font-bold px-3 py-0.5 rounded-full"
              style={{ background: result ? GREEN : ORANGE, color: '#fff' }}
            >
              {count}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step caption */}
      <p
        className="text-sm text-center max-w-xs leading-snug"
        style={{ color: INK }}
      >
        {caption}
      </p>

      {/* Answer reveal */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 px-5 py-2 rounded-xl font-bold text-lg text-white"
          style={{ background: GREEN }}
        >
          {lang === 'en' ? 'Answer: 18 sides' : 'Jawaban: 18 sisi'}
        </motion.div>
      )}
    </div>
  )
}
