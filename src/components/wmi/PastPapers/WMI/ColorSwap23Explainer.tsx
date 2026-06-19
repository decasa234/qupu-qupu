import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  GridStrip,
} from './ColorSwap23Illustration'
import { buildColorSwap23Steps, type CellColor } from './colorSwap23Steps'

// IKMC-19-PE-Q23 — post-answer animation.
// Reuses the GridStrip primitive from the illustration so the animation
// reads as the static scene coming alive step by step.
//
// Animation beats:
//   0. intro  — starting grid; state the three rules.
//   1. ani    — grid after Ani swaps black→white.
//   2. bob    — grid after Bob swaps grey→black.
//   3. chris  — grid after Chris swaps white→grey. Final grid shown.
//   4. result — final grid in green; "= D".

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'

// ── phase colour for the equation pill ───────────────────────────────────────
function phaseColor(phase: string, isResult: boolean): string {
  if (isResult) return GREEN
  if (phase === 'ani') return BLUE
  if (phase === 'bob') return ORANGE
  if (phase === 'chris') return GREEN
  return BLUE
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function ColorSwap23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildColorSwap23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const pillColor = phaseColor(beat.phase, isResult)
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Ani (hitam→putih), Bob (abu-abu→hitam), Chris (putih→abu-abu). Kisi akhir cocok dengan jawaban D.'
      : 'Explainer: Ani (black→white), Bob (grey→black), Chris (white→grey). Final grid matches answer D.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* animated grid figure */}
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          >
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              width={Math.min(320, SVG_W)}
              style={{ display: 'block' }}
              aria-hidden="true"
            >
              {/* white background */}
              <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
              {/* animated grid */}
              <GridStrip cells={beat.cells as CellColor[]} />
              {/* green outline on result beat */}
              {isResult && (
                <rect
                  x={1}
                  y={1}
                  width={SVG_W - 2}
                  height={SVG_H - 2}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={3}
                  rx={6}
                />
              )}
            </svg>
          </motion.div>
        </AnimatePresence>

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
                style={{ background: pillColor }}
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
