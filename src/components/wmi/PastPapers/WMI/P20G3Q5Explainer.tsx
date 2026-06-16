import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DotsTreesFigure } from './P20G3Q5Illustration'
import { buildP20G3Q5Steps } from './p20G3Q5Steps'

const GREEN = '#10B981'

export default function P20G3Q5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G3Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: banyak titik = ${story.fraction} dari banyak pohon, jadi jawabannya pilihan ${story.answer}.`
      : `Explainer: dot count = ${story.fraction} of tree count, so the answer is option ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DotsTreesFigure hotDots={beat.hotDots} hotTrees={beat.hotTrees} />

        {beat.result && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full font-display text-lg font-extrabold text-white"
            style={{ background: GREEN }}
            aria-hidden="true"
          >
            {story.answer}
          </div>
        )}

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
