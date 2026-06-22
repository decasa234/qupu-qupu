// IKMC-23-EC-Q2 — Explainer: "What is the value of each ? coin?"
//
// Pattern: BallScales8ECExplainer (equation badge + primitive spotlighting + caption box).
// Imports the CoinRow2EC primitive from CoinScale2ECIllustration.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CoinRow2EC } from './CoinScale2ECIllustration'
import { buildCoinScale2ECSteps } from './coinScale2ECSteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function CoinScale2ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCoinScale2ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Jumlahkan koin yang diketahui 20+10+10+1=41. Selisih 51−41=10 dibagi 2 menghasilkan 5. Jawaban C.'
      : 'Explainer: Sum known coins 20+10+10+1=41. Gap 51−41=10 divided by 2 gives 5. Answer C.'

  return (
    <div className="mx-auto w-full max-w-[720px]" role="img" aria-label={ariaLabel}>
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

        {/* coin row, spotlight on active coins */}
        <motion.div
          key={`coins-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          <CoinRow2EC spotlight={beat.spotlight} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] w-full max-w-[520px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
