// IKMC-22-PE-Q12 — "In one of the pictures below, a shape is used that cannot
// be seen in the others. In which picture is it?"
//
// The five A–E options ARE the figures (tangram animals). There is NO separate
// stem figure — the choices are the only figures (options-only type).
//
// Each picture is a tangram animal assembled from flat geometric polygons:
//   A (blue)   — sitting rabbit
//   B (yellow) — running cat / goose
//   C (green)  — standing bird / flamingo
//   D (purple) — dog  ← ANSWER: contains a RECTANGLE (non-square) not in A/B/C/E
//   E (pink)   — lying cat
//
// The unique shape in D: the dog's body uses a rectangle (a parallelogram with
// right angles that is wider than tall, not a square and not a skewed
// parallelogram), which does not appear in any of the other four pictures.
// A, B, C, E all use only right-triangles, squares and/or parallelograms.
//
// Colour palette (from scan):
//   A → #39AEDD (sky blue)
//   B → #F5C518 (golden yellow)
//   C → #4CAF50 (green)
//   D → #9C6BB7 (purple)
//   E → #D9547E (rose/pink)
//
// Pure SVG polygon coords — no raster, no random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ─────────────────────────────────────────────────────────────
const COLORS: Record<string, string> = {
  A: '#39AEDD',
  B: '#F5C518',
  C: '#4CAF50',
  D: '#9C6BB7',
  E: '#D9547E',
}
const STROKE = '#1F2937'
const SW = 1.2

// ── Shape definitions ─────────────────────────────────────────────────────────
// Each shape is a polygon in a 100×100 viewBox.
// Assembled faithfully from the scan crops (2022.imgs/033-035.jpg).

// ── Option A: Blue sitting rabbit ────────────────────────────────────────────
// Pieces:
//   - Head: large right-triangle (pointing up-right, upper body)
//   - Ear left: parallelogram (slanted, top-left, narrow)
//   - Ear right: small triangle (pointed up)
//   - Body square: square (rotated ~45°, diamond shape, mid)
//   - Body left: large triangle (left side, lower)
//   - Tail: small triangle (bottom-right)
//   - Foot: small triangle (bottom)

const A_POLYS = [
  // Left ear: tall narrow parallelogram leaning right
  '35,5 45,5 55,25 45,25',
  // Right ear (head-top): small triangle
  '45,5 60,5 52,22',
  // Head/neck triangle: large right triangle
  '35,25 65,25 65,55',
  // Body square (diamond): square rotated 45°
  '45,40 65,25 80,45 60,60',
  // Left body: large triangle filling left
  '20,45 55,45 35,75',
  // Back leg small triangle
  '55,70 75,55 75,75',
  // Foot: small triangle bottom
  '30,72 55,72 42,85',
]

// ── Option B: Yellow cat / goose ─────────────────────────────────────────────
// Pieces:
//   - Tail/base: parallelogram (bottom-left, low angle)
//   - Body: large triangle lower-left
//   - Body-right: large triangle
//   - Neck-square: square (rotated 45°)
//   - Head triangle: medium triangle
//   - Top-right: small triangle (beak/hat)

const B_POLYS = [
  // Parallelogram base (tail / body bottom)
  '5,75 45,75 55,90 15,90',
  // Large triangle left (body)
  '10,50 50,75 10,75',
  // Large triangle right (back)
  '50,50 80,70 50,75',
  // Square rotated 45° (torso)
  '45,35 65,20 82,38 62,53',
  // Medium triangle (head/neck)
  '55,15 80,20 65,38',
  // Small triangle top-right (ear/beak pointing up)
  '72,5 88,5 80,18',
]

// ── Option C: Green bird / flamingo ──────────────────────────────────────────
// Pieces:
//   - Beak/head: small triangle (top, pointing right)
//   - Head square: small square (rotated 45°)
//   - Neck triangle: medium triangle
//   - Body: large triangle (main)
//   - Wing: large triangle (extends right)
//   - Leg/tail: small triangle (bottom)

const C_POLYS = [
  // Head/beak: small right triangle
  '55,8 68,8 55,22',
  // Neck-top square (diamond)
  '42,22 55,8 68,22 55,36',
  // Neck triangle (medium)
  '30,48 55,20 55,48',
  // Body large triangle (main)
  '15,48 55,48 30,80',
  // Wing large triangle (right side)
  '55,48 80,30 80,65',
  // Leg/tail small triangle (bottom-right)
  '45,80 65,65 65,80',
]

