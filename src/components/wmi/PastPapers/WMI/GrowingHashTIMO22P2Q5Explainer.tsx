// GrowingHashTIMO22P2Q5Explainer.tsx
// TIMO-22-P2H-Q5 animated explainer.
//
// 4 beats: observe → count/diff (+6 each) → formula (6n−3) → answer (Group 6 = 33).

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildGrowingHashTIMO22P2Q5Steps } from './growingHashTIMO22P2Q5Steps'

const CS = 15
const BOTTOM_Y = 150
const PAD = 14
const GAP = 14

const GROUP_LX = [
  PAD,
  PAD + 2 * CS + GAP,
  PAD + 6 * CS + 2 * GAP,
  PAD + 12 * CS + 3 * GAP,
] as const

// Group counts and midpoint x-values for the +6 diff labels
const COUNTS = [3, 9, 15, 21] as const
const MID_X = [58, 133, 237] as const   // midpoints between group centres

function hashCells(n: number): [number, number][] {
  const cells: [number, number][] = []
  const last = 2 * n - 1
  for (let r = 0; r <= last; r++) {
    if (r === last) {
      for (let c = 0; c < 2 * n; c++) cells.push([r, c])
    } else {
      const lo = Math.min(r, last - 1 - r)
      const hi = Math.max(r, last - 1 - r)
      cells.push([r, lo])
      if (hi !== lo) cells.push([r, hi])
    }
  }
  return cells
}

export default function GrowingHashTIMO22P2Q5Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildGrowingHashTIMO22P2Q5Steps(lang as 'en' | 'id')
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
        <svg viewBox="0 0 390 238" width="100%" aria-hidden="true">
          {([1, 2, 3, 4] as const).map((n, gi) => {
            const lx = GROUP_LX[gi]
            const cx = lx + n * CS
            const cellFill = b.showFormula ? '#BFDBFE' : '#DBEAFE'
            const cellStroke = b.showFormula ? '#1D4ED8' : '#1E40AF'
            return (
              <g key={n}>
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
                        y={py + CS * 0.74}
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

                {/* Count badge — shown when showCounts */}
                {b.showCounts && (
                  <text
                    x={cx} y={182}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#1D4ED8"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {COUNTS[gi]}
                  </text>
                )}

                <text
                  x={cx} y={196}
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

          {/* +6 diff labels between group count badges */}
          {b.showDiffs && MID_X.map((mx, i) => (
            <text
              key={i}
              x={mx} y={182}
              textAnchor="middle"
              fontSize={9}
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
              x={195} y={214}
              textAnchor="middle"
              fontSize={12}
              fill="#059669"
              fontFamily="sans-serif"
            >
              {lang === 'id' ? 'Rumus: 6 × n − 3' : 'Formula: 6 × n − 3'}
            </text>
          )}

          {/* Answer */}
          {b.showAnswer && (
            <text
              x={195} y={232}
              textAnchor="middle"
              fontSize={13}
              fill="#DC2626"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {lang === 'id'
                ? 'Kelompok ke-6: 6 × 6 − 3 = 33'
                : 'Group 6: 6 × 6 − 3 = 33'}
            </text>
          )}
        </svg>
      </div>
      <p className="text-center text-sm text-slate-600 max-w-xs px-2">{caption}</p>
    </div>
  )
}
