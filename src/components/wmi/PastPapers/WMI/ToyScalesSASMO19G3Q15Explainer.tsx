// SASMO 2019 G3 Q15 — animated explainer.
// Beat-by-beat chain: Scale 1 (Train > 2 Cars) → Scale 2 (Car > Ship)
//   → Scale 3 (Submarine > 2 Trains) → Submarine is heaviest.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ToyScalesSASMO19G3Q15 } from './ToyScalesSASMO19G3Q15Illustration'
import { buildToyScalesSASMO19G3Q15Steps } from './toyScalesSASMO19G3Q15Steps'

const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'

export default function ToyScalesSASMO19G3Q15Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildToyScalesSASMO19G3Q15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Kapal Selam > Kereta > Mobil > Kapal — kapal selam adalah mainan terberat.'
      : 'Explainer: Submarine > Train > Car > Ship — submarine is the heaviest toy.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
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

        {/* three scales with per-beat dimming */}
        <motion.div
          key={`scales-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="w-full"
        >
          <ToyScalesSASMO19G3Q15 litScale={beat.litScale as 1 | 2 | 3 | null} />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="min-h-[44px] w-full max-w-[380px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
