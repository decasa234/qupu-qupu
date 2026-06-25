// LatticePathHK18P3Q25Illustration.tsx
// Stem illustration for HKIMO-18-P3H-Q25:
// "Andy goes from A to B, each step only right or up. How many ways?"
//
// Grid (faithful to scan 2018.imgs/004.jpg):
//   Bottom row (cells y=0..1): 3 cells wide — lattice x=0..3, y=0..1
//   Upper rows (cells y=1..3): 2 cells wide — lattice x=0..2, y=1..3
//   The step cuts off the top-right column above y=1.
//   A = lattice (0,0) bottom-left, B = lattice (2,3) top-right of upper section.
//
// Answer: C(5,2)=10 — the 2R+3U path from A to B counts 10 ways
// (the x=3 column at the bottom is a dead-end; paths there cannot reach B).
//
// PROBLEM-ONLY: shows grid + labels. No DP counts. SSR-safe.

const CELL = 58
const PAD_L = 42   // space left of grid for up-arrow
const PAD_R = 22
const PAD_T = 26   // space above grid for B label
const PAD_B = 46   // space below grid for A label + right-arrow

// SVG width: columns 0..3 (3 cells wide at bottom = max)
const VW = PAD_L + 3 * CELL + PAD_R   // 42 + 174 + 22 = 238
// SVG height: rows 0..3 (3 cell rows)
const VH = PAD_T + 3 * CELL + PAD_B   // 26 + 174 + 46 = 246

// Lattice → SVG pixel coords (row 0 is at bottom of drawing)
const lx = (col: number) => PAD_L + col * CELL
const ly = (row: number) => PAD_T + (3 - row) * CELL

// Is (col, row) an accessible lattice point in this staircase?
const ok = (col: number, row: number) =>
  row <= 1 ? col <= 3 : col <= 2

export default function LatticePathHK18P3Q25Illustration() {
  // Horizontal grid lines
  // y=0,1 (bottom section): full width x=lx(0)..lx(3)
  // y=2,3 (upper section):  x=lx(0)..lx(2)
  const hLines = [0, 1, 2, 3].map(row => ({
    row,
    x1: lx(0),
    x2: lx(row <= 1 ? 3 : 2),
    y: ly(row),
  }))

  // Vertical grid lines
  // col=0,1,2: full height (row 0..3)
  // col=3: bottom section only (row 0..1)
  const vLines = [
    { col: 0, y1: ly(3), y2: ly(0) },
    { col: 1, y1: ly(3), y2: ly(0) },
    { col: 2, y1: ly(3), y2: ly(0) },
    { col: 3, y1: ly(1), y2: ly(0) },
  ]

  // All accessible lattice points
  const dots: [number, number][] = []
  for (let r = 0; r <= 3; r++) {
    for (let c = 0; c <= 3; c++) {
      if (ok(c, r)) dots.push([c, r])
    }
  }

  // Arrow: lx(0), ly(0) = origin of A = (30+42, 26+174) = actual pixel
  const ax = lx(0)
  const ay = ly(0)

  return (
    <div
      className="mx-auto w-full max-w-[280px]"
      role="img"
      aria-label="Staircase grid from A at bottom-left to B at top-right. Move only right or up."
    >
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-hidden="true">
        <defs>
          <marker
            id="lp-arr"
            markerWidth="7"
            markerHeight="7"
            refX="3.5"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0,0 7,3.5 0,7" fill="#475569" />
          </marker>
        </defs>

        {/* Grid lines */}
        {hLines.map(({ row, x1, x2, y }) => (
          <line
            key={`h${row}`}
            x1={x1} y1={y} x2={x2} y2={y}
            stroke="#94A3B8" strokeWidth={1.6}
          />
        ))}
        {vLines.map(({ col, y1, y2 }) => (
          <line
            key={`v${col}`}
            x1={lx(col)} y1={y1} x2={lx(col)} y2={y2}
            stroke="#94A3B8" strokeWidth={1.6}
          />
        ))}

        {/* Lattice dots */}
        {dots.map(([c, r]) => (
          <circle
            key={`d${c}${r}`}
            cx={lx(c)} cy={ly(r)} r={3.5}
            fill="#64748B"
          />
        ))}

        {/* A label — below and left of (0,0) */}
        <text
          x={ax} y={ay + 18}
          textAnchor="middle"
          fontSize={15} fontWeight="700" fill="#0F172A"
        >
          A
        </text>

        {/* Right arrow at A */}
        <line
          x1={ax + 4} y1={ay + 32}
          x2={ax + 26} y2={ay + 32}
          stroke="#475569" strokeWidth={1.6}
          markerEnd="url(#lp-arr)"
        />

        {/* Up arrow at A */}
        <line
          x1={ax - 22} y1={ay + 8}
          x2={ax - 22} y2={ay - 14}
          stroke="#475569" strokeWidth={1.6}
          markerEnd="url(#lp-arr)"
        />

        {/* B label — above-right of (2,3) */}
        <text
          x={lx(2) + 10} y={ly(3) + 4}
          textAnchor="start"
          fontSize={15} fontWeight="700" fill="#0F172A"
        >
          B
        </text>

        {/* Highlight A and B dots */}
        <circle cx={lx(0)} cy={ly(0)} r={5} fill="#0EA5E9" />
        <circle cx={lx(2)} cy={ly(3)} r={5} fill="#10B981" />
      </svg>
    </div>
  )
}
