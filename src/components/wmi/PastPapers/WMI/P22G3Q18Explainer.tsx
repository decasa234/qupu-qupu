import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CheckGridFigure } from './P22G3Q18Illustration'
import { buildP22G3Q18Steps } from './p22G3Q18Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// WMI-22P3A-Q18 — post-answer explainer for the white check-mark area.
// Re-uses the static CheckGridFigure: count the 8 small rectangles (288 cm²),
// recognise the white tick is one quarter, land on 288 ÷ 4 = 72 (answer D).
export default function P22G3Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G3Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: seluruh kisi 8 × 36 = ${story.total} cm², putih seperempatnya, jadi ${story.white} cm².`
      : `Explainer: whole grid 8 × 36 = ${story.total} cm², the white tick is one quarter, so ${story.white} cm².`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CheckGridFigure
          showTotal={beat.showTotal}
          emphasizeWhite={beat.emphasizeWhite}
          whiteLabel={beat.whiteLabel}
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
