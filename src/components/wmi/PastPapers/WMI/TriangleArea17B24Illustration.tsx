// SEAMO-17-B-Q24 — Triangle area ratios.
//
// In triangle ABC: D is on AB with AD = (1/2)DB  →  AD:DB = 1:2, D at 1/3 from A.
//                  E is on CB with CE = (1/4)CB   →  E at 1/4 from C.
// Shaded region CDE has area 9 cm².  Find area of ABC.
//
// Solution chain:
//   Area(CDB)/Area(ABC) = DB/AB = 2/3   (same height from C)
//   Area(CDE)/Area(CDB) = CE/CB = 1/4   (same height from D)
//   Area(CDE)/Area(ABC) = (2/3)×(1/4) = 1/6
//   Area(ABC) = 9 × 6 = 54 cm²
//
// The static figure shows ONLY the problem (shaded CDE, labels A,B,C,D,E).
// It does NOT reveal 54 or any intermediate area.
//
// Co-exports the `TriangleArea17B24Figure` primitive for the explainer.
//
// No existing primitive matches a labelled-triangle-with-ratio-points figure.
// Faithful reconstruction of 2017.imgs/024.jpg: C top-centre, A bottom-left,
// B bottom-right, triangle is tall and slightly leans right, CDE shaded grey.
// SSR-safe: pure render, no hooks, no Math.random, no Date.

// ── colours ───────────────────────────────────────────────────────────────────
const INK        = '#1F2937'
const STROKE     = '#374151'
const SHADE_FILL = '#CBD5E1'   // light grey-blue for the shaded CDE region
const SHADE_STROKE = '#6B7280'
const LABEL_COL  = '#111827'
const HIGHLIGHT  = '#2563EB'   // blue for animated highlights

// ── coordinate system ─────────────────────────────────────────────────────────
// Match the source crop: tall triangle, C near top-centre, A bottom-left,
// B bottom-right (wider than tall looks), D on AB at 1/3 from A, E on CB at 1/4 from C.
const W = 260
const H = 220
const PAD = 22

// Triangle vertices
const A = { x: PAD,           y: H - PAD }        // bottom-left
const B = { x: W - PAD,       y: H - PAD }        // bottom-right
const C = { x: PAD + 80,      y: PAD + 4 }        // top, slightly left of centre

// D on AB: AD:DB = 1:2  →  D = A + (1/3)(B−A)
const D = {
  x: A.x + (1 / 3) * (B.x - A.x),
  y: A.y + (1 / 3) * (B.y - A.y),
}

// E on CB: CE:CB = 1/4  →  E = C + (1/4)(B−C)
const E = {
  x: C.x + (1 / 4) * (B.x - C.x),
  y: C.y + (1 / 4) * (B.y - C.y),
}

function fmt(n: number) { return n.toFixed(1) }

function pts(arr: {x:number; y:number}[]): string {
  return arr.map(p => `${fmt(p.x)},${fmt(p.y)}`).join(' ')
}

// ── props ─────────────────────────────────────────────────────────────────────

export type HighlightRegion = 'none' | 'CDE' | 'CDB' | 'ABC'

export interface TriangleArea17B24FigureProps {
  /** Which region to highlight with a blue stroke for the explainer. */
  highlight?: HighlightRegion
  /** Reveal the area label inside a region. */
  areaLabel?: { region: HighlightRegion; text: string } | null
  /** Hide the shaded CDE fill (used after the ratio analysis). */
  unshade?: boolean
}

// ── shared primitive ─────────────────────────────────────────────────────────

/**
 * TriangleArea17B24Figure — shared primitive for illustration + explainer.
 *
 * Renders triangle ABC with points D (on AB, AD:DB=1:2) and E (on CB, CE:CB=1/4).
 * Region CDE is shaded grey by default.  The explainer controls `highlight`,
 * `areaLabel`, and `unshade` to animate the solution step-by-step.
 */
