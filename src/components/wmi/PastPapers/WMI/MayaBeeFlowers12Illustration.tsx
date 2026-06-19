// IKMC-19-PE-Q12 — "Maya Bee was gathering pollen from all of the flowers that
// lie inside the rectangle, but are outside the triangle."
//
// PROBLEM ONLY — shows the student exactly what is in the printed figure:
//   • a green rectangle (upright, portrait orientation)
//   • a blue triangle (wide, chevron-pointing-up, base at the bottom of the SVG)
//     whose apex reaches above the midpoint of the rectangle
//   • orange flowers scattered in regions: inside rectangle only, inside
//     triangle only, inside both (rect ∩ triangle), and outside both
//
// Layout reproduced faithfully from 2019.imgs/017.jpg:
//   • Rectangle (green border, ~40 % of SVG width, centred horizontally)
//   • Triangle (blue border, full-width base, apex above the rectangle midpoint,
//     interior overlaps the lower half of the rectangle)
//   • 20 total flowers placed in four regions:
//       – 9  orange (inside rect, outside triangle)  ← answer = A
//       – 4  orange/darker (inside rect AND inside triangle)
//       – 2  orange (inside triangle, outside rect)
//       – 5  orange (outside both shapes — scattered around the periphery)
//
// Does NOT reveal the count or colour-code which flowers qualify.
// Pure render — no Math.random, no Date. SSR-safe and deterministic.

// ── shared layout constants (re-exported so the explainer can overlay) ────────

/** SVG viewport width. */
export const SVG_W = 320

/** SVG viewport height. */
export const SVG_H = 260

/** Rectangle bounds (green border). */
export const RECT = { x: 110, y: 30, w: 100, h: 190 } as const

/** Triangle vertices: apex top-centre, base-left, base-right. */
export const TRI = {
  ax: SVG_W / 2,  // apex x
  ay: 80,          // apex y (inside the rectangle)
  bl: 10,          // base-left x
  br: SVG_W - 10, // base-right x
  by: SVG_H - 10, // base y
} as const

/** Colour palette (echoing qupu tokens). */
export const COLOR = {
  RECT_STROKE: '#16A34A',   // green-600
  RECT_FILL: 'none',
  TRI_STROKE: '#2563EB',    // blue-600
  TRI_FILL: 'none',
  FLOWER_ORANGE: '#F97316', // orange-500
  FLOWER_CENTER: '#FDE68A', // amber-100
  FLOWER_DARK_CENTER: '#F59E0B', // amber-400
  BG: '#FAFAFA',
} as const

// ── Flower positions ──────────────────────────────────────────────────────────
//
// Each position was placed to match the original figure.
// Region coding (for documentation only — not rendered):
//   'A' = inside rectangle, outside triangle → these 9 count
//   'T' = inside triangle, outside rectangle → do NOT count
//   'B' = inside both rectangle and triangle → do NOT count
//   'O' = outside both → do NOT count

