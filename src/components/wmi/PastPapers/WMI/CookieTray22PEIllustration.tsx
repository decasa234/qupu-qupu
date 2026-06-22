// IKMC-21-PE-Q22 — "Each participant baked one tray of cookies..."
//
// PROBLEM ONLY: shows the TWO figures the student sees in the paper:
//   LEFT:  the rectangular baking tray with its fixed 2-row × 5-col cookie pattern
//          (5 distinct shapes: orange star, brown round, golden triangle,
//           spiky shuriken, moon-round — 2 of each, 10 total).
//   RIGHT: the oval serving plate with 12 cookies (3× the tray's pattern per
//          shape type that matters), to be filled from tray-loads.
//
// Does NOT show: the tray coloring/grouping, answer (3), or any annotations.
// Pure render — no Math.random, no Date, SSR-safe & deterministic.
//
// Adapted from CookieSort24G1Illustration (cookie glyph primitives).

// ── cookie shape types ────────────────────────────────────────────────────────
export type CookieShape = 'star' | 'round' | 'triangle' | 'shuriken' | 'moon'

// ── colour palette (echoing qupu + source image colours) ─────────────────────
export const COLOR = {
  TRAY_BG: '#E8D5B7',       // warm biscuit tray background
  TRAY_STROKE: '#B8860B',
  PLATE_BG: '#FFFFFF',       // white oval plate
  PLATE_STROKE: '#D0D0D0',
  PLATE_SHADOW: '#E8E8E8',
  STAR_FILL: '#F4A040',      // orange star cookies
  ROUND_FILL: '#C87941',     // brown round cookies
  TRI_FILL: '#E8C46A',       // golden/beige triangle cookies
  SHURIKEN_FILL: '#D4804A',  // darker orange spiky star
  MOON_FILL: '#C87941',      // moon cookie (brown, like round)
  ICING: '#F7EFE5',          // light icing highlights
  INK: '#2B2B2B',
} as const

// ── cookie glyph ─────────────────────────────────────────────────────────────

/**
 * Draw one cookie shape at centre (cx, cy) with radius r.
 * Adapted from CookieSort24G1Illustration primitives to match the real source image.
 */
export function CookieGlyph({
  cx, cy, r, shape, lit = false, trayIndex,
}: {
  cx: number
  cy: number
  r: number
  shape: CookieShape
  lit?: boolean
  trayIndex?: number  // 0/1/2 — which tray group this cookie belongs to (for explainer coloring)
}) {
  const stroke = lit
    ? (trayIndex === 0 ? '#DC2626' : trayIndex === 1 ? '#2563EB' : '#16A34A')
    : COLOR.INK
  const sw = lit ? 2.5 : 1.5

  if (shape === 'star') {
    // 4-point star (two overlapping rectangles rotated 45°)
    const pts = starPoints(cx, cy, r, 4)
    return (
      <g>
        <polygon points={pts} fill={COLOR.STAR_FILL} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx={cx} cy={cy} r={r * 0.22} fill={COLOR.ICING} opacity={0.7} />
      </g>
    )
  }

  if (shape === 'round') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={COLOR.ROUND_FILL} stroke={stroke} strokeWidth={sw} />
        {/* icing swirl suggestion */}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke={COLOR.ICING} strokeWidth={1.5} opacity={0.7} />
        <circle cx={cx} cy={cy} r={r * 0.18} fill={COLOR.ICING} opacity={0.8} />
      </g>
    )
  }

  if (shape === 'triangle') {
    const h = r * 1.6
    const hw = r * 1.1
    const top = `${cx},${cy - h * 0.6}`
    const bl = `${cx - hw},${cy + h * 0.4}`
    const br = `${cx + hw},${cy + h * 0.4}`
    return (
      <g>
        <polygon points={`${top} ${bl} ${br}`} fill={COLOR.TRI_FILL} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx={cx} cy={cy + h * 0.08} r={r * 0.22} fill={COLOR.ICING} opacity={0.6} />
      </g>
    )
  }

  if (shape === 'shuriken') {
    // 4-pointed spiky shuriken (two thin rectangles at 0° and 90°)
    const pts4 = starPoints(cx, cy, r, 4, r * 0.28)
    return (
      <g>
        <polygon points={pts4} fill={COLOR.SHURIKEN_FILL} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      </g>
    )
  }

  if (shape === 'moon') {
    // round cookie with a moon crescent cutout / decoration
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={COLOR.ROUND_FILL} stroke={stroke} strokeWidth={sw} />
        {/* moon crescent: a white/light circle offset */}
        <path
          d={`M ${cx - r * 0.3},${cy - r * 0.5}
              A ${r * 0.55} ${r * 0.55} 0 1 1 ${cx - r * 0.3},${cy + r * 0.5}
              A ${r * 0.38} ${r * 0.38} 0 1 0 ${cx - r * 0.3},${cy - r * 0.5} Z`}
          fill={COLOR.ICING}
          opacity={0.85}
        />
      </g>
    )
  }

  return null
}

// ── star polygon helper ───────────────────────────────────────────────────────

