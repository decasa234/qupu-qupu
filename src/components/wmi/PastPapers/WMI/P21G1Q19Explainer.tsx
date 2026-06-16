import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { P21G1Q19Scene } from './P21G1Q19Illustration'
import { buildP21G1Q19Steps } from './p21G1Q19Steps'

const GREEN = '#10B981'

export default function P21G1Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lingkaran angka-delapan melingkupi 6 hewan, jadi nilainya ${story.answer} — jawaban B.`
      : `Explainer: the figure-eight loop encircles 6 animals, so its value is ${story.answer} — answer B.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <P21G1Q19Scene
          showRoundLoop={beat.showRoundLoop}
          showFigureEight={beat.showFigureEight}
          countEnclosed={beat.countEnclosed}
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
