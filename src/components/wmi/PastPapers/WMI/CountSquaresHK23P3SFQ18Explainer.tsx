// CountSquaresHK23P3SFQ18Explainer.tsx
// HKIMO-23-P3SF-Q18 animated explainer.
//
// 6 beats: intro → count 1×1 (20) → count 2×2 (10) → count 3×3 (4) → count 4×4 (1) → result 35.
// Each beat overlays coloured frames on the squares of that size.

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildCountSquaresHK23P3SFQ18Steps } from './countSquaresHK23P3SFQ18Steps'
import { CS, PAD, CELLS, SVG_W, SVG_H, cellXY } from './CountSquaresHK23P3SFQ18Illustration'

// ── highlight data ────────────────────────────────────────────────────────────

/** All 10 two-squares (top-left [row,col]). */
const TWO_SQUARES: [number, number][] = [
  [1, 2],
  [2, 0], [2, 1], [2, 2],
  [3, 0], [3, 1], [3, 2],
  [4, 0], [4, 1], [4, 2],
]

/** All 4 three-squares (top-left [row,col]). */
const THREE_SQUARES: [number, number][] = [
  [2, 0], [2, 1],
  [3, 0], [3, 1],
]

/** The 1 four-square (top-left [row,col]). */
const FOUR_SQUARES: [number, number][] = [[2, 0]]

// Colour palette
const AMBER   = '#F59E0B'
const BLUE    = '#3B82F6'
const GREEN   = '#10B981'
const PURPLE  = '#8B5CF6'
const INK     = '#1F2937'

// ── overlay sub-components ────────────────────────────────────────────────────

function SizeFrames({
  squares,
  size,
  color,
  opacity,
}: {
  squares: [number, number][]
  size: number
  color: string
  opacity: number
}) {
  if (opacity === 0) return null
  return (
    <>
      {squares.map(([row, col]) => {
        const { x, y } = cellXY(row, col)
        return (
          <rect
            key={`${row},${col}`}
            x={x + 1} y={y + 1}
            width={size * CS - 2} height={size * CS - 2}
            fill={color}
            fillOpacity={0.18}
            stroke={color}
            strokeWidth={2.5}
            strokeOpacity={opacity}
            rx={2}
          />
        )
      })}
    </>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function CountSquaresHK23P3SFQ18Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = buildCountSquaresHK23P3SFQ18Steps(lang as 'en' | 'id')
  const beat = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map(s => s.hold),
  })

  const current = story.steps[beat]
  const sz = current.showSize

  // 1×1 highlight: individual cells get amber tint when sz===1
  const show1 = sz === 1
  // result beat: all cells amber
  const showResult = current.phase === 'result'

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        className="max-w-[240px]"
        aria-hidden="true"
      >
        {/* base cells */}
        {CELLS.map(([row, col]) => {
          const { x, y } = cellXY(row, col)
          const isAmber = show1 || showResult
          return (
            <rect
              key={`${row},${col}`}
              x={x} y={y}
              width={CS} height={CS}
              fill={isAmber ? '#FEF3C7' : 'white'}
              stroke="#374151"
              strokeWidth={1.4}
              style={{ transition: 'fill 0.3s' }}
            />
          )
        })}

        {/* 1×1 cell borders highlight */}
        {show1 && CELLS.map(([row, col]) => {
          const { x, y } = cellXY(row, col)
          return (
            <rect
              key={`h1-${row},${col}`}
              x={x + 1} y={y + 1}
              width={CS - 2} height={CS - 2}
              fill="none"
              stroke={AMBER}
              strokeWidth={2}
              rx={1}
            />
          )
        })}

        {/* 2×2 squares */}
        <SizeFrames squares={TWO_SQUARES}   size={2} color={BLUE}   opacity={sz === 2 ? 1 : 0} />
        {/* 3×3 squares */}
        <SizeFrames squares={THREE_SQUARES} size={3} color={GREEN}  opacity={sz === 3 ? 1 : 0} />
        {/* 4×4 square */}
        <SizeFrames squares={FOUR_SQUARES}  size={4} color={PURPLE} opacity={sz === 4 ? 1 : 0} />

        {/* result beat: show all highlights at once */}
        {showResult && (
          <>
            <SizeFrames squares={TWO_SQUARES}   size={2} color={BLUE}   opacity={0.6} />
            <SizeFrames squares={THREE_SQUARES} size={3} color={GREEN}  opacity={0.6} />
            <SizeFrames squares={FOUR_SQUARES}  size={4} color={PURPLE} opacity={0.8} />
          </>
        )}
      </svg>

      {/* equation badge */}
      {current.equation !== '' && (
        <div
          className="rounded-full bg-gray-100 px-4 py-1 font-mono text-sm font-semibold"
          style={{ color: INK }}
        >
          {current.equation}
        </div>
      )}

      {/* running total badge */}
      {current.runningTotal > 0 && (
        <div className="text-base font-bold" style={{ color: current.result ? GREEN : INK }}>
          {current.result
            ? `✓ ${current.runningTotal} squares`
            : `So far: ${current.runningTotal}`}
        </div>
      )}

      {/* caption */}
      <p className="max-w-[260px] text-center text-sm leading-snug text-gray-600">
        {current.caption}
      </p>
    </div>
  )
}
