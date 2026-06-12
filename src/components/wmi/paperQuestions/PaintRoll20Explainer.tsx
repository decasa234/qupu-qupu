import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PaintRollDiagram } from './PaintRoll20Illustration'
import { buildPaintRoll20Steps } from './paintRoll20Steps'

const GREEN = '#10B981'

export default function PaintRoll20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPaintRoll20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: cat tumpah dan balok berdiri di genangannya, jadi alas dan sisi kirinya basah; sisi atas dan kanan kering. Balok menggelinding ke kanan seperempat putaran demi seperempat putaran: gulingan 1 sisi kanan yang kering tidak meninggalkan cat, gulingan 2 sisi atas yang kering mendarat tepat di kotak 1 sehingga kotak 1 tetap bersih, gulingan 3 sisi kiri yang basah mengecap kotak 3 dan kotak 2, gulingan 4 alas yang basah mengecap kotak 4. Catnya habis sebelum kotak 5, jadi kotak 5 tetap bersih. Jawabannya ${story.answer}.`
      : `Explainer: the paint has spilled and the block stands in the puddle, so its bottoms and left sides are wet while the tops and right sides are dry. The block rolls right one quarter-turn at a time: roll 1 the dry right sides leave no paint, roll 2 the dry tops land right on square 1 so it stays clean, roll 3 the wet left sides stamp square 3 and square 2, roll 4 the soaked bottoms stamp square 4. The paint is used up before square 5, so it stays clean. The answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PaintRollDiagram
          rollsDone={beat.rollsDone}
          stamped={beat.stamped}
          dryCells={beat.dryCells}
          dryLabel={story.dryLabel}
          wetLabel={story.wetLabel}
        />

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
