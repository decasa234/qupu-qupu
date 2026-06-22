import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DogToys12Scales } from './DogToys12ECIllustration'
import { buildDogToys12Steps, DOG_TOY_ANSWER_EN, DOG_TOY_ANSWER_ID } from './dogToys12ECSteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function DogToys12ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDogToys12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Timbangan 1 menunjukkan mainan < 12 kg; Timbangan 2 menunjukkan mainan > 10 kg. Karena berat harus bilangan bulat, satu-satunya kandidat adalah ${DOG_TOY_ANSWER_ID}.`
      : `Explainer: Scale 1 shows toy < 12 kg; Scale 2 shows toy > 10 kg. Since the weight must be a whole number, the only candidate is ${DOG_TOY_ANSWER_EN}.`

  return (
    <div className="mx-auto w-full max-w-[640px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* inequality badge */}
        {beat.inequality ? (
          <motion.div
            key={`ineq-${index}`}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="rounded-full px-4 py-1 text-sm font-extrabold"
            style={
              beat.result
                ? { background: GREEN, color: '#FFFFFF' }
                : { background: '#FFFFFF', border: `2px solid ${BLUE}`, color: BLUE }
            }
          >
            {beat.inequality}
          </motion.div>
        ) : (
          <div className="h-8" />
        )}

        {/* The two scales, spotlight on the active one */}
        <motion.div
          key={`scales-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          <DogToys12Scales litScale={beat.litScale} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
