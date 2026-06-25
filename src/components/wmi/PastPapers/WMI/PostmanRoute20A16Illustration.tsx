// SEAMO-20-A-Q16 — Postman route-counting through Point A.
//
// Problem: How many ways for the postman to reach the house passing through
//   Point A, following the arrows (right or up only)?
// Answer: D — 12  (paths start→A = 3, paths A→house = 4; 3 × 4 = 12)
//
// Figure reconstruction from docs/reference/ocr-res/seamo/contest/paper-a/2020.imgs/017.jpg:
//   • 4 columns × 3 rows of rectangular cells (landscape blocks)
//   • 5 × 4 lattice of intersection nodes
//   • All moves: RIGHT or UP only (arrows on every horizontal/vertical segment)
//   • Postman at bottom-left (0,3 in SVG coords)
//   • House at top-right (4,0 in SVG coords)
//   • Point A at (col=1, row=1) in SVG coords = 1 right, 2 up from start
//     → paths from start to A = C(3,1) = 3
//     → paths from A to house = C(4,3) = 4  (3 right + 1 up)
//     → total = 3 × 4 = 12 → answer D
//
// The stem shows ONLY the problem — never the answer.
// Pure render — no framer-motion, no React state/hooks, SSR-safe.

// ── Grid geometry (shared with explainer) ─────────────────────────────────────

/** Width of each rectangular cell (landscape blocks) */
export const CW = 54
/** Height of each rectangular cell */
export const CH = 42
/** Number of cell columns */
export const COLS = 4
/** Number of cell rows */
export const ROWS = 3
/** Number of lattice nodes per column */
export const NCOLS = COLS + 1  // 5
/** Number of lattice nodes per row */
export const NROWS = ROWS + 1  // 4

const PAD_L = 56  // room for postman glyph
const PAD_R = 56  // room for house glyph
const PAD_T = 20
const PAD_B = 20

export const SVG_W = PAD_L + COLS * CW + PAD_R  // 56 + 216 + 56 = 328
export const SVG_H = PAD_T + ROWS * CH + PAD_B  // 20 + 126 + 20 = 166

/**
 * Map lattice node (col, row) → SVG (x, y).
 * col 0 = leftmost; row 0 = TOPMOST (SVG top-down convention).
 * Start (postman) = (0, ROWS); House = (COLS, 0).
 */
export function nodeXY(col: number, row: number): [number, number] {
  return [PAD_L + col * CW, PAD_T + row * CH]
}

// Named nodes in SVG (row, col) from top-left:
export const NODE_START: [number, number] = [0, ROWS]   // col=0, row=3 (bottom-left)
export const NODE_HOUSE: [number, number] = [COLS, 0]   // col=4, row=0 (top-right)
// Point A: col=1, row=1 in SVG = 1 right, 2 up from start
export const NODE_A: [number, number] = [1, 1]

// ── Colour tokens ─────────────────────────────────────────────────────────────

export const CELL_FILL   = '#EFF6FF'  // blue-50
export const GRID_STROKE = '#60A5FA'  // blue-400
export const ARROW_COLOR = '#1D4ED8'  // blue-700
const LABEL_INK   = '#1E3A5F'

// ── Arrowhead marker ─────────────────────────────────────────────────────────

function Defs() {
  return (
    <defs>
      <marker
        id="arr"
        viewBox="0 0 8 8"
        refX="8" refY="4"
        markerWidth="5" markerHeight="5"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L8,4 L0,8 Z" fill={ARROW_COLOR} />
      </marker>
    </defs>
  )
}

// ── Grid cells and border lines ───────────────────────────────────────────────

function GridBackground() {
  const items: React.ReactNode[] = []

  // Cell fills
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [x, y] = nodeXY(c, r)
      items.push(
        <rect
          key={`cell-${r}-${c}`}
          x={x} y={y}
          width={CW} height={CH}
          fill={CELL_FILL}
          stroke={GRID_STROKE}
          strokeWidth={1.5}
        />,
      )
    }
  }

  return <g>{items}</g>
}

// ── Arrows on every horizontal segment (pointing right) ───────────────────────

function HorizontalArrows() {
  const arrows: React.ReactNode[] = []
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [x1, y1] = nodeXY(c, r)
      const [x2] = nodeXY(c + 1, r)
      const midX = (x1 + x2) / 2
      // Arrow drawn as a short segment ending at 60% toward the next node
      arrows.push(
        <line
          key={`h-${r}-${c}`}
          x1={midX - 6} y1={y1}
          x2={midX + 6} y2={y1}
          stroke={ARROW_COLOR}
          strokeWidth={2}
          markerEnd="url(#arr)"
        />,
      )
    }
  }
  return <g>{arrows}</g>
}

// ── Arrows on every vertical segment (pointing up) ────────────────────────────

function VerticalArrows() {
  const arrows: React.ReactNode[] = []
  for (let c = 0; c <= COLS; c++) {
    for (let r = 1; r <= ROWS; r++) {
      const [x1, y1] = nodeXY(c, r)      // lower node (larger row index = lower SVG y)
      const [, y2] = nodeXY(c, r - 1)    // upper node
      const midY = (y1 + y2) / 2
      arrows.push(
        <line
          key={`v-${c}-${r}`}
          x1={x1} y1={midY + 6}
          x2={x1} y2={midY - 6}
          stroke={ARROW_COLOR}
          strokeWidth={2}
          markerEnd="url(#arr)"
        />,
      )
    }
  }
  return <g>{arrows}</g>
}

