// StarGridGroupsHK24P3Q5Explainer.tsx
// HKIMO-24-P3H-Q5 animated explainer.
//
// 4 beats: introduce shape → reveal counts → formula → answer (182).
//
// Groups: G1=1×1=1, G2=2×1=2, G3=3×2=6, G4=4×3=12. All cells contain *.
// Formula (n≥2): Gn = n×(n−1). G14 = 14×13 = 182.

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildStarGridGroupsHK24P3Q5Steps } from './starGridGroupsHK24P3Q5Steps'

// ── Mini-grid layout ──────────────────────────────────────────────────────────

const CS  = 22   // cell size px
const GAP = 10   // horizontal gap between groups

function groupCols(n: number) { return n === 1 ? 1 : n - 1 }

// x-positions for groups 1–4 (index 0–3)
const GX: [number, number, number, number] = [
  6,
  6 + 1 * CS + GAP,
  6 + 1 * CS + GAP + 1 * CS + GAP,
  6 + 1 * CS + GAP + 1 * CS + GAP + 2 * CS + GAP,
]
// [6, 38, 70, 124]

const MAX_GH = 4 * CS   // 88 — tallest group
const TOP_PAD = 6
const COUNTS = [1, 2, 6, 12]
const SVG_W = GX[3] + 3 * CS + 6   // 124 + 66 + 6 = 196
const SVG_H = TOP_PAD + MAX_GH + 60  // 6 + 88 + 60 = 154

// ── Explainer component ───────────────────────────────────────────────────────

export default function StarGridGroupsHK24P3Q5Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildStarGridGroupsHK24P3Q5Steps(lang as 'en' | 'id')
  const beat = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map(s => s.hold),
  })
  const b = story.steps[beat]
  const caption = lang === 'id' ? b.caption_id : b.caption_en

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="mx-auto w-full max-w-[340px]" role="img" aria-label="Star grid group pattern explainer">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" aria-hidden="true">

          {[1, 2, 3, 4].map((n, gi) => {
            const gx   = GX[gi]
            const gc   = groupCols(n)
            const gh   = n * CS
            const gy   = TOP_PAD + MAX_GH - gh  // bottom-align
            const midX = gx + (gc * CS) / 2

            const cellFill  = b.showFormula ? '#EFF6FF' : '#FEF9C3'
            const starColor = b.showFormula ? '#1D4ED8' : '#92400E'

            return (
              <g key={n}>
                {/* Grid cells — all filled with * */}
                {Array.from({ length: n }, (_, r) =>
                  Array.from({ length: gc }, (__, c) => {
                    const x = gx + c * CS
                    const y = gy + r * CS
                    return (
                      <g key={`${r},${c}`}>
                        <rect
                          x={x} y={y} width={CS} height={CS}
                          fill={cellFill}
                          stroke="#9CA3AF" strokeWidth={0.8}
                        />
                        <text
                          x={x + CS / 2} y={y + CS / 2}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize={CS * 0.5} fontWeight={700}
                          fill={starColor}
                          fontFamily="ui-monospace, monospace"
                        >
                          *
                        </text>
                      </g>
                    )
                  }),
                )}

                {/* Count badge */}
                {b.showCounts && (
                  <text
                    x={midX} y={TOP_PAD + MAX_GH + 14}
                    textAnchor="middle" fontSize={11}
                    fill="#1D4ED8" fontWeight="bold"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {COUNTS[gi]}
                  </text>
                )}

                {/* Group label */}
                <text
                  x={midX} y={TOP_PAD + MAX_GH + 26}
                  textAnchor="middle" fontSize={9}
                  fill="#6B7280"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {`${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`}
                </text>
              </g>
            )
          })}

          {/* Formula */}
          {b.showFormula && (
            <text
              x={SVG_W / 2} y={TOP_PAD + MAX_GH + 42}
              textAnchor="middle" fontSize={12}
              fill="#059669"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lang === 'id' ? 'Rumus: n × (n − 1)' : 'Formula: n × (n − 1)'}
            </text>
          )}

          {/* Answer */}
          {b.showAnswer && (
            <text
              x={SVG_W / 2} y={TOP_PAD + MAX_GH + 58}
              textAnchor="middle" fontSize={13}
              fill="#DC2626" fontWeight="bold"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lang === 'id' ? 'Ke-14: 14×13 = 182' : 'Group 14: 14×13 = 182'}
            </text>
          )}
        </svg>
      </div>
      <p className="text-center text-sm text-slate-600 max-w-xs px-2">{caption}</p>
    </div>
  )
}
