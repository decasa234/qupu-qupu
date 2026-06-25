// GeoPattern20A22Illustration.tsx
//
// Stem illustration for SEAMO-20-A-Q22:
//   "A series of geometric patterns is shown below. Draw the next pattern in your Answer Sheet."
//
// The figure (2020.imgs/023.jpg) shows THREE staircase-grid patterns;
// the answer (2020.imgs/026.jpg) is the FOURTH pattern.
//
// Each pattern is a right-angled staircase of cells:
//   N steps → rows 1..N from top, where row i has (N - i + 1) cells,
//   all left-aligned (col 1 is leftmost in every row).
//
// Three elements move across the patterns:
//   CIRCLE   — a filled amber-ring circle   (○)
//   DIAMOND  — a rotated square outline     (◇)
//   SHADED   — lower-left triangle of a cell filled amber
//
// Observed positions (row,col, 1-indexed from top-left of staircase):
//   Pattern 1  (N=4):  circle@(1,1)  diamond@(4,1)  shaded@(3,3)
//   Pattern 2  (N=3):  circle@(2,2)  diamond@(3,2)  shaded@(3,3)
//   Pattern 3  (N=4):  circle@(4,3)  diamond@(4,1)  shaded@(4,2)
//   Pattern 4  (N=4):  circle@(4,4)  diamond@(4,2)  shaded@(4,1)  ← the answer
//
// The illustration shows all 4 patterns in a 2×2 grid; pattern 4 is
// labelled "Pola 4" and highlighted as the answer pattern.
//
// Pure SVG. SSR-safe. No hooks, no framer-motion, no window/document.
// Classification: STEM (figure in question stem; answer is drawn figure)

// ── palette ──────────────────────────────────────────────────────────────────
const CELL_STROKE  = '#374151'   // cell grid lines
const AMBER_FILL   = '#F59E0B'   // amber for shaded triangle + diamond + circle ring
const AMBER_LIGHT  = '#FEF3C7'   // light amber tint (circle interior)
const WHITE        = '#FFFFFF'
const INK          = '#1F2937'
const LABEL_COLOR  = '#6B7280'
const ANSWER_RING  = '#10B981'   // green ring around pattern 4

// ── geometry ─────────────────────────────────────────────────────────────────
const CS = 28   // cell size (pixels)
const PAD = 10  // outer padding of each pattern frame

// ── helpers ──────────────────────────────────────────────────────────────────

/** Cell top-left (x,y) in local staircase coords. row/col are 1-indexed. */
function cellOrigin(row: number, col: number): [number, number] {
  // row 1 = top; col 1 = leftmost in that row.
  // The staircase is left-aligned: each row starts at x=0.
  const x = (col - 1) * CS
  const y = (row - 1) * CS
  return [x, y]
}

/** Cell centre */
function cellCentre(row: number, col: number): [number, number] {
  const [x, y] = cellOrigin(row, col)
  return [x + CS / 2, y + CS / 2]
}

// ── sub-components ────────────────────────────────────────────────────────────

/** Staircase grid of N steps (N rows, row i has N-i+1 cells). */
function StaircaseGrid({ n }: { n: number }) {
  const cells: Array<{ r: number; c: number }> = []
  for (let r = 1; r <= n; r++) {
    for (let c = 1; c <= n - r + 1; c++) {
      cells.push({ r, c })
    }
  }
  return (
    <g>
      {cells.map(({ r, c }) => {
        const [x, y] = cellOrigin(r, c)
        return (
          <rect
            key={`${r}-${c}`}
            x={x}
            y={y}
            width={CS}
            height={CS}
            fill={WHITE}
            stroke={CELL_STROKE}
            strokeWidth={1.5}
          />
        )
      })}
    </g>
  )
}

/** Lower-left triangle shaded amber inside cell (row, col). */
function ShadedTriangle({ row, col }: { row: number; col: number }) {
  const [x, y] = cellOrigin(row, col)
  // lower-left triangle: corners at (x,y+CS), (x+CS,y+CS), (x,y)
  return (
    <polygon
      points={`${x},${y} ${x},${y + CS} ${x + CS},${y + CS}`}
      fill={AMBER_FILL}
      stroke="none"
    />
  )
}

/** Circle glyph at cell (row, col). */
function CircleGlyph({ row, col }: { row: number; col: number }) {
  const [cx, cy] = cellCentre(row, col)
  const r = CS * 0.35
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={AMBER_LIGHT} stroke={AMBER_FILL} strokeWidth={2} />
    </g>
  )
}

/** Diamond (◇) glyph at cell (row, col). */
function DiamondGlyph({ row, col }: { row: number; col: number }) {
  const [cx, cy] = cellCentre(row, col)
  const hw = CS * 0.32   // half-width
  const hh = CS * 0.32   // half-height
  return (
    <polygon
      points={`${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`}
      fill={AMBER_LIGHT}
      stroke={AMBER_FILL}
      strokeWidth={2}
    />
  )
}

