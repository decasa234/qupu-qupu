// LatticePathHK18P3Q25Explainer.tsx
// Animated explainer for HKIMO-18-P3H-Q25.
//
// Staircase grid (bottom 3-wide, upper 2-wide).
// A=(0,0), B=(2,3). Beat-by-beat DP path-count reveal.
// DP values: row0=(1,1,1,†), row1=(1,2,3,†), row2=(1,3,6), row3=(1,4,10)
// † = dead-end (cannot reach B; grayed out).

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildLatticePathHK18P3Q25Steps } from './latticePathHK18P3Q25Steps'

// ---- layout (mirrors the illustration) -----------------------------------
const CELL = 52
const PAD_L = 18
const PAD_R = 18
const PAD_T = 20
const PAD_B = 28

const VW = PAD_L + 3 * CELL + PAD_R   // 18+156+18 = 192
const VH = PAD_T + 3 * CELL + PAD_B   // 20+156+28 = 204

const lx = (col: number) => PAD_L + col * CELL
const ly = (row: number) => PAD_T + (3 - row) * CELL

const okDot = (col: number, row: number) =>
  row <= 1 ? col <= 3 : col <= 2

// ---- DP counts at each lattice point --------------------------------------
// (col, row) → number of paths from A=(0,0)
// Dead-end nodes (x=3 in upper section, or x=3 in row1 that can't reach B)
// are marked separately.
const DP: Record<string, number> = {
  '0,0': 1, '1,0': 1, '2,0': 1, '3,0': 1,
  '0,1': 1, '1,1': 2, '2,1': 3, '3,1': 4,
  '0,2': 1, '1,2': 3, '2,2': 6,
  '0,3': 1, '1,3': 4, '2,3': 10,
}
const isDeadEnd = (col: number, row: number) => col === 3

// ---- component ------------------------------------------------------------
export default function LatticePathHK18P3Q25Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildLatticePathHK18P3Q25Steps(lang as 'en' | 'id')
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

  // Which DP counts to show based on beat
  const showCount = (col: number, row: number): boolean => {
    if (b.showRow23 && row >= 2) return true
    if (b.showRow01 && row <= 1) return true
    return false
  }

  // Horizontal lines
  const hLines = [0, 1, 2, 3].map(row => ({
    row, x1: lx(0), x2: lx(row <= 1 ? 3 : 2), y: ly(row),
  }))
  // Vertical lines
  const vLines = [
    { col: 0, y1: ly(3), y2: ly(0) },
    { col: 1, y1: ly(3), y2: ly(0) },
    { col: 2, y1: ly(3), y2: ly(0) },
    { col: 3, y1: ly(1), y2: ly(0) },
  ]

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="mx-auto w-full max-w-[240px]" role="img" aria-live="polite"
        aria-label={`Lattice path explainer, step ${beat + 1}`}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-hidden="true">
          {/* Grid lines */}
          {hLines.map(({ row, x1, x2, y }) => (
            <line key={`h${row}`} x1={x1} y1={y} x2={x2} y2={y}
              stroke="#CBD5E1" strokeWidth={1.4} />
          ))}
          {vLines.map(({ col, y1, y2 }) => (
            <line key={`v${col}`} x1={lx(col)} y1={y1} x2={lx(col)} y2={y2}
              stroke="#CBD5E1" strokeWidth={1.4} />
          ))}

          {/* Dead-end zone shading (col=3) */}
          {b.showRow01 && (
            <rect
              x={lx(2)} y={ly(1)}
              width={CELL} height={CELL}
              fill="#F1F5F9" opacity={0.7}
            />
          )}

          {/* Lattice dots + DP counts */}
          {[0, 1, 2, 3].flatMap(row =>
            [0, 1, 2, 3].filter(col => okDot(col, row)).map(col => {
              const dead = isDeadEnd(col, row)
              const show = showCount(col, row)
              const val = DP[`${col},${row}`]
              const isB = col === 2 && row === 3
              const isA = col === 0 && row === 0
              const dotFill = isA ? '#0EA5E9' : isB && b.showAnswer ? '#10B981' : dead ? '#CBD5E1' : '#64748B'
              return (
                <g key={`n${col}${row}`}>
                  <circle cx={lx(col)} cy={ly(row)} r={isA || isB ? 5 : 3.5}
                    fill={dotFill} />
                  {show && val !== undefined && (
                    <text
                      x={lx(col) + (dead ? 10 : 0)}
                      y={ly(row) - 7}
                      textAnchor="middle"
                      fontSize={dead ? 9 : isB && b.showAnswer ? 14 : 11}
                      fontWeight={isB && b.showAnswer ? '700' : '500'}
                      fill={dead ? '#94A3B8' : isB && b.showAnswer ? '#059669' : '#1E293B'}
                    >
                      {dead ? `(${val}†)` : val}
                    </text>
                  )}
                </g>
              )
            })
          )}

          {/* A label */}
          <text x={lx(0) - 4} y={ly(0) + 16} textAnchor="middle"
            fontSize={13} fontWeight="700" fill="#0F172A">A</text>

          {/* B label */}
          <text x={lx(2) + 9} y={ly(3) + 4} textAnchor="start"
            fontSize={13} fontWeight="700" fill="#0F172A">B</text>

          {/* Formula overlay */}
          {b.showFormula && (
            <g>
              <rect x={PAD_L} y={VH - PAD_B + 2} width={VW - PAD_L - PAD_R} height={22}
                fill="#ECFDF5" rx={4} />
              <text x={VW / 2} y={VH - PAD_B + 16} textAnchor="middle"
                fontSize={12} fontWeight="700" fill="#059669">
                C(5,2) = 5!/(2!·3!) = 10
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Caption */}
      <p className="text-center text-sm text-slate-700 leading-snug max-w-[240px]">
        {caption}
      </p>
    </div>
  )
}
