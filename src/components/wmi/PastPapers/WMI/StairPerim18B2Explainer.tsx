import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StairPerim18B2Figure } from './StairPerim18B2Illustration'
import { buildStairPerim18B2Steps } from './stairPerim18B2Steps'

// SEAMO-18-B-Q2 — 3-step descending staircase perimeter.
// Teaching: "slide" trick — horizontals equal the bottom (15), verticals equal
// the left wall (8). Perimeter = 30 + 16 = 46 cm → D.

const GREEN = '#10B981'

export default function StairPerim18B2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const steps = useMemo(() => buildStairPerim18B2Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria =
    lang === 'id'
      ? 'Sisi datar berjumlah 30 cm dan sisi tegak 16 cm; kelilingnya 46 cm, jawaban D.'
      : 'Flat sides total 30 cm and standing sides 16 cm; perimeter is 46 cm, answer D.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <StairPerim18B2Figure phase={beat.phase} />
        {beat.equation && (
          <div className="font-display text-sm font-extrabold text-qupu-blue">
            {beat.equation}
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
