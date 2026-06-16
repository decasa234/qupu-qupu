// WMI-23F3A-Q15 (2023 Grade 3 Final) — clockwise outward spiral of shapes.
//
// "The figures are arranged in a pattern. Starting from START, they are arranged
// outward in a clockwise spiral. Which two figures are missing?"  (MC, answer = B.)
//
// The 4×4 grid holds a SHAPE (regular heptagon or square) in one of three fills
// (white = outline only, gray, black). Two cells, (1,3) and (1,4), are blank
// "?" cells — the two missing figures the learner must find.
//
// PROOF (two interleaved cycles read in spiral order from START):
//   Spiral order (clockwise outward from START at (3,3)):
//     (3,3)(3,2)(2,2)(2,3)(2,4)(3,4)(4,4)(4,3)(4,2)(4,1)(3,1)(2,1)(1,1)(1,2)(1,3)(1,4)
//   SHAPE cycle, period 5 starting at START:
//     [square, square, heptagon, heptagon, heptagon] →
//     pos 15 (1,3) = heptagon, pos 16 (1,4) = square.
//   COLOR cycle, period 4 starting at the 2ND shape:
//     [white, white, gray, black] →
//     pos 15 (1,3) = white, pos 16 (1,4) = gray.
//   ⇒ missing = white heptagon at (1,3) and gray square at (1,4)  ⇒  option B.
//
// The default figure draws ONLY the setup: the 4×4 grid with the spiral guide
// line and the two "?" cells. It NEVER fills the two missing shapes — that is the
// animator's job, via the co-exported Spiral23G3 primitive (reveal=true).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// Three fills. There is no qupu neutral-gray/black token, so the shape fills are
// literal grayscale values intrinsic to the problem statement.
const SHAPE_WHITE = '#FFFFFF' // white = outline only
const SHAPE_GRAY = '#9CA3AF' // gray fill
const SHAPE_BLACK = '#2B2622' // black fill (warm near-black, matches family)
const OUTLINE = '#2B2622' // shape outlines / grid ink
const GRID_LINE = '#C9BBA8' // faint cell separators
const SPIRAL_LINE = '#f0853a' // qupu-brand-orange spiral guide
const QMARK = '#30598A' // qupu-brand-blue "?" + dashed ring

export type ShapeKind = 'heptagon' | 'square'
export type ShapeFill = 'white' | 'gray' | 'black'

function fillFor(fill: ShapeFill): string {
  return fill === 'white' ? SHAPE_WHITE : fill === 'gray' ? SHAPE_GRAY : SHAPE_BLACK
}

/** Regular heptagon points centred at (cx, cy), flat-ish top, given circumradius. */
function heptagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 7; i++) {
    // start at the top vertex (-90°) and step by 360/7
    const a = (-90 + (i * 360) / 7) * (Math.PI / 180)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/**
 * Shared shape primitive — reused by both the grid figure and the answer-option
 * renderer so the option shapes can never drift from the grid shapes. Draws a
 * heptagon or square of the given fill, centred in a `size`×`size` box (origin
 * at the box top-left of the surrounding <g>/<svg> coordinate system: the glyph
 * is centred at size/2, size/2).
 */
export function ShapeGlyph({
  shape,
  fill,
  size = 36,
}: {
  shape: ShapeKind
  fill: ShapeFill
  size?: number
}) {
  const cx = size / 2
  const cy = size / 2
  const color = fillFor(fill)
  // White shapes get a slightly thicker outline so they read against the cream.
  const strokeW = fill === 'white' ? 2.2 : 1.6
  if (shape === 'square') {
    const s = size * 0.7
    return (
      <rect
        x={cx - s / 2}
        y={cy - s / 2}
        width={s}
        height={s}
        fill={color}
        stroke={OUTLINE}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />
    )
  }
  const r = size * 0.42
  return (
    <polygon
      points={heptagonPoints(cx, cy, r)}
      fill={color}
      stroke={OUTLINE}
      strokeWidth={strokeW}
      strokeLinejoin="round"
    />
  )
}

// ---- grid contents ---------------------------------------------------------
// Row r (1..4), col c (1..4). null = a missing "?" cell. The START cell carries
// a label. Everything below is the literal problem; the two ??? cells are null.
type Cell =
  | { kind: 'shape'; shape: ShapeKind; fill: ShapeFill; start?: boolean }
  | { kind: 'missing' }

// 4 rows top→bottom, 4 cols left→right (index [r-1][c-1]).
const GRID: Cell[][] = [
  [
    { kind: 'shape', shape: 'heptagon', fill: 'black' }, // (1,1)
    { kind: 'shape', shape: 'heptagon', fill: 'white' }, // (1,2)
    { kind: 'missing' }, // (1,3) ???
    { kind: 'missing' }, // (1,4) ???
  ],
  [
    { kind: 'shape', shape: 'square', fill: 'gray' }, // (2,1)
    { kind: 'shape', shape: 'heptagon', fill: 'white' }, // (2,2)
    { kind: 'shape', shape: 'heptagon', fill: 'gray' }, // (2,3)
    { kind: 'shape', shape: 'heptagon', fill: 'black' }, // (2,4)
  ],
  [
    { kind: 'shape', shape: 'square', fill: 'white' }, // (3,1)
    { kind: 'shape', shape: 'square', fill: 'white' }, // (3,2)
    { kind: 'shape', shape: 'square', fill: 'black', start: true }, // (3,3) START
    { kind: 'shape', shape: 'square', fill: 'white' }, // (3,4)
  ],
  [
    { kind: 'shape', shape: 'heptagon', fill: 'white' }, // (4,1)
    { kind: 'shape', shape: 'heptagon', fill: 'black' }, // (4,2)
    { kind: 'shape', shape: 'heptagon', fill: 'gray' }, // (4,3)
    { kind: 'shape', shape: 'square', fill: 'white' }, // (4,4)
  ],
]

// The two answers the animator reveals into the "?" cells (NEVER in the static
// default). (1,3) = white heptagon, (1,4) = gray square.
const REVEAL: Record<string, { shape: ShapeKind; fill: ShapeFill }> = {
  '1,3': { shape: 'heptagon', fill: 'white' },
  '1,4': { shape: 'square', fill: 'gray' },
}

// Spiral order as [row, col] pairs (1-based), clockwise outward from START.
const SPIRAL: ReadonlyArray<readonly [number, number]> = [
  [3, 3], [3, 2], [2, 2], [2, 3], [2, 4], [3, 4], [4, 4], [4, 3],
  [4, 2], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4],
]

