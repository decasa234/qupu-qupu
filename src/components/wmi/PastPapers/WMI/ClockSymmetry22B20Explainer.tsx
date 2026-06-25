// SEAMO-22-B-Q20 — Clock symmetry about the '5' at 5:00 pm
//
// Beat-by-beat explainer: start (5:00) → axis ('5') → symmetry condition
// → equation → answer (23 1/13 minutes).

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FullClock } from './ClockSymmetry22B20Illustration'
import { buildClockSymmetrySteps, ANSWER_VALUE, ANSWER_LABEL } from './clockSymmetry22B20Steps'

const BLUE       = '#30598A'
const ORANGE     = '#f0853a'
const ORANGE_DRK = '#9A3412'
const GREEN      = '#10B981'
const GREEN_DRK  = '#065F46'
const SHELL      = '#FFF9F4'
const PEACH      = '#FFD3B1'

export default function ClockSymmetry22B20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildClockSymmetrySteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle =
    beat.tone === 'win'
      ? { background: '#D1FAE5', borderColor: GREEN,  color: GREEN_DRK }
      : beat.tone === 'solve' || beat.tone === 'derive'
        ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE_DRK }
        : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const mathColor =
    beat.tone === 'win'   ? GREEN_DRK :
    beat.tone === 'solve' ? ORANGE_DRK : BLUE

  const ariaLabel = T(
    `Clock symmetry: at 5:00 pm, after t = 300/13 = 23 1/13 minutes both hands are equidistant from the '5'. Answer: ${ANSWER_LABEL} (${ANSWER_VALUE}).`,
    `Simetri jam: pukul 5:00 sore, setelah t = 300/13 = 23 1/13 menit kedua jarum berjarak sama dari angka '5'. Jawaban: ${ANSWER_LABEL} (${ANSWER_VALUE}).`,
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[340px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Goal legend */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {T("Find t so both hands are equal distance from '5'", "Cari t agar kedua jarum sama jarak dari '5'")}
        </div>

        {/* Running arithmetic chip */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {beat.math && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-sm font-black tabular-nums"
                style={{ color: mathColor }}
              >
                {beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clock figure */}
        <div className="flex items-center justify-center">
          <FullClock
            minuteAngle={beat.minuteAngle}
            hourAngle={beat.hourAngle}
            showQuestion={beat.showQuestion}
            showAxis={beat.showAxis}
            highlightFive={beat.highlightFive}
            size={148}
          />
        </div>

        {/* Answer announcement on winning beat */}
        <AnimatePresence initial={false}>
          {beat.result && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="font-display text-base font-black tabular-nums"
              style={{ color: GREEN_DRK }}
            >
              {T(`Answer ${ANSWER_LABEL}: ${ANSWER_VALUE} minutes`, `Jawaban ${ANSWER_LABEL}: ${ANSWER_VALUE} menit`)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
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