// ── Point A label ─────────────────────────────────────────────────────────────

function PointALabel() {
  const [ax, ay] = nodeXY(...NODE_A)
  return (
    <g>
      <circle cx={ax} cy={ay} r={11} fill="#DBEAFE" stroke={ARROW_COLOR} strokeWidth={2} />
      <text
        x={ax} y={ay}
        textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={800}
        fontFamily="system-ui, sans-serif"
        fill={LABEL_INK}
      >
        A
      </text>
    </g>
  )
}

// ── Postman glyph ─────────────────────────────────────────────────────────────

function PostmanGlyph({ x, y }: { x: number; y: number }) {
  const BLUE  = '#2563EB'
  const SKIN  = '#FBBF24'
  const NAVY  = '#1E3A5F'
  const WHITE = '#F8FAFC'

  return (
    <g transform={`translate(${x},${y})`}>
      {/* cap */}
      <ellipse cx={0} cy={-24} rx={9} ry={4} fill={NAVY} />
      <rect x={-9} y={-24} width={18} height={3.5} fill={NAVY} rx={1} />
      {/* head */}
      <circle cx={0} cy={-16} r={8} fill={SKIN} />
      <circle cx={3} cy={-17} r={1.3} fill={NAVY} />
      {/* body */}
      <rect x={-8} y={-8} width={16} height={19} fill={BLUE} rx={3} />
      {/* left arm + envelope */}
      <line x1={-8} y1={-4} x2={-16} y2={2} stroke={BLUE} strokeWidth={4} strokeLinecap="round" />
      <rect x={-22} y={0} width={11} height={8} fill={WHITE} stroke={NAVY} strokeWidth={0.8} rx={1} />
      <line x1={-22} y1={0} x2={-16.5} y2={4} stroke={NAVY} strokeWidth={0.7} />
      <line x1={-11} y1={0} x2={-16.5} y2={4} stroke={NAVY} strokeWidth={0.7} />
      {/* right arm */}
      <line x1={8} y1={-4} x2={13} y2={2} stroke={BLUE} strokeWidth={4} strokeLinecap="round" />
      {/* legs */}
      <line x1={-3} y1={11} x2={-5} y2={24} stroke={NAVY} strokeWidth={4} strokeLinecap="round" />
      <line x1={3} y1={11} x2={5} y2={24} stroke={NAVY} strokeWidth={4} strokeLinecap="round" />
    </g>
  )
}

// ── House glyph ───────────────────────────────────────────────────────────────

function HouseGlyph({ x, y }: { x: number; y: number }) {
  const TEAL   = '#0D9488'
  const BROWN  = '#92400E'
  const RED    = '#DC2626'
  const YELLOW = '#FDE68A'
  const DOOR   = '#854D0E'

  return (
    <g transform={`translate(${x},${y})`}>
      {/* roof */}
      <polygon points="-18,-22 18,-22 22,-6 -22,-6" fill={RED} />
      {/* chimney */}
      <rect x={8} y={-26} width={5} height={14} fill={BROWN} />
      {/* house body */}
      <rect x={-18} y={-6} width={36} height={26} fill={TEAL} />
      {/* door */}
      <rect x={-6} y={8} width={12} height={12} fill={DOOR} rx={2} />
      {/* window */}
      <rect x={-15} y={0} width={10} height={9} fill={YELLOW} rx={1} />
    </g>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * PostmanRoute20A16Illustration
 *
 * Stem illustration for SEAMO-20-A-Q16.
 *
 * Shows a 4×3 rectangular cell grid with right/up direction arrows on every
 * segment, a postman glyph at the bottom-left, a house glyph at the top-right,
 * and Point A marked at the interior node (col=1, row=1 in SVG coords).
 *
 * The figure asks the student to count how many paths pass through A; the
 * answer (12 = 3 × 4) is NEVER shown here — this is the problem-only figure.
 *
 * SSR-safe: no hooks, no framer-motion.
 */
export default function PostmanRoute20A16Illustration() {
  const [sx, sy] = nodeXY(...NODE_START)
  const [hx, hy] = nodeXY(...NODE_HOUSE)

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi 4 kolom × 3 baris sel persegi panjang dengan panah ke kanan dan ke atas. ' +
        'Tukang pos ada di sudut kiri bawah, rumah ada di sudut kanan atas. ' +
        'Titik A ditandai di dalam kisi. ' +
        'Hitung cara tukang pos sampai ke rumah melewati titik A.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <Defs />
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        <GridBackground />
        <HorizontalArrows />
        <VerticalArrows />
        <PointALabel />

        {/* Postman at start (bottom-left) */}
        <PostmanGlyph x={sx - 34} y={sy - 2} />

        {/* House at goal (top-right) */}
        <HouseGlyph x={hx + 32} y={hy + 12} />
      </svg>
    </div>
  )
}
