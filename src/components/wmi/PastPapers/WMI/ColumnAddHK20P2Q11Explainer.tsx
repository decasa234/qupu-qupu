import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ColumnAddHK20P2Q11Diagram } from './ColumnAddHK20P2Q11Illustration'
import { buildColumnAddHK20P2Q11Steps } from './columnAddHK20P2Q11Steps'

const VIOLET = '#7C3AED'
const BLUE = '#30598A'

export default function ColumnAddHK20P2Q11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildColumnAddHK20P2Q11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: AB + AA = 1C4; B + A = 14 (simpan); 2A + 1 selalu ganjil → C ganjil.'
      : 'Explainer: AB + AA = 1C4; B + A = 14 (carry); 2A + 1 is always odd → C is Odd.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ColumnAddHK20P2Q11Diagram
          highlightCol={beat.highlightCol}
          showCarry={beat.showCarry}
        />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#EDE9FE', borderColor: VIOLET, color: VIOLET }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
