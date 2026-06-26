import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FruitScalesSIMOC21G1Q18Diagram } from './FruitScalesSIMOC21G1Q18Illustration'
import { buildFruitScalesSIMOC21G1Q18Steps } from './fruitScalesSIMOC21G1Q18Steps'

const GREEN = '#10B981'

export default function FruitScalesSIMOC21G1Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildFruitScalesSIMOC21G1Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dari timbangan 3, pir hijau=3; dari timbangan 2, apel kuning = 1+6−3 = 4 — jawaban 4.'
      : 'Explainer: from scale 3, green pear=3; from scale 2, yellow apple = 1+6−3 = 4 — answer 4.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <FruitScalesSIMOC21G1Q18Diagram activeScale={beat.activeScale} />

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
