// BoxAdd19B9Explainer.tsx — animated explainer for SEAMO-19-B-Q9
//
// Walks through the digit-sum shortcut:
//   1) Digit sum 1–7 = 28
//   2) Extra = 72 = 9 × (tens sum) → tens sum = 8
//   3) Best tens set {5,2,1}; assign largest unit (7) to 5 → 57
//   4) 57+23+14+6=100 ✓; 57 not in A–D → answer E
//
// Uses useBeatControl for beat sequencing; ColumnAddFigure for the visual.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ColumnAddFigure, SVG_W, SVG_H } from './BoxAdd19B9Illustration'
import { buildBoxAdd19B9Steps } from './boxAdd19B9Steps'

const GREEN  = '#10B981'
const BLUE   = '#2563EB'

export default function BoxAdd19B9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBoxAdd19B9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: jumlah digit 1–7=28; kelebihan 72=9×(jml puluhan)→puluhan=8; ' +
        'set terbaik {5,2,1}→57+23+14+6=100; 57 tidak ada di pilihan → jawaban E.'
      : 'Explainer: digit sum 1–7=28; extra 72=9×(tens sum)→tens=8; ' +
        'best set {5,2,1}→57+23+14+6=100; 57 not listed → answer E.'

  return (
    <div className="mx-auto w-full max-w-[240px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
          <ColumnAddFigure
            digits={beat.digits}
            fills={beat.fills}
            highlightResult={beat.highlightResult}
          />
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
