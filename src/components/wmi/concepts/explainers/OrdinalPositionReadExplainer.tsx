import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ItemRow } from '../ordinal-position-read'
import type { ExplainerProps } from './registry'
import { buildOrdinalPositionReadSteps } from './ordinalPositionReadSteps'
import { useBeatControl } from './useBeatControl'

// `ordinal-position-read`. The figure the child already saw is redrawn here and
// then walked: a rose beat first shows where reading-order habit lands them,
// then the count restarts at the end the question actually named and a badge
// ticks up card by card until it stops. The answer chip only appears on the
// final beat, after the walk has produced it.

const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'

export default function OrdinalPositionReadExplainer(props: ExplainerProps) {
  const { params, lang = 'en', correctAnswer } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildOrdinalPositionReadSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.result
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  // The stored answer is the letter for the choice asks and the value for the
  // fill-in ones; either way it is what the child must produce.
  const answerChip = correctAnswer && correctAnswer.length > 0 ? correctAnswer : story.answer

  const ariaLabel = T(
    `Strategy: walk the row of ${story.n} items one place at a time, starting from the end the question names, and read what the count stops on.`,
    `Strategi: telusuri barisan ${story.n} benda satu per satu, mulai dari ujung yang diminta soal, lalu baca apa yang ada di tempat berhentinya.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[15rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <motion.div
          key={reduce ? 'still' : index}
          initial={reduce ? false : { opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          className="w-full"
        >
          <ItemRow
            cells={story.cells}
            kind={story.kind}
            states={beat.states}
            badges={beat.badges}
            startArrow={beat.arrow}
            maxWidth={420}
          />
        </motion.div>

        <div className="flex min-h-[1.75rem] items-center justify-center">
          {beat.result && (
            <span
              className="rounded-full border-2 px-3 py-[0.0625rem] font-display text-[0.75rem] font-extrabold tabular-nums"
              style={{ background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }}
            >
              {T('Answer', 'Jawaban')}: {answerChip}
            </span>
          )}
          {beat.trap && (
            <span
              className="flex items-center gap-1 rounded-full border-2 px-3 py-[0.0625rem] font-display text-[0.75rem] font-extrabold"
              style={{ background: ROSE_SOFT, borderColor: ROSE, color: ROSE }}
            >
              <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
                <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke={ROSE} strokeWidth={2.6} strokeLinecap="round" />
              </svg>
              {T('Wrong end', 'Ujung yang salah')}
            </span>
          )}
        </div>

        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-[0.8125rem] font-extrabold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
