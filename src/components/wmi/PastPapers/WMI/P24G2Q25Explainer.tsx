import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DigitLattice, OPTIMAL_PATH } from './P24G2Q25Illustration'
import { buildP24G2Q25Steps } from './p24G2Q25Steps'

// Post-answer explainer for WMI-24P2A-Q25 (robot digit-lattice).
// Mirrors the static figure (DigitLattice) and traces the verified cheapest
// LEFT/RIGHT/DOWN path node by node with a running total, landing on 24 (answer A).

const GREEN = '#10B981'

export default function P24G2Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G2Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jalur termurah kiri/kanan/turun berjumlah ${story.total}; jawaban ${story.answer}.`
      : `Explainer: the cheapest left/right/down path totals ${story.total}; answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DigitLattice path={OPTIMAL_PATH} step={beat.step} />

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
