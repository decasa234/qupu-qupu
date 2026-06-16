import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Star, starPositions, VIEW_W, VIEW_H } from './starVisual'
import { buildStarCountSteps } from './starCountSteps'

const GREEN = '#10B981'

export default function StarCountExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStarCountSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const positions = useMemo(() => starPositions(), [])

  const ariaLabel =
    lang === 'id'
      ? `Hitung bintang baris demi baris: ${story.rows.join(' + ')} = ${story.total}.`
      : `Count the stars row by row: ${story.rows.join(' + ')} = ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 520 }} aria-hidden="true">
          {positions.map((p, i) => {
            const dim = beat.row !== null && p.row !== beat.row
            const counted = beat.phase === 'result' || (beat.row !== null && p.row <= beat.row)
            return <Star key={i} cx={p.cx} cy={p.cy} color={counted || beat.phase === 'show' ? p.color : '#cbd5e1'} tilt={p.tilt} opacity={dim ? 0.3 : 1} />
          })}
        </svg>

        {beat.running > 0 && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: beat.result ? GREEN : '#2f6df0' }}>
            {beat.phase === 'result' ? `${story.rows.join(' + ')} = ${story.total}` : beat.running}
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
