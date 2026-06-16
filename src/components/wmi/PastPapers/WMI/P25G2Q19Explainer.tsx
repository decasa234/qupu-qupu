// Post-answer explainer for WMI-25P2A-Q19 (2025 Grade-2 Semifinal).
//
// Mirrors the static 10-cube solid and brings it alive: a cube's painted faces =
// 6 - the faces it hides against neighbours.  It lights the 4-face cubes (a = 6),
// then the 3-face cubes (b = 2), then the 2-face cubes (c = 2), landing on
// abc = 622 (answer A).
//
// Pure render: reuses the Q19SolidFigure primitive with a per-cube tint map.
// SSR-safe, deterministic.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q19SolidFigure } from './P25G2Q19Illustration'
import { buildP25G2Q19Steps } from './p25G2Q19Steps'

const GREEN = '#10B981'

export default function P25G2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G2Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 6 kubus dengan 4 sisi tercat, 2 dengan 3 sisi, 2 dengan 2 sisi, jadi abc = ${story.answer}.`
      : `Explainer: 6 cubes with 4 painted faces, 2 with 3 faces, 2 with 2 faces, so abc = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q19SolidFigure tints={beat.tints} />

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
