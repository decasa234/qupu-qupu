import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Stones25G1 } from './Stones25G1Illustration'
import { buildStonesSteps } from './stones25G1Steps'

// WMI-25F1A-Q1 post-answer animation. Teaches the method, not just the answer:
// first find the landmark (the big toucan), then count the small birds to its
// LEFT one at a time (b0..b8) with a running counter 1..9. Result: 9 small birds
// stand to the left of the toucan.

// qupu colour tokens echoed as hex, matching the static illustration.
const ORANGE = '#f0853a' // qupu-brand-orange (the counting accent)
const BLUE = '#30598A' // qupu-brand-blue (setup captions)
const YELLOW_DK = '#B5860B' // toucan-beak accent for the landmark beat
const GREEN = '#10B981'
const GREEN_DK = '#065F46'
const GREEN_FILL = '#D1FAE5'

export default function Stones25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStonesSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: find the big bird (the toucan), then count the small birds to its left one by one — 1, 2, … up to ${story.answer}. So ${story.answer} small birds are to the left of the toucan.`,
    `Strategi: cari burung besar (toucan), lalu hitung burung kecil di sebelah kirinya satu per satu — 1, 2, … sampai ${story.answer}. Jadi ${story.answer} burung kecil ada di sebelah kiri toucan.`,
  )

  // Caption box: yellow on the landmark beat, orange while counting, green on result.
  const captionStyle = beat.result
    ? { background: GREEN_FILL, borderColor: GREEN, color: GREEN_DK }
    : beat.phase === 'landmark'
      ? { background: '#FDF3DA', borderColor: YELLOW_DK, color: YELLOW_DK }
      : beat.phase === 'count'
        ? { background: '#FFFFFF', borderColor: ORANGE, color: ORANGE }
        : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  return (
    <div className="mx-auto w-full max-w-[540px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The static bird row coming alive — birds light up one at a time. */}
        <motion.div
          key={index}
          initial={{ opacity: 0.7, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="w-full"
        >
          <Stones25G1 litStones={beat.lit} />
        </motion.div>

        {/* The running tally, called out big while counting and on the result. */}
        {beat.running > 0 && (
          <motion.div
            key={`n-${beat.running}-${beat.result ? 'r' : 'c'}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : ORANGE }}
          >
            {beat.running}
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