export const FLOWERS: ReadonlyArray<{
  cx: number
  cy: number
  region: 'A' | 'T' | 'B' | 'O'
}> = [
  // ── Inside rect, OUTSIDE triangle (9 flowers — the answer) ──
  // y < apex(80): above the triangle entirely → definitely outside tri
  { cx: 128, cy: 45,  region: 'A' },
  { cx: 155, cy: 38,  region: 'A' },
  { cx: 185, cy: 48,  region: 'A' },
  { cx: 122, cy: 75,  region: 'A' },
  { cx: 195, cy: 62,  region: 'A' },
  // y ≥ 80: must be horizontally outside the triangle's narrowing opening
  { cx: 140, cy: 95,  region: 'A' }, // tri left edge at y=95 ≈ 146.8; x=140 is left of it ✓
  { cx: 130, cy: 102, region: 'A' }, // tri left edge at y=102 ≈ 140.6; x=130 is left ✓
  { cx: 200, cy: 88,  region: 'A' }, // tri right edge at y=88 ≈ 167.1; x=200 is right ✓
  { cx: 205, cy: 105, region: 'A' }, // tri right edge at y=105 ≈ 182.4; x=205 is right ✓

  // ── Inside BOTH rect and triangle (4 flowers — do NOT count) ──
  { cx: 145, cy: 155, region: 'B' },
  { cx: 175, cy: 160, region: 'B' },
  { cx: 135, cy: 195, region: 'B' },
  { cx: 185, cy: 190, region: 'B' },

  // ── Inside triangle, OUTSIDE rect (2 flowers) ──
  // tri at y=185: x ≈ 71.8–248.2; rect x: 110–210; so x=85 and x=248 are in tri, outside rect
  { cx: 85,  cy: 185, region: 'T' },
  { cx: 248, cy: 180, region: 'T' },

  // ── Outside BOTH shapes (5 flowers — scattered around) ──
  { cx: 28,  cy: 80,  region: 'O' },
  { cx: 48,  cy: 48,  region: 'O' },
  { cx: 290, cy: 55,  region: 'O' },
  { cx: 278, cy: 100, region: 'O' },
  { cx: 32,  cy: 130, region: 'O' },
] as const

// ── Flower glyph ──────────────────────────────────────────────────────────────

/**
 * Simple 6-petal flower glyph centred at (cx, cy).
 * `r` is the outer petal radius; `cr` is the centre dot radius.
 * Co-exported so the explainer can reuse the same glyph and overlay highlights.
 */
export function FlowerGlyph({
  cx,
  cy,
  r = 10,
  petalFill = COLOR.FLOWER_ORANGE,
  centerFill = COLOR.FLOWER_CENTER,
}: {
  cx: number
  cy: number
  r?: number
  petalFill?: string
  centerFill?: string
}) {
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 6
        const px = cx + Math.cos(angle) * r * 0.65
        const py = cy + Math.sin(angle) * r * 0.65
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={r * 0.48}
            ry={r * 0.28}
            fill={petalFill}
            transform={`rotate(${(angle * 180) / Math.PI + 90} ${px} ${py})`}
          />
        )
      })}
      {/* centre dot */}
      <circle cx={cx} cy={cy} r={r * 0.28} fill={centerFill} />
    </g>
  )
}

// ── Triangle path helper ──────────────────────────────────────────────────────

/** Returns the SVG path `d` string for the triangle. */
export function triPath(): string {
  const { ax, ay, bl, br, by } = TRI
  return `M ${ax} ${ay} L ${br} ${by} L ${bl} ${by} Z`
}

// ── Default export — static illustration ──────────────────────────────────────

/**
 * MayaBeeFlowers12Illustration
 *
 * Static, problem-only SVG for IKMC-19-PE-Q12.
 * Shows the green rectangle, the blue triangle, and the scattered flowers
 * faithfully reconstructed from 2019.imgs/017.jpg.
 * Does NOT colour-code or count the qualifying flowers.
 */
export default function MayaBeeFlowers12Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Persegi panjang hijau dengan segitiga biru di dalamnya. ' +
        'Bunga-bunga oranye tersebar di berbagai daerah. ' +
        'Hitung bunga yang ada di dalam persegi panjang tetapi di luar segitiga.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* flowers (drawn first, behind the borders) */}
        {FLOWERS.map((f, i) => (
          <FlowerGlyph key={i} cx={f.cx} cy={f.cy} r={10} />
        ))}

        {/* triangle border (blue, drawn over flowers) */}
        <path
          d={triPath()}
          fill="none"
          stroke={COLOR.TRI_STROKE}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* rectangle border (green, drawn last = on top) */}
        <rect
          x={RECT.x}
          y={RECT.y}
          width={RECT.w}
          height={RECT.h}
          fill="none"
          stroke={COLOR.RECT_STROKE}
          strokeWidth={2.5}
        />
      </svg>
    </div>
  )
}
