import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ThreeScales24 } from './ThreeScales24ECIllustration'
import { buildThreeScales24Steps, ANSWER_LABEL_EN, ANSWER_LABEL_ID } from './threeScales24ECSteps'

// Palette echoes the EC balance-scales pool (DogToys12EC, BallScales8EC).
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function ThreeScales24ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildThreeScales24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const answerLabel = lang === 'id' ? ANSWER_LABEL_ID : ANSWER_LABEL_EN
  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Timbangan 1 menunjukkan 1 segi enam = 3 segitiga (H=3T). Timbangan 2: 1 persegi = segi enam + segitiga = 4T. Timbangan 3 sisi kanan = 4T = 1 persegi, jadi letakkan ${answerLabel} di sisi kiri.`
      : `Explainer: Scale 1 shows 1 hexagon = 3 triangles (H=3T). Scale 2: 1 square = hexagon + triangle = 4T. Scale 3 right side = 4T = 1 square, so put ${answerLabel} on the left. Answer A.`

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

        {/* Three scales, spotlight on the active one */}
        <motion.div
          key={`scales-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          <ThreeScales24 litScale={beat.litScale} />
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
