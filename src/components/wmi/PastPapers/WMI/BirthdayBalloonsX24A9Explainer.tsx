// SEAMOX-24-A-Q9 — animated explainer.
// Beat-by-beat "assume all same, then adjust" walkthrough.
// Beat 0: intro → Beat 1: give all 11 × 2 = 22 → Beat 2: 34−22=12 extra
//   → Beat 3: girls = 12÷2 = 6 ✓

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BirthdayBalloonsX24A9 } from './BirthdayBalloonsX24A9Illustration'
import { buildBirthdayBalloonsX24A9Steps } from './birthdayBalloonsX24A9Steps'

const BLUE      = '#2563EB'
const BLUE_BG   = '#DBEAFE'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'

export default function BirthdayBalloonsX24A9Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(
    () => buildBirthdayBalloonsX24A9Steps(lang as 'en' | 'id'),
    [lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: berikan semua 11 anak 2 balon (22 total); sisa 12 ekstra dibagi ke anak perempuan (12÷2=6).'
      : 'Explainer: give all 11 children 2 balloons (22 total); the 12 extra go to girls (12÷2=6).'

  return (
    <div className="mx-auto w-full max-w-[660px]" role="img" aria-label={ariaLabel}>
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

        {/* illustration with per-beat phase highlight */}
        <motion.div
          key={`fig-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="flex w-full justify-center"
        >
          <BirthdayBalloonsX24A9
            phase={beat.phase !== 'intro' ? beat.phase : null}
            lang={lang}
          />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="min-h-[44px] w-full max-w-[560px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
