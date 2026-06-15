import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ShapeTrain } from './P21G1Q3Illustration'
import { buildP21G1Q3Steps } from './p21G1Q3Steps'

const GREEN = '#10B981'

export default function P21G1Q3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ada ${story.answer} jenis bentuk — segitiga, persegi, persegi panjang, lingkaran. Jawaban ${story.answerLetter}.`
      : `Explainer: there are ${story.answer} kinds of shape — triangle, square, rectangle, circle. Answer ${story.answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ShapeTrain litKinds={beat.litKinds} />

        {/* running kinds tally */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold"
              style={
                beat.tally >= n
                  ? { background: '#FEF3C7', border: '2px solid #F59E0B', color: '#92400E' }
                  : { background: '#F1F5F9', border: '2px solid #E2E8F0', color: '#CBD5E1' }
              }
            >
              {n}
            </span>
          ))}
        </div>

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
