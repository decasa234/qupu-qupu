// SEAMOX-24-A-Q18 — animated explainer.
//
// Beat-by-beat walk through: count levels (5), multiply by 2 flights (10),
// multiply by 90 s (900 s), convert to minutes (15 min).
//
// Imports layout primitives from the illustration (SSR-safe). Animation via
// framer-motion (matches house style of ClimbStairs22A15Explainer).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  FLOOR_COUNT,
  C,
  floorLineY,
  stairPoints,
} from './DonStairsX24A18Illustration'
import { buildDonStairsX24A18Steps } from './donStairsX24A18Steps'

const GREEN  = '#10B981'
const BLUE   = '#2C7BE5'
const ORANGE = '#D97706'

// ── PersonGlyph ───────────────────────────────────────────────────────────────

function PersonGlyph({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g stroke="none">
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <line
        x1={cx} y1={cy + 5} x2={cx} y2={cy + 15}
        stroke={color} strokeWidth={2.5} strokeLinecap="round"
      />
    </g>
  )
}

// ── HouseGlyph ────────────────────────────────────────────────────────────────

function HouseGlyph({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const r = 9
  return (
    <g>
      <polygon
        points={`${cx - r},${cy} ${cx},${cy - r * 0.85} ${cx + r},${cy}`}
        fill={color}
        strokeLinejoin="round"
      />
      <rect
        x={cx - r * 0.55} y={cy}
        width={r * 1.1} height={r * 0.85}
        fill={color} rx={1}
      />
    </g>
  )
}

// ── FlightCountBadge — floats at the midpoint of each highlighted stair segment ──

function FlightCountBadge({
  f,
  color,
  label,
}: {
  f: number
  color: string
  label: string
}) {
  // Badge sits at the mid-x of the landing (x=35) and mid-y of the level gap
  const yBot = floorLineY(f)
  const yMid = yBot - 18   // half-gap
  const bx = 42
  const by = yMid

  return (
    <g>
      <rect
        x={bx - 1} y={by - 7}
        width={14} height={14}
        rx={3}
        fill={color}
        opacity={0.9}
      />
      <text
        x={bx + 6}
        y={by}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={800}
        fill="#FFFFFF"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function DonStairsX24A18Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildDonStairsX24A18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult  = beat.result
  const hlColor   = isResult ? GREEN : BLUE
  const hlSet     = new Set(beat.highlightFloors)

  // Determine what label to show on stair badges per beat
  const badgeLabel = ((): string => {
    switch (beat.phase) {
      case 'flights':  return '×2'
      case 'seconds':  return '90s'
      case 'result':   return '✓'
      default:         return ''
    }
  })()

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN,  color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,   color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? '5 level × 2 penerbangan × 90 detik = 900 detik = 15 menit'
      : '5 levels × 2 flights × 90 s = 900 s = 15 min'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Building figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: 'block', maxWidth: SVG_W + 32 }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* Floor slab lines */}
          {Array.from({ length: FLOOR_COUNT }, (_, i) => {
            const f = i + 1
            return (
              <line
                key={f}
                x1={0} y1={floorLineY(f)} x2={SVG_W * 0.55} y2={floorLineY(f)}
                stroke={C.FLOOR_LINE} strokeWidth={1.5}
              />
            )
          })}

          {/* Staircase segments */}
          {Array.from({ length: FLOOR_COUNT - 1 }, (_, i) => {
            const f = i + 1
            const isHl = hlSet.has(f)
            return (
              <polyline
                key={f}
                points={stairPoints(f)}
                fill="none"
                stroke={isHl ? hlColor : C.STAIR_STROKE}
                strokeWidth={isHl ? 2.5 : 1.5}
                strokeLinejoin="round"
              />
            )
          })}

          {/* Flight count / time badges on highlighted segments */}
          <AnimatePresence>
            {badgeLabel !== '' &&
              Array.from(hlSet).map((f) => (
                <motion.g
                  key={`badge-${f}-${beat.phase}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20, delay: f * 0.05 }}
                >
                  <FlightCountBadge f={f} color={isResult ? GREEN : ORANGE} label={badgeLabel} />
                </motion.g>
              ))}
          </AnimatePresence>

          {/* Floor labels */}
          {Array.from({ length: FLOOR_COUNT }, (_, i) => {
            const f = i + 1
            const labelY =
              f < FLOOR_COUNT
                ? (floorLineY(f) + floorLineY(f + 1)) / 2
                : floorLineY(FLOOR_COUNT) - 16
            const color =
              f === 1
                ? C.LABEL_DON
                : f === FLOOR_COUNT
                ? C.LABEL_HOME
                : C.LABEL_NORM
            return (
              <text
                key={f}
                x={60}
                y={labelY}
                fontSize={12}
                fontWeight={600}
                fill={color}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                dominantBaseline="central"
              >
                {`F${f}${f === FLOOR_COUNT ? '  ← Home' : f === 1 ? '  ← Don' : ''}`}
              </text>
            )
          })}

          {/* Don glyph */}
          <PersonGlyph
            cx={20}
            cy={floorLineY(1) + 22}
            color={isResult ? GREEN : C.LABEL_DON}
          />

          {/* Home glyph */}
          <HouseGlyph
            cx={20}
            cy={floorLineY(FLOOR_COUNT) - 16}
            color={isResult ? GREEN : C.LABEL_HOME}
          />
        </svg>

        {/* Equation pill */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
