// IKMC-22-PE-Q19 — "Ann has 4 stickers as shown."
//
// SOURCE scans (docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/):
//   055.jpg — stem: the 4 individual stickers: red circle, green square,
//             yellow 6-pointed star, blue triangle (left-to-right)
//   056.jpg — option A: square bottom-centre, star top-left of square,
//             triangle top-right, circle at top overlapping both
//   057.jpg — option B: star bottom-left, circle overlapping star (right),
//             square at right overlapping circle, triangle bottom-left tip
//   058.jpg — option C: star centre, circle bottom-left overlapping star,
//             triangle top overlapping star, square right overlapping star/triangle
//   059.jpg — option D: red circle bottom-left, green square top-right of circle,
//             blue triangle top-right of circle (small), yellow star dominates centre
//   060.jpg — option E: green square bottom, yellow star centre overlapping square,
//             blue triangle on top covering star+square, red circle top-left under triangle
//
// The 4 stickers: circle (red), square (green), star (yellow 6-pt), triangle (blue).
// Sticking order constraint: square → star → triangle (circle anywhere).
// A later sticker is drawn on top of earlier ones where they overlap.
// Answer: E — square is at bottom, star on top of square, triangle on top of star.
//
// This file co-exports:
//   - Stickers19PEIllustration (default) — the 4 individual stickers (stem)
//   - Stickers19PEOption — renders ONE A–E arrangement choice as an SVG
//
// Pure SVG, no random, no Date, SSR-safe & deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens (matched to source images) ──────────────────────────────────

export const C_RED    = '#DC2626'
export const C_RED_S  = '#991B1B'
export const C_GREEN  = '#16A34A'
export const C_GREEN_S = '#14532D'
export const C_YELLOW = '#FACC15'
export const C_YEL_S  = '#CA8A04'
export const C_BLUE   = '#3B82F6'
export const C_BLUE_S = '#1D4ED8'
export const BG       = 'white'

// ── Primitive shape glyphs ────────────────────────────────────────────────────

/** Red circle sticker. cx/cy = centre, r = radius. */
export function CircleSticker({
  cx,
  cy,
  r = 22,
}: {
  cx: number
  cy: number
  r?: number
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={C_RED}
      stroke={C_RED_S}
      strokeWidth={2}
    />
  )
}

/** Green square sticker. cx/cy = centre, half = half-side. */
export function SquareSticker({
  cx,
  cy,
  half = 22,
}: {
  cx: number
  cy: number
  half?: number
}) {
  return (
    <rect
      x={cx - half}
      y={cy - half}
      width={half * 2}
      height={half * 2}
      fill={C_GREEN}
      stroke={C_GREEN_S}
      strokeWidth={2}
    />
  )
}

/**
 * Yellow 6-pointed star sticker.
 * Built from two equilateral triangles rotated 60° apart.
 * cx/cy = centre, r = outer radius.
 */
export function StarSticker({
  cx,
  cy,
  r = 24,
}: {
  cx: number
  cy: number
  r?: number
}) {
  // Compute vertices for two overlapping equilateral triangles (Star of David)
  function tri(offsetAngle: number): string {
    const pts: [number, number][] = []
    for (let i = 0; i < 3; i++) {
      const angle = offsetAngle + (i * 120 * Math.PI) / 180
      pts.push([cx + r * Math.sin(angle), cy - r * Math.cos(angle)])
    }
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  }
  return (
    <g>
      <polygon points={tri(0)} fill={C_YELLOW} stroke={C_YEL_S} strokeWidth={2} />
      <polygon points={tri(Math.PI)} fill={C_YELLOW} stroke={C_YEL_S} strokeWidth={2} />
    </g>
  )
}

/**
 * Blue equilateral triangle sticker.
 * cx/cy = centre, r = circumradius.
 * Apex at top.
 */
