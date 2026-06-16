import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PyramidDiagram } from './Pyramid20Illustration'
import { buildPyramid20Steps } from './pyramid20Steps'

const GREEN = '#10B981'

export default function Pyramid20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPyramid20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: isi baris bawah lewat petunjuk 7 dan 10, susun piramida ke atas, bintang = ${story.answer}.`
      : `Explainer: fill the bottom row using the 7 and 10 clues, build the pyramid up, star = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PyramidDiagram solved={beat.solved} activeKeys={beat.activeKeys} showStar={beat.showStar} />

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
