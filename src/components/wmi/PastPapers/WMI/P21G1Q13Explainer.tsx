import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CubeFigure,
  FIGURE_FOOTPRINTS,
  FIGURE_ORDER,
  Q13_VIEW_H,
  Q13_VIEW_W,
  type FigureLabel,
} from './P21G1Q13Illustration'
import { buildP21G1Q13Steps } from './p21G1Q13Steps'

// WMI-21P1A-Q13 — post-answer explainer. Reuses the illustration's four cube
// figures (CubeFigure / FIGURE_FOOTPRINTS) and walks A→B→C→D, revealing each
// cube count with a running leader badge, then crowns figure D (9 cubes, the
// most) as the answer.

const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE = '#30598A'

// Same 2 × 2 grid as the illustration, plus a per-cell count badge anchor.
const CELL: Record<FigureLabel, { lx: number; ox: number; oy: number; bx: number; by: number }> = {
  A: { lx: 24, ox: 56, oy: 40, bx: 96, by: 26 },
  B: { lx: 196, ox: 224, oy: 40, bx: 296, by: 26 },
  C: { lx: 24, ox: 56, oy: 178, bx: 110, by: 164 },
  D: { lx: 196, ox: 232, oy: 168, bx: 300, by: 154 },
}

export default function P21G1Q13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? `Penjelasan: hitung kubus tiap bangun (${story.counts.A}, ${story.counts.B}, ${story.counts.C}, ${story.counts.D}); paling banyak adalah bangun (${story.answer}).`
      : `Explainer: count each figure's cubes (${story.counts.A}, ${story.counts.B}, ${story.counts.C}, ${story.counts.D}); the most is figure (${story.answer}).`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${Q13_VIEW_W} ${Q13_VIEW_H}`}
          width="100%"
          style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {FIGURE_ORDER.map((label) => {
            const c = CELL[label]
            const isCounted = beat.counted.includes(label)
            const isLeader = beat.leader === label && beat.counted.includes(label)
            const isWin = beat.result && story.answer === label
            return (
              <g key={label} opacity={beat.active && beat.active !== label && !isCounted ? 0.4 : 1}>
                <text x={c.lx} y={c.oy - 18} fontSize={18} fontWeight={900} fill={INK} className="font-display">
                  {`(${label})`}
                </text>
                <CubeFigure footprint={FIGURE_FOOTPRINTS[label]} ox={c.ox} oy={c.oy} highlight={isWin || isLeader} />
                {isCounted && (
                  <g>
                    <circle
                      cx={c.bx}
                      cy={c.by}
                      r={14}
                      fill={isWin ? '#D1FAE5' : '#E1EFFB'}
                      stroke={isWin ? GREEN : BLUE}
                      strokeWidth={2.4}
                    />
                    <text
                      x={c.bx}
                      y={c.by}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={14}
                      fontWeight={900}
                      fill={isWin ? '#065F46' : BLUE}
                      className="font-display"
                    >
                      {story.counts[label]}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>

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