// ── Option D: Purple dog ──────────────────────────────────────────────────────
// UNIQUE SHAPE: the dog's body contains a RECTANGLE (wider than tall,
//   right-angled corners — not a square, not a skewed parallelogram).
// Other pieces: right triangles (legs, head, tail), small triangles.
// Pieces:
//   - Head triangle: medium right triangle (top-left)
//   - Ear: small triangle
//   - Body: RECTANGLE (unique shape, horizontal) ← answer
//   - Front-leg triangle: right triangle
//   - Back-leg triangle: right triangle
//   - Tail: small right triangle

const D_POLYS = [
  // Head: medium right triangle (top-left)
  '10,20 38,20 10,48',
  // Ear small triangle
  '18,8 35,8 18,22',
  // Body: RECTANGLE (the unique shape — right angles, not square, not slanted)
  '20,48 80,48 80,68 20,68',
  // Front leg: right triangle (bottom-left under body)
  '20,68 38,68 20,85',
  // Hind leg: right triangle (bottom-right under body)
  '62,68 80,68 80,85',
  // Tail: small right triangle (top-right)
  '80,30 95,18 95,48',
]

// ── Option E: Pink lying cat ──────────────────────────────────────────────────
// Pieces:
//   - Body-left: large triangle
//   - Body-right: large triangle
//   - Back/hip: medium triangle
//   - Tail: parallelogram (top-right, slanted)
//   - Head square: square (rotated 45°)
//   - Ear: small triangle

const E_POLYS = [
  // Tail: parallelogram (top-right, angled)
  '72,15 92,5 92,25 72,35',
  // Head square (diamond)
  '18,20 38,5 58,20 38,35',
  // Ear: small triangle (top of head)
  '30,8 42,8 36,20',
  // Body left: large triangle
  '10,52 50,35 50,65',
  // Body right: large triangle
  '50,35 85,52 50,65',
  // Hip/back: medium triangle
  '50,65 80,52 80,72',
]

const ALL_POLYS: Record<string, string[]> = {
  A: A_POLYS,
  B: B_POLYS,
  C: C_POLYS,
  D: D_POLYS,
  E: E_POLYS,
}

// ── Aria labels ───────────────────────────────────────────────────────────────
const ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Picture A: blue sitting rabbit made from triangles, a diamond-square, and a parallelogram.',
    id: 'Gambar A: kelinci duduk biru terbuat dari segitiga, belah ketupat, dan jajargenjang.',
  },
  B: {
    en: 'Picture B: yellow running cat made from triangles, a diamond-square, and a parallelogram.',
    id: 'Gambar B: kucing berlari kuning terbuat dari segitiga, belah ketupat, dan jajargenjang.',
  },
  C: {
    en: 'Picture C: green standing bird made from triangles and a diamond-square.',
    id: 'Gambar C: burung berdiri hijau terbuat dari segitiga dan belah ketupat.',
  },
  D: {
    en: 'Picture D: purple dog — contains a rectangle not seen in the other pictures.',
    id: 'Gambar D: anjing ungu — memiliki persegi panjang yang tidak ada di gambar lain.',
  },
  E: {
    en: 'Picture E: pink lying cat made from triangles, a diamond-square, and a parallelogram.',
    id: 'Gambar E: kucing berbaring merah muda terbuat dari segitiga, belah ketupat, dan jajargenjang.',
  },
}

// ── Single option renderer (used in CHOICE_RENDERERS) ────────────────────────

interface TangramFigureProps {
  label: string
  size?: number
}

function TangramFigure({ label, size = 80 }: TangramFigureProps) {
  const polys = ALL_POLYS[label]
  const fill = COLORS[label]
  const aria = ARIA[label]
  if (!polys || !fill) return null

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-label={aria?.en}
      role="img"
      style={{ display: 'block' }}
    >
      {polys.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill={fill}
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

/**
 * ShapeOdd12PEOption — renders one A/B/C/D/E tangram animal figure.
 * Registered in CHOICE_RENDERERS for IKMC-22-PE-Q12.
 */
export function ShapeOdd12PEOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  if (!ALL_POLYS[k]) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={ARIA[k]?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <TangramFigure label={k} size={84} />
    </span>
  )
}

// Re-export for use by the explainer
export { TangramFigure, COLORS, ARIA }
