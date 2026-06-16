import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q22Figure } from './P22G3Q22Illustration'
import { buildP22G3Q22Steps } from './p22G3Q22Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// WMI-22P3A-Q22 — post-answer explainer. Re-uses Q22Figure: teach the growing
// pentagon-run rule, reveal the 4 hidden shapes (P P S P), and land on option B.
export default function P22G3Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G3Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pola tumbuh; 4 bangun tersembunyi adalah segi lima, segi lima, persegi, segi lima — opsi ${story.answer}.`
      : `Explainer: a growing pattern; the 4 hidden shapes are pentagon, pentagon, square, pentagon — option ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q22Figure revealHidden={beat.revealHidden} highlightSlots={beat.highlightSlots} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
