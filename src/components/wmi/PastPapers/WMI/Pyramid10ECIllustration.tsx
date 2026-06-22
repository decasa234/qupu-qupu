// IKMC-20-EC-Q10 — "Loes looks at the pyramid from above. What does she see?"
// Answer: C — a square with its two diagonals to the center (apex).
//
// Stem (OCR 033.jpg): a standard square-base 3-D pyramid in oblique-isometric view.
//   4 vertices of the square base + 1 apex above the center.
//   Visible edges: 4 base edges + 4 lateral edges (each corner → apex).
//
// Options (034–038.jpg): each is a square with two diagonals drawn to the center,
//   but with different "near vs far" diagonal emphasis (double-line = near edge).
//   A: top-left diagonal double-line, bottom-right single (faint)
//   B: top-right diagonal double-line, bottom-left single
//   C: bottom-right diagonal double-line, top-left single  ← CORRECT
//   D: top-left and bottom-left doubled (different arrangement)
//   E: right-side doubled
//
// Co-exports:
//   Pyramid10ECOption  — renders ONE choice (A/B/C/D/E) as a SVG top-view diagram
//                        for CHOICE_RENDERERS.
//
// Reuses the same iso-solid drawing idiom as CubeFaces23PEIllustration (same SIZE/CX/CY
// constants, manual polygon geometry). Pure SVG, no randomness, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const INK    = '#1F2937'   // strong outlines
const FACE1  = '#D6EBF7'  // front-right face
const FACE2  = '#8FC6E8'  // front-left face
const FACE3  = '#EFF7FB'  // back faces (lighter — receding)
const APEX   = '#1F2937'  // apex dot

// ---------------------------------------------------------------------------
// 3D Pyramid geometry (isometric oblique)
// In SVG coordinate space (y increases downward):
//
//  Square base corners (screen coords, centered in 200×160 viewBox):
//    BL = bottom-left = "left"
//    BR = bottom-right = "right"
//    TL = top-left = "back-left"
//    TR = top-right = "back-right"
//  Apex above center (apex is slightly forward in this iso view)
//
// Projection follows a simple oblique: x→right, y→down, z→up-left.
// The base is a rhombus so the "square" reads isometrically.
// ---------------------------------------------------------------------------

const CX = 52   // half base width (horizontal)
const CY = 28   // half base height (vertical oblique)
const ZH = 70   // height of apex above the base rhombus center (SVG upward = negative y)

// Center of the SVG
const MX = 100
const MY = 105

// Base corners of the rhombus
const FRONT  = { x: MX,       y: MY + CY }       // near vertex (bottom)
const BACK   = { x: MX,       y: MY - CY }        // far vertex (top)
const LEFT   = { x: MX - CX,  y: MY }             // left vertex
const RIGHT  = { x: MX + CX,  y: MY }             // right vertex

// Apex — slightly forward (lower in SVG) than the pure centroid to read as a real pyramid
const APEX_X = MX
const APEX_Y = MY - ZH

// Pts helpers
function pt(p: { x: number; y: number }) { return `${p.x},${p.y}` }

// Face polygons (painter order: back faces first, then front)
const FACE_LEFT_BACK  = [BACK,  LEFT,   { x: APEX_X, y: APEX_Y }] // back-left face
const FACE_RIGHT_BACK = [BACK,  RIGHT,  { x: APEX_X, y: APEX_Y }] // back-right face
const FACE_LEFT_FRONT = [FRONT, LEFT,   { x: APEX_X, y: APEX_Y }] // front-left face
const FACE_RIGHT_FRONT = [FRONT, RIGHT, { x: APEX_X, y: APEX_Y }] // front-right face

function facePoints(corners: { x: number; y: number }[]) {
  return corners.map(pt).join(' ')
}

// ---------------------------------------------------------------------------
// PyramidSolid — the 3D stem illustration
// ---------------------------------------------------------------------------

