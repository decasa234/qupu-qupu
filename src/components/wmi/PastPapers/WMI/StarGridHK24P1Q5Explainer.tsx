// HKIMO-24-P1H-Q5 — animated explainer
//
// Pattern: group n = n×n grid of stars with bottom-right cell empty → n²−1 stars.
// Group 6 = 6²−1 = 35.
//
// 6 beats: intro → highlight G2 → G3 → G4 → formula → answer.

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard } from './primitives/GridBoard'
import { StarGridHK24P1Q5Story } from './starGridHK24P1Q5Steps'

const CELL  = 24
const GAP   = 14
const PAD   = 10
const MAX_N = 4

const GROUP_X: Record<number, number> = {
  1: PAD,
  2: PAD + CELL + GAP,
  3: PAD + CELL + GAP + 2 * CELL + GAP,
  4: PAD + CELL + GAP + 2 * CELL + GAP + 3 * CELL + GAP,
}

const groupY = (n: number) => PAD + (MAX_N - n) * CELL

const VW       = PAD + (1 + 2 + 3 + 4) * CELL + 3 * GAP + PAD   // 302
const GRID_BTM = PAD + MAX_N * CELL + 22 + PAD                    // 138 (grids + labels + padding)
const VH       = GRID_BTM + 30 + 28                               // 196 (+ formula row + answer row)

const ORDINALS_EN = ['', '1st', '2nd', '3rd', '4th']
const ORDINALS_ID = ['', 'ke-1', 'ke-2', 'ke-3', 'ke-4']

function isFilled(n: number, r: number, c: number): boolean {
  if (n === 1) return true
  return !(r === n - 1 && c === n - 1)
}

export default function StarGridHK24P1Q5Explainer({
  lang = 'en',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const { beats, finalIndex } = StarGridHK24P1Q5Story
  const beat = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: beats.map(b => b.hold),
  })

  const b = beats[beat]
  const ordinals = lang === 'en' ? ORDINALS_EN : ORDINALS_ID

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        className="max-w-[320px]"
        aria-hidden="true"
      >
        {([1, 2, 3, 4] as const).map(n => {
          const gx = GROUP_X[n]
          const gy = groupY(n)
          const active = b.activeGroup === n
          return (
            <g key={n} transform={`translate(${gx},${gy})`}>
              <GridBoard
                rows={n}
                cols={n}
                cellSize={CELL}
                fill={(r, c) => (isFilled(n, r, c) ? (active ? '#F59E0B' : '#FDE68A') : '#F8FAFC')}
                label={(r, c) => (isFilled(n, r, c) ? '★' : '')}
                gridStroke={active ? '#D97706' : '#D1D5DB'}
              />
              {active && (
                <rect
                  x={-2} y={-2}
                  width={n * CELL + 4} height={n * CELL + 4}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  rx={4}
                />
              )}
              <text
                x={n * CELL / 2}
                y={n * CELL + 16}
                textAnchor="middle"
                fontSize={11}
                fontWeight={active ? 700 : 400}
                fill={active ? '#D97706' : '#374151'}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {ordinals[n]}
              </text>
            </g>
          )
        })}

        {/* formula label */}
        <text
          x={VW / 2}
          y={GRID_BTM + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          fill={b.showFormula ? '#1E40AF' : 'transparent'}
          fontFamily="ui-monospace, monospace"
        >
          {lang === 'en' ? 'Group n  =  n² − 1 stars' : 'Kelompok n  =  n² − 1 bintang'}
        </text>

        {/* answer label */}
        <text
          x={VW / 2}
          y={GRID_BTM + 44}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={800}
          fill={b.showAnswer ? '#059669' : 'transparent'}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {lang === 'en' ? 'Group 6 = 6² − 1 = 35 ★' : 'Kelompok 6 = 6² − 1 = 35 ★'}
        </text>
      </svg>

      <p className="text-center text-sm text-slate-700 max-w-[300px] leading-snug px-2">
        {lang === 'en' ? b.caption_en : b.caption_id}
      </p>
    </div>
  )
}