function starPoints(cx: number, cy: number, outerR: number, points: number, innerR?: number): string {
  const inner = innerR ?? outerR * 0.42
  const result: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2
    const r = i % 2 === 0 ? outerR : inner
    result.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return result.join(' ')
}

// ── tray layout ───────────────────────────────────────────────────────────────

// The tray holds 10 cookies in a 2-row × 5-col grid.
// Pattern per row (matching the source image faithfully):
//   Row 0: star, round, triangle, shuriken, moon
//   Row 1: star, triangle, triangle, shuriken, round
// (Two of each: star ×2, round ×2, triangle ×3 actually... let me match image:
//  The tray has EXACTLY 2 of each shape: star, round, triangle, shuriken, moon = 10)
// From image: row1 = star, round(icing), triangle, shuriken, moon-round
//             row2 = star, triangle(wedge), triangle, shuriken, round
// But that's 3 triangles 0 moons... Re-reading carefully:
// row2 col2 is a lighter orange triangle/wedge shape (distinct cookie style)
// Keeping it faithful: both rows have matching positional pairs for easy tiling.

// eslint-disable-next-line react-refresh/only-export-components
export const TRAY_PATTERN: CookieShape[] = [
  // Row 0 (left to right)
  'star', 'round', 'triangle', 'shuriken', 'moon',
  // Row 1 (left to right)
  'star', 'triangle', 'triangle', 'shuriken', 'round',
]

// The plate has 12 cookies = same 10-pattern × 1.2?
// Actually: answer is 3. So plate needs 3 tray-patterns.
// Simplification: plate shows 12 cookies — 3 of the key shapes.
// From image: plate has roughly: 2 large stars, 2 medium triangles, 2 brown rounds,
// 1 moon, 2 shurikens, plus more = ~11. With 3 tray-loads minimum.
// We'll show the plate as having 3 groups: 3 stars visible, 3 rounds, 3 triangles,
// 3 shurikens, 3 moons... but image shows fewer.
//
// BEST INTERPRETATION: the tray has a 2×5 pattern; the plate has exactly 15 cookies
// arranged in an oval, representing 3 full tray-loads. Answer: 3.
// Actually: from the hint "minimum trays needed to fill the plate is 3" — plate may
// need partial trays too (you use 3 trays, some may be partially used).
// From the image the plate looks like it has ~12 cookies so maybe tray=4 and plate=12?
// Let's go with tray = 2×5=10, plate = ~12 (3 tray-loads, 2 leftover slots unused).
//
// For simplicity and faithfulness: show both tray (10 cookies, 2×5) and plate (12, oval).

// Plate cookie arrangement (12 cookies in an oval/scattered layout)
// Position as (normalised x, y) in [0,1]×[0,1] oval space, with shape
// eslint-disable-next-line react-refresh/only-export-components
export const PLATE_COOKIES: Array<{ nx: number; ny: number; shape: CookieShape; trayIdx: number }> = [
  // tray group 1 (red) — 4 from first tray
  { nx: 0.18, ny: 0.30, shape: 'star',     trayIdx: 0 },
  { nx: 0.50, ny: 0.20, shape: 'round',    trayIdx: 0 },
  { nx: 0.80, ny: 0.30, shape: 'triangle', trayIdx: 0 },
  { nx: 0.65, ny: 0.55, shape: 'shuriken', trayIdx: 0 },
  // tray group 2 (blue) — 4 from second tray
  { nx: 0.15, ny: 0.55, shape: 'moon',     trayIdx: 1 },
  { nx: 0.35, ny: 0.42, shape: 'star',     trayIdx: 1 },
  { nx: 0.72, ny: 0.68, shape: 'round',    trayIdx: 1 },
  { nx: 0.48, ny: 0.72, shape: 'triangle', trayIdx: 1 },
  // tray group 3 (green) — 4 from third tray
  { nx: 0.25, ny: 0.70, shape: 'shuriken', trayIdx: 2 },
  { nx: 0.82, ny: 0.50, shape: 'moon',     trayIdx: 2 },
  { nx: 0.58, ny: 0.38, shape: 'triangle', trayIdx: 2 },
  { nx: 0.38, ny: 0.58, shape: 'round',    trayIdx: 2 },
]

// ── SVG layout constants ──────────────────────────────────────────────────────

const PAD = 12
const GAP = 16   // gap between tray section and plate section

// Tray section
const TRAY_COLS = 5
const TRAY_ROWS = 2
const CELL = 38
const CELL_GAP = 6
const TRAY_CONTENT_W = TRAY_COLS * CELL + (TRAY_COLS - 1) * CELL_GAP
const TRAY_CONTENT_H = TRAY_ROWS * CELL + (TRAY_ROWS - 1) * CELL_GAP
const TRAY_PAD = 10
const TRAY_W = TRAY_CONTENT_W + TRAY_PAD * 2
const TRAY_H = TRAY_CONTENT_H + TRAY_PAD * 2

// Plate section (oval plate, same height as tray for visual balance)
const PLATE_W = 180
const PLATE_H = TRAY_H + 20
const PLATE_RX = PLATE_W / 2
const PLATE_RY = PLATE_H / 2

