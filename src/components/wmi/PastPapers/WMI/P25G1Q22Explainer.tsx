// Beat-by-beat explainer for WMI-25P1A-Q22 (round fish-tank grouping).
// Reuses the FishTank primitive from the illustration so the animation reads as
// the static figure coming alive. Lands on answer B = 6 (largest difference).

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FishTank, VIEW } from './P25G1Q22Illustration'
import { buildP25G1Q22Steps } from './p25G1Q22Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function P25G1Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kelompokkan jenis terbesar (7) dan terkecil (1); selisih terbesar = ${story.answer}.`
      : `Explainer: group the biggest kind (7) and smallest kind (1); largest difference = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          width="100%"
          style={{ maxWidth: VIEW, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={VIEW} height={VIEW} fill="white" />
          <FishTank groupFill={beat.groupFill} />
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
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
