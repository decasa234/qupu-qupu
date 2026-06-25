import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RectilinearUFigure, type RectPhase } from './Rectilinear20A4Illustration'
import { buildRectilinear20A4Steps } from './rectilinear20A4Steps'

// SEAMO-20-A-Q4 — animated explainer for the U-shape perimeter.
//
// Beats:
//   0. intro    — static figure + three labeled sides.
//   1. labeled  — blue highlight the three labeled sides (total 50 cm).
//   2. deduced  — amber highlight the unlabeled sides (also 50 cm by symmetry).
//   3. total    — full green outline + 100 cm answer.

const GREEN = '#10B981'
const BLUE_BOX = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'

export default function Rectilinear20A4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const storyboard = useMemo(() => buildRectilinear20A4Steps(lang === 'id' ? 'id' : 'en'), [lang])
  const index = useBeatControl(storyboard.finalIndex, {
    ...props,
    holds: storyboard.steps.map((s) => s.hold),
  })
  const beat = storyboard.steps[index] ?? storyboard.steps[storyboard.finalIndex]

  const aria =
    lang === 'id'
      ? 'Sisi berlabel berjumlah 50 cm; sisi tak berlabel juga 50 cm; keliling = 100 cm.'
      : 'Labeled sides total 50 cm; unlabeled sides also total 50 cm; perimeter = 100 cm.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <RectilinearUFigure phase={beat.phase as RectPhase} />

        {beat.equation && (
          <div
            className="rounded-lg px-4 py-1 text-center font-display text-base font-extrabold"
            style={{ background: '#F3F4F6', color: '#1F2937', letterSpacing: '0.01em' }}
          >
            {beat.equation}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BOX, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
