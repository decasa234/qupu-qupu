// TriStarGroupsHK23P3SFQ2Explainer.tsx
// HKIMO-23-P3SF-Q2 animated explainer.
//
// 4 beats: introduce groups → reveal star counts → formula → answer (120).
//
// Groups 1–2: empty n×n grids (0 stars visible, matching source figure).
// Groups 3–4: stars (*) at (r, c) 0-indexed where c < n − r − 1.
// Formula: n(n−1)/2. Group 16 → 16×15/2 = 120.
//
// Draws cells manually (not GridBoard) for per-beat color control.

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildTriStarGroupsHK23P3SFQ2Steps } from './triStarGroupsHK23P3SFQ2Steps'

// ── Layout constants ────────────────────────────────────────────────────────────

const CS      = 20    // cell size
const GAP     = 8     // gap between groups
const PAD     = 6     // side padding
const MAX_H   = 4 * CS   // 80
const TOP_PAD = 6
const COUNTS  = [0, 0, 3, 6]

const GX = [
  PAD,
  PAD + 1 * CS + GAP,
  PAD + 1 * CS + GAP + 2 * CS + GAP,
  PAD + 1 * CS + GAP + 2 * CS + GAP + 3 * CS + GAP,
]
// [6, 34, 82, 150]

const SVG_W = GX[3] + 4 * CS + PAD   // 150 + 80 + 6 = 236
const SVG_H = TOP_PAD + MAX_H + 60   // 6 + 80 + 60 = 146

function hasStar(n: number, r: number, c: number): boolean {
  return n >= 3 && c < n - r - 1
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TriStarGroupsHK23P3SFQ2Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildTriStarGroupsHK23P3SFQ2Steps(lang as 'en' | 'id')
  const beat  = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map(s => s.hold),
  })
  const b       = story.steps[beat]
  const caption = lang === 'id' ? b.caption_id : b.caption_en

  const starFill  = b.showFormula ? '#EFF6FF' : '#FEF9C3'
  const starColor = b.showFormula ? '#1D4ED8' : '#92400E'

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="mx-auto w-full max-w-[340px]"
        role="img"
        aria-label="Star triangle group pattern explainer"
      >
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" aria-hidden="true">

          {([1, 2, 3, 4] as const).map((n, gi) => {
            const gx   = GX[gi]
            const gy   = TOP_PAD + MAX_H - n * CS
            const midX = gx + (n * CS) / 2

            return (
              <g key={n}>
                {/* Grid cells */}
                {Array.from({ length: n }, (_, r) =>
                  Array.from({ length: n }, (__, c) => {
                    const isStar = hasStar(n, r, c)
                    const cx = gx + c * CS
                    const cy = gy + r * CS
                    return (
                      <g key={`${r},${c}`}>
                        <rect
                          x={cx} y={cy} width={CS} height={CS}
                          fill={isStar ? starFill : '#FFFFFF'}
                          stroke="#9CA3AF" strokeWidth={0.8}
                        />
                        {isStar && (
                          <text
                            x={cx + CS / 2} y={cy + CS / 2}
                            textAnchor="middle" dominantBaseline="central"
                            fontSize={Math.round(CS * 0.45)} fontWeight={700}
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
                    x={midX} y={TOP_PAD + MAX_H + 14}
                    textAnchor="middle" fontSize={10}
                    fill="#1D4ED8" fontWeight="bold"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {COUNTS[gi]}
                  </text>
                )}

                {/* Group label */}
                <text
                  x={midX} y={TOP_PAD + MAX_H + 26}
                  textAnchor="middle" fontSize={8}
                  fill="#6B7280"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {`${n}${(['st', 'nd', 'rd', 'th'] as const)[gi]}`}
                </text>
              </g>
            )
          })}

          {/* Formula */}
          {b.showFormula && (
            <text
              x={SVG_W / 2} y={TOP_PAD + MAX_H + 42}
              textAnchor="middle" fontSize={11}
              fill="#059669"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lang === 'id' ? 'Rumus: n × (n−1) ÷ 2' : 'Formula: n × (n−1) ÷ 2'}
            </text>
          )}

          {/* Answer */}
          {b.showAnswer && (
            <text
              x={SVG_W / 2} y={TOP_PAD + MAX_H + 58}
              textAnchor="middle" fontSize={13}
              fill="#DC2626" fontWeight="bold"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lang === 'id' ? 'Ke-16: 16×15÷2 = 120' : 'Group 16: 16×15÷2 = 120'}
            </text>
          )}
        </svg>
      </div>
      <p className="text-center text-sm text-slate-600 max-w-xs px-2">{caption}</p>
    </div>
  )
}
