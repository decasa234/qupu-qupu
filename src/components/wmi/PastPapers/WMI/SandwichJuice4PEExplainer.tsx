import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SandwichJuice4PE } from './SandwichJuice4PEIllustration'
import { buildSandwichJuiceSteps } from './sandwichJuice4PESteps'

// IKMC-22-PE-Q4 post-answer explainer.
//
// Strategy: show both orders side by side, spotlight the ONE extra juice in
// order 2, then compute 14 − 12 = 2 euro. Lands on the answer without ever
// stating it before the subtract beat.
//
// Adapted from ClothingPrices25G1Explainer (lit-pair animation pattern +
// big-number call-out + caption strip).

const BLUE     = '#30598A'
const ORANGE   = '#F0853A'
const GREEN    = '#10B981'
const GREEN_DK = '#065F46'
const GREEN_FILL = '#D1FAE5'

export default function SandwichJuice4PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSandwichJuiceSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: the second order has one extra juice and costs 2 euro more. So one juice costs 14 − 12 = ${story.juicePrice} euro — answer B.`,
    `Strategi: pesanan kedua punya satu jus tambahan dan harganya 2 euro lebih mahal. Jadi satu jus harganya 14 − 12 = ${story.juicePrice} euro — jawaban B.`,
  )

  // Caption colours: blue for setup/diff, orange for subtract, green for result.
  const captionStyle = beat.result
    ? { background: GREEN_FILL, borderColor: GREEN, color: GREEN_DK }
    : beat.phase === 'subtract'
      ? { background: '#FFF1E5', borderColor: ORANGE, color: '#B5530F' }
      : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const valueColor = beat.result ? GREEN : ORANGE

  // Answer label shown on the SVG once we reach the result beat.
  const answerLabel = beat.result
    ? T(`1 juice = ${story.juicePrice} €`, `1 jus = ${story.juicePrice} €`)
    : null

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The two-order diagram — juices light up on the diff/subtract beats. */}
        <motion.div
          key={index}
          initial={{ opacity: 0.75, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="w-full"
        >
          <SandwichJuice4PE litJuice={beat.litJuice} answerLabel={answerLabel} />
        </motion.div>

        {/* Big difference call-out on the subtract / result beats. */}
        {beat.value != null && (
          <motion.div
            key={`v-${beat.value}-${beat.phase}`}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: valueColor }}
          >
            {beat.value}
          </motion.div>
        )}

        {/* Caption strip */}
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
