// RayAnglesOSN18KQ11Explainer — OSN 2018 SD Kabupaten Q11
//
// Animates the solution: name the 4 gaps, collect single-gap sizes (4),
// then two-adjacent (1 new: 80°), three-adjacent (2 new: 60°, 100°),
// and the full span (110°) → 8 distinct angle sizes.
//
// Each beat highlights the current span via an orange arc on the fan diagram
// and adds the new size(s) to an accumulating pill row.

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RayFanCore } from './RayAnglesOSN18KQ11Illustration'
import { buildRayAnglesOSN18KQ11Steps } from './rayAnglesOSN18KQ11Steps'

const BLUE   = '#30598A'
const GREEN  = '#10B981'

export default function RayAnglesOSN18KQ11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildRayAnglesOSN18KQ11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? '5 sinar dari satu titik; celah berurutan 10°, 20°, 30°, 50°; terdapat 8 ukuran sudut berbeda.'
      : '5 rays from one vertex with consecutive gaps 10°, 20°, 30°, 50°; there are 8 different angle sizes.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-4">

        {/* Ray-fan with optional arc highlight */}
        <RayFanCore highlightArc={beat.arc} />

        {/* Accumulating distinct-size pills */}
        <div className="flex min-h-[36px] flex-wrap justify-center gap-1.5">
          <AnimatePresence>
            {beat.found.map((sz) => (
              <motion.div
                key={sz}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                className="rounded-lg border-2 px-2.5 py-1 font-display text-sm font-black tabular-nums"
                style={
                  beat.result
                    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
                }
              >
                {sz}°
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
