// Beat-by-beat explainer for WMI-25P1A-Q20 (garden one-stroke puzzle).
// Reuses the GardenPlan primitive from the illustration so the animation reads
// as the static figure coming alive. Lands on answer C = gates A and C.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { GardenPlan, VIEW_W, VIEW_H } from './P25G1Q20Illustration'
import { buildP25G1Q20Steps } from './p25G1Q20Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function P25G1Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: gerbang dengan jumlah jalur ganjil adalah A dan C, jadi pintu masuk dan keluar di sana.`
      : `Explainer: the gates with an odd number of paths are A and C, so the entrance and exit go there.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />
          <GardenPlan gateRings={beat.rings} gateBadges={beat.badges} />
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
