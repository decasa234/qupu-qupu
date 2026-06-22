import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BraidPrimitive,
  SVG_W,
  SVG_H,
  THREAD_GREEN,
  THREAD_BLUE,
  THREAD_RED,
} from './Braid8PEIllustration'
import { buildBraid8PESteps } from './braid8PESteps'

// IKMC-20-PE-Q8 — post-answer animation.
// Reuses the BraidPrimitive from the illustration so the animation reads as
// the static scene coming alive — one strand highlighted per beat.
//
// Answer D: 1=green, 2=blue, 3=red.

const GREEN  = '#10B981'
const BLUE   = '#30598A'

// ── Colour key strip shown during result beat ─────────────────────────────────

/**
 * A small horizontal legend: "1 ■ green | 2 ■ blue | 3 ■ red"
 * Only visible on the result beat.
 */
function ColorKey() {
  const entries = [
    { num: '1', label: 'green / hijau', fill: THREAD_GREEN },
    { num: '2', label: 'blue / biru',   fill: THREAD_BLUE  },
    { num: '3', label: 'red / merah',   fill: THREAD_RED   },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="flex items-center justify-center gap-4"
    >
      {entries.map(({ num, fill }) => (
        <span key={num} className="flex items-center gap-1">
          <span
            className="inline-block rounded-sm"
            style={{ width: 14, height: 14, background: fill }}
            aria-hidden="true"
          />
          <span
            className="font-display text-xs font-extrabold"
            style={{ color: '#1F2937' }}
          >
            {num}
          </span>
        </span>
      ))}
    </motion.div>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function Braid8PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildBraid8PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accentColor = isResult ? GREEN : beat.highlight === 'G' ? THREAD_GREEN : beat.highlight === 'B' ? THREAD_BLUE : beat.highlight === 'R' ? THREAD_RED : BLUE

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: telusuri setiap ekor bernomor — benang 1 berwarna hijau, benang 2 berwarna biru, benang 3 berwarna merah — jawaban D.'
      : 'Explainer: trace each numbered tail — thread 1 is green, thread 2 is blue, thread 3 is red — answer D.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.highlight ?? 'all'}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              width={Math.min(320, SVG_W)}
              style={{ display: 'block' }}
              aria-hidden="true"
            >
              <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
              <BraidPrimitive highlightStrand={beat.highlight} showNumbers={true} />
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* colour key — shown only on result beat */}
        <div className="flex min-h-[1.5rem] items-center justify-center">
          <AnimatePresence>
            {isResult && <ColorKey key="color-key" />}
          </AnimatePresence>
        </div>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
                style={{ background: isResult ? GREEN : accentColor }}
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