// ── per-pattern data ──────────────────────────────────────────────────────────

interface PatternSpec {
  n: number
  circle:  [number, number]
  diamond: [number, number]
  shaded:  [number, number]
}

const PATTERNS: PatternSpec[] = [
  { n: 4, circle: [1, 1], diamond: [4, 1], shaded: [3, 3] },
  { n: 3, circle: [2, 2], diamond: [3, 2], shaded: [3, 3] },
  { n: 4, circle: [4, 3], diamond: [4, 1], shaded: [4, 2] },
  { n: 4, circle: [4, 4], diamond: [4, 2], shaded: [4, 1] },  // answer
]

/** Single pattern panel (staircase + glyphs), translated to (tx, ty). */
function PatternPanel({
  spec,
  tx,
  ty,
  label,
  isAnswer = false,
}: {
  spec: PatternSpec
  tx: number
  ty: number
  label: string
  isAnswer?: boolean
}) {
  const [shRow, shCol] = spec.shaded
  const [ciRow, ciCol] = spec.circle
  const [diRow, diCol] = spec.diamond

  // bounding box of the staircase: n*CS wide, n*CS tall
  const bw = spec.n * CS
  const bh = spec.n * CS
  const fw = bw + PAD * 2
  const fh = bh + PAD * 2 + 16   // +16 for label

  return (
    <g transform={`translate(${tx},${ty})`}>
      {/* frame */}
      {isAnswer && (
        <rect
          x={0}
          y={0}
          width={fw}
          height={fh}
          rx={6}
          fill="none"
          stroke={ANSWER_RING}
          strokeWidth={2.5}
          strokeDasharray="5 3"
        />
      )}

      {/* label */}
      <text
        x={fw / 2}
        y={fh - 4}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill={isAnswer ? ANSWER_RING : LABEL_COLOR}
      >
        {label}
      </text>

      {/* staircase content (shifted by PAD) */}
      <g transform={`translate(${PAD},${PAD})`}>
        {/* Draw shaded triangle FIRST (below cell border, then re-draw border) */}
        <ShadedTriangle row={shRow} col={shCol} />
        <StaircaseGrid n={spec.n} />
        {/* glyphs on top of grid */}
        <CircleGlyph  row={ciRow} col={ciCol} />
        <DiamondGlyph row={diRow} col={diCol} />
      </g>
    </g>
  )
}

// ── layout: 2-column, 2-row grid of panels ───────────────────────────────────

// Max staircase size is 4 → panel inner = 4*CS + 2*PAD + 16
const PANEL_W = 4 * CS + PAD * 2
const PANEL_H = 4 * CS + PAD * 2 + 16
const GAP     = 14

const VB_W = PANEL_W * 2 + GAP * 3
const VB_H = PANEL_H * 2 + GAP * 3

const POSITIONS = [
  { tx: GAP,              ty: GAP },
  { tx: GAP * 2 + PANEL_W, ty: GAP },
  { tx: GAP,              ty: GAP * 2 + PANEL_H },
  { tx: GAP * 2 + PANEL_W, ty: GAP * 2 + PANEL_H },
]

const LABELS = ['Pola 1', 'Pola 2', 'Pola 3', 'Pola 4 (Jawaban)']

// ── default export ────────────────────────────────────────────────────────────

/**
 * GeoPattern20A22Illustration
 *
 * Static, problem illustration for SEAMO-20-A-Q22.
 * Shows four staircase-grid patterns (3 given + 1 answer),
 * each with a circle, diamond, and shaded-triangle element.
 */
export default function GeoPattern20A22Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Empat pola geometri berbentuk tangga sel. ' +
        'Pola 1–3 diberikan; Pola 4 adalah jawaban. ' +
        'Tiga elemen bergerak: lingkaran (○), belah ketupat (◇), dan segitiga bayangan amber. ' +
        'Pada Pola 4: segitiga bayangan di baris bawah kol-1, ' +
        'belah ketupat di baris bawah kol-2, lingkaran di baris bawah kol-4.'
      }
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ maxWidth: VB_W * 2, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={VB_W} height={VB_H} fill={WHITE} />
        {PATTERNS.map((spec, i) => (
          <PatternPanel
            key={i}
            spec={spec}
            tx={POSITIONS[i].tx}
            ty={POSITIONS[i].ty}
            label={LABELS[i]}
            isAnswer={i === 3}
          />
        ))}
      </svg>
    </div>
  )
}

// ── Registry wiring ───────────────────────────────────────────────────────────
//
//   'SEAMO-20-A-Q22': {
//     illustration: () => import('./GeoPattern20A22Illustration'),
//   },
//
// Set figure_url to null in the seed/DB.
