import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CELL_H, CELL_W, Q17Cell } from './P20G3Q17Illustration'
import { buildP20G3Q17Steps } from './p20G3Q17Steps'

const GREEN = '#10B981'

export default function P20G3Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G3Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: selisih segitiga = 10 berarti n = 10, jadi segitiga putih = ${story.answer}.`
      : `Explainer: triangle difference = 10 means n = 10, so white triangles = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${CELL_W} ${CELL_H}`}
          width="100%"
          style={{ maxWidth: CELL_W + 40, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <Q17Cell picture={beat.picture} showCounts={beat.showCounts} />
        </svg>

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
