import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CircleNumbers20A9 } from './CircleNumbers20A9Illustration'
import { buildCircleNumbers20A9Steps } from './circleNumbers20A9Steps'

const GREEN  = '#10B981'
const BLUE   = '#30598A'

export default function CircleNumbers20A9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCircleNumbers20A9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: temukan aturan lingkaran — atas + kiri bawah − kanan bawah = tengah; jawaban 14.'
      : 'Explainer: find the circle rule — top + bottom-left − bottom-right = centre; answer 14.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CircleNumbers20A9 revealAnswer={beat.revealAnswer} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.phase === 'result'
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
