// IKMC-19-PE-Q17 — "A cat and a bowl of milk are in the opposite corners of the board."
//
// The board is a 3×3 grid of cells (2 columns × 2 rows of internal lines creates
// 4 interior nodes plus corners = 3×3 = 9 cells, i.e. a 4×4 lattice of nodes).
// The figure from the paper (2019.imgs/031.jpg) shows:
//   - A 3-column × 3-row grid of cells
//   - Cat glyph in the top-left cell (node 0,0)
//   - Milk-bowl glyph in the bottom-right cell (node 2,2 in cell coords)
//   - Two arrows to the right of the grid: a red →  and a blue ↓
//     indicating that the cat may ONLY move RIGHT or DOWN.
//
// Answer: the number of monotone paths from top-left to bottom-right on a 3×3 grid
// is C(4,2) = 6.  (We must make exactly 2 steps right and 2 steps down in some order.)
//
// PROBLEM-ONLY: static scene.  Does NOT show any enumerated paths.
// Pure render — no Math.random, no Date.  SSR-safe and deterministic.

// ── Shared layout constants (re-exported so the explainer can use the same coords) ──────────

/** SVG viewBox width */
export const SVG_W = 300

/** SVG viewBox height */
export const SVG_H = 200

/** Number of cells per dimension (3×3 grid → 4×4 nodes) */
export const GRID_N = 3

/** Top-left corner of the grid in SVG space */
export const GRID_X0 = 20
export const GRID_Y0 = 20

/** Size of each cell */
export const CELL_SIZE = 52

/** Derived: grid pixel width/height */
export const GRID_PX = GRID_N * CELL_SIZE   // 156
export const GRID_PY = GRID_N * CELL_SIZE   // 156

/** Helper: pixel centre of cell (col, row) */
export function cellCentre(col: number, row: number): [number, number] {
  return [GRID_X0 + col * CELL_SIZE + CELL_SIZE / 2, GRID_Y0 + row * CELL_SIZE + CELL_SIZE / 2]
}

/** Colour palette */
export const COLOR = {
  GRID_FILL: '#FFFDE7',
  GRID_STROKE: '#4B5563',
  CAT_FILL: '#92400E',   // warm brown
  MILK_FILL: '#7C3AED',  // purple bowl
  ARROW_RIGHT: '#DC2626', // red
  ARROW_DOWN: '#2563EB',  // blue
  BG: '#FFFFFF',
} as const

// ── Cat glyph (simple SVG cat face) ─────────────────────────────────────────────────────────

/** Minimal cat icon centred at (cx, cy) with radius r. */
export function CatGlyph({ cx, cy, r = 16 }: { cx: number; cy: number; r?: number }) {
  const headR = r
  const earH = r * 0.55
  const earW = r * 0.45
  // Ear triangles
  const leftEarX = cx - r * 0.55
  const rightEarX = cx + r * 0.55
  const earBaseY = cy - r * 0.62

  return (
    <g aria-hidden="true">
      {/* Head circle */}
      <circle cx={cx} cy={cy} r={headR} fill={COLOR.CAT_FILL} stroke="#1F2937" strokeWidth={1.2} />
      {/* Left ear */}
      <polygon
        points={`${leftEarX - earW},${earBaseY - earH} ${leftEarX + earW},${earBaseY - earH} ${leftEarX},${cy - r * 0.85}`}
        fill={COLOR.CAT_FILL}
        stroke="#1F2937"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* Right ear */}
      <polygon
        points={`${rightEarX - earW},${earBaseY - earH} ${rightEarX + earW},${earBaseY - earH} ${rightEarX},${cy - r * 0.85}`}
        fill={COLOR.CAT_FILL}
        stroke="#1F2937"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* Eyes */}
      <circle cx={cx - r * 0.32} cy={cy - r * 0.12} r={r * 0.14} fill="#3B82F6" />
      <circle cx={cx + r * 0.32} cy={cy - r * 0.12} r={r * 0.14} fill="#3B82F6" />
      {/* Nose */}
      <polygon
        points={`${cx},${cy + r * 0.18} ${cx - r * 0.1},${cy + r * 0.08} ${cx + r * 0.1},${cy + r * 0.08}`}
        fill="#F472B6"
      />
      {/* Whiskers */}
      <line x1={cx - r * 0.05} y1={cy + r * 0.2} x2={cx - r * 0.7} y2={cy + r * 0.15} stroke="#D1D5DB" strokeWidth={0.9} />
      <line x1={cx - r * 0.05} y1={cy + r * 0.25} x2={cx - r * 0.7} y2={cy + r * 0.3} stroke="#D1D5DB" strokeWidth={0.9} />
      <line x1={cx + r * 0.05} y1={cy + r * 0.2} x2={cx + r * 0.7} y2={cy + r * 0.15} stroke="#D1D5DB" strokeWidth={0.9} />
      <line x1={cx + r * 0.05} y1={cy + r * 0.25} x2={cx + r * 0.7} y2={cy + r * 0.3} stroke="#D1D5DB" strokeWidth={0.9} />
    </g>
  )
}

