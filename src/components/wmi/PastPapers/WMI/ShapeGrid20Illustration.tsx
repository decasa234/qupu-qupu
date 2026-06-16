// 3x3 grid of colourful shapes for WMI-20F1A-Q4.
//
// Recovered from "wmiPastPaper/2020 WMI Final G01 Paper A/images/
// 7082ebbdb71296120029c0abd64eb323e20ca73b83b981c4d630a55dab0754c2.jpg":
//   row 1: yellow star, pink heart, teal flower
//   row 2: green plus, orange rectangle, purple spade
//   row 3: magenta diamond (outline), brown circled-cross, blue triangle (down)
// Asked: the shape in the bottom right = the blue triangle (answer B).
export type GridShapeKind =
  | 'star'
  | 'heart'
  | 'flower'
  | 'plus'
  | 'rectangle'
  | 'spade'
  | 'diamond'
  | 'cross'
  | 'triangle'

/** The grid contents, row-major (row 0 = top). */
export const GRID_SHAPES: GridShapeKind[][] = [
  ['star', 'heart', 'flower'],
  ['plus', 'rectangle', 'spade'],
  ['diamond', 'cross', 'triangle'],
]

const SHAPE_COLOR: Record<GridShapeKind, string> = {
  star: '#FACC15',
  heart: '#F9A8D4',
  flower: '#14B8A6',
  plus: '#84CC16',
  rectangle: '#FB923C',
  spade: '#8B7CC8',
  diamond: '#A21CAF',
  cross: '#B45309',
  triangle: '#3B82F6',
}

/** One shape glyph, drawn centred at (0,0) inside roughly a 52x52 box. */
export function GridShapeGlyph({ kind }: { kind: GridShapeKind }) {
  const color = SHAPE_COLOR[kind]

  if (kind === 'star') {
    const outer = 25
    const inner = 10.5
    const pts: string[] = []
    for (let i = 0; i < 10; i++) {
      const rad = (Math.PI / 5) * i - Math.PI / 2
      const rr = i % 2 === 0 ? outer : inner
      pts.push(`${(rr * Math.cos(rad)).toFixed(2)},${(rr * Math.sin(rad)).toFixed(2)}`)
    }
    return <polygon points={pts.join(' ')} fill={color} strokeLinejoin="round" />
  }
  if (kind === 'heart') {
    return (
      <path
        d="M 0 20 C -24 4 -24 -14 -12 -19 C -5 -22 0 -16 0 -10 C 0 -16 5 -22 12 -19 C 24 -14 24 4 0 20 Z"
        fill={color}
      />
    )
  }
  if (kind === 'flower') {
    const petals = []
    for (let i = 0; i < 6; i++) {
      const rad = (Math.PI / 3) * i
      petals.push(
        <circle key={i} cx={(13 * Math.cos(rad)).toFixed(2)} cy={(13 * Math.sin(rad)).toFixed(2)} r={9} fill={color} />,
      )
    }
    return (
      <g>
        {petals}
        <circle cx={0} cy={0} r={6} fill="#FFFFFF" />
      </g>
    )
  }
  if (kind === 'plus') {
    return (
      <polygon
        points="-8,-25 8,-25 8,-8 25,-8 25,8 8,8 8,25 -8,25 -8,8 -25,8 -25,-8 -8,-8"
        fill={color}
        strokeLinejoin="round"
      />
    )
  }
  if (kind === 'rectangle') {
    return <rect x={-13} y={-24} width={26} height={48} fill={color} />
  }
  if (kind === 'spade') {
    return (
      <path
        d="M 0 -23 C 14 -9 24 -3 24 8 C 24 16 16 20 10 16 C 7 14 5 12 4 9 C 5 16 8 20 12 24 L -12 24 C -8 20 -5 16 -4 9 C -5 12 -7 14 -10 16 C -16 20 -24 16 -24 8 C -24 -3 -14 -9 0 -23 Z"
        fill={color}
      />
    )
  }
  if (kind === 'diamond') {
    return (
      <g>
        <polygon points="0,-24 15,0 0,24 -15,0" fill="none" stroke={color} strokeWidth={4.5} strokeLinejoin="round" />
        <polygon points="0,-9 5.5,0 0,9 -5.5,0" fill={color} strokeLinejoin="round" />
      </g>
    )
  }
  if (kind === 'cross') {
    return (
      <g>
        <circle cx={0} cy={0} r={23} fill={color} />
        <polygon points="-5,-16 5,-16 5,-5 16,-5 16,5 5,5 5,16 -5,16 -5,5 -16,5 -16,-5 -5,-5" fill="#FFFFFF" />
      </g>
    )
  }
  // triangle (points down)
  return <polygon points="0,21 -23,-15 23,-15" fill={color} strokeLinejoin="round" />
}

