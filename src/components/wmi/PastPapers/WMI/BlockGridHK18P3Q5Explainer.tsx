// BlockGridHK18P3Q5Explainer.tsx
// HKIMO-18-P3H-Q5 animated explainer.
//
// 4 beats: introduce shape → reveal counts (+6, +10 diff) → formula 2n²−1 → answer 181.

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildBlockGridHK18P3Q5Steps } from './blockGridHK18P3Q5Steps'

const CS = 22
const CY = 80
const R = 7.7
const D = 5.0

const GROUP_CX = [21, 85, 193] as const
const COUNTS = [1, 7, 17] as const

function blockCells(n: number): [number, number][] {
  const cells: [number, number][] = []
  const half = n - 1
  for (let r = -half; r <= half; r++) {
    for (let c = -half; c <= half; c++) {
      if (r === 0 && c === 0) {
        cells.push([r, c])
      } else if (n >= 3) {
        if (r !== 0 && c !== 0) cells.push([r, c])
      } else {
        if (c !== 0) cells.push([r, c])
      }
    }
  }
  return cells
}

export default function BlockGridHK18P3Q5Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildBlockGridHK18P3Q5Steps(lang as 'en' | 'id')
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
      <div className="mx-auto w-full max-w-[320px]" role="img" aria-label="Block-grid pattern explainer">
        <svg viewBox="0 0 270 200" width="100%" aria-hidden="true">
          {([1, 2, 3] as const).map((n, gi) => {
            const cx = GROUP_CX[gi]
            const cellFill = b.showFormula ? '#EFF6FF' : 'white'
            const strokeC = b.showFormula ? '#1D4ED8' : '#374151'
            return (
              <g key={n}>
                {blockCells(n).map(([row, col]) => {
                  const px = cx + col * CS
                  const py = CY + row * CS
                  return (
                    <g key={`${row},${col}`}>
                      <rect
                        x={px - CS / 2} y={py - CS / 2}
                        width={CS} height={CS}
                        fill={cellFill} stroke={strokeC} strokeWidth={0.9}
                      />
                      <circle
                        cx={px} cy={py} r={R}
                        fill="none" stroke={strokeC} strokeWidth={1.1}
                      />
                      <line
                        x1={px - D} y1={py - D} x2={px + D} y2={py + D}
                        stroke={strokeC} strokeWidth={1.1} strokeLinecap="round"
                      />
                      <line
                        x1={px + D} y1={py - D} x2={px - D} y2={py + D}
                        stroke={strokeC} strokeWidth={1.1} strokeLinecap="round"
                      />
                    </g>
                  )
                })}

                {/* Per-group count badge */}
                {b.showCounts && (
                  <text
                    x={cx} y={156}
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
                  x={cx} y={169}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6B7280"
                  fontFamily="sans-serif"
                >
                  {['1st', '2nd', '3rd'][gi]} Group
                </text>
              </g>
            )
          })}

          {/* Formula line */}
          {b.showFormula && (
            <text
              x={135} y={184}
              textAnchor="middle"
              fontSize={12}
              fill="#059669"
              fontFamily="sans-serif"
            >
              {lang === 'id' ? 'Rumus: 2 × n² − 1' : 'Formula: 2 × n² − 1'}
            </text>
          )}

          {/* Answer line */}
          {b.showAnswer && (
            <text
              x={135} y={199}
              textAnchor="middle"
              fontSize={13}
              fill="#DC2626"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {lang === 'id'
                ? 'Kelompok ke-10: 2×100−1 = 181'
                : 'Group 10: 2×100−1 = 181'}
            </text>
          )}
        </svg>
      </div>
      <p className="text-center text-sm text-slate-600 max-w-xs px-2">{caption}</p>
    </div>
  )
}
