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
      ? `Penjelasan: hanya alasnya yang kering — sisi tempat balok berdiri; semua sisi lainnya basah. Balok berdiri tepat di atas kotak 1, jadi alas yang kering menutupinya dan kotak 1 tidak pernah kena cat. Balok menggelinding ke kanan seperempat putaran demi seperempat putaran: gulingan 1 sisi kanan yang basah mengecat kotak 2, gulingan 2 sisi atas yang basah mengecap kotak 3, gulingan 3 sisi kiri yang basah mengecap kotak 4, gulingan 4 mendarat di alas yang kering dan catnya sudah habis sebelum kotak 5, jadi kotak 5 tetap bersih. Jawabannya ${story.answer}.`
      : `Explainer: only the bottom is dry — the face the block stands on; every other face is wet. The block stands right on square 1, so the dry bottom covers it and square 1 never gets paint. The block rolls right one quarter-turn at a time: roll 1 the wet right sides paint square 2, roll 2 the wet tops stamp square 3, roll 3 the wet left sides stamp square 4, roll 4 lands on the dry bottoms and the paint is finished before square 5, so it stays clean. The answer is ${story.answer}.`

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
