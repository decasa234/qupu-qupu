// Post-answer explainer for WMI-25P2A-Q17 (2025 Grade-2 Semifinal).
//
// Mirrors the static fish-tank wheel and brings it alive: it states the rules,
// reads the ring of counts, then groups the 7 wedges into 3 kinds (neighbours
// differ) to open the biggest possible gap — 7, 4, 1 → 7 - 1 = 6 (answer E).
//
// Pure render: uses the shared FishTankWheel primitive with a per-wedge `highlight`.
// SSR-safe, deterministic.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FishTankWheel } from './P25G2Q17Illustration'
import { buildP25G2Q17Steps } from './p25G2Q17Steps'

const GREEN = '#10B981'

export default function P25G2Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G2Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kelompokkan tujuh wilayah jadi tiga jenis (7, 4, 1), selisih terbesar 7 - 1 = ${story.answer}.`
      : `Explainer: group the seven areas into three kinds (7, 4, 1); biggest gap 7 - 1 = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FishTankWheel highlight={beat.highlight} dimUngrouped={beat.dimUngrouped} />

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
