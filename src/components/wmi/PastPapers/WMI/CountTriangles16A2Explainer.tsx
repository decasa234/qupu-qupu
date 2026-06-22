import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CountTriangles16A2Figure } from './CountTriangles16A2Illustration'
import { buildCountTriangles16A2Steps } from './countTriangles16A2Steps'

const GREEN = '#10B981'

export default function CountTriangles16A2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCountTriangles16A2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menghitung segitiga dari segala ukuran — totalnya ${story.total}.`
      : `Explainer: counting triangles of every size — the total is ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CountTriangles16A2Figure highlightSize={beat.phase === 'count' ? beat.size : null} />

        {beat.running > 0 && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: beat.result ? GREEN : '#2f6df0' }}>
            {beat.running}
          </div>
        )}

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
