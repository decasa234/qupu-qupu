// SEAMO-16-B-Q10 — Three overlapping circles (Venn diagram) with labelled regions.
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-b/2016.md Q10,
// crop: 2016.imgs/012.jpg — circles A (violet, top-left), B (green, top-right),
// C (orange, bottom-centre) with pairwise and triple-overlap area labels.
//
// Region labels (cm²):
//   A∩B only (top centre) : 70
//   A∩B∩C (triple centre)  : 30
//   A∩C only (left-bottom) : 90
//   B∩C only (right-bottom): 80
//
// Stem illustration shows only the PROBLEM (circle areas + overlap labels).
// The explainer imports VennCircles to highlight regions beat-by-beat.
//
// Co-exported primitive: VennCircles
//   Props: highlightRegion? — which region to tint amber during animation.
//
// Default export: static illustration div. SSR-safe, no hooks.

// ── palette ───────────────────────────────────────────────────────────────────
const VIOLET = '#A78BFA'   // circle A fill — matches source image
const GREEN  = '#6EE7B7'   // circle B fill
const ORANGE = '#FCA972'   // circle C fill
const AMBER  = '#FDE68A'   // highlighted region tint
const INK    = '#1F2937'   // text / stroke
const STROKE = '#374151'   // circle outline

// ── geometry ──────────────────────────────────────────────────────────────────
// Three circles in a "two on top, one below" arrangement, matching the source.
// Radii chosen so pairwise overlaps are visible and centred labels fit.
const VB_W = 280
const VB_H = 230
const R    = 80   // circle radius

// Circle centres
const A = { cx: 90,  cy: 90  }   // top-left
const B = { cx: 190, cy: 90  }   // top-right
const C = { cx: 140, cy: 165 }   // bottom-centre

// Region label positions (placed inside each visible region)
const LABEL_A_ONLY    = { x: 48,  y: 78 }    // A only — left of A∩B overlap
const LABEL_B_ONLY    = { x: 232, y: 78 }    // B only — right of A∩B overlap
const LABEL_C_ONLY    = { x: 140, y: 208 }   // C only — below triple overlap
const LABEL_AB        = { x: 140, y: 65 }    // A∩B petal (above triple)
const LABEL_TRIPLE    = { x: 140, y: 115 }   // A∩B∩C centre
const LABEL_AC        = { x: 88,  y: 148 }   // A∩C petal (left of triple)
const LABEL_BC        = { x: 192, y: 148 }   // B∩C petal (right of triple)

// Circle letter label positions
const LETTER_A = { x: 42,  y: 58 }
const LETTER_B = { x: 238, y: 58 }
const LETTER_C = { x: 140, y: 220 }  // slightly below C centre

// ── highlight clip helpers ────────────────────────────────────────────────────
export type VennRegion = 'AB' | 'ABC' | 'AC' | 'BC' | null

// ── primitive ─────────────────────────────────────────────────────────────────

export interface VennCirclesProps {
  /**
   * Which pairwise/triple region to tint amber. Null (default) = no highlight.
   */
  highlightRegion?: VennRegion
}

/**
 * VennCircles — shared primitive for the three-circle Venn diagram.
 *
 * Renders the three overlapping circles with their overlap area labels.
 * Static by default. The explainer passes `highlightRegion` to tint a
 * region amber during beat animation.
 */
