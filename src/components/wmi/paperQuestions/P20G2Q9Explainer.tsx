import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { P20G2Q9Clock } from './P20G2Q9Illustration'
import { buildP20G2Q9Steps } from './p20G2Q9Steps'

// WMI-20P2A-Q9 — post-answer animation for the "read the clock" question.
// We reuse the built P20G2Q9Clock primitive (emphasize + minute ring) so the
// scene reads as the static figure coming alive, walking the method one idea per
// beat: tell the hands apart by length, read the hour off the short hand, turn
// the long hand's number into minutes (×5), and land on 8:20 — never asserting
// the answer up front.

const GREEN = '#10B981' // result accent (echoes fill-qupu-green)
const RED = '#DC2626' // trap / rejection
const BLUE = '#30598A' // neutral step accent
const ACCENT = '#f0853a' // minute colour (fill-qupu-brand-orange)

export default function P20G2Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G2Q9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jarum pendek di ${story.hourNumber} → jam ${story.hourNumber}; jarum panjang di ${story.minuteNumber} → ${story.minuteNumber} × 5 = ${story.minuteValue} menit; jadi pukul ${story.answerTime}.`
      : `Explainer: short hand at ${story.hourNumber} → hour ${story.hourNumber}; long hand at ${story.minuteNumber} → ${story.minuteNumber} × 5 = ${story.minuteValue} minutes; so ${story.answerTime}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <P20G2Q9Clock emphasize={beat.emphasize} showMinuteRing={beat.showMinuteRing} />

        {/* the arithmetic / time made visible */}
        {beat.sum && (
          <motion.div
            key={beat.sum}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : ACCENT }}
          >
            {beat.sum}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'trap'
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
