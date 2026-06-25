import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StairPath21B19Figure } from './StairPath21B19Illustration'
import { buildStairPath21B19Steps } from './stairPath21B19Steps'

// SEAMO-21-B-Q19 — Javier's staircase walking path.
// Teaching: horizontal segments sum to the full span (120 m);
// vertical segments sum to the full height (70 m).
// Total distance = 120 + 70 = 190 m → D.

const PURPLE = '#6366F1'

export default function StairPath21B19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const steps = useMemo(() => buildStairPath21B19Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria =
    lang === 'id'
      ? 'Semua segmen horizontal berjumlah 120 m dan segmen vertikal 70 m; total jarak 190 m, jawaban D.'
      : 'All horizontal segments total 120 m and vertical segments 70 m; total distance 190 m, answer D.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <StairPath21B19Figure phase={beat.phase} />
        {beat.equation && (
          <div className="font-display text-sm font-extrabold text-qupu-blue">
            {beat.equation}
          </div>
        )}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#EDE9FE', borderColor: PURPLE, color: '#4C1D95' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
