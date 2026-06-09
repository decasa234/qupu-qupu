// WMI-19F2A-Q10 — "Which figure is NOT divided into four equal parts?"  Answer: C.
//
// The original scan shows figure A only (a square cut by both diagonals). The
// remaining figures are reconstructed into a clean, standard set in which exactly
// ONE figure (C) has unequal parts:
//   A — square cut by both diagonals → 4 equal triangles.
//   B — square cut into 4 equal horizontal strips.
//   C — square cut into 4 UNEQUAL vertical strips (the odd one out).
//   D — square cut into a 2×2 grid → 4 equal small squares.
export type EqualPartsLabel = 'A' | 'B' | 'C' | 'D'

const PURPLE = '#341857'
const INK = '#1F2937'

/** Tile geometry: each figure is drawn inside a 100×100 box at (0,0). */
const TILE = 100

/**
 * The four parts of one figure, as SVG polygon point strings inside the 100×100
 * box. Three figures have 4 equal-area parts; C's vertical strips are unequal.
 */
export const FIGURE_PARTS: Record<EqualPartsLabel, string[]> = {
  // Both diagonals → 4 congruent triangles meeting at the centre.
  A: [
    '0,0 100,0 50,50',
    '100,0 100,100 50,50',
    '100,100 0,100 50,50',
    '0,100 0,0 50,50',
  ],
  // 4 equal horizontal strips (each 100 wide × 25 tall).
  B: [
    '0,0 100,0 100,25 0,25',
    '0,25 100,25 100,50 0,50',
    '0,50 100,50 100,75 0,75',
    '0,75 100,75 100,100 0,100',
  ],
  // 4 UNEQUAL vertical strips: widths 15, 35, 20, 30 — NOT equal.
  C: [
    '0,0 15,0 15,100 0,100',
    '15,0 50,0 50,100 15,100',
    '50,0 70,0 70,100 50,100',
    '70,0 100,0 100,100 70,100',
  ],
  // 2×2 grid → 4 equal small squares (50×50 each).
  D: [
    '0,0 50,0 50,50 0,50',
    '50,0 100,0 100,50 50,50',
    '0,50 50,50 50,100 0,100',
    '50,50 100,50 100,100 50,100',
  ],
}

/** Whether a figure's 4 parts are all the same area. C is the only false one. */
export const FIGURE_EQUAL: Record<EqualPartsLabel, boolean> = {
  A: true,
  B: true,
  C: false,
  D: true,
}

const LABELS: EqualPartsLabel[] = ['A', 'B', 'C', 'D']

/** Soft fill tints used when a figure's parts are being shaded/checked. */
const SHADE = ['#DBEAFE', '#FDE68A', '#BBF7D0', '#FBCFE8']

export interface EqualPartsFigureProps {
  label: EqualPartsLabel
  /** When true, the 4 parts are tinted (the "shade the pieces" beat). */
  shade?: boolean
  /** 'equal' draws a green frame, 'unequal' an orange one; 'none' is neutral. */
  verdict?: 'equal' | 'unequal' | 'none'
}

/** One labelled figure (square + division lines) drawn in a 100×100 cell. */
export function EqualPartsFigure({ label, shade = false, verdict = 'none' }: EqualPartsFigureProps) {
  const parts = FIGURE_PARTS[label]
  const frame =
    verdict === 'equal' ? '#10B981' : verdict === 'unequal' ? '#F97316' : '#94A3B8'
  const frameW = verdict === 'none' ? 2.5 : 4
  return (
    <g>
      {/* Outer square */}
      <rect x={0} y={0} width={TILE} height={TILE} fill="white" stroke={frame} strokeWidth={frameW} />
      {/* The 4 parts (tinted only while shading) */}
      {parts.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill={shade ? SHADE[i] : 'none'}
          stroke={PURPLE}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ))}
    </g>
  )
}

/** A 100×100 figure plus its A/B/C/D label below it, positioned at (x, y). */
export function LabelledFigure({
  label,
  x,
  y,
  shade,
  verdict,
}: EqualPartsFigureProps & { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <EqualPartsFigure label={label} shade={shade} verdict={verdict} />
      <text
        x={TILE / 2}
        y={TILE + 20}
        textAnchor="middle"
        fontSize={18}
        fontWeight={800}
        fill={verdict === 'unequal' ? '#C2410C' : verdict === 'equal' ? '#065F46' : INK}
      >
        {label}
      </text>
    </g>
  )
}

export const EQUAL_PARTS_VIEW_W = 480
export const EQUAL_PARTS_VIEW_H = 150

/** Layout: the four figures evenly spaced across the row. */
export function figureOrigin(i: number): { x: number; y: number } {
  const gap = (EQUAL_PARTS_VIEW_W - 4 * TILE) / 5
  return { x: gap + i * (TILE + gap), y: 14 }
}

export default function EqualPartsG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four squares A, B, C and D each divided into four parts. A, B and D have four equal parts; C is divided into four unequal strips."
    >
      <svg
        viewBox={`0 0 ${EQUAL_PARTS_VIEW_W} ${EQUAL_PARTS_VIEW_H}`}
        width="100%"
        style={{ maxWidth: EQUAL_PARTS_VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {LABELS.map((label, i) => {
          const o = figureOrigin(i)
          return <LabelledFigure key={label} label={label} x={o.x} y={o.y} />
        })}
      </svg>
    </div>
  )
}
