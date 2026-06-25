// HKIMO-20-P1H-Q19 — post-answer animation.
// Reuses HeptagonShape and vertex constants from the illustration so the
// animation reads as the static polygon coming alive.
//
// Animation beats (see polygonAnglesHK20P1Q19Steps.ts):
//   0. intro     — show the polygon.
//   1–7. angle-N — highlight each vertex/angle one by one, counting up.
//   8. result    — all 7 angles lit, answer box shows "7".

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  HeptagonShape,
  VERTICES,
  SVG_W,
  SVG_H,
  COLOR,
} from './PolygonAnglesHK20P1Q19Illustration'
import { buildPolygonAnglesHK20P1Q19Steps } from './polygonAnglesHK20P1Q19Steps'
import type { Lang } from './polygonAnglesHK20P1Q19Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const ORANGE = '#F59E0B'
const INK    = COLOR.LABEL

const VERTEX_COLORS = [
  '#3B82F6', // 1 – blue
  '#8B5CF6', // 2 – violet
  '#EC4899', // 3 – pink
  '#F97316', // 4 – orange
  '#10B981', // 5 – green
  '#EF4444', // 6 – red
  '#0EA5E9', // 7 – sky
]

// ── Draw a small arc at a polygon vertex marking the interior angle ───────────
// prev → vertex → next (all clockwise). We draw a small filled wedge.

function AngleMark({
  vertex,
  prev,
  next,
  color,
  index,
}: {
  vertex: { x: number; y: number }
  prev: { x: number; y: number }
  next: { x: number; y: number }
  color: string
  index: number
}) {
  const R = 14 // arc radius

  // Unit vectors from vertex toward each neighbour
  const dp = { x: prev.x - vertex.x, y: prev.y - vertex.y }
  const dn = { x: next.x - vertex.x, y: next.y - vertex.y }
  const lp = Math.sqrt(dp.x * dp.x + dp.y * dp.y) || 1
  const ln = Math.sqrt(dn.x * dn.x + dn.y * dn.y) || 1
  const up = { x: dp.x / lp, y: dp.y / ln }
  const un = { x: dn.x / ln, y: dn.y / ln }

  // Arc endpoint coordinates
  const ax = vertex.x + up.x * R
  const ay = vertex.y + up.y * R
  const bx = vertex.x + un.x * R
  const by = vertex.y + un.y * R

  // Cross product to determine sweep direction (1 = counter-clockwise arc)
  const cross = dp.x * dn.y - dp.y * dn.x
  const sweep = cross < 0 ? 1 : 0

  const arcPath = `M ${ax} ${ay} A ${R} ${R} 0 0 ${sweep} ${bx} ${by} L ${vertex.x} ${vertex.y} Z`

  // Label position: midpoint of arc (bisector direction)
  const bx2 = up.x + un.x
  const by2 = up.y + un.y
  const bl = Math.sqrt(bx2 * bx2 + by2 * by2) || 1
  const labelDist = R + 12
  const lx = vertex.x + (bx2 / bl) * labelDist
  const ly = vertex.y + (by2 / bl) * labelDist

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      style={{ transformOrigin: `${vertex.x}px ${vertex.y}px` }}
    >
      <path d={arcPath} fill={color} opacity={0.55} />
      <circle cx={lx} cy={ly} r={9} fill={color} />
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
        fill="#fff"
      >
        {index}
      </text>
    </motion.g>
  )
}

// ── Explainer component ───────────────────────────────────────────────────────

export default function PolygonAnglesHK20P1Q19Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const steps = useMemo(
    () => buildPolygonAnglesHK20P1Q19Steps(lang as Lang),
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
  const { highlightVertex, count, caption, result } = current

  // Which vertices to show: 0 = none, 1–7 = single, 8 = all
  const activeVertices: number[] = highlightVertex === 0
    ? []
    : highlightVertex === 8
      ? [1, 2, 3, 4, 5, 6, 7]
      : [highlightVertex]

  const n = VERTICES.length // 7

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* SVG figure */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        xmlns="http://www.w3.org/2000/svg"
      >
        <HeptagonShape />

        <AnimatePresence>
          {activeVertices.map((vNum) => {
            const vi = vNum - 1 // 0-indexed
            const vertex = VERTICES[vi]
            const prev   = VERTICES[(vi - 1 + n) % n]
            const next   = VERTICES[(vi + 1) % n]
            return (
              <AngleMark
                key={`angle-${vNum}`}
                vertex={vertex}
                prev={prev}
                next={next}
                color={VERTEX_COLORS[vi]}
                index={vNum}
              />
            )
          })}
        </AnimatePresence>
      </svg>

      {/* Count badge */}
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
              {lang === 'en' ? 'Angles counted:' : 'Sudut terhitung:'}
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

      {/* Caption */}
      <p
        className="text-sm text-center max-w-xs leading-snug"
        style={{ color: INK }}
      >
        {caption}
      </p>

      {/* Answer box */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 px-5 py-2 rounded-xl font-bold text-lg text-white"
          style={{ background: GREEN }}
        >
          {lang === 'en' ? 'Answer: 7 interior angles' : 'Jawaban: 7 sudut dalam'}
        </motion.div>
      )}
    </div>
  )
}
