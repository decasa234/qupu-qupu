// StarGroupPatternHK25P2Q5Explainer.tsx
// HKIMO-25-P2H-Q5 animated explainer.
//
// 4 beats: introduce shape → reveal counts (+2 each) → formula (2n−1) → answer (197).
//
// Draws each of the 4 groups as a mini n×n grid of cells, with * glyphs in the
// top row and left column. Binds to the quantities from the seed JSON:
//   Group 1 = 1 = 2×1−1, Group 2 = 3 = 2×2−1, Group 3 = 5 = 2×3−1, Group 4 = 7 = 2×4−1
//   Group 99 = 2×99−1 = 197

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildStarGroupPatternHK25P2Q5Steps } from './starGroupPatternHK25P2Q5Steps'

// ── Mini-grid layout ──────────────────────────────────────────────────────────

const CS   = 22   // cell size in explainer SVG units
const GAP  = 12   // horizontal gap between groups

// x position of each group's top-left corner (groups 1–4, index 0–3)
const GX: [number, number, number, number] = [
  8,
  8 + 1 * CS + GAP,
  8 + 1 * CS + GAP + 2 * CS + GAP,
  8 + 1 * CS + GAP + 2 * CS + GAP + 3 * CS + GAP,
]
// GX = [8, 42, 98, 176]

const MAX_GH = 4 * CS  // 88 — height of group 4 grid
const TOP_PAD = 6
const COUNTS = [1, 3, 5, 7]
const SVG_W = GX[3] + 4 * CS + 8   // 176 + 88 + 8 = 272
const SVG_H = TOP_PAD + MAX_GH + 60  // 6 + 88 + 60 = 154

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasStar(r: number, c: number): boolean {
  return r === 0 || c === 0
}

// ── Explainer component ───────────────────────────────────────────────────────

export default function StarGroupPatternHK25P2Q5Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildStarGroupPatternHK25P2Q5Steps(lang as 'en' | 'id')
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
      <div className="mx-auto w-full max-w-[340px]" role="img" aria-label="Star group pattern explainer">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" aria-hidden="true">

          {[1, 2, 3, 4].map((n, gi) => {
            const gx  = GX[gi]
            const gh  = n * CS
            const gy  = TOP_PAD + MAX_GH - gh  // bottom-align
            const midX = gx + (n * CS) / 2

            const cellFill  = b.showFormula ? '#EFF6FF' : '#FEF9C3'
            const starColor = b.showFormula ? '#1D4ED8' : '#92400E'
            const strokeC   = b.showFormula ? '#93C5FD' : '#D97706'

            return (
              <g key={n}>
                {/* Grid cells */}
                {Array.from({ length: n }, (_, r) =>
                  Array.from({ length: n }, (__, c) => {
                    const star  = hasStar(r, c)
                    const x = gx + c * CS
                    const y = gy + r * CS
                    return (
                      <g key={`${r},${c}`}>
                        <rect
                          x={x} y={y} width={CS} height={CS}
                          fill={star ? cellFill : '#FFFFFF'}
                          stroke="#9CA3AF" strokeWidth={0.8}
                        />
                        {star && (
                          <text
                            x={x + CS / 2} y={y + CS / 2}
                            textAnchor="middle" dominantBaseline="central"
                            fontSize={CS * 0.5} fontWeight={700}
                            fill={starColor}
                            fontFamily="ui-monospace, monospace"
                          >
                            *
                          </text>
                        )}
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

          {/* Formula line */}
          {b.showFormula && (
            <text
              x={SVG_W / 2} y={TOP_PAD + MAX_GH + 42}
              textAnchor="middle" fontSize={12}
              fill="#059669"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lang === 'id' ? 'Rumus: 2 × n − 1' : 'Formula: 2 × n − 1'}
            </text>
          )}

          {/* Answer line */}
          {b.showAnswer && (
            <text
              x={SVG_W / 2} y={TOP_PAD + MAX_GH + 58}
              textAnchor="middle" fontSize={13}
              fill="#DC2626" fontWeight="bold"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lang === 'id'
                ? 'Ke-99: 2×99−1 = 197'
                : 'Group 99: 2×99−1 = 197'}
            </text>
          )}
        </svg>
      </div>
      <p className="text-center text-sm text-slate-600 max-w-xs px-2">{caption}</p>
    </div>
  )
}
