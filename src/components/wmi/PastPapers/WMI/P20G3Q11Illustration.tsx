// "Largest shaded area" figure for WMI-20P3A-Q11 (2020 Semifinal G3, Q11).
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q11.jpg: a grid of
// unit squares holds four shaded compound shapes labelled A, B, C, D. Find the
// one with the LARGEST shaded area. Keyed answer: D.
//
// D is a pinwheel of four equal diamonds (unit squares rotated 45°, each area 2)
// meeting at a centre → 8 cm², the largest. A, B, C are smaller compound shapes.
// Coordinates are in grid units, x→right, y→down. The figure shows ONLY the four
// labelled shapes; the explainer counts the areas and lands on D.

export const GRID_COLS = 13
export const GRID_ROWS = 7
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

export const SHAPES: ReadonlyArray<ShadedShape> = [
  {
    // A: a left-pointing barb (triangle) + a 4×2 body block. ~7 cm².
    label: 'A',
    polys: [
      [
        [0, 0],
        [1, 1],
        [0, 2],
      ], // left barb triangle
      [
        [1, 0],
        [4, 0],
        [4, 2],
        [1, 2],
      ], // body (3×2 = 6)
    ],
    area: 7,
    labelAt: [2.4, 1],
  },
  {
    // B: a slanted parallelogram blob, cols 6..9. ~6 cm².
    label: 'B',
    polys: [
      [
        [7, 0],
        [9, 0],
        [9, 3],
        [8, 4],
        [7, 4],
        [7, 1],
      ],
    ],
    area: 6,
    labelAt: [8, 2],
  },
  {
    // C: a triangle roof + a vertical tail + base block, cols 10..12. ~6 cm².
    label: 'C',
    polys: [
      [
        [10, 2],
        [11, 2],
        [11, 4],
        [10, 5],
      ], // slim slanted tail (~ area 2.5)
      [
        [11, 3],
        [13, 3],
        [13, 5],
        [11, 5],
      ], // base block (2×2 = 4)
    ],
    area: 6,
    labelAt: [12, 4],
  },
  {
    // D: pinwheel of four equal diamonds about centre (2,5). Each diamond is a
    // unit square rotated 45° spanning a 2×2 block → area 2; four of them = 8.
    label: 'D',
    polys: [
      [
        [1, 3],
        [2, 4],
        [1, 5],
        [0, 4],
      ], // left diamond
      [
        [2, 3],
        [3, 4],
        [2, 5],
        [1, 4],
      ], // top diamond
      [
        [3, 4],
        [4, 5],
        [3, 6],
        [2, 5],
      ], // right diamond
      [
        [1, 4],
        [2, 5],
        [1, 6],
        [0, 5],
      ], // bottom diamond
    ],
    area: 8,
    labelAt: [2, 4.7],
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
