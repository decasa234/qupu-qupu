import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumTriHK20P3Q4Diagram } from './NumTriHK20P3Q4Illustration'
import { buildNumTriHK20P3Q4Steps } from './numTriHK20P3Q4Steps'

const BLUE   = '#30598A'
const VIOLET = '#7C3AED'

export default function NumTriHK20P3Q4Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildNumTriHK20P3Q4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola segitiga angka — atas = kiri × kanan − 3; jawaban 15.'
      : 'Explainer: number triangle pattern — top = left × right − 3; answer 15.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <NumTriHK20P3Q4Diagram
          highlightIdx={beat.highlightIdx}
          revealAnswer={beat.revealAnswer}
        />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#EDE9FE', borderColor: VIOLET, color: VIOLET }
              : { background: '#E1EFFB', borderColor: BLUE,   color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
