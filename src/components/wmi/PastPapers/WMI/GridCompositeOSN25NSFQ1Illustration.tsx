// OSN 2025 SD Nasional SemiFinal Q1 — composite flat figure, triangle ABC on grid
//
// PROBLEM ONLY — shows the static figure the student sees:
//   • 10 × 6 grid of unit squares (each = 1/2 cm²)
//   • Blue L-shaped composite: left 6 × 6 block + right 4 × 4 block (notch upper-right)
//   • Triangle ABC with diagonal hatching drawn inside
//   • Vertices A, B, C labelled
//
// Does NOT show: the answer (5 cm²), the bounding-rectangle decomposition,
// or the sub-triangle areas.
//
// Grid coords: col / row in unit squares, y increases downward.
//   A = (0, 6)  [bottom-left corner of L-shape]
//   B = (10, 4) [right edge, 2 units above bottom]
//   C = (10, 2) [step corner — top of right block]
// Area = ½|0(4-2)+10(2-6)+10(6-4)| = ½|−40+20| = 10 unit squares = 5 cm² ✓
//
// Pure render — no hooks, no Date, SSR-safe and deterministic.

export const CELL = 40          // px per grid unit
export const COLS = 10
export const ROWS = 6
export const PAD  = 28          // extra space around for labels

export const SVG_W = COLS * CELL   // 400
export const SVG_H = ROWS * CELL   // 240

// L-shape polygon in px (boundary coords, clockwise from top-left)
export const L_PTS: [number, number][] = [
  [0,           0          ],   // top-left of left block
  [6 * CELL,    0          ],   // top-right of left block
  [6 * CELL,    2 * CELL   ],   // inner step corner
  [10 * CELL,   2 * CELL   ],   // top-right of right block  (= C)
  [10 * CELL,   6 * CELL   ],   // bottom-right of right block
  [0,           6 * CELL   ],   // bottom-left  (= A)
]

export const L_POLY = L_PTS.map(([x, y]) => `${x},${y}`).join(' ')

// Triangle vertex coordinates in px
export const VA = { x: 0,           y: 6 * CELL }   // A
export const VB = { x: 10 * CELL,   y: 4 * CELL }   // B
export const VC = { x: 10 * CELL,   y: 2 * CELL }   // C

export const TRI_POLY =
  `${VA.x},${VA.y} ${VB.x},${VB.y} ${VC.x},${VC.y}`

// ── main component ────────────────────────────────────────────────────────────

export default function GridCompositeOSN25NSFQ1Illustration() {
  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${SVG_W + PAD * 2} ${SVG_H + PAD * 2}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block' }}
      aria-label="Gabungan bangun datar dengan segitiga ABC di atas petak"
    >
      <defs>
        {/* diagonal hatching for triangle fill */}
        <pattern
          id="hatch-osn25nsfq1"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="#1e293b" strokeWidth="1.2" />
        </pattern>

        {/* clip to L-shape so inner grid lines stay tidy */}
        <clipPath id="l-clip-osn25nsfq1">
          <polygon points={L_POLY} />
        </clipPath>
      </defs>

      {/* ── background ─────────────────────────────────────────────────────── */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* full grid lines (very faint — only visible outside the L-shape) */}
      {Array.from({ length: COLS + 1 }, (_, i) => (
        <line
          key={`fv${i}`}
          x1={i * CELL} y1={0} x2={i * CELL} y2={SVG_H}
          stroke="#e2e8f0" strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: ROWS + 1 }, (_, i) => (
        <line
          key={`fh${i}`}
          x1={0} y1={i * CELL} x2={SVG_W} y2={i * CELL}
          stroke="#e2e8f0" strokeWidth={0.5}
        />
      ))}

      {/* ── L-shape fill ──────────────────────────────────────────────────── */}
      <polygon points={L_POLY} fill="#dbeafe" />

      {/* inner grid lines (clipped to L-shape, slightly stronger) */}
      <g clipPath="url(#l-clip-osn25nsfq1)">
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <line
            key={`lv${i}`}
            x1={i * CELL} y1={0} x2={i * CELL} y2={SVG_H}
            stroke="#93c5fd" strokeWidth={0.7}
          />
        ))}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <line
            key={`lh${i}`}
            x1={0} y1={i * CELL} x2={SVG_W} y2={i * CELL}
            stroke="#93c5fd" strokeWidth={0.7}
          />
        ))}
      </g>

      {/* ── triangle ABC ──────────────────────────────────────────────────── */}
      {/* hatched fill */}
      <polygon points={TRI_POLY} fill="url(#hatch-osn25nsfq1)" />
      {/* outline */}
      <polygon points={TRI_POLY} fill="none" stroke="#1e293b" strokeWidth={2} />

      {/* ── L-shape border (on top so it covers hatching at edges) ────────── */}
      <polygon points={L_POLY} fill="none" stroke="#3b82f6" strokeWidth={2.5} />

      {/* ── vertex dots ───────────────────────────────────────────────────── */}
      {[VA, VB, VC].map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="#1e293b" />
      ))}

      {/* ── vertex labels ─────────────────────────────────────────────────── */}
      <text
        x={VA.x - 18} y={VA.y + 6}
        fontSize={16} fontWeight="bold" fill="#1e293b" fontFamily="sans-serif"
      >A</text>

      <text
        x={VB.x + 8} y={VB.y + 6}
        fontSize={16} fontWeight="bold" fill="#1e293b" fontFamily="sans-serif"
      >B</text>

      <text
        x={VC.x + 8} y={VC.y + 6}
        fontSize={16} fontWeight="bold" fill="#1e293b" fontFamily="sans-serif"
      >C</text>
    </svg>
  )
}
