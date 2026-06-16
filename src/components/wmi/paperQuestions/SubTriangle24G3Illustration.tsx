/**
 * WMI-24F3A-Q12 — "2 of the 9 small triangles are already painted; paint 2
 * more of the same colour so the figure remains line-symmetric. How many
 * ways?" (Grade 3, 2024, answer C = 9).
 *
 * The large equilateral triangle is subdivided into 9 small triangles in a
 * 3-row triangular grid (each side divided into 3 equal segments). Labels
 * A–I run left-to-right, top-to-bottom:
 *
 *         Row 1 (top)  :  A                    (1 up-pointing)
 *         Row 2 (mid)  :  B  C  D              (up, down, up)
 *         Row 3 (bot)  :  E  F  G  H  I        (up, down, up, down, up)
 *
 * The two triangles ALREADY PAINTED in the problem figure are B and D — the
 * symmetric pair of upward-pointing triangles in the second row, mirrored
 * across the vertical axis of the large triangle.
 *
 * Co-exported constants let the explainer / animator reuse the same geometry:
 *   TRIANGLES_24G3   — array of 9 { label, up, pts } entries
 *   SHADED_LABELS    — ['B', 'D']  (the two given painted triangles)
 *   SubTriFigure     — primitive SVG component for explainers/animator
 *
 * Pure render — no Math.random, no Date, no useState/useEffect. SSR-safe.
 */

// ── colour tokens ────────────────────────────────────────────────────────────
const FILL_BG = '#FFFFFF'       // unshaded triangle fill
const FILL_SHADED = '#B6D98A'   // green fill (matches the scanned figure)
const STROKE_LINE = '#2B2118'   // dark outline
const STROKE_SHADED = '#5A8A2A' // darker green outline for shaded cells

// ── geometry ─────────────────────────────────────────────────────────────────
// viewBox: 240 × 220 with a 12 px margin on all sides.
const VW = 240
const VH = 220
const MARGIN = 12

// Large triangle vertices: apex (top-centre), base-left, base-right.
const apex: [number, number] = [VW / 2, MARGIN]
const baseL: [number, number] = [MARGIN, VH - MARGIN]
const baseR: [number, number] = [VW - MARGIN, VH - MARGIN]

/**
 * Returns the grid point at triangular-grid position (row, col) using the
 * standard barycentric formula for a 3×3 subdivision:
 *   P(row, col) = apex + (row/3)*(baseL - apex) + (col/3)*(baseR - baseL)
 */
function gridPt(row: number, col: number): [number, number] {
  return [
    apex[0] + (row / 3) * (baseL[0] - apex[0]) + (col / 3) * (baseR[0] - baseL[0]),
    apex[1] + (row / 3) * (baseL[1] - apex[1]) + (col / 3) * (baseR[1] - baseL[1]),
  ]
}

// All 10 grid points: G[row][col], row 0–3, col 0–row.
const G: [number, number][][] = Array.from({ length: 4 }, (_, r) =>
  Array.from({ length: r + 1 }, (___, c) => gridPt(r, c)),
)

// ── triangle entries ─────────────────────────────────────────────────────────

export interface TriEntry24G3 {
  label: string
  up: boolean // true = pointing up, false = pointing down (inverted)
  pts: [number, number][]
}

export const TRIANGLES_24G3: TriEntry24G3[] = [
  // Row 1 — 1 up-triangle
  { label: 'A', up: true,  pts: [G[0][0], G[1][0], G[1][1]] },
  // Row 2 — 2 up-triangles + 1 down
  { label: 'B', up: true,  pts: [G[1][0], G[2][0], G[2][1]] },
  { label: 'C', up: false, pts: [G[1][0], G[1][1], G[2][1]] }, // inverted
  { label: 'D', up: true,  pts: [G[1][1], G[2][1], G[2][2]] },
  // Row 3 — 3 up-triangles + 2 down
  { label: 'E', up: true,  pts: [G[2][0], G[3][0], G[3][1]] },
  { label: 'F', up: false, pts: [G[2][0], G[2][1], G[3][1]] }, // inverted
  { label: 'G', up: true,  pts: [G[2][1], G[3][1], G[3][2]] },
  { label: 'H', up: false, pts: [G[2][1], G[2][2], G[3][2]] }, // inverted
  { label: 'I', up: true,  pts: [G[2][2], G[3][2], G[3][3]] },
]

/** The two triangles already shaded in the problem figure. */
export const SHADED_LABELS: string[] = ['B', 'D']

function ptsStr(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

// ── primitive figure ─────────────────────────────────────────────────────────

export interface SubTriFigureProps {
  /** Additional triangle labels to shade beyond the default B and D. */
  extraShaded?: string[]
  /** When true, render A–I labels inside each triangle (for explainers). */
  showLabels?: boolean
}

/**
 * Pure SVG of the 9-triangle figure. Shades B and D by default; pass
 * `extraShaded` to highlight additional triangles in the animator.
 * The parent component supplies the aria-label wrapper.
 */
export function SubTriFigure({ extraShaded = [], showLabels = false }: SubTriFigureProps) {
  const shadedSet = new Set([...SHADED_LABELS, ...extraShaded])

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 260 }}
      aria-hidden="true"
    >
      {TRIANGLES_24G3.map((tri) => {
        const shaded = shadedSet.has(tri.label)
        return (
          <polygon
            key={tri.label}
            points={ptsStr(tri.pts)}
            fill={shaded ? FILL_SHADED : FILL_BG}
            stroke={shaded ? STROKE_SHADED : STROKE_LINE}
            strokeWidth={shaded ? 2.2 : 1.8}
            strokeLinejoin="round"
          />
        )
      })}
      {/* outer border — redrawn thick so it dominates the inner grid lines */}
      <polygon
        points={ptsStr([apex, baseL, baseR])}
        fill="none"
        stroke={STROKE_LINE}
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      {showLabels &&
        TRIANGLES_24G3.map((tri) => {
          const cx = tri.pts.reduce((s, p) => s + p[0], 0) / 3
          const cy = tri.pts.reduce((s, p) => s + p[1], 0) / 3
          return (
            <text
              key={`lbl-${tri.label}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              fill={STROKE_LINE}
            >
              {tri.label}
            </text>
          )
        })}
    </svg>
  )
}

// ── default export ───────────────────────────────────────────────────────────

export default function SubTriangle24G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Segitiga besar dibagi menjadi 9 segitiga kecil (3 baris). Dua segitiga berwarna hijau di baris kedua (posisi B dan D) sudah dicat membentuk simetri garis. Tentukan berapa cara mengecet 2 segitiga lagi agar tetap simetri."
    >
      <SubTriFigure />
    </div>
  )
}
