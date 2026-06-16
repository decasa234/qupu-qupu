import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CakeQ22 } from './P24G1Q22Illustration'
import { buildP24G1Q22Steps } from './p24G1Q22Steps'

const GREEN = '#10B981'

export default function P24G1Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: total 60, tiap bagian 30; potong dua sudut atas (8 + 22 = 30) dari sisanya (5 + 16 + 9 = 30), jadi opsi (${story.answer}).`
      : `Explainer: total 60, each piece 30; cut the two top corners (8 + 22 = 30) from the rest (5 + 16 + 9 = 30), so option (${story.answer}).`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CakeQ22 shade={beat.shade} showCut={beat.showCut} showSums={beat.showSums} />

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
