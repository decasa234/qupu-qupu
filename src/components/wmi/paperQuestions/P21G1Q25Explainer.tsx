import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q25Diagram } from './P21G1Q25Illustration'
import { buildP21G1Q25Steps } from './p21G1Q25Steps'

const GREEN = '#10B981'

export default function P21G1Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pasang lima keping ke kotak 4×4 (boleh diputar, tidak dibalik), lalu baca sel bertanda A dan B; A + B = 5 — jawaban D.'
      : 'Explainer: fit the five pieces into the 4×4 grid (rotate, never flip), then read the marked cells A and B; A + B = 5 — answer D.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q25Diagram gridHighlight={beat.gridHighlight} />

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
