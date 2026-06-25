// ShortestPathsX24A6Illustration.tsx
// SEAMO-X 2024 Paper A Q6 — "Using → and ↓ movements only, find the number
// of shortest paths from A to B, without passing through x."
//
// Figure (faithfully reconstructed from OCR image 2024.imgs/006.jpg):
//   A 4×4 node grid (3×3 rectangular cells).
//   A is at the top-left corner node (col=0, row=0).
//   B is at the bottom-right corner node (col=3, row=3).
//   A filled dot labelled "x" marks the blocked intersection at (col=1, row=1).
//
// Answer: 8 paths (grid-counting with x set to 0).
//
// Pure SVG, SSR-safe: no hooks, no framer-motion, no Date, no Math.random.

// ── Layout constants (exported so explainer reuses same geometry) ─────────────

/** Pixel size of one grid cell. */
export const CELL = 44

/** Outer padding (left, right, top, bottom). */
export const PAD = 20

/** Number of cells in x direction (→). Nodes: 0 … COLS. */
export const COLS = 3

/** Number of cells in y direction (↓). Nodes: 0 … ROWS. */
export const ROWS = 3

/** SVG x coordinate of grid column c (0-based). */
export function nodeX(col: number): number {
  return PAD + col * CELL
}

/** SVG y coordinate of grid row r (0-based). */
export function nodeY(row: number): number {
  return PAD + row * CELL
}

export const SVG_W = 2 * PAD + COLS * CELL   // 172
export const SVG_H = 2 * PAD + ROWS * CELL   // 172

/** Blocked intersection (col, row) — set to 0 in the path count. */
export const BLOCKED: [number, number] = [1, 1]

// ── Colour palette ────────────────────────────────────────────────────────────
export const C = {
  GRID:  '#D1D5DB',
  FILL:  '#F9FAFB',
  BLUE:  '#1D4ED8',
  INK:   '#1F2937',
} as const

// ── Subcomponents ─────────────────────────────────────────────────────────────

/** 3×3 cell grid (background). */
function GridCells() {
  const rects: React.ReactElement[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
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
        />,
      )
    }
  }
  return <g>{rects}</g>
}

/** Labelled endpoint circle for A or B. */
function EndpointLabel({ col, row, label }: { col: number; row: number; label: string }) {
  const x = nodeX(col)
  const y = nodeY(row)
  const fill = label === 'A' ? C.BLUE : C.INK
  return (
    <g>
      <circle cx={x} cy={y} r={10} fill={fill} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

/** Filled dot + "x" label at the blocked intersection. */
function BlockedMarker() {
  const [bc, br] = BLOCKED
  const x = nodeX(bc)
  const y = nodeY(br)
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill={C.INK} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontStyle="italic"
      >
        x
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * ShortestPathsX24A6Illustration
 *
 * Problem-only figure for SEAMO-X 2024 Paper A Q6.
 * Shows a 3×3 cell grid with A (top-left), B (bottom-right), and the blocked
 * intersection x at (col=1, row=1). Never reveals the answer (8 paths).
 */
export default function ShortestPathsX24A6Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Kisi 3×3 petak. A di sudut kiri atas, B di sudut kanan bawah. ' +
        'Persimpangan x (terblokir) ada satu langkah ke kanan dan satu langkah ke bawah dari A. ' +
        'Hanya gerakan ke kanan (→) dan ke bawah (↓) yang diizinkan.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(220, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <GridCells />
        <BlockedMarker />
        <EndpointLabel col={0} row={0} label="A" />
        <EndpointLabel col={3} row={3} label="B" />
      </svg>
    </div>
  )
}