export const GRID_VIEW = 264
const PAD = 18
const CELL = 76 // 3 cells = 228, grid spans 18..246

function cellCenter(i: number) {
  return PAD + CELL / 2 + i * CELL
}

export interface ShapeGridDiagramProps {
  /** Row index (0..2) to wash with a highlight, or null. */
  highlightRow?: number | null
  /** [row, col] of the cell to ring in blue, or null. */
  highlightCell?: [number, number] | null
  /** [row, col] of a tempting-but-wrong cell — ringed red with an X. */
  trapCell?: [number, number] | null
}

export function ShapeGridDiagram({ highlightRow = null, highlightCell = null, trapCell = null }: ShapeGridDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${GRID_VIEW} ${GRID_VIEW}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* row wash, under everything */}
      {highlightRow !== null && (
        <rect x={PAD} y={PAD + highlightRow * CELL} width={CELL * 3} height={CELL} fill="#FEF3C7" />
      )}

      {/* cell borders */}
      {GRID_SHAPES.map((row, r) =>
        row.map((_, c) => (
          <rect
            key={`b${r}${c}`}
            x={PAD + c * CELL}
            y={PAD + r * CELL}
            width={CELL}
            height={CELL}
            fill="none"
            stroke="#94A3B8"
            strokeWidth={1.5}
          />
        )),
      )}

      {/* shapes */}
      {GRID_SHAPES.map((row, r) =>
        row.map((kind, c) => (
          <g key={`s${r}${c}`} transform={`translate(${cellCenter(c)}, ${cellCenter(r)})`}>
            <GridShapeGlyph kind={kind} />
          </g>
        )),
      )}

      {/* blue ring on the asked cell */}
      {highlightCell && (
        <rect
          x={PAD + highlightCell[1] * CELL + 3}
          y={PAD + highlightCell[0] * CELL + 3}
          width={CELL - 6}
          height={CELL - 6}
          rx={10}
          fill="none"
          stroke="#2563EB"
          strokeWidth={4}
        />
      )}

      {/* red ring + X on the trap cell */}
      {trapCell && (
        <g>
          <rect
            x={PAD + trapCell[1] * CELL + 3}
            y={PAD + trapCell[0] * CELL + 3}
            width={CELL - 6}
            height={CELL - 6}
            rx={10}
            fill="none"
            stroke="#EF4444"
            strokeWidth={4}
          />
          <line
            x1={cellCenter(trapCell[1]) - 22}
            y1={cellCenter(trapCell[0]) - 22}
            x2={cellCenter(trapCell[1]) + 22}
            y2={cellCenter(trapCell[0]) + 22}
            stroke="#EF4444"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <line
            x1={cellCenter(trapCell[1]) + 22}
            y1={cellCenter(trapCell[0]) - 22}
            x2={cellCenter(trapCell[1]) - 22}
            y2={cellCenter(trapCell[0]) + 22}
            stroke="#EF4444"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  )
}

export default function ShapeGrid20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 grid of shapes. Top row: yellow star, pink heart, teal flower. Middle row: green plus, orange rectangle, purple spade. Bottom row: magenta diamond, brown circled cross, blue triangle."
    >
      <ShapeGridDiagram />
    </div>
  )
}
