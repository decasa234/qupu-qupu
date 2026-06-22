import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RoadMap8PE, SVG_W } from './RoadMap8PEIllustration'
import { buildRoadMap8PESteps } from './roadMap8PESteps'

// IKMC-23-PE-Q8 — post-answer animation.
// Reuses the RoadMap8PE primitive from the illustration so the animation reads
// as the static scene coming alive.
//
// Animation beats:
//   0. intro     — static road, state the rule (stop when going straight).
//   1. first-4   — highlight dots 1–4 (outer loop), running total 4.
//   2. next-4    — highlight dots 5–8 (middle loop), running total 8.
//   3. inner-4   — highlight dots 9–12 (inner loop), running total 12.
//   4. last-2    — highlight dots 13–14 (near Y), running total 14.
//   5. result    — all dots green, 14 → D.

const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#F59E0B'

const FIG_W = Math.min(300, SVG_W)

export default function RoadMap8PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildRoadMap8PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung persimpangan di mana Steven melanjutkan lurus: 4 di putaran luar + 4 di putaran tengah + 4 di putaran dalam + 2 terakhir = 14 berhenti total — jawaban D.'
      : 'Explainer: count crossings where Steven goes straight: 4 on outer loop + 4 on middle loop + 4 on inner loop + 2 final = 14 stops total — answer D.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <div style={{ width: FIG_W }}>
          <RoadMap8PE litCount={beat.litCount} isResult={isResult} />
        </div>

        {/* running tally pill */}
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
                style={{ background: isResult ? GREEN : ORANGE }}
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