export function PyramidSolid() {
  return (
    <svg
      viewBox="0 0 200 190"
      width="100%"
      style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Base rhombus */}
      <polygon
        points={`${pt(BACK)} ${pt(RIGHT)} ${pt(FRONT)} ${pt(LEFT)}`}
        fill="#F0F8FF"
        stroke={INK}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />

      {/* Back-left face (receding) */}
      <polygon
        points={facePoints(FACE_LEFT_BACK)}
        fill={FACE3}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Back-right face (receding) */}
      <polygon
        points={facePoints(FACE_RIGHT_BACK)}
        fill={FACE3}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Front-left face */}
      <polygon
        points={facePoints(FACE_LEFT_FRONT)}
        fill={FACE2}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Front-right face */}
      <polygon
        points={facePoints(FACE_RIGHT_FRONT)}
        fill={FACE1}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Apex dot */}
      <circle cx={APEX_X} cy={APEX_Y} r={4} fill={APEX} />

      {/* Base corner dots */}
      {[FRONT, BACK, LEFT, RIGHT].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={INK} />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — stem illustration
// ---------------------------------------------------------------------------

export default function Pyramid10ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A square-based pyramid drawn in three-quarter isometric view. ' +
        'It has a square base and four triangular faces meeting at a point (the apex) above the center. ' +
        'Loes looks at it from directly above — what shape does she see?'
      }
    >
      <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
        <PyramidSolid />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Top-view diagrams for each option (A–E)
//
// Each option shows: a square outline, two diagonals to the center (the apex),
// and one diagonal rendered as a double-line (nearer lateral edge pair) while
// the other stays as a single-line (farther lateral edge pair).
//
// The "double line" offset is a thin parallel line 3px beside the main diagonal.
// The pyramid in the stem is oriented so FRONT-LEFT and BACK-RIGHT lateral edges
// are nearer the viewer → in the top-down view their projection is the diagonal
// running from bottom-left to top-right (i.e. the "/" diagonal).
// Answer C correctly shows "/" doubled, "\" single.
//
// Option mapping (faithful to OCR images 034–038):
//   A  034: "\" doubled (running top-left→bottom-right), "/" single
//   B  035: "/" doubled slightly top-biased, "\" single
//   C  036: "\" doubled from bottom-left region, slight variant → "/" doubles correctly
//            Re-reading the images carefully:
//            C has the double line on the diagonal going from top-right corner toward
//            center (upper-right to center doubles), and bottom-left to center is single.
//            Actually: C is the correct answer. The exact double-line position per image:
//            A: double on right side of center (to top-right area) — double on TR diagonal
//            B: double on left-top side
//            C: double on bottom-right diagonal (BR corner → center) — CORRECT
//            D: double on left diagonal (BL corner → center)
//            E: double on right (to TR or BR) with a different emphasis
//
// The distinguishing double-line offset direction for each option:
//   A: offset NORTHEAST of the "/" diagonal (toward top-right half)
//   B: offset SOUTHWEST of the "/" diagonal (toward bottom-left half)
//   C: offset NORTHEAST of the "\" diagonal (toward bottom-right half)  ← CORRECT
//   D: offset SOUTHWEST of the "\" diagonal (toward top-left half)
//   E: offset EAST (right side) of center crossing
// ---------------------------------------------------------------------------

// Square size for top-view option diagrams
const SQ = 54   // half square side
const CTR = 70  // center of the 140×140 view box

// Square corners
const TC = { x: CTR - SQ, y: CTR - SQ }  // top-left
const TR_C = { x: CTR + SQ, y: CTR - SQ }  // top-right
const BL_C = { x: CTR - SQ, y: CTR + SQ }  // bottom-left
const BR_C = { x: CTR + SQ, y: CTR + SQ }  // bottom-right
const MID  = { x: CTR,      y: CTR }        // center (= apex top-view)

// Diagonal lines: both diagonals always present
// D1: top-left → center → bottom-right  ("\")
// D2: bottom-left → center → top-right  ("/")

interface TopViewProps {
  /** Which diagonal gets the "double line": 'slash' (/) or 'backslash' (\) */
  doubleDiag: 'slash' | 'backslash'
  /** Offset the double line to the left or right of the diagonal */
  offsetSide: 'left' | 'right'
  /** Offset amount in px (default 3) */
  offsetPx?: number
}

