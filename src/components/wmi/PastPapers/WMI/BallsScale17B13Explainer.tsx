// SEAMO-17-B-Q13 — Explainer: "What must be added to balance Fig. 3?"
//
// Pattern: BallScales8ECExplainer — spotlight one scale, equation badge, caption.
// Imports BallsScale17B13 primitive from BallsScale17B13Illustration.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BallsScale17B13 } from './BallsScale17B13Illustration'
import { buildBallsScale17B13Steps } from './ballsScale17B13Steps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function BallsScale17B13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBallsScale17B13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Dari Gambar 1 diperoleh 5A=3B. Dari Gambar 2 diperoleh nilai C. Gambar 3 tidak seimbang — tambahkan 2C ke piring kanan. Jawaban B.'
      : 'Explainer: Fig. 1 gives 5A=3B. Fig. 2 gives C in terms of A and B. Fig. 3 is unbalanced — add 2C to the right pan. Answer B.'

  return (
    <div className="mx-auto w-full max-w-[760px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* equation badge */}
        {beat.equation ? (
          <motion.div
            key={`eq-${index}`}
            initial={{ scale: 0.78, opacity: 0 }}
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

        {/* Three scales, spotlight on the active one */}
        <motion.div
          key={`scales-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          <BallsScale17B13 litScale={beat.litScale} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] w-full max-w-[540px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
