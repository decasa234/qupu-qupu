// IKMC-21-EC-Q23 — post-answer beat-by-beat explainer.
//
// Reuses NumberArrowsFigure from NumberArrows23ECIllustration.
// Animation traces arrow chains from the known values 5 and 7 to deduce
// that the "?" square (top-right) must contain 6 (answer D).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberArrowsFigure } from './NumberArrows23ECIllustration'
import { buildNumberArrows23ECSteps } from './numberArrows23ECSteps'

const GREEN = '#10B981'
const BLUE  = '#1D4ED8'

export default function NumberArrows23ECExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildNumberArrows23ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: '#1E3A8A' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lacak rantai panah dari 5 dan 7 untuk menyimpulkan bahwa kotak "?" harus berisi 6 — jawaban D.'
      : 'Explainer: trace arrow chains from 5 and 7 to deduce the "?" square must contain 6 — answer D.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        <NumberArrowsFigure
          solved={beat.solved}
          activeKeys={beat.activeKeys}
          activeEdges={beat.activeEdges}
        />

        {isResult && (
          <div
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            {lang === 'id' ? '? = 6, Jawaban D' : '? = 6, Answer D'}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
