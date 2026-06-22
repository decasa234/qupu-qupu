// IKMC-21-PE-Q9 — animated explainer for the cat-path problem.
//
// Reuses the wall-path layout and CatGlyph from CatPath9PEIllustration.
// One new segment is highlighted per beat, with a running distance total.
// On the result beat, all walked segments flash green and the cat is shown at D.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '@/components/wmi/concepts/explainers/registry'
import { useBeatControl } from '@/components/wmi/concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  RECT,
  COLOR,
  POINTS,
  CatGlyph,
} from './CatPath9PEIllustration'
import {
  buildCatPath9PESteps,
  type PointName,
  type Segment,
} from './catPath9PESteps'

// ── Colours ──────────────────────────────────────────────────────────────────

const GREEN  = '#10B981'
const BLUE   = '#1D4ED8'
const ORANGE = '#F59E0B'

// ── Helpers ───────────────────────────────────────────────────────────────────

const R = RECT

function segmentKey(s: Segment, i: number) {
  return `${s.from}-${s.to}-${i}`
}

/** SVG line coords for a segment between two named points. */
function segCoords(from: PointName, to: PointName): { x1: number; y1: number; x2: number; y2: number } {
  const [x1, y1] = POINTS[from]
  const [x2, y2] = POINTS[to]
  return { x1, y1, x2, y2 }
}

// ── Segment highlight (animated stroke) ──────────────────────────────────────

function SegmentLine({
  from,
  to,
  color,
  width,
  animated,
}: {
  from: PointName
  to: PointName
  color: string
  width: number
  animated: boolean
}) {
  const { x1, y1, x2, y2 } = segCoords(from, to)
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
      animate={animated ? { pathLength: 1, opacity: 1 } : { opacity: animated ? 0 : 0.6 }}
      transition={animated ? { duration: 0.5, ease: 'easeOut' } : undefined}
    />
  )
}

// ── Running total badge ───────────────────────────────────────────────────────

function TotalBadge({ total, color }: { total: number; color: string }) {
  const cx = R.x + R.w / 2
  const cy = R.y + R.h / 2

  return (
    <g>
      <circle cx={cx} cy={cy} r={26} fill={color} opacity={0.92} />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {total} m
      </text>
      <text
        x={cx}
        y={cy + 11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={700}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        total
      </text>
    </g>
  )
}

// ── Point labels ──────────────────────────────────────────────────────────────

const LABEL_OFF: Record<string, [number, number]> = {
  A: [-14, 12],
  B: [0, 14],
  C: [10, 12],
  D: [12, 0],
  E: [-14, -8],
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function CatPath9PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCatPath9PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : BLUE

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Rose berjalan B→C (4m) →D (1m) →E (5m) →A (2m) →B (3m) →C (4m) →D (1m) = 20m. Jawaban: D.'
      : 'Explainer: Rose walks B→C (4m) →D (1m) →E (5m) →A (2m) →B (3m) →C (4m) →D (1m) = 20m. Answer: D.'

  // Figure out which walked segments to show (the beat tracks them)
  // walkedSegments is the ordered list of segments walked (may repeat)
  const walked = beat.walkedSegments

  // The newest (active) segment index within walked
  const newestIdx = walked.length - 1

  // Cat position
  const [catX, catY] = beat.catAt ? POINTS[beat.catAt] : POINTS['B']

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(320, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* Background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* Wall rectangle */}
          <rect
            x={R.x} y={R.y} width={R.w} height={R.h}
            fill={COLOR.WALL_FILL}
            stroke={COLOR.WALL}
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* Previously walked segments (faded) */}
          {walked.slice(0, -1).map((seg, i) => (
            <SegmentLine
              key={segmentKey(seg, i)}
              from={seg.from}
              to={seg.to}
              color={isResult ? GREEN : ORANGE}
              width={5}
              animated={false}
            />
          ))}

          {/* Newest (active) segment — animated in */}
          {walked.length > 0 && (
            <AnimatePresence>
              <motion.g key={`seg-${newestIdx}-${beat.total}`}>
                <SegmentLine
                  from={walked[newestIdx].from}
                  to={walked[newestIdx].to}
                  color={isResult ? GREEN : BLUE}
                  width={6}
                  animated={!isResult}
                />
              </motion.g>
            </AnimatePresence>
          )}

          {/* Running total badge (centre of rect) */}
          {beat.total > 0 && (
            <AnimatePresence mode="wait">
              <motion.g
                key={beat.total}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <TotalBadge total={beat.total} color={isResult ? GREEN : BLUE} />
              </motion.g>
            </AnimatePresence>
          )}

          {/* Point dots */}
          {Object.entries(POINTS).map(([name, [px, py]]) => (
            <circle
              key={name}
              cx={px}
              cy={py}
              r={5}
              fill={name === beat.catAt ? (isResult ? GREEN : COLOR.START) : COLOR.POINT}
              stroke="white"
              strokeWidth={1.5}
            />
          ))}

          {/* Point labels */}
          {Object.entries(POINTS).map(([name, [px, py]]) => {
            const [ox, oy] = LABEL_OFF[name] ?? [0, 10]
            const isActive = name === beat.catAt
            return (
              <text
                key={`lbl-${name}`}
                x={px + ox}
                y={py + oy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={900}
                fill={isActive ? (isResult ? GREEN : BLUE) : COLOR.POINT_LABEL}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {name}
              </text>
            )
          })}

          {/* Cat — follows the current position */}
          {(() => {
            // Place cat slightly above the point dot
            return <CatGlyph cx={catX} cy={catY - 22} r={12} />
          })()}
        </svg>

        {/* Equation row */}
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
                style={{ background: accentColor }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
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
