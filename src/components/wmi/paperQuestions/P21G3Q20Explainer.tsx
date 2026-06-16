import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PinwheelSquare, BIG_SIDE, HOLE_SIDE, RECT_WIDE } from './P21G3Q20Illustration'
import { buildP21G3Q20Steps } from './p21G3Q20Steps'

// WMI-21P3A-Q20 — pinwheel of 4 equal rectangles inside a 22 cm square with a
// 6 cm square hole. Find the width. Solving L + w = 22 and L − w = 6 gives w = 8
// (answer A). The animation reuses the static PinwheelSquare primitive and reveals
// one relation per beat, landing on w = 8.

const BLUE = '#30598A'
const GREEN = '#10B981'

export default function P21G3Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildP21G3Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: each rectangle is L long and w wide. One big side gives L + w = ${BIG_SIDE}; the hole gives L − w = ${HOLE_SIDE}. Subtracting, 2w = ${BIG_SIDE - HOLE_SIDE}, so w = ${RECT_WIDE} cm. Answer A.`,
    `Penjelasan: tiap persegi panjang berpanjang L dan berlebar w. Satu sisi besar memberi L + w = ${BIG_SIDE}; lubang memberi L − w = ${HOLE_SIDE}. Dikurangkan, 2w = ${BIG_SIDE - HOLE_SIDE}, jadi w = ${RECT_WIDE} cm. Jawaban A.`,
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t('Two facts about the big side and the hole', 'Dua fakta tentang sisi besar dan lubang')}
        </div>

        <PinwheelSquare
          markHole={beat.markHole}
          showWidth={beat.showWidth}
          showLength={beat.showLength}
          showAnswer={beat.showAnswer}
        />

        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