// ── Milk bowl glyph ───────────────────────────────────────────────────────────────────────────

/** Milk bowl centred at (cx, cy). */
export function MilkGlyph({ cx, cy }: { cx: number; cy: number }) {
  const w = 30
  const h = 16
  const rim = 4

  return (
    <g aria-hidden="true">
      {/* Bowl body (ellipse-based trapezoid) */}
      <path
        d={`M ${cx - w / 2} ${cy} Q ${cx - w / 2 - 2} ${cy + h} ${cx} ${cy + h} Q ${cx + w / 2 + 2} ${cy + h} ${cx + w / 2} ${cy} Z`}
        fill={COLOR.MILK_FILL}
        stroke="#4B5563"
        strokeWidth={1.2}
      />
      {/* Rim ellipse at top */}
      <ellipse cx={cx} cy={cy} rx={w / 2} ry={rim / 2} fill="#C4B5FD" stroke="#4B5563" strokeWidth={1.2} />
      {/* Milk surface highlight */}
      <ellipse cx={cx} cy={cy} rx={w / 2 - 2} ry={rim / 2 - 1} fill="white" opacity={0.55} />
    </g>
  )
}

// ── Directional arrow (the "allowed move" legend) ─────────────────────────────────────────────

function ArrowRight({ x, y, color }: { x: number; y: number; color: string }) {
  const len = 38
  const hw = 8   // arrowhead half-width
  const hl = 10  // arrowhead length
  return (
    <g>
      <line x1={x} y1={y} x2={x + len - hl} y2={y} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <polygon
        points={`${x + len},${y} ${x + len - hl},${y - hw} ${x + len - hl},${y + hw}`}
        fill={color}
      />
    </g>
  )
}

function ArrowDown({ x, y, color }: { x: number; y: number; color: string }) {
  const len = 38
  const hw = 8
  const hl = 10
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + len - hl} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <polygon
        points={`${x},${y + len} ${x - hw},${y + len - hl} ${x + hw},${y + len - hl}`}
        fill={color}
      />
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────────────────────

/**
 * CatPath17Illustration
 *
 * Static problem figure for IKMC-19-PE-Q17.
 * Shows a 3×3 grid with the cat at the top-left corner and the milk bowl
 * at the bottom-right corner. Two arrows to the right of the grid indicate
 * the only allowed moves: RIGHT (red) and DOWN (blue).
 * Does NOT draw any of the 6 solution paths.
 */
export default function CatPath17Illustration() {
  const [catCx, catCy] = cellCentre(0, 0)
  const [milkCx, milkCy] = cellCentre(2, 2)

  // Arrow legend: positioned to the right of the grid
  const legendX = GRID_X0 + GRID_PX + 30
  const legendY1 = GRID_Y0 + GRID_PY / 2 - 28
  const legendY2 = GRID_Y0 + GRID_PY / 2 + 14

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Papan 3×3 kotak dengan kucing di sudut kiri atas dan semangkuk susu di sudut kanan bawah. ' +
        'Panah merah menunjukkan kucing bisa bergerak ke kanan, panah biru menunjukkan bisa bergerak ke bawah. ' +
        'Berapa cara kucing bisa mencapai susu?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* ── Grid cells ── */}
        {Array.from({ length: GRID_N }, (_, row) =>
          Array.from({ length: GRID_N }, (_, col) => (
            <rect
              key={`cell-${row}-${col}`}
              x={GRID_X0 + col * CELL_SIZE}
              y={GRID_Y0 + row * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={COLOR.GRID_FILL}
              stroke={COLOR.GRID_STROKE}
              strokeWidth={2}
            />
          ))
        )}

        {/* Cat in top-left cell */}
        <CatGlyph cx={catCx} cy={catCy} r={18} />

        {/* Milk bowl in bottom-right cell */}
        <MilkGlyph cx={milkCx} cy={milkCy} />

        {/* Arrow legend to the right of the grid */}
        <ArrowRight x={legendX} y={legendY1} color={COLOR.ARROW_RIGHT} />
        <ArrowDown x={legendX + 18} y={legendY2} color={COLOR.ARROW_DOWN} />
      </svg>
    </div>
  )
}
