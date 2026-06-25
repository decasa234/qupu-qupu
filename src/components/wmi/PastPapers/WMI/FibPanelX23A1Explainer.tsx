/**
 * SEAMOX-23-A-Q1 — Animated explainer for "Find the missing number in the diagram".
 *
 * Walks through the Fibonacci-sum rule beat-by-beat:
 *   left_circle = 2nd + 3rd box; right_circle = left_circle + 3rd box.
 * Applies the rule to Panel 3 and reveals the answer 55.
 *
 * Uses the shared FibPanelX23A1SVG primitive from FibPanelX23A1Illustration.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FibPanelX23A1SVG } from './FibPanelX23A1Illustration'
import { buildFibX23A1Steps } from './fibPanelX23A1Steps'

export default function FibPanelX23A1Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildFibX23A1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: aturan Fibonacci — lingkaran kiri = kotak ke-2 + ke-3; jawaban yang hilang adalah 55.'
      : 'Explainer: Fibonacci rule — left circle = 2nd + 3rd box; the missing number is 55.'

  return (
    <div className="mx-auto w-full max-w-[640px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FibPanelX23A1SVG
          blankPanel={2}
          highlightPanel={beat.highlightPanel}
          highlightCircle={beat.highlightCircle}
          revealedAnswer={beat.revealAnswer ? '55' : undefined}
        />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.phase === 'result'
              ? { background: '#D1FAE5', borderColor: '#059669', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
