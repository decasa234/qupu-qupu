import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CircleChain } from './P22G1Q20Illustration'
import { buildP22G1Q20Steps } from './p22G1Q20Steps'

const GREEN = '#10B981'

export default function P22G1Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G1Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: setiap lingkaran berjumlah sama, jadi bintang = ${story.star} dan belah ketupat = ${story.diamond} (jawaban ${story.answer}).`
      : `Explainer: every circle has the same total, so star = ${story.star} and diamond = ${story.diamond} (answer ${story.answer}).`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CircleChain
          highlightCircles={beat.highlightCircles}
          showConstant={beat.showConstant}
          revealStar={beat.revealStar}
          revealDiamond={beat.revealDiamond}
        />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