export function TriangleArea17B24Figure({
  highlight = 'none',
  areaLabel = null,
  unshade = false,
}: TriangleArea17B24FigureProps = {}) {

  // Which polygon to draw a highlighted stroke around
  const highlightPts: Record<string, {x:number;y:number}[]> = {
    CDE: [C, D, E],
    CDB: [C, D, B],
    ABC: [A, B, C],
  }

  // Centroid for the area label position
  function centroid(verts: {x:number;y:number}[]) {
    const sx = verts.reduce((s, p) => s + p.x, 0) / verts.length
    const sy = verts.reduce((s, p) => s + p.y, 0) / verts.length
    return { x: sx, y: sy }
  }

  const labelPos = areaLabel && areaLabel.region !== 'none'
    ? centroid(highlightPts[areaLabel.region] ?? [A, B, C])
    : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Main triangle ABC */}
      <polygon
        points={pts([A, B, C])}
        fill="white"
        stroke={STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Shaded CDE region */}
      {!unshade && (
        <polygon
          points={pts([C, D, E])}
          fill={SHADE_FILL}
          stroke={SHADE_STROKE}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      )}

      {/* Cevian from C to D (already part of boundary via the shaded region,
          but we draw it explicitly to make CD visible when unshaded) */}
      {unshade && (
        <line
          x1={fmt(C.x)} y1={fmt(C.y)}
          x2={fmt(D.x)} y2={fmt(D.y)}
          stroke={STROKE}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}

      {/* CE segment on side CB (always visible as boundary line) */}
      <line
        x1={fmt(C.x)} y1={fmt(C.y)}
        x2={fmt(E.x)} y2={fmt(E.y)}
        stroke={STROKE}
        strokeWidth={1.5}
      />

      {/* Highlight overlay */}
      {highlight !== 'none' && highlightPts[highlight] && (
        <polygon
          points={pts(highlightPts[highlight])}
          fill={HIGHLIGHT + '22'}
          stroke={HIGHLIGHT}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}

      {/* Area label inside highlighted region */}
      {areaLabel && labelPos && (
        <text
          x={fmt(labelPos.x)}
          y={fmt(labelPos.y)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={HIGHLIGHT}
        >
          {areaLabel.text}
        </text>
      )}

      {/* Vertex labels */}
      {/* C — top */}
      <text x={fmt(C.x - 10)} y={fmt(C.y - 6)} fontSize={14} fontWeight={700} fill={LABEL_COL} textAnchor="middle">C</text>
      {/* A — bottom-left */}
      <text x={fmt(A.x - 7)} y={fmt(A.y + 5)} fontSize={14} fontWeight={700} fill={LABEL_COL} textAnchor="end">A</text>
      {/* B — bottom-right */}
      <text x={fmt(B.x + 7)} y={fmt(B.y + 5)} fontSize={14} fontWeight={700} fill={LABEL_COL} textAnchor="start">B</text>
      {/* D — on AB */}
      <text x={fmt(D.x)} y={fmt(D.y + 13)} fontSize={13} fontWeight={700} fill={LABEL_COL} textAnchor="middle">D</text>
      {/* E — on CB, slightly right of the point */}
      <text x={fmt(E.x + 9)} y={fmt(E.y - 4)} fontSize={13} fontWeight={700} fill={LABEL_COL} textAnchor="start">E</text>

      {/* Small dot markers for D and E */}
      <circle cx={fmt(D.x)} cy={fmt(D.y)} r={3} fill={INK} />
      <circle cx={fmt(E.x)} cy={fmt(E.y)} r={3} fill={INK} />
    </svg>
  )
}

// ── default export: static stem illustration ──────────────────────────────────

/**
 * Default illustration: triangle ABC with D on AB (AD:DB=1:2) and E on CB
 * (CE:CB=1/4), region CDE shaded grey. Does NOT reveal the answer (54 cm²).
 * Faithful to SEAMO 2017 Paper B Q24 source crop.
 */
export default function TriangleArea17B24Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Segitiga ABC dengan titik D pada AB (AD = setengah DB) dan titik E pada CB ' +
        '(CE = seperempat CB). Daerah yang diarsir adalah segitiga CDE. ' +
        'Diketahui luas CDE = 9 cm², temukan luas ABC.'
      }
    >
      <TriangleArea17B24Figure />
    </div>
  )
}
