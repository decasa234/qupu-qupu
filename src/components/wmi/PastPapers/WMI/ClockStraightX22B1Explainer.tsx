// SEAMOX-22-B-Q1 — Clock straight-line problem at 7 a.m.
//
// Beat-by-beat animated explainer: start at 7:00 → relative speed →
// equation for 180° separation → first straight-line moment → official answer.

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ClockX22B1Face } from './ClockStraightX22B1Illustration'
import { buildClockStraightSteps, ANSWER_VALUE } from './clockStraightX22B1Steps'

const BLUE       = '#30598A'
const ORANGE     = '#f0853a'
const ORANGE_DRK = '#9A3412'
const GREEN      = '#10B981'
const GREEN_DRK  = '#065F46'
const SHELL      = '#FFF9F4'
const PEACH      = '#FFD3B1'

export default function ClockStraightX22B1Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const T     = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildClockStraightSteps(lang), [lang])
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
    `Clock straight line: at 7:00 AM the hour hand is at 210° and the minute hand at 0°. The minute gains 5.5°/min. First straight line at 60/11 ≈ 5.45 min. Official key: ${ANSWER_VALUE} minutes.`,
    `Garis lurus jam: pukul 7:00 pagi jarum jam berada di 210° dan jarum menit di 0°. Menit mendahului 5,5°/menit. Garis lurus pertama pada 60/11 ≈ 5,45 menit. Kunci resmi: ${ANSWER_VALUE} menit.`,
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[340px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Goal legend */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {T(
            'Find t (minutes) when hands first form a straight line',
            'Cari t (menit) ketika jarum pertama kali membentuk garis lurus',
          )}
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

        {/* Animated clock face */}
        <div className="flex items-center justify-center">
          <ClockX22B1Face
            minuteAngle={beat.minuteAngle}
            hourAngle={beat.hourAngle}
            showQuestionArc={beat.showQuestionArc}
            showStraightLine={beat.showStraightLine}
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
              {T(`Answer: ${ANSWER_VALUE} minutes`, `Jawaban: ${ANSWER_VALUE} menit`)}
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
