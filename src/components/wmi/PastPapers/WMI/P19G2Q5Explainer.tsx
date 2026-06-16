import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubePile } from './P19G2Q5Illustration'
import { buildP19G2Q5Steps } from './p19G2Q5Steps'

const GREEN = '#10B981'

// Post-answer explainer for WMI-19P2A-Q5. Reuses the CubePile primitive and
// lights one horizontal layer at a time, counting 12 + 8 + 1 = 21 (choice C).
export default function P19G2Q5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP19G2Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung tumpukan kubus lapis demi lapis, seluruhnya ${story.total} kubus — jawaban C.`
      : `Explainer: count the cube pile layer by layer, ${story.total} cubes in total — answer C.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CubePile litLevel={beat.litLevel} />

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