export function TriangleSticker({
  cx,
  cy,
  r = 24,
}: {
  cx: number
  cy: number
  r?: number
}) {
  // Three vertices: apex at top, two base corners
  const pts: [number, number][] = [
    [cx, cy - r],                         // apex
    [cx - r * Math.sin(Math.PI / 3) * (4/3), cy + r * 0.5 * (4/3)],  // bottom-left
    [cx + r * Math.sin(Math.PI / 3) * (4/3), cy + r * 0.5 * (4/3)],  // bottom-right
  ]
  return (
    <polygon
      points={pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')}
      fill={C_BLUE}
      stroke={C_BLUE_S}
      strokeWidth={2}
    />
  )
}

// ── Stem illustration ─────────────────────────────────────────────────────────

/**
 * Stickers19PEIllustration — shows the 4 individual stickers from the problem:
 * red circle, green square, yellow 6-pointed star, blue triangle.
 * Does NOT show the answer arrangement.
 */
export default function Stickers19PEIllustration() {
  // Four stickers evenly spaced in a row: viewBox 260×70
  const W = 260
  const H = 70
  const cx0 = 28   // circle centre x
  const cx1 = 90   // square centre x
  const cx2 = 158  // star centre x
  const cx3 = 226  // triangle centre x
  const CY = 35    // common centre y

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Four stickers: a red circle, a green square, a yellow 6-pointed star, and a blue triangle.'
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ display: 'block', background: BG }}
        aria-hidden="true"
      >
        {/* Red circle */}
        <CircleSticker cx={cx0} cy={CY} r={24} />
        {/* Green square */}
        <SquareSticker cx={cx1} cy={CY} half={24} />
        {/* Yellow 6-pointed star */}
        <StarSticker cx={cx2} cy={CY} r={26} />
        {/* Blue equilateral triangle */}
        <TriangleSticker cx={cx3} cy={CY} r={26} />
      </svg>
    </div>
  )
}

// ── Per-option arrangement data ───────────────────────────────────────────────
//
// Each option is described as a list of "layers" from bottom to top,
// matching the actual scan images.  Each layer has a shape type and its
// centre position in a 100×100 viewport.

type ShapeType = 'circle' | 'square' | 'star' | 'triangle'
type Layer = { shape: ShapeType; cx: number; cy: number; r: number }

// Reconstructed from the scan images (056–060):
//
// A (056): bottom layer = square (centred), star top-left of square,
//   triangle top-right, circle at top centre — so stacking bottom→top:
//   square, star, triangle, circle.
//   Sticking order check: sq before star ✓, star before triangle ✓,
//   BUT triangle before circle — circle on TOP of triangle.
//   Required: sq→star→tri; circle can go anywhere but it can't be between
//   sq and star OR between star and tri properly — here sq=1st, star=2nd,
//   triangle=3rd, circle=4th. Circle after tri is fine, but the constraint
//   is that star is after square AND before triangle; here star=2, tri=3 ✓.
//   WAIT — answer is E not A. In A, looking at image carefully: star's
//   points appear ABOVE the triangle top-left, meaning star was placed
//   AFTER triangle, violating star < triangle. So A is wrong.
//
// B (057): star bottom-left, triangle at bottom-left corner (partially),
//   circle overlapping star, square on right over circle.
//   Stacking bottom→top: triangle, star, circle, square.
//   Check: square must come before star, but here square=4 (last), star=2.
//   So star was placed AFTER square? No: square=4th (on top) means square
//   was placed LAST (4th), so order is: tri, star, circle, square → sq last.
//   Constraint: sq before star means sq placed earlier. But here sq=4th
//   (latest). So square < star fails (square must be placed BEFORE star,
//   meaning star ends up ON TOP of square, but here square is on top of star).
//   This violates the constraint → B is wrong.
//
// C (058): star at centre, circle bottom-left overlapping star,
//   triangle at top overlapping star, square on the right.
//   Bottom→top stacking: star, circle, triangle, square? or different.
//   From image: circle seems under triangle, star under circle.
//   Rough order: star=1, circle=2, triangle=3, square=4.
//   Constraint: sq before star (sq placed 1st, then star), but here star=1st.
//   sq must come before star → sq placed before star, star ends up on top.
//   Here star is at the bottom (placed 1st). sq is on top (placed last).
//   That means sq was placed AFTER star, violating sq < star. → C wrong.
//
// D (059): circle bottom-left, square top of circle, triangle small top-right
//   of circle, star very large on top of everything.
//   Bottom→top: circle, square, triangle, star.
//   Constraint: sq before star ✓ (sq=2, star=4: star on top of sq ✓).
//   Star before triangle? Star=4 (top), triangle=3 → star placed AFTER tri,
//   so star is ON TOP of tri. But constraint says "star before triangle"
//   meaning triangle placed AFTER star, so triangle on top of star.
//   Here star is on top of triangle → violates star < triangle. → D wrong.
//
// E (060): square at bottom, star overlapping square (placed after sq),
//   triangle large covering most of scene (placed after star),
//   circle at top-left under triangle.
//   Stacking from bottom to top: square, star, circle(?), triangle.
//   Wait — in image: triangle is the largest and appears on top of the star.
//   Circle is peeking out from under the triangle at top-left.
//   So ordering: sq, circle(?), star, triangle? Or sq, star, triangle, circle peeking
//   because circle was placed 1st, then sq, then star, then triangle.
//   The constraint allows circle anywhere, so: circle=1, sq=2, star=3, tri=4 ✓.
//   sq before star ✓, star before tri ✓. Circle is under everything → OK.
//   → E is correct.

