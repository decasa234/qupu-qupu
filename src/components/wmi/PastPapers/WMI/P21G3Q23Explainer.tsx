/**
 * P21G3Q23Explainer — beat-by-beat solution for WMI-21P3A-Q23 (2021 G3 Semifinal).
 *
 * Reuses the OctahedronP21G3Q23 primitive from the illustration. Teaches the
 * graph-colouring idea: each triangular face touches 3 others, so 1 colour fails;
 * but the 8 faces split into two alternating sets (top vs bottom), so 2 colours
 * suffice — answer A = 2.
 *
 * SSR-safe, deterministic. No Math.random, no Date, no window/document at module top.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { OctahedronP21G3Q23, Q23_VIEW_W, Q23_VIEW_H } from './P21G3Q23Illustration'
import { buildP21G3Q23Steps } from './p21G3Q23Steps'

const GREEN = '#10B981'

export default function P21G3Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G3Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: setiap sisi segitiga berbatasan dengan 3 sisi lain; 8 sisi terbagi dua kelompok berselang-seling, jadi cukup ${story.minColors} warna. Jawaban ${story.answer}.`
      : `Explainer: each triangular face touches 3 others; the 8 faces split into two alternating sets, so ${story.minColors} colours suffice. Answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${Q23_VIEW_W} ${Q23_VIEW_H}`}
          width="100%"
          style={{ maxWidth: 240, display: 'block' }}
          aria-hidden="true"
        >
          <OctahedronP21G3Q23 painted={beat.painted} active={beat.active} />
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
