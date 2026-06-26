/**
 * HanoiTowerOSN24NEKQ1Illustration — OSN-24-SD-NAS-EKSPERIMEN-Q1
 *
 * "4 cubes on peg I (bottom→top): 5/6 kg, 70/8 ons, 751 g, 6/7 kg.
 *  Pegs II and III are empty. Move all cubes to peg III in the fewest steps.
 *  Peg I: any order. Pegs II and III: must stay sorted (heavy→light, bottom→top)."
 *
 * Source OCR: docs/reference/ocr-res/osn/nasional/sd/2024-eksperimen.md (question 1)
 * Source image: 2024-eksperimen.imgs/004.jpg
 *
 * Weight ranks (1=heaviest, 4=lightest):
 *   rank 1 = 70/8 ons (875 g)
 *   rank 2 = 6/7 kg  (857 g)
 *   rank 3 = 5/6 kg  (833 g)
 *   rank 4 = 751 g
 *
 * Initial peg I (bottom→top): rank 3, rank 1, rank 4, rank 2
 * Goal peg III (bottom→top): rank 1, 2, 3, 4  (sorted heavy→light)
 *
 * Fresh SVG — no existing primitive covers a Tower of Hanoi apparatus.
 */

import React from 'react'

// ---------------------------------------------------------------------------
// Visual constants
// ---------------------------------------------------------------------------

const VB_W = 380
const VB_H = 230
const BASE_Y = 188      // top of wooden base
const BASE_H = 22       // base height
const PEG_TOP_Y = 48    // top of all peg rods
const PEG_W = 10
const CUBE_H = 33       // height of each cube
const CUBE_W = 72       // width of each cube (same physical size)
const PEG_X = [82, 190, 298] as const  // centre-x for pegs I, II, III

// ---------------------------------------------------------------------------
// Per-rank styling (matches source image shading)
// ---------------------------------------------------------------------------

export const RANK_STYLE: Record<number, { fill: string; stroke: string; text: string }> = {
  1: { fill: '#B91C1C', stroke: '#7F1D1D', text: '#FFFFFF' },  // heaviest — deep crimson
  2: { fill: '#EF4444', stroke: '#B91C1C', text: '#FFFFFF' },  // medium-dark red
  3: { fill: '#FCA5A5', stroke: '#EF4444', text: '#7F1D1D' },  // light red/pink
  4: { fill: '#FEE2E2', stroke: '#FCA5A5', text: '#991B1B' },  // lightest — pale pink
}

// Two-line labels for fraction weights
const RANK_LABEL: Record<number, [string, string]> = {
  1: ['70/8', 'ons'],
  2: ['6/7', 'kg'],
  3: ['5/6', 'kg'],
  4: ['751 g', ''],
}

// ---------------------------------------------------------------------------
// Shared Tower diagram (used by both Illustration and Explainer)
// ---------------------------------------------------------------------------

export interface TowerState {
  pegI:   number[]   // ranks, bottom→top
  pegII:  number[]
  pegIII: number[]
}

function CubeStack({ ranks, cx }: { ranks: number[]; cx: number }) {
  return (
    <>
      {ranks.map((rank, i) => {
        const y = BASE_Y - (i + 1) * CUBE_H
        const s = RANK_STYLE[rank]
        const [line1, line2] = RANK_LABEL[rank]
        const midY = y + CUBE_H / 2
        return (
          <g key={`${rank}-${i}`}>
            <rect
              x={cx - CUBE_W / 2}
              y={y}
              width={CUBE_W}
              height={CUBE_H}
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={1.5}
              rx={3}
            />
            {line2 ? (
              <>
                <text
                  x={cx}
                  y={midY - 3}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={s.text}
                  fontSize={10}
                  fontWeight="700"
                  fontFamily="sans-serif"
                >
                  {line1}
                </text>
                <text
                  x={cx}
                  y={midY + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={s.text}
                  fontSize={9}
                  fontFamily="sans-serif"
                >
                  {line2}
                </text>
              </>
            ) : (
              <text
                x={cx}
                y={midY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={s.text}
                fontSize={10}
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {line1}
              </text>
            )}
          </g>
        )
      })}
    </>
  )
}

export function TowerDiagram({ state }: { state: TowerState }) {
  const stacks = [state.pegI, state.pegII, state.pegIII]
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{ maxHeight: VB_H }}
    >
      {/* Wooden base */}
      <rect
        x={8}
        y={BASE_Y}
        width={VB_W - 16}
        height={BASE_H}
        fill="#D97706"
        stroke="#92400E"
        strokeWidth={1.5}
        rx={5}
      />

      {/* Peg rods (drawn before cubes so cubes render on top) */}
      {PEG_X.map((cx) => (
        <rect
          key={cx}
          x={cx - PEG_W / 2}
          y={PEG_TOP_Y}
          width={PEG_W}
          height={BASE_Y - PEG_TOP_Y}
          fill="#9CA3AF"
          stroke="#6B7280"
          strokeWidth={1}
          rx={3}
        />
      ))}

      {/* Cubes */}
      {stacks.map((ranks, pi) => (
        <CubeStack key={pi} ranks={ranks} cx={PEG_X[pi]} />
      ))}

      {/* Peg labels on the base */}
      {(['I', 'II', 'III'] as const).map((label, i) => (
        <text
          key={label}
          x={PEG_X[i]}
          y={BASE_Y + BASE_H / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize={13}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — stem illustration (shows PROBLEM only, not the answer)
// ---------------------------------------------------------------------------

const INITIAL_STATE: TowerState = {
  pegI:   [3, 1, 4, 2],  // bottom→top
  pegII:  [],
  pegIII: [],
}

export default function HanoiTowerOSN24NEKQ1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Menara Hanoi 3 tiang. Tiang I (dari bawah ke atas): 5/6 kg, 70/8 ons, 751 g, 6/7 kg. ' +
        'Tiang II dan III kosong. Pindahkan semua kubus ke Tiang III dengan langkah sesedikit mungkin.'
      }
    >
      <TowerDiagram state={INITIAL_STATE} />
    </div>
  )
}
