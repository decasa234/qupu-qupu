/**
 * SEAMOX-24-B-Q11 — Explainer
 * Animates the solution beat-by-beat:
 *   1. Square with midpoints E, F
 *   2. Draw lines EB and FC → intersection G
 *   3. Shade triangle BGC; announce area = s²/5
 *   4. Solve: s²/5 = 48 → s² = 240 cm²
 *
 * Imports the shared SquareMidX24B11SVG primitive from the illustration.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SquareMidX24B11SVG } from './SquareMidX24B11Illustration'
import { buildSquareMidX24B11Steps } from './squareMidX24B11Steps'

const GREEN = '#10B981'
const BLUE = '#2563EB'

export default function SquareMidX24B11Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildSquareMidX24B11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: luas segitiga yang diarsir = s²/5, jadi luas persegi = 5 × 48 = 240 cm².'
      : 'Explainer: shaded triangle area = s²/5, so square area = 5 × 48 = 240 cm².'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SquareMidX24B11SVG
          showLines={beat.showLines}
          showShade={beat.showShade}
        />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: '#1e3a5f' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