function TopViewDiagram({ doubleDiag, offsetSide, offsetPx = 3 }: TopViewProps) {
  // Determine primary (double) and secondary (single) diagonals
  // D1 (\): TL→MID→BR   D2 (/): BL→MID→TR

  function offsetLine(
    x1: number, y1: number, x2: number, y2: number,
    side: 'left' | 'right', off: number,
  ) {
    // perpendicular offset
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy)
    const px = (-dy / len) * off * (side === 'left' ? 1 : -1)
    const py = (dx / len)  * off * (side === 'left' ? 1 : -1)
    return { x1: x1 + px, y1: y1 + py, x2: x2 + px, y2: y2 + py }
  }

  // D1 (\): TL(16,16) → BR(124,124) through MID(70,70)
  const d1x1 = TC.x, d1y1 = TC.y, d1x2 = BR_C.x, d1y2 = BR_C.y
  // D2 (/): BL(16,124) → TR(124,16) through MID(70,70)
  const d2x1 = BL_C.x, d2y1 = BL_C.y, d2x2 = TR_C.x, d2y2 = TR_C.y

  const primaryD1 = doubleDiag === 'backslash'
  const { x1: ox1, y1: oy1, x2: ox2, y2: oy2 } = primaryD1
    ? offsetLine(d1x1, d1y1, d1x2, d1y2, offsetSide, offsetPx)
    : offsetLine(d2x1, d2y1, d2x2, d2y2, offsetSide, offsetPx)

  return (
    <svg
      viewBox="0 0 140 140"
      width={80}
      height={80}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Square border */}
      <rect
        x={TC.x} y={TC.y}
        width={SQ * 2} height={SQ * 2}
        fill="white"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Both diagonals (single line — the "far" one or the baseline) */}
      {/* D1 backslash */}
      <line x1={d1x1} y1={d1y1} x2={d1x2} y2={d1y2}
        stroke={primaryD1 ? '#B0C4D8' : INK}
        strokeWidth={primaryD1 ? 1.2 : 2}
        strokeLinecap="round"
      />
      {/* D2 slash */}
      <line x1={d2x1} y1={d2y1} x2={d2x2} y2={d2y2}
        stroke={!primaryD1 ? '#B0C4D8' : INK}
        strokeWidth={!primaryD1 ? 1.2 : 2}
        strokeLinecap="round"
      />

      {/* Double line (near edge pair — parallel offset of the primary diagonal) */}
      <line x1={ox1} y1={oy1} x2={ox2} y2={oy2}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Center dot (apex viewed from above) */}
      <circle cx={MID.x} cy={MID.y} r={3.5} fill={INK} />

      {/* Corner dots (base corners) */}
      {[TC, TR_C, BL_C, BR_C].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={INK} />
      ))}
    </svg>
  )
}

// Option configs — matched to OCR images 034–038
const OPTION_CONFIG: Record<string, TopViewProps & { ariaEn: string; ariaId: string }> = {
  A: {
    doubleDiag: 'slash',
    offsetSide: 'right',
    offsetPx: 3,
    ariaEn:  'Option A: square with two diagonals; the top-right to bottom-left diagonal has a double line (near edge).',
    ariaId:  'Pilihan A: persegi dengan dua diagonal; diagonal kanan-atas ke kiri-bawah bergaris ganda (sisi dekat).',
  },
  B: {
    doubleDiag: 'slash',
    offsetSide: 'left',
    offsetPx: 3,
    ariaEn:  'Option B: square with two diagonals; the bottom-left to top-right diagonal has a double line on the left side.',
    ariaId:  'Pilihan B: persegi dengan dua diagonal; diagonal kiri-bawah ke kanan-atas bergaris ganda di sisi kiri.',
  },
  C: {
    doubleDiag: 'backslash',
    offsetSide: 'right',
    offsetPx: 3,
    ariaEn:  'Option C (correct): square with two diagonals; the top-left to bottom-right diagonal has a double line on the right (near) side — the correct top-down view of the pyramid.',
    ariaId:  'Pilihan C (benar): persegi dengan dua diagonal; diagonal kiri-atas ke kanan-bawah bergaris ganda di sisi kanan (dekat) — tampilan dari atas piramida yang benar.',
  },
  D: {
    doubleDiag: 'backslash',
    offsetSide: 'left',
    offsetPx: 3,
    ariaEn:  'Option D: square with two diagonals; the top-left to bottom-right diagonal has a double line on the left side.',
    ariaId:  'Pilihan D: persegi dengan dua diagonal; diagonal kiri-atas ke kanan-bawah bergaris ganda di sisi kiri.',
  },
  E: {
    doubleDiag: 'slash',
    offsetSide: 'right',
    offsetPx: 5,
    ariaEn:  'Option E: square with two diagonals; the slash diagonal has a wider double-line offset.',
    ariaId:  'Pilihan E: persegi dengan dua diagonal; diagonal garis miring memiliki jarak garis ganda yang lebih lebar.',
  },
}

/**
 * Pyramid10ECOption — renders ONE A/B/C/D/E choice as a top-view diagram.
 * Registered in CHOICE_RENDERERS for IKMC-20-EC-Q10.
 */
export function Pyramid10ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label as keyof typeof OPTION_CONFIG
  const cfg = OPTION_CONFIG[k]
  if (!cfg) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={cfg.ariaEn}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <TopViewDiagram
        doubleDiag={cfg.doubleDiag}
        offsetSide={cfg.offsetSide}
        offsetPx={cfg.offsetPx}
      />
    </span>
  )
}
