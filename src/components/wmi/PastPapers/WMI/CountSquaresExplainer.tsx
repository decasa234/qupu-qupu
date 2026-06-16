import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CountSquaresFigure, sizeColor } from './CountSquaresIllustration'
import { buildCountSquaresSteps } from './countSquaresSteps'

const GREEN = '#10B981'

export default function CountSquaresExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCountSquaresSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Each counting iteration takes the colour of the square size it's tallying.
  const counting = beat.phase === 'count' && beat.size != null
  const accent = counting ? sizeColor(beat.size).stroke : '#2f6df0'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menghitung persegi dari segala ukuran — totalnya ${story.total}.`
      : `Explainer: counting squares of every size — the total is ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <CountSquaresFigure highlightSize={beat.phase === 'count' ? beat.size : null} />

        {beat.running > 0 && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: beat.result ? GREEN : accent }}>
            {beat.running}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : counting
                ? { background: '#FFFFFF', borderColor: accent, color: accent }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
