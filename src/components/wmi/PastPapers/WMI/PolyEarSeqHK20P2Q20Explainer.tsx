// HKIMO-20-P2H-Q20 — post-answer animated explainer.
// Reuses the static illustration from PolyEarSeqHK20P2Q20Illustration
// and adds beat-driven captions + formula/answer overlays.
//
// Beats:
//   0. intro   — static three-panel view; read edge counts.
//   1. pattern — highlight +1 growth per figure.
//   2. formula — show "Figure n = n + 5 edges".
//   3. answer  — Figure 6 = 6 + 5 = 11.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import PolyEarSeqHK20P2Q20Illustration from './PolyEarSeqHK20P2Q20Illustration'
import { buildPolyEarSeqHK20P2Q20Steps, FIGURE_N, ANSWER } from './polyEarSeqHK20P2Q20Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function PolyEarSeqHK20P2Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPolyEarSeqHK20P2Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pola sisi +1 per bangun; bangun ke-${FIGURE_N} punya ${ANSWER} sisi.`
      : `Explainer: edges +1 per figure; figure ${FIGURE_N} has ${ANSWER} edges.`

  const hp = beat.highlightPanel === 'all' ? null : (beat.highlightPanel as 1 | 2 | 3 | null)

  return (
    <div className="mx-auto w-full max-w-[600px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PolyEarSeqHK20P2Q20Illustration highlightPanel={hp} />

        {beat.showFormula && (
          <div className="rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-2 text-center font-mono text-sm font-bold text-blue-800">
            {lang === 'id'
              ? `Bangun ke-n = n + 5 sisi`
              : `Figure n = n + 5 edges`}
          </div>
        )}

        {beat.showAnswer && (
          <div
            className="rounded-lg border-2 px-5 py-2 text-center font-display text-base font-extrabold"
            style={{ background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }}
          >
            {lang === 'id'
              ? `Bangun ke-${FIGURE_N} = ${FIGURE_N} + 5 = ${ANSWER}`
              : `Figure ${FIGURE_N} = ${FIGURE_N} + 5 = ${ANSWER}`}
          </div>
        )}

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
