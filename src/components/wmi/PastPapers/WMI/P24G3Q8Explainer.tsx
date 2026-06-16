/**
 * WMI-24P3A-Q8 post-answer explainer — folding a regular hexagon twice.
 *
 * Reuses the static figure's `HexFold` primitive so the animation reads as the
 * same scene coming alive: fold 1 (horizontal axis) → an isosceles trapezoid
 * (half the hexagon), fold 2 (its vertical axis) → a right trapezoid (a quarter
 * hexagon), which is the pictured option A.
 */
import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HexFold } from './P24G3Q8Illustration'
import { buildP24G3Q8Steps } from './p24G3Q8Steps'

const GREEN = '#10B981'

export default function P24G3Q8Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G3Q8Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dua lipatan simetris segi enam menghasilkan trapesium siku-siku (seperempat segi enam) — pilihan A.'
      : 'Explainer: two symmetric folds of a hexagon give a right trapezoid (a quarter hexagon) — option A.'

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <HexFold
          showFold1={beat.showFold1}
          showFold2={beat.showFold2}
          showHalf={beat.showHalf}
          showQuarter={beat.showQuarter}
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
