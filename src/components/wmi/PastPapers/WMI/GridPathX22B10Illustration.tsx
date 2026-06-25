// GridPathX22B10Illustration.tsx
// SEAMOX-22-B-Q10 — "Find the number of paths from Point A to Point B"
//
// Figure: U-shaped directed grid. Left arm (right+down) 3×2 cells; single
// bridge step at the bottom; right arm (right+up) 3×2 cells.
// A is at top-left of left arm; B is at top-right of right arm.
// Answer: C(5,2) × C(5,2) = 10 × 10 = 100 paths.
//
// Pure SVG, SSR-safe: no hooks, no framer-motion, no Date, no Math.random.

// ── Layout constants (exported so explainer can reuse same geometry) ─────────

export const CELL = 28       // px per grid cell
export const PAD  = 22       // outer padding
export const ROW_TOP = 26    // y of row-0 nodes (room for A/B labels)

/** X coordinate of a node in the 8-column grid.
 *  Columns 0-3 = left arm; columns 4-7 = right arm (shifted right 1 cell for gap). */
export function nodeX(col: number): number {
  return PAD + (col <= 3 ? col : col + 1) * CELL
}

/** Y coordinate of a node (row 0 = top). */
export function nodeY(row: number): number {
  return ROW_TOP + row * CELL
}

export const SVG_W = nodeX(7) + PAD   // ≈ 286
export const SVG_H = nodeY(2) + PAD   // ≈ 102

// ── Colour palette ───────────────────────────────────────────────────────────
export const C = {
  GRID:   '#D1D5DB',   // cell borders
  FILL:   '#F9FAFB',   // cell fill
  NODE:   '#374151',   // intersection dot
  ARROW:  '#6B7280',   // direction arrow
  LABEL:  '#1F2937',   // A / B text
  BRIDGE: '#9CA3AF',   // bridge edge
} as const

// ── Arrowhead helper ─────────────────────────────────────────────────────────
/** Draws a tiny filled triangle indicating direction. dir: 'r'|'d'|'u' */
function Arrowhead({ x, y, dir }: { x: number; y: number; dir: 'r'|'d'|'u' }) {
  const s = 4
  let pts: string
  if (dir === 'r') pts = `${x},${y-s} ${x+s*1.6},${y} ${x},${y+s}`
  else if (dir === 'd') pts = `${x-s},${y} ${x},${y+s*1.6} ${x+s},${y}`
  else /* u */          pts = `${x-s},${y} ${x},${y-s*1.6} ${x+s},${y}`
  return <polygon points={pts} fill={C.ARROW} />
}

// ── Grid rendering (shared with explainer) ───────────────────────────────────
/** Draw cells of one rectangular arm. */
function Arm({ startCol, cols, rows }: { startCol: number; cols: number; rows: number }) {
  const rects: React.ReactElement[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = startCol; c < startCol + cols; c++) {
      rects.push(
        <rect
          key={`${r}-${c}`}
          x={nodeX(c)}
          y={nodeY(r)}
          width={CELL}
          height={CELL}
          fill={C.FILL}
          stroke={C.GRID}
          strokeWidth={1.5}
        />
      )
    }
  }
  return <g>{rects}</g>
}

/** Draw all intersection nodes (dots) for one arm. */
function ArmNodes({ startCol, endCol, rows }: { startCol: number; endCol: number; rows: number }) {
  const dots: React.ReactElement[] = []
  for (let r = 0; r <= rows; r++) {
    for (let c = startCol; c <= endCol; c++) {
      dots.push(
        <circle key={`${r}-${c}`} cx={nodeX(c)} cy={nodeY(r)} r={2.5} fill={C.NODE} />
      )
    }
  }
  return <g>{dots}</g>
}

// ── Direction arrows placed along edges (mid-point indicators) ───────────────
function DirectionArrows() {
  const arrows: React.ReactElement[] = []
  // Left arm: → along top row, ↓ along left column
  // Top row arrows (→)
  for (let c = 0; c < 3; c++) {
    const mx = (nodeX(c) + nodeX(c + 1)) / 2
    arrows.push(<Arrowhead key={`lr${c}`} x={mx} y={nodeY(0)} dir="r" />)
  }
  // Left column arrows (↓)
  for (let r = 0; r < 2; r++) {
    const my = (nodeY(r) + nodeY(r + 1)) / 2
    arrows.push(<Arrowhead key={`ld${r}`} x={nodeX(0)} y={my} dir="d" />)
  }
  // Bridge arrow (→)
  const bx = (nodeX(3) + nodeX(4)) / 2
  arrows.push(<Arrowhead key="bridge" x={bx} y={nodeY(2)} dir="r" />)
  // Right arm: → along bottom row, ↑ along right column
  // Bottom row arrows (→)
  for (let c = 4; c < 7; c++) {
    const mx = (nodeX(c) + nodeX(c + 1)) / 2
    arrows.push(<Arrowhead key={`rr${c}`} x={mx} y={nodeY(2)} dir="r" />)
  }
  // Right column arrows (↑)
  for (let r = 0; r < 2; r++) {
    const my = (nodeY(r) + nodeY(r + 1)) / 2
    arrows.push(<Arrowhead key={`ru${r}`} x={nodeX(7)} y={my} dir="u" />)
  }
  return <g>{arrows}</g>
}

// ── Bridge edge ───────────────────────────────────────────────────────────────
function Bridge() {
  return (
    <line
      x1={nodeX(3)} y1={nodeY(2)}
      x2={nodeX(4)} y2={nodeY(2)}
      stroke={C.BRIDGE}
      strokeWidth={1.5}
      strokeDasharray="3 2"
    />
  )
}

// ── Labelled endpoint circles (A and B) ───────────────────────────────────────
function EndpointLabel({ col, row, label }: { col: number; row: number; label: string }) {
  const x = nodeX(col)
  const y = nodeY(row)
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill="#1D4ED8" />
      <text
        x={x} y={y}
        textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={800} fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────
export default function GridPathX22B10Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Kisi berbentuk U: titik A di kiri atas terhubung ke titik B di kanan atas melalui jalur kanan+bawah (lengan kiri), lurus di bawah, dan kanan+atas (lengan kanan). Berapa banyak lintasan dari A ke B?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Left arm cells */}
        <Arm startCol={0} cols={3} rows={2} />
        {/* Right arm cells */}
        <Arm startCol={4} cols={3} rows={2} />
        {/* Bridge edge (dashed, connecting the two arms at the bottom) */}
        <Bridge />
        {/* Direction arrows */}
        <DirectionArrows />
        {/* Intersection nodes */}
        <ArmNodes startCol={0} endCol={3} rows={2} />
        <ArmNodes startCol={4} endCol={7} rows={2} />
        {/* A and B labels on top of the node dots */}
        <EndpointLabel col={0} row={0} label="A" />
        <EndpointLabel col={7} row={0} label="B" />
      </svg>
    </div>
  )
}
