/**
 * P21G3Q22Explainer — beat-by-beat solution for WMI-21P3A-Q22 (2021 G3 Semifinal).
 *
 * Reuses the DiceNetP21G3Q22 primitive from the illustration so the animation is
 * the same net coming alive. Teaches the opposite-faces-sum-7 method:
 *   fold → the ★ face lands opposite the 4 → ★ = 7 − 4 = 3 → answer B.
 *
 * SSR-safe, deterministic. No Math.random, no Date, no window/document at module top.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DiceNetP21G3Q22, Q22_CELL } from './P21G3Q22Illustration'
import { buildP21G3Q22Steps } from './p21G3Q22Steps'

const GREEN = '#10B981'
const PAD = 12
const GRID_COLS = 4
const GRID_ROWS = 3
const VIEW_W = GRID_COLS * Q22_CELL + PAD * 2
const VIEW_H = GRID_ROWS * Q22_CELL + PAD * 2
const DISPLAY_W = Math.min(300, VIEW_W)

export default function P21G3Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G3Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lipat jaring jadi kubus, sisi ★ berhadapan dengan 4, jadi ★ = 7 − 4 = ${story.starValue}. Jawaban ${story.answer}.`
      : `Explainer: fold the net into a cube; the ★ face is opposite the 4, so ★ = 7 − 4 = ${story.starValue}. Answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={DISPLAY_W} style={{ display: 'block' }} aria-hidden="true">
          <g transform={`translate(${PAD}, ${PAD})`}>
            <DiceNetP21G3Q22 litPair={beat.litPair} revealStarPips={beat.revealStarPips} />
          </g>
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
