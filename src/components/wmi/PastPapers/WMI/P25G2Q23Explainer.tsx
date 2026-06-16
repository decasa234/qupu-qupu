import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TwoLettersDiagram } from './P25G2Q23Illustration'
import { buildP25G2Q23Steps } from './p25G2Q23Steps'

const GREEN = '#10B981'

export default function P25G2Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G2Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: huruf A punya ${story.aCount} segitiga, huruf I punya ${story.iCount} persegi, selisihnya ${story.difference} — jawaban ${story.answer}.`
      : `Explainer: letter A has ${story.aCount} triangles, letter I has ${story.iCount} squares, the difference is ${story.difference} — answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <TwoLettersDiagram aRevealed={beat.aRevealed} iRevealed={beat.iRevealed} showCounts={beat.showCounts} />

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
