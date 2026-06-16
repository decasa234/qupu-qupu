import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FaceFigure } from './P22G2Q20Illustration'
import { buildP22G2Q20Steps } from './p22G2Q20Steps'

const GREEN = '#10B981'

export default function P22G2Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G2Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung tiap bagian, hanya 6×7=42 dan 72÷8=9 yang lebih dari 8 dan diwarnai gelap (jawaban C).'
      : 'Explainer: evaluate each part; only 6×7=42 and 72÷8=9 exceed 8 and are shaded dark (answer C).'

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FaceFigure shaded={beat.shaded} showValues={beat.showValues} />

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