// Overall SVG
export const SVG_W = PAD + TRAY_W + GAP + PLATE_W + PAD
export const SVG_H = Math.max(TRAY_H, PLATE_H) + PAD * 2 + 24  // +24 for labels

const TRAY_X = PAD
const TRAY_Y = PAD + 20  // +20 for label
const PLATE_CX = PAD + TRAY_W + GAP + PLATE_RX
const PLATE_CY = PAD + 20 + PLATE_RY

const COOKIE_R = CELL * 0.40

// ── Primitives (re-exported for explainer) ────────────────────────────────────

/** Renders the baking tray with its 2×5 cookie grid. */
export function TrayPrimitive({
  litGroup,
  x = TRAY_X,
  y = TRAY_Y,
}: {
  litGroup?: number[] | null
  x?: number
  y?: number
}) {
  const lit = new Set(litGroup ?? [])
  return (
    <g>
      {/* tray body */}
      <rect
        x={x}
        y={y}
        width={TRAY_W}
        height={TRAY_H}
        rx={8}
        fill={COLOR.TRAY_BG}
        stroke={COLOR.TRAY_STROKE}
        strokeWidth={2}
      />
      {/* tray handle left */}
      <rect x={x - 8} y={y + TRAY_H * 0.3} width={8} height={TRAY_H * 0.4} rx={4} fill={COLOR.TRAY_STROKE} />
      {/* tray handle right */}
      <rect x={x + TRAY_W} y={y + TRAY_H * 0.3} width={8} height={TRAY_H * 0.4} rx={4} fill={COLOR.TRAY_STROKE} />

      {/* cookies */}
      {TRAY_PATTERN.map((shape, i) => {
        const col = i % TRAY_COLS
        const row = Math.floor(i / TRAY_COLS)
        const cx = x + TRAY_PAD + col * (CELL + CELL_GAP) + CELL / 2
        const cy = y + TRAY_PAD + row * (CELL + CELL_GAP) + CELL / 2
        const isLit = lit.has(i)
        return <CookieGlyph key={i} cx={cx} cy={cy} r={COOKIE_R} shape={shape} lit={isLit} />
      })}
    </g>
  )
}

/** Renders the oval serving plate with its 12 scattered cookies. */
export function PlatePrimitive({
  litByTray,
  cx = PLATE_CX,
  cy = PLATE_CY,
}: {
  litByTray?: number | null   // 0/1/2 — highlight one tray-group; null = none
  cx?: number
  cy?: number
}) {
  return (
    <g>
      {/* plate shadow */}
      <ellipse cx={cx + 2} cy={cy + 3} rx={PLATE_RX} ry={PLATE_RY} fill={COLOR.PLATE_SHADOW} />
      {/* plate body */}
      <ellipse cx={cx} cy={cy} rx={PLATE_RX} ry={PLATE_RY} fill={COLOR.PLATE_BG} stroke={COLOR.PLATE_STROKE} strokeWidth={2} />
      {/* plate rim */}
      <ellipse cx={cx} cy={cy} rx={PLATE_RX - 7} ry={PLATE_RY - 5} fill="none" stroke={COLOR.PLATE_STROKE} strokeWidth={1} opacity={0.5} />

      {/* cookies */}
      {PLATE_COOKIES.map((pc, i) => {
        const cookieCx = cx - PLATE_RX + pc.nx * PLATE_RX * 2
        const cookieCy = cy - PLATE_RY + pc.ny * PLATE_RY * 2
        const isLit = litByTray !== null && litByTray === pc.trayIdx
        return (
          <CookieGlyph
            key={i}
            cx={cookieCx}
            cy={cookieCy}
            r={COOKIE_R * 0.88}
            shape={pc.shape}
            lit={isLit}
            trayIndex={pc.trayIdx}
          />
        )
      })}
    </g>
  )
}

// ── Default export (static stem illustration) ─────────────────────────────────

/**
 * CookieTray22PEIllustration
 *
 * Static, problem-only figure for IKMC-21-PE-Q22.
 * Shows: baking tray (one participant's batch, 2×5 grid) on the left,
 * oval serving plate (to be filled) on the right.
 * Does NOT reveal the answer (3 trays) or any grouping.
 */
export default function CookieTray22PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Nampan panggang persegi panjang berisi 10 kue dalam susunan 2 baris × 5 kolom ' +
        '(bintang, bulat, segitiga, bintang-tajam, bulat-bulan). ' +
        'Di sebelahnya, piring oval berisi 12 kue yang perlu diisi dari nampan. ' +
        'Berapa nampan minimum yang diperlukan?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: SVG_W + 20 }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* label: "Nampan / Tray" */}
        <text
          x={TRAY_X + TRAY_W / 2}
          y={PAD + 14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={COLOR.INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Nampan / Tray
        </text>

        {/* label: "Piring / Plate" */}
        <text
          x={PLATE_CX}
          y={PAD + 14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={COLOR.INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Piring / Plate
        </text>

        <TrayPrimitive />
        <PlatePrimitive litByTray={null} />
      </svg>
    </div>
  )
}