// ---- layout ----------------------------------------------------------------
const CELL = 56 // cell pitch
const GLYPH = 40 // shape box inside a cell
const PAD = 18 // outer padding (headroom for the spiral + START tag)
const GRID_N = 4

/** Centre (x, y) of cell (row r, col c) in SVG user units. */
function cellCenter(r: number, c: number): { x: number; y: number } {
  return {
    x: PAD + (c - 1) * CELL + CELL / 2,
    y: PAD + (r - 1) * CELL + CELL / 2,
  }
}

export interface Spiral23G3Props {
  /**
   * Animator only — when true, the two "?" cells are filled with the answer
   * shapes (white heptagon at (1,3), gray square at (1,4)). Default false keeps
   * them as the dashed "?" cells (the static figure must not reveal the answer).
   */
  reveal?: boolean
}

/**
 * Grid + spiral primitive. By default the two missing cells render as dashed "?"
 * rings; with `reveal` they show the answer shapes. Reused by the default
 * illustration export below.
 */
export function Spiral23G3({ reveal = false }: Spiral23G3Props = {}) {
  const gridPx = GRID_N * CELL
  const width = PAD * 2 + gridPx
  const height = PAD * 2 + gridPx

  // spiral guide polyline through the cell centres
  const spiralPath = SPIRAL.map(([r, c]) => {
    const p = cellCenter(r, c)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(300, width)} aria-hidden="true">
      {/* cream board behind the grid */}
      <rect
        x={PAD}
        y={PAD}
        width={gridPx}
        height={gridPx}
        rx={8}
        className="fill-qupu-cream"
        stroke={GRID_LINE}
        strokeWidth={1.5}
      />

      {/* faint cell separators */}
      {Array.from({ length: GRID_N - 1 }, (_, i) => i + 1).map((i) => (
        <g key={`sep-${i}`}>
          <line
            x1={PAD + i * CELL}
            y1={PAD}
            x2={PAD + i * CELL}
            y2={PAD + gridPx}
            stroke={GRID_LINE}
            strokeWidth={1}
          />
          <line
            x1={PAD}
            y1={PAD + i * CELL}
            x2={PAD + gridPx}
            y2={PAD + i * CELL}
            stroke={GRID_LINE}
            strokeWidth={1}
          />
        </g>
      ))}

      {/* spiral guide line under the shapes */}
      <polyline
        points={spiralPath}
        fill="none"
        stroke={SPIRAL_LINE}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.55}
        strokeDasharray="2 4"
      />

      {/* the shapes */}
      {GRID.map((row, ri) =>
        row.map((cell, ci) => {
          const r = ri + 1
          const c = ci + 1
          const ctr = cellCenter(r, c)
          const gx = ctr.x - GLYPH / 2
          const gy = ctr.y - GLYPH / 2

          if (cell.kind === 'missing') {
            const ans = REVEAL[`${r},${c}`]
            if (reveal && ans) {
              return (
                <g key={`m-${r}-${c}`} transform={`translate(${gx}, ${gy})`}>
                  <ShapeGlyph shape={ans.shape} fill={ans.fill} size={GLYPH} />
                </g>
              )
            }
            // dashed "?" ring
            return (
              <g key={`m-${r}-${c}`}>
                <circle
                  cx={ctr.x}
                  cy={ctr.y}
                  r={GLYPH / 2}
                  fill="none"
                  stroke={QMARK}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <text
                  x={ctr.x}
                  y={ctr.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={24}
                  fontWeight={800}
                  fill={QMARK}
                >
                  ?
                </text>
              </g>
            )
          }

          return (
            <g key={`s-${r}-${c}`}>
              <g transform={`translate(${gx}, ${gy})`}>
                <ShapeGlyph shape={cell.shape} fill={cell.fill} size={GLYPH} />
              </g>
              {cell.start && (
                <text
                  x={ctr.x}
                  y={ctr.y + 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={800}
                  className="fill-qupu-cream"
                >
                  START
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

/**
 * Default export: the 4×4 grid with the clockwise spiral guide and the two "?"
 * cells. Reveals nothing about the two missing shapes.
 */
export default function Spiral23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi 4×4 berisi bangun (heptagon dan persegi) dengan tiga warna isian: putih, abu-abu, hitam. Mulai dari kotak START, bangun tersusun melingkar searah jarum jam ke arah luar. Dua kotak di baris atas masih kosong, ditandai dengan tanda tanya. Tentukan dua bangun yang hilang."
    >
      <Spiral23G3 />
    </div>
  )
}
