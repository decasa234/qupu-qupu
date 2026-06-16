import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { AnswerRow, ANSWER_BOX } from './LetterOrder19P1Illustration'
import { buildLetterOrder19P1Steps } from './letterOrder19P1Steps'

// WMI-19P1A-Q25 — post-answer explainer. Applies the three clues one at a time,
// dropping letters into the five-box row, until B is pinned to box 5 (answer C).
// Plays after the learner answers.

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

const ROW_VIEW_W = 320
const ROW_VIEW_H = 50

export default function LetterOrder19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildLetterOrder19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const aria = t(
    `Apply the clues one at a time to place the letters; B ends up in box ${ANSWER_BOX} from the left.`,
    `Terapkan petunjuk satu per satu untuk menempatkan huruf; B berakhir di kotak ke-${ANSWER_BOX} dari kiri.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={index}
          className="w-full"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <svg
            viewBox={`0 0 ${ROW_VIEW_W} ${ROW_VIEW_H}`}
            width="100%"
            style={{ display: 'block', margin: '0 auto', maxWidth: 320 }}
            aria-hidden="true"
          >
            <AnswerRow width={ROW_VIEW_W} slots={beat.slots} />
          </svg>
        </motion.div>

        <div
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
