// IKMC-23-EC-Q12 — post-answer animated explainer.
//
// Reuses RoadHouses12EC from the illustration as the shared primitive.
// Beat sequence: intro → total → east → west → result.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RoadHouses12EC } from './RoadHouses12ECIllustration'
import { buildRoadHouses12ECSteps } from './roadHouses12ECSteps'

const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#92400E'
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'

export default function RoadHouses12ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildRoadHouses12ECSteps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const capStyle: React.CSSProperties = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.phase === 'intro' || beat.phase === 'west' || beat.phase === 'east'
      ? { background: BLUE_BG,  borderColor: BLUE,  color: BLUE }
      : { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }

  const eqStyle: React.CSSProperties = beat.result
    ? { background: GREEN }
    : beat.phase === 'total'
      ? { background: AMBER }
      : { background: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Jalan A membagi semua rumah menjadi Utara (7) + Selatan (5) = 12 total. Jalan B membagi 12 itu menjadi Timur (8) + Barat. Barat = 12 − 8 = 4. Jawaban A.'
      : 'Explainer: Road A splits all houses North (7) + South (5) = 12 total. Road B splits those 12 into East (8) + West. West = 12 − 8 = 4. Answer A.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Map (shared primitive with highlight) ─────── */}
        <div className="w-full">
          <RoadHouses12EC highlight={beat.highlight} />
        </div>

        {/* ── Equation badge ──────────────────────────────── */}
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
                style={eqStyle}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Caption ─────────────────────────────────────── */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={capStyle}
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
