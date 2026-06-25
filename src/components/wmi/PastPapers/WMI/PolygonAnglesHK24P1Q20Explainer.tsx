// PolygonAnglesHK24P1Q20Explainer — HKIMO 2024 Heat Primary-1 Q20
//
// Animates counting each of the 12 interior angles of the polygon one by one.
// Each beat highlights the current vertex/angle; past angles stay coloured;
// the final beat shows all 12 lit with the answer "12".
//
// Copy-adapted from PolygonAnglesHK20P1Q19Explainer.

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
} from './PolygonAnglesHK24P1Q20Illustration'
import { buildPolygonAnglesHK24P1Q20Steps } from './polygonAnglesHK24P1Q20Steps'
import type { Lang } from './polygonAnglesHK24P1Q20Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const ORANGE = '#F59E0B'
const INK    = COLOR.LABEL

const VERTEX_COLORS = [
  '#3B82F6', // 1  – blue
  '#8B5CF6', // 2  – violet
  '#EC4899', // 3  – pink
  '#F97316', // 4  – orange
  '#EF4444', // 5  – red    (reflex notch)
  '#10B981', // 6  – green
  '#0EA5E9', // 7  – sky
  '#A855F7', // 8  – purple
  '#F59E0B', // 9  – amber
  '#DC2626', // 10 – crimson (reflex step)
  '#14B8A6', // 11 – teal
  '#6366F1', // 12 – indigo
]

// ── Draw a small arc wedge at a polygon vertex marking the interior angle ─────
// prev → vertex → next (all clockwise). We draw a small filled wedge.

function AngleMark({
  vertex,
  prev,
  next,
  color,
  index,
}: {
  vertex: { x: number; y: number }
  prev:   { x: number; y: number }
  next:   { x: number; y: number }
  color: string
  index: number
}) {
  const R = 13 // arc radius

  // Unit vectors from vertex toward each neighbour
  const dp = { x: prev.x - vertex.x, y: prev.y - vertex.y }
  const dn = { x: next.x - vertex.x, y: next.y - vertex.y }
  const lp = Math.sqrt(dp.x * dp.x + dp.y * dp.y) || 1
  const ln = Math.sqrt(dn.x * dn.x + dn.y * dn.y) || 1
  const up = { x: dp.x / lp, y: dp.y / lp }
  const un = { x: dn.x / ln, y: dn.y / ln }

  // Arc endpoint coordinates
  const ax = vertex.x + up.x * R
  const ay = vertex.y + up.y * R
  const bx = vertex.x + un.x * R
  const by = vertex.y + un.y * R

  // Cross product to determine sweep direction
  const cross = dp.x * dn.y - dp.y * dn.x
  const sweep = cross < 0 ? 1 : 0

  const arcPath = `M ${ax} ${ay} A ${R} ${R} 0 0 ${sweep} ${bx} ${by} L ${vertex.x} ${vertex.y} Z`

  // Label position: bisector direction
  const bx2 = up.x + un.x
  const by2 = up.y + un.y
  const bl = Math.sqrt(bx2 * bx2 + by2 * by2) || 1
  const labelDist = R + 11
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
      <circle cx={lx} cy={ly} r={8} fill={color} />
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight="bold"
        fill="#fff"
      >
        {index}
      </text>
    </motion.g>
  )
}

// ── Explainer component ───────────────────────────────────────────────────────

export default function PolygonAnglesHK24P1Q20Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const steps = useMemo(
    () => buildPolygonAnglesHK24P1Q20Steps(lang as Lang),
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

  // Which vertices to show: 0 = none, 1–12 = single, 13 = all
  const activeVertices: number[] =
    highlightVertex === 0
      ? []
      : highlightVertex === 13
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        : [highlightVertex]

  const n = VERTICES.length // 12

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* SVG figure */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        xmlns="http://www.w3.org/2000/svg"
      >
        <PolygonShape />

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
          {lang === 'en' ? 'Answer: 12 interior angles' : 'Jawaban: 12 sudut dalam'}
        </motion.div>
      )}
    </div>
  )
}
