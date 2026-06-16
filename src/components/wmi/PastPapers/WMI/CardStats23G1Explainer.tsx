import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardStats23G1 } from './CardStats23G1Illustration'
import { buildCardStats23G1Steps } from './cardStats23G1Steps'

// qupu colour tokens (echo the static figure's hexes so the scene reads as one).
const ORANGE = '#f0853a' // fill-qupu-orange — highlight / deduction
const BLUE = '#30598a' // fill-qupu-blue — neutral / intro
const GREEN = '#10B981' // result accent
const GREEN_INK = '#065F46'

export default function CardStats23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'D'
  const story = useMemo(() => buildCardStats23G1Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: the "?" card must complete both tally tables. The shape table wants ${story.wantTriangle} triangles but only ${story.seeTriangle} show, so it is a triangle; the colour table wants ${story.wantGray} gray but only ${story.seeGray} show, so it is gray. A gray triangle — answer ${story.answer}.`,
    `Strategi: kartu "?" harus melengkapi kedua tabel. Tabel bentuk ingin ${story.wantTriangle} segitiga tapi hanya ada ${story.seeTriangle}, jadi itu segitiga; tabel warna ingin ${story.wantGray} abu-abu tapi hanya ada ${story.seeGray}, jadi itu abu-abu. Segitiga abu-abu — jawaban ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CardStats23G1
          litShape={beat.litShape}
          litColor={beat.litColor}
          revealMissing={beat.revealMissing}
        />

        {/* "wants N — sees M → needs 1 more" deduction chip */}
        <AnimatePresence mode="wait">
          {beat.result ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="font-display text-xl font-black"
              style={{ color: GREEN }}
            >
              {T('gray + triangle', 'abu-abu + segitiga')}
            </motion.div>
          ) : beat.tally ? (
            <motion.div
              key={`tally-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="flex items-center gap-2 font-display text-lg font-black tabular-nums"
            >
              <span style={{ color: BLUE }}>{T('want', 'mau')} {beat.tally.wants}</span>
              <span style={{ color: '#9aa3b2' }}>−</span>
              <span style={{ color: BLUE }}>{T('see', 'ada')} {beat.tally.sees}</span>
              <span style={{ color: '#9aa3b2' }}>=</span>
              <span style={{ color: ORANGE }}>{beat.tally.wants - beat.tally.sees}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.tally
                ? { background: '#FFFFFF', borderColor: ORANGE, color: ORANGE }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
