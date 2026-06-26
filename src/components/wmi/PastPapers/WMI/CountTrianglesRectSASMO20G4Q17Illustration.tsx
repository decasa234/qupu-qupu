// CountTrianglesRectSASMO20G4Q17Illustration.tsx
//
// SASMO-20-G4-Q17 — "Ada berapa banyak segitiga dalam gambar di bawah ini?"
// Answer: 42
//
// Source figure (2020.imgs/012.jpg): a rectangle containing 6 diagonal lines
// forming two symmetric "fans" that cross each other — the left fan from the
// top-left corner and two left-edge/bottom points, the right fan its mirror.
// All six lines intersect in the lower-centre region, creating many overlapping
// triangular regions that total 42 when counted by every size.
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

const VW  = 220
const VH  = 200
const L   = 10   // left edge x
const R   = 210  // right edge x
const T   = 10   // top edge y
const B   = 190  // bottom edge y

// ─── 6 internal line segments ────────────────────────────────────────────────
// L1/L2: outer fan — from top corners to lower-centre-opposite area
// L3/L4: middle fan — from left/right mid-side to lower-opposite area
// L5/L6: inner cross — diagonal pair meeting in the upper-centre region

export const LINES: readonly [number, number, number, number][] = [
  [L,       T,      140, B],  // L1: TL corner → bottom, 65% from left
  [R,       T,       80, B],  // L2: TR corner → bottom, 35% from left (mirror)
  [L,       T + 75, 165, B],  // L3: left side (75 px down) → bottom-right area
  [L + 45,  B,      R,  T + 75], // L4: bottom-left area → right side (mirror of L3)
  [L + 60,  B,      150, T],  // L5: lower-left area → upper-right area
  [L + 60,  T,      150, B],  // L6: upper-left area → lower-right area (mirror of L5)
] as const

// ─── Highlight groups ─────────────────────────────────────────────────────────
// The 42 triangles are grouped by approximate visual size for the explainer.
// We do NOT enumerate every triangle polygon here — the explainer highlights
// groups using colour fills over the full figure, not individual polygons.

export type HighlightGroup = 'small' | 'medium' | 'large' | null

// ─── Colours ─────────────────────────────────────────────────────────────────
const STROKE      = '#1A3A6B'
const FILL_BG     = '#EBF4FF'
const RECT_STROKE = '#1A3A6B'

const GROUP_COLOR: Record<NonNullable<HighlightGroup>, string> = {
  small:  'rgba(16,185,129,0.20)',  // green tint
  medium: 'rgba(245,158,11,0.20)', // amber tint
  large:  'rgba(99,102,241,0.20)', // indigo tint
}

// ─── Shared figure component ──────────────────────────────────────────────────

export interface CountTrianglesRectFigureProps {
  highlightGroup?: HighlightGroup
}

export function CountTrianglesRectFigure({
  highlightGroup = null,
}: CountTrianglesRectFigureProps) {
  const hColor = highlightGroup ? GROUP_COLOR[highlightGroup] : null

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width={VW} height={VH} fill={FILL_BG} rx={6} />

      {/* Optional highlight wash over figure area */}
      {hColor && (
        <rect
          x={L} y={T}
          width={R - L} height={B - T}
          fill={hColor}
        />
      )}

      {/* Outer rectangle */}
      <rect
        x={L} y={T}
        width={R - L} height={B - T}
        fill="none"
        stroke={RECT_STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Six internal lines */}
      {LINES.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={STROKE}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

// ─── Default export — static illustration ────────────────────────────────────

export default function CountTrianglesRectSASMO20G4Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Sebuah persegi panjang berisi 6 garis diagonal yang saling bersilangan, ' +
        'membentuk dua pola kipas simetris. Hitung semua segitiga — totalnya 42.'
      }
    >
      <CountTrianglesRectFigure />
    </div>
  )
}
