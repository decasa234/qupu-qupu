import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ArrowGridDiagram } from './ArrowGrid19P1Illustration'
import { buildArrowGrid19P1Steps } from './arrowGrid19P1Steps'

const GREEN = '#10B981'

export default function ArrowGrid19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildArrowGrid19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: mulai di ${story.start}, ikuti panahnya satu per satu (kanan +1, kiri −1, atas −10, bawah +10), berhenti di ${story.answer}.`
      : `Explainer: start at ${story.start} and follow the arrows one by one (right +1, left −1, up −10, down +10), landing on ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ArrowGridDiagram
          movesDone={beat.movesDone}
          showStart={beat.showStart}
          showCurrent={beat.showCurrent}
          showLanding={beat.showLanding}
          spotlightMove={beat.spotlightMove}
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
