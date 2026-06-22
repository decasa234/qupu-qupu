// IKMC-19-EC-Q20 — post-answer animation.
//
// Reuses the Z-shape polygon and midline constants from Hallway20ECIllustration
// so the animation reads as the static figure coming alive.
//
// Beat structure (5 beats, see hallway20ECSteps.ts):
//   0  intro   — static figure + full midline (dashed, dim), no highlight
//   1  seg1    — amber highlight on bottom-arm segment (36 m)
//   2  seg2    — amber highlight on vertical step segment (20 m)
//   3  seg3    — amber highlight on top-arm segment (27 m)
//   4  result  — all three segments in green + "36 + 20 + 27 = 83 m"

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  Z_POLY,
  SVG_W,
  SVG_H,
  COLOR,
  // midline waypoints
  ML_ENTRY_X, ML_ENTRY_Y,
  JCT_BOT_X,  JCT_BOT_Y,
  JCT_TOP_X,  JCT_TOP_Y,
  ML_EXIT_X,  ML_EXIT_Y,
} from './Hallway20ECIllustration'
import { buildHallway20ECSteps } from './hallway20ECSteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#30598A'
const AMBER  = '#F59E0B'

// ── figure dimensions for this explainer ─────────────────────────────────────
const FIG_W = Math.min(300, SVG_W)

// ── Segment path data (each as an SVG 'd' attribute) ─────────────────────────
// seg1: bottom horizontal — from left entry to bottom junction
const SEG1_D = `M ${ML_ENTRY_X} ${ML_ENTRY_Y} L ${JCT_BOT_X} ${JCT_BOT_Y}`
// seg2: vertical step — from bottom junction to top junction
const SEG2_D = `M ${JCT_BOT_X} ${JCT_BOT_Y} L ${JCT_TOP_X} ${JCT_TOP_Y}`
// seg3: top horizontal — from top junction to right exit
const SEG3_D = `M ${JCT_TOP_X} ${JCT_TOP_Y} L ${ML_EXIT_X} ${ML_EXIT_Y}`

// ── segment label positions (midpoint of each segment in SVG coords) ──────────
const SEG1_MID_X = (ML_ENTRY_X + JCT_BOT_X) / 2
const SEG1_MID_Y = ML_ENTRY_Y - 9   // above the bottom-arm midline
const SEG2_MID_X = JCT_BOT_X + 10  // to the right of the vertical step
const SEG2_MID_Y = (JCT_BOT_Y + JCT_TOP_Y) / 2
const SEG3_MID_X = (JCT_TOP_X + ML_EXIT_X) / 2
const SEG3_MID_Y = ML_EXIT_Y - 9   // above the top-arm midline

// ── SegmentLine sub-component ─────────────────────────────────────────────────

interface SegmentLineProps {
  d: string
  color: string
  labelX: number
  labelY: number
  label: string
}

function SegmentLine({ d, color, labelX, labelY, label }: SegmentLineProps) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10.5}
        fontWeight={800}
        fill={color}
        stroke="white"
        strokeWidth={3}
        paintOrder="stroke"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function Hallway20ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildHallway20ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult  = beat.isResult
  const accentCol = isResult ? GREEN : BLUE

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN,  color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,   color: BLUE      }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: jalur tengah koridor terdiri dari tiga ruas: 36 m (bawah) + 20 m (vertikal) + 27 m (atas) = 83 m — jawaban E.'
      : 'Explainer: the hallway midline has three segments: 36 m (bottom) + 20 m (vertical) + 27 m (top) = 83 m — answer E.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* Z-shape hallway fill */}
          <polygon
            points={Z_POLY}
            fill={COLOR.FILL}
            stroke={COLOR.STROKE}
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* dim base midline (always shown, grey) */}
          <path
            d={`M ${ML_ENTRY_X} ${ML_ENTRY_Y} L ${JCT_BOT_X} ${JCT_BOT_Y} L ${JCT_TOP_X} ${JCT_TOP_Y} L ${ML_EXIT_X} ${ML_EXIT_Y}`}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />

          {/* ── beat-driven segment highlights ── */}

          <AnimatePresence>
            {beat.highlight.seg1 && (
              <motion.g
                key="seg1"
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                style={{ transformOrigin: `${ML_ENTRY_X}px ${ML_ENTRY_Y}px` }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                <SegmentLine
                  d={SEG1_D}
                  color={isResult ? GREEN : AMBER}
                  labelX={SEG1_MID_X}
                  labelY={SEG1_MID_Y}
                  label="36 m"
                />
              </motion.g>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {beat.highlight.seg2 && (
              <motion.g
                key="seg2"
                initial={{ opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0 }}
                style={{ transformOrigin: `${JCT_BOT_X}px ${JCT_BOT_Y}px` }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                <SegmentLine
                  d={SEG2_D}
                  color={isResult ? GREEN : AMBER}
                  labelX={SEG2_MID_X}
                  labelY={SEG2_MID_Y}
                  label="20 m"
                />
              </motion.g>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {beat.highlight.seg3 && (
              <motion.g
                key="seg3"
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                style={{ transformOrigin: `${ML_EXIT_X}px ${ML_EXIT_Y}px` }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                <SegmentLine
                  d={SEG3_D}
                  color={isResult ? GREEN : AMBER}
                  labelX={SEG3_MID_X}
                  labelY={SEG3_MID_Y}
                  label="27 m"
                />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation pill */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation != null && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: accentCol }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
