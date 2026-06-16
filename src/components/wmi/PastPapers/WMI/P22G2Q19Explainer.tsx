import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CirclesDiagram } from './P22G2Q19Illustration'
import { buildP22G2Q19Steps } from './p22G2Q19Steps'

const GREEN = '#10B981'

export default function P22G2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G2Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: tiap lingkaran berjumlah ${story.total}, jadi bintang = ${story.star} dan wajik = ${story.diamond} (jawaban D).`
      : `Explainer: each circle totals ${story.total}, so star = ${story.star} and diamond = ${story.diamond} (answer D).`

  return (
    <div className="mx-auto w-full max-w-[540px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CirclesDiagram
          showStar={beat.showStar}
          showDiamond={beat.showDiamond}
          highlight={beat.highlight}
          showTotal={beat.showTotal}
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
