import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CrossPuzzle } from './P25G3Q9Illustration'
import { buildP25G3Q9Steps } from './p25G3Q9Steps'

const GREEN = '#10B981'

export default function P25G3Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = (props.correctAnswer || 'E').trim().toUpperCase().charAt(0) || 'E'
  const story = useMemo(() => buildP25G3Q9Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tengah = 9/18, lalu ▲ = 18/18 − 7/18 − 9/18 = 2/18 (jawaban ${story.answer}).`
      : `Explainer: centre = 9/18, then ▲ = 18/18 − 7/18 − 9/18 = 2/18 (answer ${story.answer}).`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CrossPuzzle showCentre={beat.showCentre} showTriangle={beat.showTriangle} litLine={beat.litLine} />

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
