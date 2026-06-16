import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoSolid, RightArrow } from './P23G1Q18Illustration'
import { buildP23G1Q18Steps } from './p23G1Q18Steps'

const GREEN = '#10B981'
const ORANGE = '#F59E0B'
const BLUE = '#30598A'

export default function P23G1Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP23G1Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const eqLine = `${story.totalRight} − ${story.totalLeft} = ${story.needed}`

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bangun kiri ${story.totalLeft} kubus, bangun kanan ${story.totalRight} kubus. ${eqLine}. Jadi diperlukan ${story.needed} kubus lagi, jawaban ${story.answer}.`
      : `Explainer: left solid ${story.totalLeft} cubes, right solid ${story.totalRight} cubes. ${eqLine}. So ${story.needed} more cubes are needed, the answer is ${story.answer}.`

  // small count badge over a solid
  const countBadge = (label: string) =>
    label ? (
      <div
        className="rounded-full border-2 px-2.5 py-0.5 font-display text-sm font-black tabular-nums"
        style={{ borderColor: ORANGE, color: '#92400E', background: '#FEF3C7' }}
      >
        {label}
      </div>
    ) : (
      <div className="h-[26px]" aria-hidden />
    )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-end justify-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <IsoSolid which="left" litCount={beat.leftLit} dimRest={beat.phase === 'countLeft'} maxWidth={150} />
            {countBadge(beat.leftLabel)}
          </div>
          <div className="pb-6">
            <RightArrow size={46} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <IsoSolid which="right" litCount={beat.rightLit} dimRest={beat.phase === 'countRight'} maxWidth={185} />
            {countBadge(beat.rightLabel)}
          </div>
        </div>

        {beat.result && (
          <motion.div
            key="answer"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: ORANGE }}
          >
            {eqLine}
          </motion.div>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
