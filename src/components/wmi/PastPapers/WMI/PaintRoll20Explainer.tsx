import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
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
      ? `Penjelasan: cat tumpah dan balok berdiri di genangannya, jadi alas dan sisi kirinya basah. Balok menggelinding ke kanan. Tumpukan tinggi di belakang meninggalkan jejak basah panjang sepanjang baris belakang dan mengecap kotak 2; kubus kecil di depan hanya mengecap beberapa kotak, yaitu kotak 3 dan kotak 4. Kotak 1 hanya tersentuh sisi kering, dan di baris depan catnya berhenti sebelum kotak 5, jadi kotak 1 dan kotak 5 tetap bersih. Jawabannya ${story.answer}.`
      : `Explainer: the paint has spilled and the block stands in the puddle, so its bottoms and left sides are wet. The block tumbles to the right. The tall back stack leaves a long wet trail along the whole back row and paints square 2; the little front cube stamps only a couple of squares, square 3 and square 4. Square 1 only met a dry side, and in the front row the paint stops before square 5, so squares 1 and 5 stay clean. The answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <PaintRollDiagram
          stamped={beat.stamped}
          fresh={beat.fresh}
          cleanCells={beat.cleanCells}
          cleanLabel={story.cleanLabel}
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
