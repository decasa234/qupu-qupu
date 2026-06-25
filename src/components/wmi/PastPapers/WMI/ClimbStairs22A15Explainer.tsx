// SEAMO-22-A-Q15 — animated explainer.
//
// Beat-by-beat walk through the Fibonacci recurrence to count ways to climb
// a 5-step staircase taking 1 or 2 steps at a time. Answer: B (8).
//
// Imports the staircase primitive from the illustration (SSR-safe, no hooks).
// Animation uses framer-motion (matches house style of Staircase1PEExplainer).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  StaircaseGrid5,
  StepLabel,
  SVG_W,
  SVG_H,
  STEP_COUNT,
} from './ClimbStairs22A15Illustration'
import { buildClimbStairs22A15Steps } from './climbStairs22A15Steps'

const GREEN = '#10B981'
const BLUE  = '#30598A'

// ── ways(n) label badge above each highlighted step ──────────────────────────

function WaysLabel({ step, value, color }: { step: number; value: number; color: string }) {
  // StepLabel renders inside the riser; WaysLabel floats above the tread.
  // We need stepTread to position it — import inline to keep this file lean.
  // Re-derive: PAD.left=24, TREAD_W=48, STEP_COUNT=5, PAD.top=24, RISER_H=32.
  const PAD_LEFT = 24, TREAD_W = 48, RISER_H = 32, PAD_TOP = 24
  const x = PAD_LEFT + (step - 1) * TREAD_W
  const y = PAD_TOP  + (STEP_COUNT - step) * RISER_H
  const cx = x + TREAD_W / 2
  const ty = y - 10   // just above the tread

  return (
    <g>
      <circle cx={cx} cy={ty} r={11} fill={color} />
      <text
        x={cx}
        y={ty}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={800}
        fill="#FFFFFF"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {value}
      </text>
    </g>
  )
}

// ── Fibonacci values for each step ───────────────────────────────────────────
const FIB: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 8 }

// ── Main explainer component ──────────────────────────────────────────────────

export default function ClimbStairs22A15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildClimbStairs22A15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const hlColor  = isResult ? GREEN : BLUE
  const hlSet    = new Set(beat.highlightSteps)

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola Fibonacci cara(1)=1, cara(2)=2, cara(3)=3, cara(4)=5, cara(5)=8; jawaban B.'
      : 'Explainer: Fibonacci pattern ways(1)=1, ways(2)=2, ways(3)=3, ways(4)=5, ways(5)=8; answer B.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H + 20}`}
          width="100%"
          style={{ display: 'block', maxWidth: SVG_W + 48 }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H + 20} fill="white" />

          {/* staircase grid with optional step highlights */}
          <StaircaseGrid5
            highlightSteps={hlSet.size > 0 ? hlSet : undefined}
            highlightColor={hlColor}
          />

          {/* step number labels inside risers for highlighted steps */}
          {Array.from(hlSet).map((n) => (
            <StepLabel key={n} step={n} color={hlColor} />
          ))}

          {/* Fibonacci value badges above highlighted steps */}
          <AnimatePresence>
            {Array.from(hlSet).map((n) => (
              <motion.g
                key={`fib-${n}-${beat.phase}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20, delay: n * 0.06 }}
              >
                <WaysLabel step={n} value={FIB[n]} color={isResult && n === 5 ? GREEN : BLUE} />
              </motion.g>
            ))}
          </AnimatePresence>
        </svg>

        {/* equation row */}
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

        {/* caption */}
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
