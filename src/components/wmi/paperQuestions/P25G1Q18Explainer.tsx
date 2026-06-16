import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { IsoSolid } from './P25G1Q18Illustration'
import { buildP25G1Q18Steps } from './p25G1Q18Steps'

const GREEN = '#10B981'

/**
 * Post-answer explainer for WMI-25P1A-Q18. Teaches the method (painted faces =
 * 6 − neighbours, so 4 painted ⇔ glued to exactly 2 cubes), then glows the six
 * such cubes a few at a time with a running count that lands on 6 (answer A).
 */
export default function P25G1Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q18Steps(lang, props.correctAnswer), [lang, props.correctAnswer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const runningLabel = lang === 'id' ? '4 sisi' : '4-faces'
  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kubus dengan tepat 2 tetangga punya 4 sisi dicat — ada ${story.total}.`
      : `Explainer: cubes glued to exactly 2 neighbours show 4 painted faces — there are ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <IsoSolid litFour={beat.litFour} revealCount={beat.revealCount} />

        <div
          className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }
          }
        >
          {`${runningLabel}: ${beat.running}`}
        </div>

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
