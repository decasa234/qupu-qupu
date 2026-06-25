// SEAMO-X 2022 Paper A Q11 — animated explainer.
// Drives beat-by-beat chain-substitution through the 4 animal balance scales.
// Beat 0: intro (all neutral) → Beat 1: scale 1 lit → Beat 2: scale 2 lit
//   → Beat 3: scale 3 lit → Beat 4: scale 4 lit (result).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AnimalScalesX22A11 } from './AnimalScalesX22A11Illustration'
import { buildAnimalScalesX22A11Steps } from './animalScalesX22A11Steps'

const BLUE     = '#30598A'
const BLUE_BG  = '#E1EFFB'
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'

export default function AnimalScalesX22A11Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildAnimalScalesX22A11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 1 kelinci = 3 tupai = 6 burung = 12 anak ayam.'
      : 'Explainer: 1 rabbit = 3 squirrels = 6 birds = 12 chicks.'

  return (
    <div className="mx-auto w-full max-w-[660px]" role="img" aria-label={ariaLabel}>
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

        {/* four scales with per-beat dimming */}
        <motion.div
          key={`scales-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="w-full"
        >
          <AnimalScalesX22A11 litScale={beat.litScale} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="min-h-[44px] w-full max-w-[560px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
