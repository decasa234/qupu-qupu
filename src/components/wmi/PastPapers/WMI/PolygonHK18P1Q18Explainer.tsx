// HKIMO-18-P1H-Q18 — post-answer animation.
// Reuses HexagonShape and vertex constants from the illustration so the
// animation reads as the static polygon coming alive.
//
// Animation beats (see polygonHK18P1Q18Steps.ts):
//   0. intro   — show the polygon.
//   1-6. side  — highlight each side one by one, counting up.
//   7. result  — all 6 sides lit, answer box shows "6".

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  HexagonShape,
  SIDES,
  SVG_W,
  SVG_H,
  COLOR,
} from './PolygonHK18P1Q18Illustration'
import { buildPolygonHK18P1Q18Steps } from './polygonHK18P1Q18Steps'
import type { Lang } from './polygonHK18P1Q18Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const ORANGE = '#F59E0B'
const INK    = COLOR.LABEL

// Colours for each counted side (1-indexed)
const SIDE_COLORS = [
  '#3B82F6', // 1 – blue
  '#8B5CF6', // 2 – violet
  '#EC4899', // 3 – pink
  '#F97316', // 4 – orange
  '#10B981', // 5 – green
  '#EF4444', // 6 – red
]

// ── sub-component: a single highlighted side ──────────────────────────────────

function SideLine({
  from, to, color, index,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  index: number
}) {
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2

  // Offset the label slightly outward from the shape centre (SVG centre ≈ 110,90)
  const cx = SVG_W / 2
  const cy = SVG_H / 2
  const dx = midX - cx
  const dy = midY - cy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const lx = midX + (dx / len) * 18
  const ly = midY + (dy / len) * 18

  return (
    <motion.g
      key={`side-${index}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <line
        x1={from.x} y1={from.y}
        x2={to.x}   y2={to.y}
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={lx} cy={ly} r={10} fill={color} />
      <text
        x={lx} y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
        fill="#fff"
      >
        {index}
      </text>
    </motion.g>
  )
}

// ── Explainer component ───────────────────────────────────────────────────────

export default function PolygonHK18P1Q18Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const steps = useMemo(
    () => buildPolygonHK18P1Q18Steps(lang as Lang),
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

  // Which sides to display — 0 = none, 1..6 = just that side, 7 = all
  const activeSides: number[] = highlightSide === 0
    ? []
    : highlightSide === 7
      ? [1, 2, 3, 4, 5, 6]
      : [highlightSide]

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* SVG figure */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base polygon (always visible) */}
        <HexagonShape />

        {/* Highlighted sides */}
        <AnimatePresence>
          {activeSides.map((sideNum) => {
            const [from, to] = SIDES[sideNum - 1]
            return (
              <SideLine
                key={`side-${sideNum}`}
                from={from}
                to={to}
                color={SIDE_COLORS[sideNum - 1]}
                index={sideNum}
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
            <span
              className="text-base font-semibold"
              style={{ color: INK }}
            >
              {lang === 'en' ? 'Sides counted:' : 'Sisi terhitung:'}
            </span>
            <span
              className="text-xl font-bold px-3 py-0.5 rounded-full"
              style={{
                background: result ? GREEN : ORANGE,
                color: '#fff',
              }}
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
          {lang === 'en' ? 'Answer: 6 sides' : 'Jawaban: 6 sisi'}
        </motion.div>
      )}
    </div>
  )
}
