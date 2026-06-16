// Beat-by-beat explainer for WMI-25P1A-Q19 (apple-in-grid square count).
// Reuses the AppleGrid primitive from the illustration so the animation reads
// as the static figure coming alive. Lands on answer D = 4 squares.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { AppleGrid, VIEW_W, VIEW_H } from './P25G1Q19Illustration'
import { buildP25G1Q19Steps } from './p25G1Q19Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function P25G1Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ada ${story.answer} persegi dari segala ukuran yang memuat apel.`
      : `Explainer: ${story.answer} squares of all sizes contain the apple.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />
          <AppleGrid highlight={beat.highlight} />
        </svg>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 font-display text-base font-extrabold"
            style={{ background: '#E1EFFB', color: BLUE }}
          >
            {beat.count}
          </span>
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
    </div>
  )
}
