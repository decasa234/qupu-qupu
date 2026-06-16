import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  LabelledFigure,
  figureOrigin,
  EQUAL_PARTS_VIEW_W,
  EQUAL_PARTS_VIEW_H,
  type EqualPartsLabel,
} from './EqualPartsG2Illustration'
import { buildEqualPartsG2Steps } from './equalPartsG2Steps'

const GREEN = '#10B981'

const LABELS: EqualPartsLabel[] = ['A', 'B', 'C', 'D']

export default function EqualPartsG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildEqualPartsG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: periksa setiap persegi A–D; hanya C yang dibagi menjadi bagian tak sama, jadi jawabannya C.'
      : 'Explainer: check each square A–D; only C is divided into unequal parts, so the answer is C.'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${EQUAL_PARTS_VIEW_W} ${EQUAL_PARTS_VIEW_H}`}
          width="100%"
          style={{ maxWidth: EQUAL_PARTS_VIEW_W }}
          aria-hidden="true"
        >
          {LABELS.map((label) => {
            const o = figureOrigin(LABELS.indexOf(label))
            const verdict = beat.verdicts[label]
            const shade = beat.focus === label || verdict !== 'none'
            return (
              <LabelledFigure
                key={label}
                label={label}
                x={o.x}
                y={o.y}
                shade={shade}
                verdict={verdict}
              />
            )
          })}
        </svg>

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
