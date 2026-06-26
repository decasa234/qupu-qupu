// OSN-25-SD-NAS-FINAL-Q5 — post-answer explainer.
//
// Beats:
//   0. intro  — static seat row, problem constraints.
//   1. amir   — highlight window seats 1 and 5 (2 choices).
//   2. budi   — highlight aisle seats 2, 3, 4 (3 choices).
//   3. rest   — remaining 3 people × 3! = 6.
//   4. result — 2 × 3 × 6 = 36.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BusSeatRow } from './BusSeatOSN25NFQ5Illustration'
import { buildBusSeatOSN25NFQ5Steps } from './busSeatOSN25NFQ5Steps'

const GREEN  = '#10B981'
const BLUE   = '#30598A'

export default function BusSeatOSN25NFQ5Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildBusSeatOSN25NFQ5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Amir 2 pilihan jendela, Budi 3 pilihan samping lorong, sisa 3!=6. Total 2×3×6=36.'
      : 'Explainer: Amir 2 window choices, Budi 3 aisle choices, rest 3!=6. Total 2×3×6=36.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Seat row */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <BusSeatRow seatStates={beat.seatStates} />
        </div>

        {/* Equation badge */}
        {beat.equation && (
          <motion.div
            key={beat.phase + '-eq'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.equation}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN,  color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
