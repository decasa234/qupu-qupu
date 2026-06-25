// SEAMO-22-A-Q7 — animated explainer for the mirror-clock puzzle.
//
// "Mark saw the reflection of an old clock. What was the actual time?"
// Answer: D = 4:45 pm (16.45)
//
// Beats:
//   0 show       — mirrored clock, neutral — "What does it appear to show?"
//   1 mirror-rule — explain left↔right flip
//   2 reflected  — highlight hands; "appears to show 7:15"
//   3 subtract   — show arithmetic 12:00 − 7:15 = 4:45
//   4 result     — flip to normal clock at 4:45; "Actual time = 4:45 pm → D"
//
// Copy-adapted from: ClockReadG2Explainer + PartyClocks16A11Explainer patterns.
// Pure SSR-safe when beat-control hooks are not called (server renders beat 0).

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MirrorClock } from './MirrorClock22A7Illustration'
import { buildMirrorClock22A7Steps } from './mirrorClock22A7Steps'

const BLUE      = '#30598A'
const ORANGE    = '#f0853a'
const ORANGE_DK = '#9A3412'
const GREEN     = '#10B981'
const GREEN_DK  = '#065F46'
const SHELL     = '#FFF9F4'
const PEACH     = '#FFD3B1'

export default function MirrorClock22A7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildMirrorClock22A7Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle =
    beat.tone === 'win'
      ? { background: '#D1FAE5', borderColor: GREEN,  color: GREEN_DK  }
      : beat.tone === 'check'
        ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE_DK }
        : { background: '#E1EFFB', borderColor: BLUE,   color: BLUE      }

  const mathColor =
    beat.tone === 'win' ? GREEN_DK : beat.tone === 'check' ? ORANGE_DK : BLUE

  const ariaLabel = T(
    'Explainer: mirror-clock shows 7:15 reflected; actual time = 12:00 − 7:15 = 4:45 pm. Answer D.',
    'Penjelasan: jam cermin tampak 7:15; waktu nyata = 12:00 − 7:15 = 16.45. Jawaban D.',
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[380px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Goal chip */}
        <div className="flex items-center rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {T('What is the actual time?', 'Pukul berapa waktu sebenarnya?')}
        </div>

        {/* Mirror label */}
        <div
          className="font-display text-xs font-semibold"
          style={{ color: beat.showActual ? GREEN_DK : '#94A3B8', transition: 'color 0.3s' }}
        >
          {beat.showActual
            ? T('Actual clock (4:45 pm)', 'Jam nyata (16.45)')
            : T('Mirror reflection', 'Bayangan cermin')}
        </div>

        {/* Clock */}
        <div style={{ transition: 'opacity 0.3s' }}>
          <MirrorClock
            emphasizeHour={beat.emphasizeHour}
            emphasizeMinute={beat.emphasizeMinute}
            showActual={beat.showActual}
          />
        </div>

        {/* Running arithmetic chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {beat.math && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-base font-black tabular-nums"
                style={{ color: mathColor }}
              >
                {beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Answer reveal on winning beat */}
        <AnimatePresence initial={false}>
          {beat.result && (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="font-display text-base font-black"
              style={{ color: GREEN_DK }}
            >
              {T('4:45 pm = Answer D ✓', '16.45 = Jawaban D ✓')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption box */}
        <div
          className="mt-auto min-h-[3rem] w-full rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
