// Animated explainer for OSN-25-SD-NAS-FINAL-Q15.
//
// Beat sequence (7 beats):
//   0 — show grid with grey=(5,5); others "?"
//   1 — highlight red, reveal red₀=0 from top-side constraint
//   2 — highlight blue, show blue₀+blue₁=5 from left-side constraint
//   3 — case red₁=4 → tally 5
//   4 — case red₁=5 → tally 9
//   5 — case red₁=6 → tally 15
//   6 — answer = 15
//
// Primitive: GridBoard from './primitives/GridBoard'

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard } from './primitives/GridBoard'
import { buildColorGridOSN25NFQ15Steps } from './colorGridOSN25NFQ15Steps'

const CELL = 60
const PAD  = 18

// Region fill colours
const GREY_FILL  = '#94A3B8'
const RED_FILL   = '#FCA5A5'
const BLUE_FILL  = '#93C5FD'
const GREEN_FILL = '#86EFAC'
const WHITE_FILL = '#FFFFFF'

// Dimmed (non-highlighted) version of each fill
const GREY_DIM  = '#CBD5E1'
const RED_DIM   = '#FECACA'
const BLUE_DIM  = '#BFDBFE'
const GREEN_DIM = '#BBF7D0'

type HighlightMode = 'none' | 'grey' | 'red' | 'blue' | 'green' | 'all'

function cellFill(r: number, c: number, mode: HighlightMode): string {
  const region =
    r === 0 && c <= 1 ? 'grey'
    : r === 0 && c === 2 ? 'red'
    : r === 1 && c === 0 ? 'blue'
    : r === 1 && c === 1 ? 'center'
    : r === 1 && c === 2 ? 'red'
    : r === 2 && c === 0 ? 'blue'
    : r === 2 && c >= 1 ? 'green'
    : 'center'

  if (region === 'center') return WHITE_FILL

  const bright: Record<string, string> = { grey: GREY_FILL, red: RED_FILL, blue: BLUE_FILL, green: GREEN_FILL }
  const dim:    Record<string, string> = { grey: GREY_DIM,  red: RED_DIM,  blue: BLUE_DIM,  green: GREEN_DIM }

  if (mode === 'all' || mode === 'none') return bright[region]
  return region === mode ? bright[region] : dim[region]
}

// Derive cell label based on beat context
function cellLabel(
  r: number,
  c: number,
  highlight: HighlightMode,
): string {
  // Grey cells always show "5"
  if (r === 0 && c <= 1) return '5'
  // Centre is always blank
  if (r === 1 && c === 1) return ''
  // On beat that highlights red, show derived red₀=0 in top-right cell
  if (highlight === 'red' && r === 0 && c === 2) return '0'
  // Default for coloured cells
  return '?'
}

const GRID_W = 3 * CELL
const GRID_H = 3 * CELL
const VW = GRID_W + PAD * 2
const VH = GRID_H + PAD * 2 + 40   // extra 40 for tally panel below

export default function ColorGridOSN25NFQ15Explainer({
  lang = 'id',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const { steps, finalIndex } = useMemo(
    () => buildColorGridOSN25NFQ15Steps(lang),
    [lang],
  )

  const beat = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: steps.map(s => s.hold),
  })

  const current = steps[beat]
  const { highlight, tally, showAnswer, caseNote } = current

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        className="max-w-[250px]"
        aria-hidden="true"
      >
        {/* outer border */}
        <rect
          x={PAD - 1}
          y={PAD - 1}
          width={GRID_W + 2}
          height={GRID_H + 2}
          fill="none"
          stroke="#1E293B"
          strokeWidth={2}
          rx={2}
        />

        <g transform={`translate(${PAD},${PAD})`}>
          <GridBoard
            rows={3}
            cols={3}
            cellSize={CELL}
            fill={(r, c) => cellFill(r, c, highlight)}
            label={(r, c) => cellLabel(r, c, highlight)}
            gridStroke="#475569"
          />
        </g>

        {/* tally panel below grid */}
        {tally > 0 && (
          <g transform={`translate(${PAD}, ${PAD + GRID_H + 8})`}>
            <rect
              x={0}
              y={0}
              width={GRID_W}
              height={28}
              rx={4}
              fill={showAnswer ? '#DCFCE7' : '#F1F5F9'}
              stroke={showAnswer ? '#16A34A' : '#94A3B8'}
              strokeWidth={1}
            />
            <text
              x={GRID_W / 2}
              y={14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={700}
              fill={showAnswer ? '#15803D' : '#334155'}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {caseNote
                ? caseNote
                : lang === 'id'
                  ? `Total: ${tally} persegi`
                  : `Total: ${tally} squares`}
            </text>
          </g>
        )}

        {/* final answer overlay */}
        {showAnswer && (
          <text
            x={VW / 2}
            y={VH - 6}
            textAnchor="middle"
            fontSize={14}
            fontWeight={800}
            fill="#15803D"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {lang === 'id' ? '5 + 4 + 6 = 15' : '5 + 4 + 6 = 15'}
          </text>
        )}
      </svg>

      <p className="text-center text-sm text-slate-700 max-w-[250px] leading-snug px-2">
        {current.caption}
      </p>
    </div>
  )
}
