// Post-answer explainer for WMI-25P2A-Q21 (2025 Grade-2 Semifinal).
//
// Mirrors the butterfly pentagon pattern and grows it Picture 1 -> 2 -> 3 while the
// caption tracks the white-tile count (4, 7, 10 — +3 each time), then states the
// rule white(n) = 3n + 1 and plugs in n = 9 to land on 28 white tiles (answer D).
//
// Pure render: reuses the ButterflyPattern primitive (drawing `flowers` flowers)
// plus a live "Picture k" label.  SSR-safe, deterministic.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ButterflyPattern, Q21_VIEW_H, Q21_VIEW_W } from './P25G2Q21Illustration'
import { buildP25G2Q21Steps } from './p25G2Q21Steps'

const GREEN = '#10B981'

export default function P25G2Q21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G2Q21Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const label = lang === 'id' ? `Gambar ${beat.flowers}` : `Picture ${beat.flowers}`

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ubin putih 4, 7, 10 (tambah 3), aturan 3n + 1, jadi Gambar 9 = ${story.answer}.`
      : `Explainer: white tiles 4, 7, 10 (add 3), rule 3n + 1, so Picture 9 = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${Q21_VIEW_W} ${Q21_VIEW_H}`}
          width="100%"
          style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <ButterflyPattern flowers={beat.flowers} />
          <text x={Q21_VIEW_W / 2} y={Q21_VIEW_H - 14} textAnchor="middle" fontSize={15} fontWeight={800} fill="#30598A">
            {label}
          </text>
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
