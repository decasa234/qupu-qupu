// SASMO-19-G2-Q17 — animated explainer.
// Beats: show all → highlight triangles(8) → highlight rectangles(15)
//         → highlight circles(19) → result 8+15+19=42.
// Imports TownShapesDiagram from the illustration (no duplicate geometry).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TownShapesDiagram } from './TownShapesSASMO19G2Q17Illustration'
import { buildTownShapesSteps, N_TRIANGLES, N_RECTANGLES, N_CIRCLES, N_TOTAL } from './townShapesSASMO19G2Q17Steps'

const PHASE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  all:        { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8' },
  triangles:  { bg: '#EDE9FE', border: '#7C3AED', text: '#5B21B6' },
  rectangles: { bg: '#FEF3C7', border: '#B45309', text: '#92400E' },
  circles:    { bg: '#D1FAE5', border: '#047857', text: '#065F46' },
  result:     { bg: '#D1FAE5', border: '#059669', text: '#065F46' },
}

export default function TownShapesSASMO19G2Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTownShapesSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const colors = PHASE_COLORS[beat.phase] ?? PHASE_COLORS.all

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ${N_TRIANGLES} segitiga + ${N_RECTANGLES} persegi panjang + ${N_CIRCLES} lingkaran = ${N_TOTAL}`
      : `Explainer: ${N_TRIANGLES} triangles + ${N_RECTANGLES} rectangles + ${N_CIRCLES} circles = ${N_TOTAL}`

  // map explainer phase to diagram highlight phase
  const diagramPhase =
    beat.phase === 'result' ? 'all' :
    beat.phase === 'triangles' ? 'triangles' :
    beat.phase === 'rectangles' ? 'rectangles' :
    beat.phase === 'circles' ? 'circles' : 'all'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        <TownShapesDiagram phase={diagramPhase} />

        {/* tally row (shown during count phases) */}
        {beat.phase !== 'all' && (
          <div className="flex gap-4 text-xs font-bold">
            <span style={{ color: '#7C3AED' }}>
              △ {beat.phase === 'triangles'  || beat.phase === 'result' ? N_TRIANGLES  : '?'}
            </span>
            <span style={{ color: '#B45309' }}>
              ▭ {beat.phase === 'rectangles' || beat.phase === 'result' ? N_RECTANGLES : '?'}
            </span>
            <span style={{ color: '#047857' }}>
              ○ {beat.phase === 'circles'    || beat.phase === 'result' ? N_CIRCLES    : '?'}
            </span>
            {beat.phase === 'result' && (
              <span style={{ color: '#065F46', fontWeight: 900 }}>
                = {N_TOTAL}
              </span>
            )}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={{
            background: colors.bg,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
