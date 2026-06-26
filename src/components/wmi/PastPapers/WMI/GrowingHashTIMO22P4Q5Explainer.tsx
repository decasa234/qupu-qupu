// GrowingHashTIMO22P4Q5Explainer.tsx
// TIMO-22-P4H-Q5 animated explainer.
//
// 4 beats: observe → count/diff (+10 each) → formula (10n−6) → answer (Group 9 = 84).

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildGrowingHashTIMO22P4Q5Steps } from './growingHashTIMO22P4Q5Steps'

const CS  = 12    // cell size (px)
const BL  = 148   // common bottom-baseline y
const PAD = 14
const GAP = 14

// Left-x for Groups 1–4 (n = 1..4)
const GROUP_LX = [
  PAD,                          // G1: 14
  PAD + 2 * CS + GAP,          // G2: 54
  PAD + 6 * CS + 2 * GAP,     // G3: 122
  PAD + 12 * CS + 3 * GAP,    // G4: 218
] as const

// Count badges and midpoints for +10 diff labels
const COUNTS = [4, 14, 24, 34] as const
// Midpoints between consecutive group centres (each group n has centre at lx + n*CS)
const MID_X = [
  (GROUP_LX[0] + 1 * CS + GROUP_LX[1] + 2 * CS) / 2,  // between G1 and G2
  (GROUP_LX[1] + 2 * CS + GROUP_LX[2] + 3 * CS) / 2,  // between G2 and G3
  (GROUP_LX[2] + 3 * CS + GROUP_LX[3] + 4 * CS) / 2,  // between G3 and G4
] as const

// All filled [row, col] cells for group n (0-indexed inside 2n×2n grid).
function groupCells(n: number): Array<[number, number]> {
  const cells: Array<[number, number]> = []
  const max = 2 * n - 1
  for (let r = 0; r <= max; r++) {
    for (let c = 0; c <= max; c++) {
      const frame = r === 0 || r === max || c === 0 || c === max
      const diag  = r >= 1 && r <= max - 1 && r + c === max
      if (frame || diag) cells.push([r, c])
    }
  }
  return cells
}

export default function GrowingHashTIMO22P4Q5Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildGrowingHashTIMO22P4Q5Steps(lang as 'en' | 'id')
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
      <div
        className="mx-auto w-full max-w-[420px]"
        role="img"
        aria-label="Penjelasan animasi pola # kelompok"
      >
        <svg viewBox="0 0 330 248" width="100%" aria-hidden="true">

          {/* Groups 1–4 */}
          {([1, 2, 3, 4] as const).map((n, gi) => {
            const lx = GROUP_LX[gi]
            const cx = lx + n * CS
            const dim = 2 * n
            const top = BL - dim * CS
            const max = dim - 1
            const filled = new Set(groupCells(n).map(([r, c]) => `${r},${c}`))

            return (
              <g key={n}>
                {/* All grid cells */}
                {Array.from({ length: dim * dim }, (_, i) => {
                  const r = Math.floor(i / dim)
                  const c = i % dim
                  const isFilled = filled.has(`${r},${c}`)
                  return (
                    <rect
                      key={`${r},${c}`}
                      x={lx + c * CS}
                      y={top + r * CS}
                      width={CS}
                      height={CS}
                      fill={isFilled ? '#DBEAFE' : '#F9FAFB'}
                      stroke={isFilled ? '#1E40AF' : '#D1D5DB'}
                      strokeWidth={isFilled ? 0.7 : 0.35}
                    />
                  )
                })}

                {/* # text on filled cells */}
                {groupCells(n).map(([r, c]) => (
                  <text
                    key={`t${r},${c}`}
                    x={lx + c * CS + CS / 2}
                    y={top + r * CS + CS * 0.74}
                    textAnchor="middle"
                    fontSize={CS * 0.68}
                    fill="#1E40AF"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    #
                  </text>
                ))}

                {/* Count badge */}
                {b.showCounts && (
                  <text
                    x={cx}
                    y={168}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#1D4ED8"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {COUNTS[gi]}
                  </text>
                )}

                {/* Group label */}
                <text
                  x={cx}
                  y={180}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#6B7280"
                  fontFamily="sans-serif"
                >
                  {`Kelompok ${n}`}
                </text>
              </g>
            )
          })}

          {/* +10 diff labels between group count badges */}
          {b.showDiffs && MID_X.map((mx, i) => (
            <text
              key={i}
              x={mx}
              y={168}
              textAnchor="middle"
              fontSize={9}
              fill="#059669"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              +10
            </text>
          ))}

          {/* Formula */}
          {b.showFormula && (
            <text
              x={165}
              y={200}
              textAnchor="middle"
              fontSize={12}
              fill="#059669"
              fontFamily="sans-serif"
            >
              {lang === 'id' ? 'Rumus: 10 × n − 6' : 'Formula: 10 × n − 6'}
            </text>
          )}

          {/* Answer */}
          {b.showAnswer && (
            <text
              x={165}
              y={220}
              textAnchor="middle"
              fontSize={13}
              fill="#DC2626"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {lang === 'id'
                ? 'Kelompok ke-9: 10 × 9 − 6 = 84'
                : 'Group 9: 10 × 9 − 6 = 84'}
            </text>
          )}

        </svg>
      </div>
      <p className="text-center text-sm text-slate-600 max-w-xs px-2">{caption}</p>
    </div>
  )
}
