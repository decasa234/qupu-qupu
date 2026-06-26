import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  A, F, E, B, C, D,
  COLOR,
  RightAngle,
} from './PolygonAreaOSN20KQ9Illustration'
import { buildPolygonAreaOSN20KQ9Steps } from './polygonAreaOSN20KQ9Steps'

// OSN-20-SD-KAB-Q9 — animated explainer.
// Beats:
//   0. intro       — static scene with all labels, CD = ?
//   1. pythagorean — draw dashed EB, compute EB = 13
//   2. trapezoid   — highlight FABE, area = 171
//   3. remainder   — highlight BCDE, area = 195
//   4. solve-cd    — Shoelace → xD = 27 → CD = 13
//   5. result      — CD = 13 cm green label

const GREEN  = '#10b981'
const ORANGE = '#f97316'
const BLUE   = '#2563eb'
const INK    = COLOR.LABEL

// ── Polygon ABCDEF points string ─────────────────────────────────────────────
const POLY_POINTS = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y} ${E.x},${E.y} ${F.x},${F.y}`

// ── Trapezoid FABE points (left piece) ───────────────────────────────────────
const TRAP_POINTS = `${F.x},${F.y} ${A.x},${A.y} ${B.x},${B.y} ${E.x},${E.y}`

// ── Quadrilateral BCDE points (right piece) ──────────────────────────────────
const QUAD_POINTS = `${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y} ${E.x},${E.y}`

// ── Default export ────────────────────────────────────────────────────────────
export default function PolygonAreaOSN20KQ9Explainer({
  params,
  correctAnswer,
  lang = 'id',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const storyboard = useMemo(() => buildPolygonAreaOSN20KQ9Steps(lang), [lang])
  const { steps, finalIndex } = storyboard

  const holds = useMemo(() => steps.map(s => s.hold), [steps])

  const beatIndex = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount: count => onStepCount?.(count),
    onStepChange,
    onPlayEnd,
    holds,
  })

  const beat = steps[Math.min(beatIndex, finalIndex)]

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* base polygon (always visible) */}
        <polygon
          points={POLY_POINTS}
          fill={COLOR.FILL}
          stroke={COLOR.STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* trapezoid FABE highlight */}
        <AnimatePresence>
          {beat.showTrapezoid && (
            <motion.polygon
              key="trap"
              points={TRAP_POINTS}
              fill={ORANGE}
              fillOpacity={0.35}
              stroke={ORANGE}
              strokeWidth={2}
              initial={{ fillOpacity: 0 }}
              animate={{ fillOpacity: 0.35 }}
              exit={{ fillOpacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* right quadrilateral BCDE highlight */}
        <AnimatePresence>
          {beat.showRemainder && (
            <motion.polygon
              key="quad"
              points={QUAD_POINTS}
              fill={GREEN}
              fillOpacity={0.35}
              stroke={GREEN}
              strokeWidth={2}
              initial={{ fillOpacity: 0 }}
              animate={{ fillOpacity: 0.35 }}
              exit={{ fillOpacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* dashed EB line */}
        <AnimatePresence>
          {beat.showEB && (
            <motion.line
              key="eb"
              x1={E.x} y1={E.y}
              x2={B.x} y2={B.y}
              stroke={COLOR.DASHED}
              strokeWidth={2}
              strokeDasharray="5 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* right-angle markers (always) */}
        <RightAngle cx={F.x} cy={F.y} dx1={0} dy1={1} dx2={1} dy2={0} />
        <RightAngle cx={E.x} cy={E.y} dx1={-1} dy1={0} dx2={0} dy2={1} />

        {/* ── Dimension labels ─────────────────────────── */}
        {/* FA = 25 */}
        <text x={F.x - 14} y={(F.y + A.y) / 2} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif">25</text>

        {/* FE = 9 */}
        <text x={(F.x + E.x) / 2} y={F.y - 8} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif">9</text>

        {/* AB = 15 */}
        <text x={(A.x + B.x) / 2 - 10} y={(A.y + B.y) / 2} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif">15</text>

        {/* BC = 13 */}
        <text x={(B.x + C.x) / 2 + 11} y={(B.y + C.y) / 2} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={700} fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif">13</text>

        {/* EB label (when dashed line is shown) */}
        <AnimatePresence>
          {beat.showEB && (
            <motion.text
              key="eb-label"
              x={E.x + 8} y={(E.y + B.y) / 2}
              textAnchor="start" dominantBaseline="central"
              fontSize={11} fontWeight={700} fill={BLUE}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              13
            </motion.text>
          )}
        </AnimatePresence>

        {/* CD = ? or CD = 13 */}
        <AnimatePresence mode="wait">
          {beat.showAnswer ? (
            <motion.text
              key="cd-ans"
              x={(C.x + D.x) / 2} y={D.y + 14}
              textAnchor="middle" dominantBaseline="central"
              fontSize={13} fontWeight={900} fill={GREEN}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              13 cm
            </motion.text>
          ) : (
            <motion.text
              key="cd-q"
              x={(C.x + D.x) / 2} y={D.y + 14}
              textAnchor="middle" dominantBaseline="central"
              fontSize={13} fontWeight={900} fill={COLOR.QUESTION}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              ?
            </motion.text>
          )}
        </AnimatePresence>

        {/* ── Vertex labels ─────────────────────────────── */}
        {[
          { pt: F, label: 'F', dx: -10, dy: -2 },
          { pt: E, label: 'E', dx: 10,  dy: -2 },
          { pt: A, label: 'A', dx: -10, dy: 8  },
          { pt: B, label: 'B', dx: 10,  dy: 0  },
          { pt: C, label: 'C', dx: 0,   dy: 12 },
          { pt: D, label: 'D', dx: 10,  dy: 8  },
        ].map(({ pt, label, dx, dy }) => (
          <text
            key={label}
            x={pt.x + dx} y={pt.y + dy}
            textAnchor="middle" dominantBaseline="central"
            fontSize={12} fontWeight={700} fill={INK}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* ── Equation strip ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {beat.equation && (
          <motion.div
            key={beat.phase + '-eq'}
            className="rounded bg-slate-100 px-3 py-1 text-center font-mono text-xs font-semibold text-slate-700"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {beat.equation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Caption ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={beat.phase + '-cap'}
          className="max-w-xs text-center text-sm text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {beat.caption}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
