// SEAMO-X 2024 Paper A Q7 — animated explainer.
// Beat 0: intro (square idle) → Beat 1: highlight sides + 4 × 16 = 64 cm
//   → Beat 2: remaining = 98 − 64 = 34 cm ✓

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { WireSquareX24A7 } from './WireSquareX24A7Illustration'
import { buildWireSquareX24A7Steps } from './wireSquareX24A7Steps'

const BLUE     = '#2563EB'
const BLUE_BG  = '#DBEAFE'
const BLUE_INK = '#1E3A8A'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'

export default function WireSquareX24A7Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildWireSquareX24A7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: keliling persegi = 4 × 16 = 64 cm; sisa kawat = 98 − 64 = 34 cm.'
      : 'Explainer: square perimeter = 4 × 16 = 64 cm; remaining wire = 98 − 64 = 34 cm.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* equation badge */}
        {beat.equation ? (
          <motion.div
            key={`eq-${index}`}
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="rounded-full px-5 py-1 text-sm font-extrabold tabular-nums"
            style={
              beat.result
                ? { background: GREEN, color: '#FFFFFF' }
                : { background: '#FFFFFF', border: `2px solid ${BLUE}`, color: BLUE }
            }
          >
            {beat.equation}
          </motion.div>
        ) : (
          <div className="h-8" />
        )}

        {/* square diagram with per-beat phase */}
        <motion.div
          key={`sq-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="w-full"
        >
          <WireSquareX24A7 phase={beat.squarePhase} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="min-h-[44px] w-full max-w-[360px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE_INK }
          }
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
