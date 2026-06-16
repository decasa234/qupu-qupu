import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ClothingPrices25G1 } from './ClothingPrices25G1Illustration'
import { buildClothingPricesSteps } from './clothingPrices25G1Steps'

// WMI-25F1A-Q2 post-answer animation. Teaches the method, not just the answer:
// the four product prices are 11, 17, 20, 9. One pair differs by $8 — the
// storyboard first lights the shoes $17 & socks $9 (17 − 9 = 8), then turns to
// the OTHER two (the leftovers): the hat $11 & bag $20, whose difference 20 − 11
// = 9 is the answer (choice C). It walks the deduction beat by beat and never
// jumps straight to 9.

// qupu colour tokens echoed as hex, matching the static illustration.
const BLUE = '#30598A' // qupu-brand-blue (setup + the $8 pair beat)
const ORANGE = '#f0853a' // qupu-brand-orange (the "other two" call-out)
const GREEN = '#10B981'
const GREEN_DK = '#065F46'
const GREEN_FILL = '#D1FAE5'

export default function ClothingPrices25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildClothingPricesSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: two prices are $8 apart — the shoes $17 and socks $9 (17 − 9 = 8). The OTHER two prices left over are the hat $11 and the bag $20, so their difference is 20 − 11 = ${story.answer}.`,
    `Strategi: dua harga selisihnya $8 — sepatu $17 dan kaus kaki $9 (17 − 9 = 8). DUA harga yang tersisa adalah topi $11 dan tas $20, jadi selisihnya 20 − 11 = ${story.answer}.`,
  )

  // Caption box: blue on goal + the $8 pair, orange on the "other two" pick,
  // green on the result.
  const captionStyle = beat.result
    ? { background: GREEN_FILL, borderColor: GREEN, color: GREEN_DK }
    : beat.phase === 'other'
      ? { background: '#FFF1E5', borderColor: ORANGE, color: '#B5530F' }
      : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // The big number call-out: the $8 pair's difference is blue, the answer green.
  const valueColor = beat.result ? GREEN : BLUE

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The static product row coming alive — prices light up in pairs. */}
        <motion.div
          key={index}
          initial={{ opacity: 0.7, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="w-full"
        >
          <ClothingPrices25G1 litPair={beat.lit} />
        </motion.div>

        {/* The subtraction result, called out big on the $8 pair and the answer. */}
        {beat.value != null && (
          <motion.div
            key={`v-${beat.value}-${beat.result ? 'r' : 'c'}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: valueColor }}
          >
            {beat.value}
          </motion.div>
        )}

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
