import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BlocksFigure } from './P22G3Q24Illustration'
import { buildP22G3Q24Steps } from './p22G3Q24Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// WMI-22P3A-Q24 — post-answer explainer. Re-uses BlocksFigure: outline the big
// bounding rectangle (21 × 13 = 273), subtract the three 75-blocks (225), and
// land on the blue ★ band = 273 − 225 = 48 (answer C).
export default function P22G3Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G3Q24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: persegi panjang besar 21 × 13 = 273, dikurangi 3 × 75 = 225, jadi ★ = ${story.star}.`
      : `Explainer: big rectangle 21 × 13 = 273, minus 3 × 75 = 225, so ★ = ${story.star}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <BlocksFigure
          showBounding={beat.showBounding}
          emphasizeBounding={beat.emphasizeBounding}
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
