// SEAMOX-23-B-Q9 — Equilateral triangle inscribed in circle, circle inscribed in bigger equilateral triangle.
//
// SOURCE FIGURE (docs/reference/ocr-res/seamo-x/contest/paper-b/2023.imgs/002.jpg):
// Big equilateral triangle (pointing up) → circle inscribed inside it (touching all 3 sides)
// → small equilateral triangle inscribed in the circle (pointing up, vertices on circle).
// All figures in black outline on white background; no labels in the problem figure.
//
// ANSWER DERIVATION (anti-drift — bound to seed breakdown.quantities):
//   Small side a → circumradius R = a / √3 (= circle radius)
//   Circle (radius R) is the inscribed circle of the big triangle; inradius of equilateral
//   triangle with side A = A / (2√3), so A / (2√3) = a / √3 → A = 2a.
//   Area ratio = a² : (2a)² = 1 : 4 → m = 1, n = 4, m + n = 5.
//
// Co-exports TriInCirclePrimitive (shared with the explainer).
// SSR-safe: no window / document / random / Date. Pure render.

const INK = '#374151'
const BG = '#FFFFFF'
const LABEL_SMALL = '#1D4ED8'  // blue — small triangle side label 'a'
const LABEL_BIG = '#B45309'    // amber — big triangle side label '2a'
const LABEL_R = '#6B7280'      // gray — radius label 'R'

// ── Geometry (computed once at module level — SSR safe) ──────────────────────

const S3 = Math.sqrt(3)

const CX = 100
const CY = 115            // vertical centre chosen to balance 10 px top + 44 px bottom margin
const VIEW_W = 200
const VIEW_H = 200

const BIG_A = 140                     // big triangle side (px)
const BIG_R = BIG_A / S3             // circumradius ≈ 80.83 px
const BIG_r = BIG_A / (2 * S3)      // inradius ≈ 40.41 px = circle radius

// Big triangle vertices (pointing up, standard orientation):
//   apex at angle 90°, BL at 210°, BR at 330°.
const BIG_APEX = { x: CX,            y: CY - BIG_R }        // (100, 34.2)
const BIG_BL   = { x: CX - BIG_A / 2, y: CY + BIG_r }       // (30, 155.4)
const BIG_BR   = { x: CX + BIG_A / 2, y: CY + BIG_r }       // (170, 155.4)

// Circle: radius = inradius of big triangle = circumradius of small triangle.
const CIRCLE_R = BIG_r              // ≈ 40.41

// Small equilateral triangle inscribed in the circle (same upward orientation):
//   circumradius = CIRCLE_R; side = CIRCLE_R * √3 ≈ 70 = BIG_A / 2.
const SM_A  = CIRCLE_R * S3         // ≈ 69.99 (exactly BIG_A / 2)
const SM_r  = CIRCLE_R / 2          // inradius of small triangle ≈ 20.21

const SM_APEX = { x: CX,           y: CY - CIRCLE_R }       // (100, 74.6)
const SM_BL   = { x: CX - SM_A / 2, y: CY + SM_r }          // (65.0, 135.2)
const SM_BR   = { x: CX + SM_A / 2, y: CY + SM_r }          // (135.0, 135.2)

function pts(...vs: { x: number; y: number }[]) {
  return vs.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ')
}

// ── Shared primitive ─────────────────────────────────────────────────────────

export interface TriInCircleProps {
  /** Show 'a', '2a' and 'R' annotations (used by the explainer in later beats). */
  showLabels?: boolean
  /** Fill the small triangle with a light blue tint. */
  highlightSmall?: boolean
  /** Fill the big triangle region (outside circle) with a light amber tint. */
  highlightBig?: boolean
}

/**
 * Big equilateral Δ → inscribed circle → inscribed small equilateral Δ.
 * Emits a self-contained `<svg>`. Reused by both the illustration (static)
 * and the explainer (animated labels / highlights).
 */
export function TriInCirclePrimitive({
  showLabels = false,
  highlightSmall = false,
  highlightBig = false,
}: TriInCircleProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill={BG} />

      {/* Big equilateral triangle */}
      <polygon
        points={pts(BIG_APEX, BIG_BL, BIG_BR)}
        fill={highlightBig ? '#FEF3C7' : BG}
        stroke={INK}
        strokeWidth={2.2}
      />

      {/* Inscribed circle */}
      <circle
        cx={CX}
        cy={CY}
        r={CIRCLE_R}
        fill={BG}
        stroke={INK}
        strokeWidth={2.2}
      />

      {/* Small equilateral triangle inscribed in the circle */}
      <polygon
        points={pts(SM_APEX, SM_BL, SM_BR)}
        fill={highlightSmall ? '#DBEAFE' : BG}
        stroke={INK}
        strokeWidth={2.2}
      />

      {showLabels && (
        <>
          {/* Dashed radius line from circle centre to apex of small triangle */}
          <line
            x1={CX.toFixed(1)} y1={CY.toFixed(1)}
            x2={SM_APEX.x.toFixed(1)} y2={SM_APEX.y.toFixed(1)}
            stroke={LABEL_R}
            strokeWidth={1.4}
            strokeDasharray="3 2"
          />
          {/* 'R' label at midpoint of radius line */}
          <text
            x={(CX + 5).toFixed(1)}
            y={((CY + SM_APEX.y) / 2 + 1).toFixed(1)}
            textAnchor="start"
            fontSize={11}
            fontWeight="700"
            fontFamily="sans-serif"
            fill={LABEL_R}
          >
            R
          </text>

          {/* 'a' label below small triangle base */}
          <text
            x={CX.toFixed(1)}
            y={(SM_BL.y + 13).toFixed(1)}
            textAnchor="middle"
            fontSize={12}
            fontWeight="800"
            fontFamily="sans-serif"
            fill={LABEL_SMALL}
          >
            a
          </text>

          {/* '2a' label below big triangle base */}
          <text
            x={CX.toFixed(1)}
            y={(BIG_BL.y + 14).toFixed(1)}
            textAnchor="middle"
            fontSize={12}
            fontWeight="800"
            fontFamily="sans-serif"
            fill={LABEL_BIG}
          >
            2a
          </text>
        </>
      )}
    </svg>
  )
}

// ── Default export — static problem figure ───────────────────────────────────

/** Static problem figure: no labels, no highlights. */
export default function TriInCircleX23B9Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Segitiga sama sisi kecil terdapat di dalam sebuah lingkaran. ' +
        'Lingkaran tersebut terdapat di dalam segitiga sama sisi yang lebih besar.'
      }
    >
      <TriInCirclePrimitive />
    </div>
  )
}
