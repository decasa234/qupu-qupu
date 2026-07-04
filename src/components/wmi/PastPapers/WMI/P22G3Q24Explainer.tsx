import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BlocksFigure } from './P22G3Q24Illustration'
import { buildP22G3Q24Steps } from './p22G3Q24Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// WMI-22P3A-Q24 — post-answer explainer. Re-uses BlocksFigure: ring the RIGHT
// column (7 × 13 = 91), take off its 75-block to expose the band strip (16),
// then stretch across the 21-wide band = 3 strips → ★ = 3 × 16 = 48 (answer C).
export default function P22G3Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G3Q24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kolom kanan 7 × 13 = 91, dikurangi balok 75 menyisakan potongan pita 16; pita selebar 21 = 3 × 7, jadi ★ = 3 × 16 = ${story.star}.`
      : `Explainer: the right column is 7 × 13 = 91; minus the 75-block leaves a 16 band strip; the band is 21 = 3 × 7 wide, so ★ = 3 × 16 = ${story.star}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BlocksFigure
          highlightRight={beat.highlightRight}
          rightStripLabel={beat.rightStripLabel}
          bandLabel={beat.bandLabel}
        />

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