export function VennCircles({ highlightRegion = null }: VennCirclesProps = {}) {
  // We draw the circles with semi-transparent fills so overlaps show naturally.
  // The amber highlight is an extra tinted circle on top, clipped to overlap.
  // For SSR safety we avoid CSS clip-path and use SVG clipPath instead.

  // Region tint colours (applied as extra filled circles blended at 50% opacity
  // on the specific region label area — simpler and SSR-safe).
  const abTint  = highlightRegion === 'AB'  ? AMBER : 'none'
  const abcTint = highlightRegion === 'ABC' ? AMBER : 'none'
  const acTint  = highlightRegion === 'AC'  ? AMBER : 'none'
  const bcTint  = highlightRegion === 'BC'  ? AMBER : 'none'

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 280 }}
      aria-hidden="true"
    >
      {/* ── base circles with semi-transparent fill ──────────────────────── */}
      <circle cx={A.cx} cy={A.cy} r={R} fill={VIOLET} fillOpacity={0.42} stroke={STROKE} strokeWidth={2} />
      <circle cx={B.cx} cy={B.cy} r={R} fill={GREEN}  fillOpacity={0.42} stroke={STROKE} strokeWidth={2} />
      <circle cx={C.cx} cy={C.cy} r={R} fill={ORANGE} fillOpacity={0.42} stroke={STROKE} strokeWidth={2} />

      {/* ── highlight spots (small tinted discs at region centres) ──────── */}
      {abTint  !== 'none' && <circle cx={LABEL_AB.x}     cy={LABEL_AB.y}     r={22} fill={abTint}  opacity={0.70} />}
      {abcTint !== 'none' && <circle cx={LABEL_TRIPLE.x} cy={LABEL_TRIPLE.y} r={18} fill={abcTint} opacity={0.70} />}
      {acTint  !== 'none' && <circle cx={LABEL_AC.x}     cy={LABEL_AC.y}     r={22} fill={acTint}  opacity={0.70} />}
      {bcTint  !== 'none' && <circle cx={LABEL_BC.x}     cy={LABEL_BC.y}     r={22} fill={bcTint}  opacity={0.70} />}

      {/* ── region labels ────────────────────────────────────────────────── */}
      {/* A∩B only */}
      <text x={LABEL_AB.x} y={LABEL_AB.y} textAnchor="middle" dominantBaseline="central"
        fontSize={16} fontWeight={700} fill={INK}>70</text>
      {/* A∩B∩C */}
      <text x={LABEL_TRIPLE.x} y={LABEL_TRIPLE.y} textAnchor="middle" dominantBaseline="central"
        fontSize={16} fontWeight={700} fill={INK}>30</text>
      {/* A∩C only */}
      <text x={LABEL_AC.x} y={LABEL_AC.y} textAnchor="middle" dominantBaseline="central"
        fontSize={16} fontWeight={700} fill={INK}>90</text>
      {/* B∩C only */}
      <text x={LABEL_BC.x} y={LABEL_BC.y} textAnchor="middle" dominantBaseline="central"
        fontSize={16} fontWeight={700} fill={INK}>80</text>

      {/* ── circle letter labels ─────────────────────────────────────────── */}
      <text x={LETTER_A.x} y={LETTER_A.y} textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={800} fill={INK} fontFamily="sans-serif">A</text>
      <text x={LETTER_B.x} y={LETTER_B.y} textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={800} fill={INK} fontFamily="sans-serif">B</text>
      <text x={LETTER_C.x} y={LETTER_C.y} textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={800} fill={INK} fontFamily="sans-serif">C</text>
    </svg>
  )
}

// ── default export ─────────────────────────────────────────────────────────────

/**
 * VennCircles16B10Illustration
 *
 * Static, problem-only figure for SEAMO-16-B-Q10.
 * Shows: circles A (380 cm²), B (400 cm²), C (420 cm²) with labelled
 * overlap regions — no solution highlighting.
 */
export default function VennCircles16B10Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Diagram Venn tiga lingkaran yang saling bertindih. ' +
        'Lingkaran A (ungu, kiri atas) luasnya 380 cm², ' +
        'lingkaran B (hijau, kanan atas) luasnya 400 cm², ' +
        'lingkaran C (oranye, bawah) luasnya 420 cm². ' +
        'Daerah tumpang tindih A∩B = 70 cm², A∩B∩C = 30 cm², ' +
        'A∩C = 90 cm², B∩C = 80 cm².'
      }
    >
      <VennCircles />
    </div>
  )
}
