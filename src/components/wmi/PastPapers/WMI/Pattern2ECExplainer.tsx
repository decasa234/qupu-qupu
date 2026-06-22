// IKMC-20-EC-Q2 — post-answer explainer.
//
// Reuses Pattern2ECIllustration's Pattern2ECGrid primitive so the animated grid
// uses the exact same tile geometry as the stem figure.
//
// Five beats (from pattern2ECSteps.ts):
//   1. Overview — each tile is the same design in 4 rotations.
//   2. Highlight the middle row — observe the +90° step rule.
//   3. Deduce missing cell: col 1 = 90° → col 2 = 180°.
//   4. Cross-check with column 3 (top=90°, bottom=0° → middle=180°).
//   5. Reveal answer E (fill the missing tile with the 180° tile).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Pattern2ECGrid, ANSWER_LABEL, ANSWER_ROT } from './Pattern2ECIllustration'
import { buildPattern2ECSteps } from './pattern2ECSteps'

const GREEN = '#10B981'
const BLUE  = '#30598A'

export default function Pattern2ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPattern2ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? `Penjelasan: pola ubin 5×3; potongan yang hilang diputar ${ANSWER_ROT}°, pilihan (${ANSWER_LABEL}).`
      : `Explainer: 5×3 tile pattern; the missing piece is rotated ${ANSWER_ROT}°, answer (${ANSWER_LABEL}).`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <Pattern2ECGrid
          showAnswer={beat.showAnswer}
          highlightRow={beat.highlightRow}
          highlightCol={beat.highlightCol}
        />

        {/* Caption chip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