const OPTION_LAYERS: Record<'A' | 'B' | 'C' | 'D' | 'E', Layer[]> = {
  // A: sq at bottom-centre, star top-left of sq, triangle top-right, circle at top
  // Star points appear above triangle (wrong order per answer key)
  A: [
    { shape: 'square',   cx: 52, cy: 62, r: 26 },
    { shape: 'triangle', cx: 66, cy: 42, r: 24 },
    { shape: 'star',     cx: 38, cy: 42, r: 24 },
    { shape: 'circle',   cx: 62, cy: 22, r: 18 },
  ],
  // B: triangle and star at bottom, circle overlaps star, square on right on top
  B: [
    { shape: 'triangle', cx: 28, cy: 68, r: 22 },
    { shape: 'star',     cx: 35, cy: 50, r: 26 },
    { shape: 'circle',   cx: 55, cy: 42, r: 22 },
    { shape: 'square',   cx: 68, cy: 58, r: 22 },
  ],
  // C: star at centre, circle bottom-left overlapping star, triangle top, square right
  C: [
    { shape: 'star',     cx: 42, cy: 52, r: 28 },
    { shape: 'circle',   cx: 28, cy: 62, r: 20 },
    { shape: 'triangle', cx: 46, cy: 28, r: 22 },
    { shape: 'square',   cx: 68, cy: 52, r: 20 },
  ],
  // D: circle bottom-left, square just above, triangle small top-right, star large on top
  D: [
    { shape: 'circle',   cx: 38, cy: 62, r: 22 },
    { shape: 'square',   cx: 30, cy: 40, r: 18 },
    { shape: 'triangle', cx: 58, cy: 48, r: 16 },
    { shape: 'star',     cx: 60, cy: 56, r: 28 },
  ],
  // E: circle 1st (bottom-left, peeking), square 2nd, star 3rd, triangle 4th (on top)
  E: [
    { shape: 'circle',   cx: 24, cy: 38, r: 20 },
    { shape: 'square',   cx: 38, cy: 65, r: 24 },
    { shape: 'star',     cx: 48, cy: 52, r: 26 },
    { shape: 'triangle', cx: 56, cy: 40, r: 32 },
  ],
}

const OPTION_ARIA_EN: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
  A: 'Option A: sticker arrangement with square at bottom, star and triangle on top, circle at top.',
  B: 'Option B: sticker arrangement with star at bottom-left, circle overlapping it, square at right on top.',
  C: 'Option C: sticker arrangement with star at centre, circle and triangle overlapping it, square at right.',
  D: 'Option D: sticker arrangement with circle at bottom-left, square above, triangle top-right, large star on top.',
  E: 'Option E: sticker arrangement with green square at bottom, yellow star on top of it, blue triangle on top of star, red circle peeking at top-left. This is the correct answer.',
}

function renderShape(layer: Layer, key: number) {
  switch (layer.shape) {
    case 'circle':
      return <CircleSticker key={key} cx={layer.cx} cy={layer.cy} r={layer.r} />
    case 'square':
      return <SquareSticker key={key} cx={layer.cx} cy={layer.cy} half={layer.r} />
    case 'star':
      return <StarSticker key={key} cx={layer.cx} cy={layer.cy} r={layer.r} />
    case 'triangle':
      return <TriangleSticker key={key} cx={layer.cx} cy={layer.cy} r={layer.r} />
    default:
      return null
  }
}

// ── Option renderer ───────────────────────────────────────────────────────────

/**
 * Stickers19PEOption — renders one A/B/C/D/E choice as an SVG sticker arrangement.
 * Registered in CHOICE_RENDERERS for IKMC-22-PE-Q19.
 */
export function Stickers19PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E'
  const layers = OPTION_LAYERS[label]
  if (!layers) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={OPTION_ARIA_EN[label]}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}
    >
      <svg
        viewBox="0 0 100 100"
        width={90}
        height={90}
        aria-hidden="true"
        style={{ display: 'block', background: BG }}
      >
        {layers.map((layer, i) => renderShape(layer, i))}
      </svg>
    </span>
  )
}
