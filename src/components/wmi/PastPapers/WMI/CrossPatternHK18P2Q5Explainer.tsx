// CrossPatternHK18P2Q5Explainer.tsx
// HKIMO-18-P2H-Q5 animated explainer.
//
// 4 beats: introduce shape → reveal counts (+4 each) → show formula (4n−3) → answer (45).

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildCrossPatternHK18P2Q5Steps } from './crossPatternHK18P2Q5Steps'

const CS = 20
const CY = 84
const R = 7.4
const D = 4.8

const GROUP_CX: [number, number, number, number] = [24, 88, 192, 336]
const COUNTS = [1, 5, 9, 13]

function crossCells(n: number): [number, number][] {
  const cells: [number, number][] = [[0, 0]]
  for (let k = 1; k < n; k++) {
    cells.push([-k, 0], [k, 0], [0, -k], [0, k])
  }
  return cells
}

export default function CrossPatternHK18P2Q5Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildCrossPatternHK18P2Q5Steps(lang as 'en' | 'id')
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
      <div className="mx-auto w-full max-w-[440px]" role="img" aria-label="Cross pattern explainer">
        <svg viewBox="0 0 420 220" width="100%" aria-hidden="true">
          {[1, 2, 3, 4].map((n, gi) => {
            const cx = GROUP_CX[gi]
            const cellFill = b.showFormula ? '#EFF6FF' : 'white'
            const strokeC = b.showFormula ? '#1D4ED8' : '#374151'
            return (
              <g key={n}>
                {crossCells(n).map(([row, col]) => {
                  const px = cx + col * CS
                  const py = CY + row * CS
                  return (
                    <g key={`${row},${col}`}>
                      <rect
                        x={px - CS / 2} y={py - CS / 2}
                        width={CS} height={CS}
                        fill={cellFill} stroke={strokeC} strokeWidth={0.9}
                      />
                      <circle cx={px} cy={py} r={R} fill="none" stroke={strokeC} strokeWidth={1.1} />
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
                    x={cx} y={162}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#1D4ED8"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {COUNTS[gi]}
                  </text>
                )}
                <text x={cx} y={176} textAnchor="middle" fontSize={10} fill="#6B7280" fontFamily="sans-serif">
                  {['1st', '2nd', '3rd', '4th'][gi]} Group
                </text>
              </g>
            )
          })}

          {/* Formula line */}
          {b.showFormula && (
            <text x={210} y={196} textAnchor="middle" fontSize={12} fill="#059669" fontFamily="sans-serif">
              {lang === 'id' ? 'Rumus: 4 × n − 3' : 'Formula: 4 × n − 3'}
            </text>
          )}

          {/* Answer line */}
          {b.showAnswer && (
            <text x={210} y={212} textAnchor="middle" fontSize={13} fill="#DC2626" fontWeight="bold" fontFamily="sans-serif">
              {lang === 'id' ? 'Kelompok ke-12: 4×12−3 = 45' : 'Group 12: 4×12−3 = 45'}
            </text>
          )}
        </svg>
      </div>
      <p className="text-center text-sm text-slate-600 max-w-xs px-2">{caption}</p>
    </div>
  )
}
