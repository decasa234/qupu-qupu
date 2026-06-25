// Animated explainer for HKIMO-22-P1H-Q19.
// Counts squares by size: 8 unit (1×1) + 2 large (2×2) = 10.
//
// Beat sequence:
//   0  intro    — plain figure
//   1  unit     — all 8 cells highlighted amber (1×1 count)
//   2  large_a  — top-left 2×2 block (rows 0-1, cols 1-2) highlighted green
//   3  large_b  — bottom-right 2×2 block (rows 1-2, cols 2-3) highlighted violet
//   4  result   — total 8 + 2 = 10

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildSquaresHK22P1Q19Steps } from './squaresHK22P1Q19Steps'
import type { SquaresHK22P1Q19Phase } from './squaresHK22P1Q19Steps'

// ─── Layout constants ────────────────────────────────────────────────────────
const CS = 50   // cell size (px)
const PAD = 6
const W = PAD * 2 + 4 * CS   // 212
const H = PAD * 2 + 3 * CS   // 162

// The 8 cells as [row, col]
const ALL_CELLS: [number, number][] = [
  [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2], [1, 3],
  [2, 2], [2, 3],
]

// 2×2 group membership (key = "row,col")
const LARGE_A = new Set(['0,1', '0,2', '1,1', '1,2'])   // rows 0-1, cols 1-2 (top block)
const LARGE_B = new Set(['1,2', '1,3', '2,2', '2,3'])   // rows 1-2, cols 2-3 (bottom block)

function cx(col: number) { return PAD + col * CS }
function cy(row: number) { return PAD + row * CS }

function cellFill(r: number, c: number, phase: SquaresHK22P1Q19Phase): string {
  const key = `${r},${c}`
  switch (phase) {
    case 'intro':    return '#FFFFFF'
    case 'unit':     return '#FEF3C7'                                        // amber
    case 'large_a':  return LARGE_A.has(key) ? '#D1FAE5' : '#F8FAFC'        // green / pale
    case 'large_b':  return LARGE_B.has(key) ? '#EDE9FE' : '#F8FAFC'        // violet / pale
    case 'result':   return '#FEF9C3'                                        // yellow
    default:         return '#FFFFFF'
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function SquaresHK22P1Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSquaresHK22P1Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const phase = beat.phase
  const isResult = phase === 'result'

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={beat.caption}
    >
      <div className="flex flex-col items-center gap-3">
        {/* ── SVG figure ── */}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {ALL_CELLS.map(([r, c]) => (
            <rect
              key={`${r},${c}`}
              x={cx(c)} y={cy(r)}
              width={CS} height={CS}
              fill={cellFill(r, c, phase)}
              stroke="#1E293B"
              strokeWidth={2}
            />
          ))}

          {/* 2×2 overlay A — rows 0-1, cols 1-2 */}
          {phase === 'large_a' && (
            <rect
              x={cx(1)} y={cy(0)}
              width={CS * 2} height={CS * 2}
              fill="none"
              stroke="#10B981"
              strokeWidth={3.5}
              strokeLinejoin="round"
            />
          )}

          {/* 2×2 overlay B — rows 1-2, cols 2-3 */}
          {phase === 'large_b' && (
            <rect
              x={cx(2)} y={cy(1)}
              width={CS * 2} height={CS * 2}
              fill="none"
              stroke="#7C3AED"
              strokeWidth={3.5}
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* ── Caption pill ── */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
