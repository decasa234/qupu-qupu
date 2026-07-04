// "Largest shaded area" figure for WMI-20P3A-Q11 (2020 Semifinal G3, Q11).
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q11.jpg (pixel-measured
// against the 14×8 grid of the scan): four shaded compound shapes labelled A, B, C, D.
// Find the one with the LARGEST shaded area. Keyed answer: D.
//
//   A = swallowtail flag with two ¼-square notches  → 8.5
//   B = leaning parallelogram, 2 wide × 4 tall      → 8
//   C = half-column + slant + 2×2 base block        → 9
//   D = quincunx of five diamonds (each area 2)     → 10  ← largest
//
// Coordinates are in grid units, x→right, y→down. The figure shows ONLY the four
// labelled shapes; the explainer counts the areas and lands on D.

export const GRID_COLS = 14
export const GRID_ROWS = 8
export const P20G3Q11_ANSWER = 'D'

export interface ShadedShape {
  label: 'A' | 'B' | 'C' | 'D'
  /** One or more filled polygons (grid-unit vertices). */
  polys: Array<Array<[number, number]>>
  /** Shaded area in cm². */
  area: number
  /** Where to print the label (grid units). */
  labelAt: [number, number]
}

/** A diamond (unit square rotated 45°, diagonals 2) centred at (cx, cy) → area 2. */
const diamond = (cx: number, cy: number): Array<[number, number]> => [
  [cx, cy - 1],
  [cx + 1, cy],
  [cx, cy + 1],
  [cx - 1, cy],
]

export const SHAPES: ReadonlyArray<ShadedShape> = [
  {
    // A: 5×2 flag with a swallowtail notch on the left (−1) and two ¼-square
    // notches on the right edge (−0.5) → 10 − 1 − 0.5 = 8.5.
    label: 'A',
    polys: [
      [
        [0, 0],
        [4.5, 0],
        [4.5, 0.5],
        [5, 0.5],
        [5, 1],
        [4.5, 1],
        [4.5, 1.5],
        [5, 1.5],
        [5, 2],
        [0, 2],
        [1, 1],
      ],
    ],
    area: 8.5,
    labelAt: [2.4, 1],
  },
  {
    // B: leaning parallelogram, 2 wide × 4 tall → 8.
    label: 'B',
    polys: [
      [
        [6, 0],
        [8, 1],
        [8, 5],
        [6, 4],
      ],
    ],
    area: 8,
    labelAt: [7, 2.5],
  },
  {
    // C: half-column (0.5×4 = 2) + slanted middle column (3) + 2×2 base block (4) → 9.
    label: 'C',
    polys: [
      [
        [9.5, 2],
        [10, 2],
        [11, 4],
        [13, 4],
        [13, 6],
        [9.5, 6],
      ],
    ],
    area: 9,
    labelAt: [11.6, 5],
  },
  {
    // D: quincunx (X) of five diamonds — four arms + centre — each area 2 → 10.
    label: 'D',
    polys: [diamond(1, 4), diamond(3, 4), diamond(2, 5), diamond(1, 6), diamond(3, 6)],
    area: 10,
    labelAt: [1.5, 4.5],
  },
]

const INK = '#374151'
const GRID = '#9CA3AF'
const SHADE = '#C9CDD3'
const HOT = '#34D399'
const HOT_INK = '#065F46'

export const Q11_VIEW_W = 480
const PAD = 8
export const Q11_CELL = (Q11_VIEW_W - PAD * 2) / GRID_COLS
export const Q11_VIEW_H = PAD * 2 + GRID_ROWS * Q11_CELL
const gx = (u: number) => PAD + u * Q11_CELL
const gy = (v: number) => PAD + v * Q11_CELL

export interface Q11FigureProps {
  /** Highlight a single shape by label (counting beat / reveal). */
  active?: 'A' | 'B' | 'C' | 'D' | null
  /** Show each shape's area chip for the labels in this set. */
  showAreasFor?: ReadonlyArray<string>
}

export function ShadedGridFigure({ active = null, showAreasFor = [] }: Q11FigureProps) {
  const areaSet = new Set(showAreasFor)
  return (
    <svg viewBox={`0 0 ${Q11_VIEW_W} ${Q11_VIEW_H}`} width="100%" style={{ maxWidth: Q11_VIEW_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* shaded shapes (under the grid lines) */}
      {SHAPES.map((sh) => {
        const on = active === null || active === sh.label
        return (
          <g key={sh.label} opacity={on ? 1 : 0.4}>
            {sh.polys.map((poly, i) => (
              <polygon
                key={i}
                points={poly.map(([u, v]) => `${gx(u)},${gy(v)}`).join(' ')}
                fill={active === sh.label ? HOT : SHADE}
                stroke="none"
              />
            ))}
          </g>
        )
      })}

      {/* grid lines */}
      {Array.from({ length: GRID_ROWS + 1 }).map((_, r) => (
        <line key={`h${r}`} x1={gx(0)} y1={gy(r)} x2={gx(GRID_COLS)} y2={gy(r)} stroke={GRID} strokeWidth={1} />
      ))}
      {Array.from({ length: GRID_COLS + 1 }).map((_, c) => (
        <line key={`v${c}`} x1={gx(c)} y1={gy(0)} x2={gx(c)} y2={gy(GRID_ROWS)} stroke={GRID} strokeWidth={1} />
      ))}

      {/* labels A/B/C/D */}
      {SHAPES.map((sh) => (
        <text
          key={`lbl${sh.label}`}
          x={gx(sh.labelAt[0])}
          y={gy(sh.labelAt[1])}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Q11_CELL * 0.8}
          fontWeight={900}
          fontStyle="italic"
          fill={active === sh.label ? HOT_INK : INK}
          className="font-display"
        >
          {sh.label}
        </text>
      ))}

      {/* area chips */}
      {SHAPES.map((sh) =>
        areaSet.has(sh.label) ? (
          <g key={`area${sh.label}`}>
            <circle cx={gx(sh.labelAt[0]) + Q11_CELL * 0.9} cy={gy(sh.labelAt[1]) - Q11_CELL * 0.7} r={Q11_CELL * 0.5} fill={sh.label === P20G3Q11_ANSWER ? HOT : '#FEF3C7'} stroke={sh.label === P20G3Q11_ANSWER ? HOT_INK : '#D97706'} strokeWidth={1.5} />
            <text x={gx(sh.labelAt[0]) + Q11_CELL * 0.9} y={gy(sh.labelAt[1]) - Q11_CELL * 0.7} textAnchor="middle" dominantBaseline="central" fontSize={Q11_CELL * 0.46} fontWeight={900} fill={sh.label === P20G3Q11_ANSWER ? '#FFFFFF' : '#92400E'} className="font-display">
              {sh.area}
            </text>
          </g>
        ) : null,
      )}
    </svg>
  )
}

export default function P20G3Q11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A grid of unit squares with four shaded shapes labelled A, B, C and D. Find the shape with the largest shaded area."
    >
      <ShadedGridFigure />
    </div>
  )
}
