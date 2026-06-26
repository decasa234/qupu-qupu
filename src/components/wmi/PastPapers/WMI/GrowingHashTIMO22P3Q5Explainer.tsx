// GrowingHashTIMO22P3Q5Explainer.tsx
// TIMO-22-P3H-Q5 animated explainer.
//
// 4 beats: observe → count/diff (+6 each) → formula (6n−2) → answer (Group 7 = 40).

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildGrowingHashTIMO22P3Q5Steps } from './growingHashTIMO22P3Q5Steps'

const CS = 9
const PAD = 10
const GAP = 6
const DOT_GAP = 22
const BOTTOM_Y = 148

const GROUP_LX = [
  PAD,
  PAD + 2 * CS + GAP,
  PAD + 2 * CS + GAP + 4 * CS + GAP,
  PAD + 2 * CS + GAP + 4 * CS + GAP + 6 * CS + GAP,
  PAD + 2 * CS + GAP + 4 * CS + GAP + 6 * CS + GAP + 8 * CS + DOT_GAP,
] as const

// Counts for groups 1–4 (used in count badges)
const COUNTS = [4, 10, 16, 22] as const

// x-midpoints between consecutive group centres for "+6" diff labels
// G1 cx=19, G2 cx=52, G3 cx=103, G4 cx=172
const MID_X = [36, 78, 138] as const

function hashCells(n: number): [number, number][] {
  const cells: [number, number][] = []
  const last = 2 * n - 1
  for (let r = 0; r <= last; r++) {
    if (r === last) {
      for (let c = 0; c < 2 * n; c++) cells.push([r, c])
    } else {
      const rr = Math.min(r, 2 * n - 2 - r)
      cells.push([r, rr])
      cells.push([r, 2 * n - 1 - rr])
    }
  }
  return cells
}

const DISPLAY_GROUPS = [1, 2, 3, 4, 7] as const

export default function GrowingHashTIMO22P3Q5Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildGrowingHashTIMO22P3Q5Steps(lang as 'en' | 'id')
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
        aria-label="Penjelasan animasi pola #"
      >
        <svg viewBox="0 0 370 205" width="100%" aria-hidden="true">
          {DISPLAY_GROUPS.map((n, gi) => {
            const lx = GROUP_LX[gi]
            const cx = lx + n * CS
            const isG7 = n === 7
            const cellFill = b.showFormula ? '#BFDBFE' : '#DBEAFE'
            const cellStroke = b.showFormula ? '#1D4ED8' : '#1E40AF'
            // G7 stays dimmed until showAnswer
            const g7Opacity = isG7 && !b.showAnswer ? 0.35 : 1

            return (
              <g key={n} opacity={g7Opacity}>
                {hashCells(n).map(([r, c]) => {
                  const px = lx + c * CS
                  const py = BOTTOM_Y - (2 * n - 1 - r) * CS
                  return (
                    <g key={`${r},${c}`}>
                      <rect
                        x={px} y={py}
                        width={CS} height={CS}
                        fill={cellFill} stroke={cellStroke} strokeWidth={0.75}
                      />
                      <text
                        x={px + CS / 2}
                        y={py + CS * 0.76}
                        textAnchor="middle"
                        fontSize={CS * 0.72}
                        fill={cellStroke}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        #
                      </text>
                    </g>
                  )
                })}

                {/* Count badge — G1–G4 only; G7 count shown via answer text */}
                {b.showCounts && !isG7 && (
                  <text
                    x={cx} y={162}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#1D4ED8"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {COUNTS[gi]}
                  </text>
                )}

                <text
                  x={cx} y={175}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#6B7280"
                  fontFamily="sans-serif"
                >
                  {`Kelompok ${n}`}
                </text>
              </g>
            )
          })}

          {/* "…" separator */}
          <text
            x={219}
            y={BOTTOM_Y - 3 * CS}
            textAnchor="middle"
            fontSize={14}
            fill="#6B7280"
            fontFamily="sans-serif"
          >
            …
          </text>

          {/* +6 diff labels between G1–G4 */}
          {b.showDiffs && MID_X.map((mx, i) => (
            <text
              key={i}
              x={mx} y={162}
              textAnchor="middle"
              fontSize={8.5}
              fill="#059669"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              +6
            </text>
          ))}

          {/* Formula */}
          {b.showFormula && (
            <text
              x={185} y={191}
              textAnchor="middle"
              fontSize={11}
              fill="#059669"
              fontFamily="sans-serif"
            >
              {lang === 'id' ? 'Rumus: 6 × n − 2' : 'Formula: 6 × n − 2'}
            </text>
          )}

          {/* Answer */}
          {b.showAnswer && (
            <text
              x={185} y={204}
              textAnchor="middle"
              fontSize={12}
              fill="#DC2626"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {lang === 'id'
                ? 'Kelompok ke-7: 6 × 7 − 2 = 40'
                : 'Group 7: 6 × 7 − 2 = 40'}
            </text>
          )}
        </svg>
      </div>
      <p className="text-center text-sm text-slate-600 max-w-xs px-2">{caption}</p>
    </div>
  )
}
