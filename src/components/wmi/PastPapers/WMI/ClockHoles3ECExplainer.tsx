// IKMC-23-EC-Q3 — grey disc with 2 holes over a clock face.
//
// "A gray circle with 2 large holes in it is put on top of a clock-face, as
// shown. The gray circle is turned around its center. Which 2 numbers is it
// possible to see at the same time?"   Answer: B = 5 and 9.
//
// Beat-by-beat strategy:
//   1. State that the holes are 4 clock-positions apart.
//   2. Show starting position (holes at 1 & 5).
//   3. Rotate one step → 2 & 6.
//   4. Rotate to 5 & 9 (the answer pair candidate).
//   5. Check all choices — only B (5 & 9) has gap = 4.
//   6. Announce B = 5 and 9.

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ClockHoles3EC } from './ClockHoles3ECIllustration'
import { buildClockHolesSteps, ANSWER_A, ANSWER_B } from './clockHoles3ECSteps'

const BLUE = '#30598A'       // fill-qupu-brand-blue
const ORANGE = '#f0853a'     // fill-qupu-orange
const ORANGE_DARK = '#9A3412'
const GREEN = '#10B981'
const GREEN_DARK = '#065F46'
const SHELL = '#FFF9F4'      // qupu-shell panel background
const PEACH = '#FFD3B1'      // qupu-peach border

export default function ClockHoles3ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildClockHolesSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    `The gray disc has 2 holes exactly 4 clock-positions apart. As it rotates, valid visible pairs are always 4 apart. Only 5 and 9 (gap = 4) matches from the choices — answer B.`,
    `Cakram abu-abu memiliki 2 lubang yang berjarak tepat 4 posisi jam. Saat berputar, pasangan yang terlihat selalu berjarak 4. Hanya 5 dan 9 (jarak = 4) yang sesuai dari pilihan — jawaban B.`,
  )

  // Caption box colours by tone
  const captionStyle =
    beat.tone === 'win'
      ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_DARK }
      : beat.tone === 'check'
        ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE_DARK }
        : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const mathColor =
    beat.tone === 'win' ? GREEN_DARK : beat.tone === 'check' ? ORANGE_DARK : BLUE

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[340px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* goal legend */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {T('2 holes on the disc — 4 positions apart', '2 lubang pada cakram — berjarak 4 posisi')}
        </div>

        {/* running-arithmetic chip */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {beat.math && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-lg font-black tabular-nums"
                style={{ color: mathColor }}
              >
                {beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* figure */}
        <div className="flex items-center justify-center">
          <ClockHoles3EC
            holeA={beat.holeA}
            highlightVisible={beat.highlightVisible}
            answerPair={beat.answerPair}
          />
        </div>

        {/* answer pair label on winning beat */}
        <AnimatePresence initial={false}>
          {beat.result && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="font-display text-base font-black tabular-nums"
              style={{ color: GREEN_DARK }}
            >
              {`${ANSWER_A} + 4 = ${ANSWER_B} ✓`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* caption box */}
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
