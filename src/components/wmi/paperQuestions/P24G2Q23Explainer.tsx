import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { XorGridsScene } from './P24G2Q23Illustration'
import { buildP24G2Q23Steps } from './p24G2Q23Steps'

// Post-answer explainer for WMI-24P2A-Q23 (XOR-circle grids).
// Mirrors the static figure (XorGridsScene) and walks the XOR rule beat by beat:
// state the rule -> cancel the shared circles -> keep the lone circles -> land on
// the reconstructed answer grid (option C).

const GREEN = '#10B981'

export default function P24G2Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G2Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lingkaran di kedua kisi saling meniadakan, lingkaran tunggal tetap; hasilnya adalah pilihan ${story.answer}.`
      : `Explainer: circles in both grids cancel, lone circles stay; the result is option ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <XorGridsScene revealResult={beat.revealResult} highlightResult={beat.highlightResult} />

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
