import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ConcentricRings } from './Rings9ECIllustration'
import { buildRings9ECSteps } from './rings9ECSteps'

// IKMC-20-EC-Q9 — post-answer concentric-rings colouring explainer.
//
// Beat plan (7 beats):
//   0. intro      — all rings white, explain the rule
//   1. ring 1     — outer ring turns red (given)
//   2. ring 2     — ring 2 turns not-red (must differ from ring 1)
//   3. ring 3     — ring 3 turns red (must differ from ring 2)
//   4. ring 4     — ring 4 turns not-red
//   5. ring 5     — ring 5 turns red
//   6. result     — all 5 coloured; "3 red regions → answer C"
//
// Reuses ConcentricRings from Rings9ECIllustration so the animation reads
// as the static figure coming alive.

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function Rings9ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRings9ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: cincin 1, 3, 5 berwarna merah (ganjil = merah, genap = bukan merah) karena warna berganti-ganti dari luar ke dalam; total 3 daerah merah — jawaban C.'
      : 'Explainer: rings 1, 3 and 5 are red because adjacent rings alternate colours starting from red on the outside; 3 red regions total — answer C.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* animated rings figure */}
        <ConcentricRings colours={beat.colours} />

        {/* equation / tally badge */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
