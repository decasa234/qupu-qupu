// Right-angles-from-squares figure for WMI-24P3A-Q17 (2024 Grade-3 Semifinal).
//
// Source figure (db/seed/wmi/figures/2024-semifinal-g3-a-q17.jpg): on the left a
// single light-green square; on the right two equal squares overlapping so their
// edges cross (the second slid down-right from the first). These illustrate the
// two GIVEN facts in the body:
//   1 square  -> at most 4 right angles (its 4 corners).
//   2 squares -> at least 8, at MOST 16 right angles (corners + the crossings).
// The question asks for the MOST with 4 squares (answer E = 64).
//
// The static figure draws the PROBLEM ONLY: the "1 square" panel and the
// "2 squares" panel exactly as given. It does NOT draw the 4-square arrangement
// nor any total — that derivation is the explainer's job. A reusable <Square>
// primitive is co-exported.

const INK = '#374151'
const FILL = '#A7D7B0' // soft green matching the scan
const FILL_2 = '#9BCFA6'

/* ---------------------------------------------------------- primitive ------ */
// An axis-aligned square of side `s`, top-left at (x, y).
export function Square({ x, y, s, fill = FILL, stroke = INK, strokeWidth = 2 }: {
  x: number
  y: number
  s: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}) {
  return <rect x={x} y={y} width={s} height={s} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
}

/* -------------------------------------------------------------- data ------- */
// Given facts (from the body) and the verified answer-key pattern.
//   1 square  -> 4 right angles  (its own corners).
//   2 squares -> at MOST 16      (corners + the right angles made where the two
//                                 squares' edges cross).
// The key's pattern treats 16 as the per-square MAXIMUM once full crossing is
// allowed, so the most for n squares is 16 x n. For 4 squares that is 64 (E).
export const ONE_SQUARE_ANGLES = 4
export const TWO_SQUARES_MAX = 16
export const MAX_RIGHT_ANGLES_PER_SQUARE = 16
export const SQUARES_TO_DRAW = 4
export const ANSWER_MAX = MAX_RIGHT_ANGLES_PER_SQUARE * SQUARES_TO_DRAW // 64

/* ----------------------------------------------------------- layout -------- */
export const Q17_VIEW_W = 460
export const Q17_VIEW_H = 220

const S = 92 // square side

export interface Q17DiagramProps {
  lang?: 'en' | 'id'
}

export function Q17Diagram({ lang = 'en' }: Q17DiagramProps) {
  // Left panel: one square.
  const leftX = 46
  const leftY = 70
  // Right panel: two overlapping squares (second slid down-right by ~0.45 s).
  const rx = 250
  const ry = 50
  const off = Math.round(S * 0.45)

  return (
    <svg
      viewBox={`0 0 ${Q17_VIEW_W} ${Q17_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q17_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Panel labels */}
      <text x={leftX + S / 2} y={36} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>
        {lang === 'id' ? '1 persegi' : '1 square'}
      </text>
      <text x={rx + (S + off) / 2} y={20} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>
        {lang === 'id' ? '2 persegi' : '2 squares'}
      </text>

      {/* Left: single square */}
      <Square x={leftX} y={leftY} s={S} />

      {/* Right: two overlapping squares. Draw first square, then the second on top
          so the overlap region reads. */}
      <Square x={rx} y={ry} s={S} />
      <Square x={rx + off} y={ry + off} s={S} fill={FILL_2} />
    </svg>
  )
}

export default function P24G3Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Left: one square. Right: two equal squares overlapping so their edges cross. The problem asks for the greatest number of right angles when four squares are drawn."
    >
      <Q17Diagram />
    </div>
  )
}
