/**
 * SEAMOX-20-A-Q4 — Explainer for "How many rectangles are in the figure below?"
 *
 * Cycles through each of the 12 rectangles beat-by-beat, highlighting it with
 * a green dashed ring, then reveals the final count of 12.
 *
 * Uses the shared SeamoX20A4FigureSVG primitive (same geometry as the stem).
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SeamoX20A4FigureSVG, ALL_RECTS } from './SeamoX20A4Figure'
import { buildSeamoX20A4Steps } from './seamoX20A4Steps'

const GREEN = '#10B981'

export default function SeamoX20A4Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildSeamoX20A4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const rectHighlight =
    beat.phase === 'count' && beat.rectIndex != null
      ? ALL_RECTS[beat.rectIndex] ?? null
      : null

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menghitung persegi panjang dari semua ukuran — totalnya ${story.total}.`
      : `Explainer: counting rectangles of every size — the total is ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SeamoX20A4FigureSVG rectHighlight={rectHighlight} />

        {beat.running > 0 && (
          <div
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#2f6df0' }}
          >
            {beat.running}
          </div>
        )}

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
