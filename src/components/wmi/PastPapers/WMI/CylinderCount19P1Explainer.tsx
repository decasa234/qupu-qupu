import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CylinderCluster } from './CylinderCount19P1Illustration'
import { buildCylinderCount19P1Steps } from './cylinderCount19P1Steps'

const GREEN = '#10B981'

/**
 * Post-answer explainer for WMI-19P1A-Q10. Walks the cylinder pile one horizontal
 * layer at a time (bottom → top), glowing the layer being counted and ticking a
 * running total that lands on 17: 8 (base) + 6 (middle) + 3 (top) = 17.
 */
export default function CylinderCount19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCylinderCount19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const [floor, mid, top] = story.layerCounts
  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hitung tumpukan silinder lapis demi lapis — ${floor} + ${mid} + ${top} = ${story.answer} silinder.`
      : `Explainer: count the cylinder pile layer by layer — ${floor} + ${mid} + ${top} = ${story.answer} cylinders.`

  const runningLabel = lang === 'id' ? 'Jumlah' : 'Count'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CylinderCluster litLayer={beat.litLayer} dimAbove={beat.dimAbove} />

        {/* running cylinder total */}
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
