// SEAMO-19-A-Q25 — Explainer: closing-speed meeting problem.
//
// Animates the solution beat-by-beat:
//   0 → intro (vehicles at starting towns)
//   1 → combined speed: 60 + 70 = 130 km/h
//   2 → time to meet:  650 ÷ 130 = 5 hours
//   3 → answer:        9:00 AM + 5 h = 2:00 PM  (meeting marker shown)
//
// Uses TownsMeetRoad from TownsMeet19A25Illustration as the shared primitive,
// reuses the useBeatControl / ExplainerProps pattern from CarsLane9ECExplainer.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TownsMeetRoad } from './TownsMeet19A25Illustration'
import { buildTownsMeet19A25Steps } from './townsMeet19A25Steps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#1D4ED8'
const BLUE_BG = '#EFF6FF'
const AMBER = '#D97706'
const AMBER_BG = '#FFFBEB'
const AMBER_INK = '#78350F'

export default function TownsMeet19A25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTownsMeet19A25Steps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kecepatan gabungan 130 km/jam, waktu berpapasan 5 jam, pukul 2:00 PM.'
      : 'Explainer: combined speed 130 km/h, time to meet 5 hours, meeting at 2:00 PM.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Road diagram */}
        <motion.div
          key={`road-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <TownsMeetRoad
            truckFrac={beat.truckFrac}
            sedanFrac={beat.sedanFrac}
            showDistance={beat.showDistance}
            showMeet={beat.showMeet}
            lang={lang}
          />
        </motion.div>

        {/* Arithmetic highlight badge */}
        <div className="h-8 flex items-center justify-center">
          {beat.highlight && (
            <motion.div
              key={`badge-${index}`}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              className="rounded-full border-2 px-5 py-1 text-sm font-extrabold font-display"
              style={{ background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }}
            >
              {beat.highlight}
            </motion.div>
          )}
        </div>

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="min-h-[48px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
