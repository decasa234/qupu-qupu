/**
 * P21G3Q25Explainer — beat-by-beat solution for WMI-21P3A-Q25 (2021 G3 Semifinal).
 *
 * Reuses the KenKenP21G3Q25Figure primitive from the illustration. Walks the
 * cage deductions (given 2 → 3× → 24× → 8× → 36× → fill the rest), then reads the
 * three marked cells and sums them: A + B + C = 4 + 4 + 1 = 9 (answer C).
 *
 * The unique solution and A/B/C values are verified in the SSR smoke (Latin rows
 * & columns + every cage product re-checked).
 *
 * SSR-safe, deterministic. No Math.random, no Date, no window/document at module top.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { KenKenP21G3Q25Figure } from './P21G3Q25Illustration'
import { buildP21G3Q25Steps } from './p21G3Q25Steps'

const GREEN = '#10B981'

export default function P21G3Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G3Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: selesaikan KenKen 4×4 dari petunjuk bingkai, lalu jumlahkan tiga sel bertanda: A + B + C = ${story.sum}. Jawaban ${story.answer}.`
      : `Explainer: solve the 4×4 KenKen from the cage clues, then add the three marked cells: A + B + C = ${story.sum}. Answer ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <KenKenP21G3Q25Figure
          solved={beat.solved}
          activeKeys={beat.activeKeys}
          litKeys={beat.litKeys}
          markAnswers={beat.markAnswers}
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
