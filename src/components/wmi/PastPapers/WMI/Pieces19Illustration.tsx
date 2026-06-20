// IKMC-19-PE-Q19 — "A figure has been cut into these 3 pieces. Which figure
// could have been cut?" (answer A = heart shape)
//
// Source scans (docs/reference/ocr-res/ikmc/contest/preecolier/2019.imgs/):
//   032.jpg — the 3 cut pieces (stem)
//   033.jpg — option A: heart
//   034.jpg — option B: circle
//   035.jpg — option C: shield/bell (rectangle with rounded bottom)
//   036.jpg — option D: rectangle
//   037.jpg — option E: three-leaf clover (3 overlapping circles)
//
// The 3 pieces from 032.jpg:
//   Piece 1 (left):  A "bitten circle" quarter — large curved arc on top-left,
//                    diagonal straight edge cutting across.
//   Piece 2 (middle): A half-disk (D-shape) — flat side on left, semicircle arc right.
//   Piece 3 (right): A right triangle — right angle at bottom-left.
//
// These three pieces reassemble (with rotation/flipping) into a heart (option A).
//
// This file co-exports:
//   - Pieces19Illustration (default) — the 3-piece stem shown in the problem
//   - Pieces19Option — renders ONE A–E choice as an SVG whole shape
//
// Pure SVG, no random, no Date, SSR-safe & deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ─── colour tokens ────────────────────────────────────────────────────────────

const BLUE = '#29ABE2'        // matches the scan: bright sky-blue fill
const STROKE = '#1A7CA8'      // darker outline
const BG = 'white'

// ─── Heart path (option A) ────────────────────────────────────────────────────
// Standard SVG heart centred in a 100×90 viewport.
// Two cubic Bézier arcs meeting at a bottom-centre point.

function HeartPath({ fill = BLUE, stroke = STROKE }: { fill?: string; stroke?: string }) {
  // Heart: starts at bottom point (50,85), sweeps up left lobe, back down through
  // top dip (50,30), up right lobe, back to (50,85).
  const d = [
    'M 50 82',
    'C 50 82 10 55 10 35',
    'C 10 15 30 12 50 30',
    'C 70 12 90 15 90 35',
    'C 90 55 50 82 50 82',
    'Z',
  ].join(' ')
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
}

// ─── Circle path (option B) ──────────────────────────────────────────────────

function CirclePath({ fill = BLUE, stroke = STROKE }: { fill?: string; stroke?: string }) {
  return <circle cx={50} cy={50} r={40} fill={fill} stroke={stroke} strokeWidth={2} />
}

// ─── Shield/Bell path (option C) ─────────────────────────────────────────────
// Rectangle body (top, left, right sides straight) with a rounded arc at bottom.
// From 035.jpg: taller-than-wide with the rounded bottom.

function ShieldPath({ fill = BLUE, stroke = STROKE }: { fill?: string; stroke?: string }) {
  // 65 wide, 80 tall, centred. Straight top + sides, semicircular bottom.
  const x = 17.5
  const y = 10
  const w = 65
  const r = w / 2  // radius = half-width
  const straightH = 50  // height of the straight-sided portion
  const d = [
    `M ${x} ${y}`,
    `L ${x + w} ${y}`,
    `L ${x + w} ${y + straightH}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + straightH}`,
    'Z',
  ].join(' ')
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
}

// ─── Rectangle (option D) ────────────────────────────────────────────────────

function RectPath({ fill = BLUE, stroke = STROKE }: { fill?: string; stroke?: string }) {
  // Wider-than-tall from 036.jpg — portrait rectangle
  return <rect x={20} y={12} width={60} height={76} fill={fill} stroke={stroke} strokeWidth={2} />
}

// ─── Three-leaf clover (option E) ─────────────────────────────────────────────
// Three overlapping circles arranged in a triangle (like a trefoil).
// From 037.jpg: three lobes close together, no stem.

function CloverPath({ fill = BLUE, stroke = STROKE }: { fill?: string; stroke?: string }) {
  // Three circles: top-left, top-right, bottom-centre, r=24 each, shifted so they overlap.
  const r = 25
  const cx = 50
  const cy = 50
  const offset = 18  // distance from centre to each circle's centre
  // Top-left lobe
  const lx = cx - offset * 0.866
  const ly = cy - offset * 0.5 - 6
  // Top-right lobe
  const rx2 = cx + offset * 0.866
  const ry2 = cy - offset * 0.5 - 6
  // Bottom lobe
  const bx = cx
  const by = cy + offset + 6

  return (
    <g>
      <circle cx={lx} cy={ly} r={r} fill={fill} stroke={stroke} strokeWidth={2} />
      <circle cx={rx2} cy={ry2} r={r} fill={fill} stroke={stroke} strokeWidth={2} />
      <circle cx={bx} cy={by} r={r} fill={fill} stroke={stroke} strokeWidth={2} />
    </g>
  )
}

// ─── Per-label shape map ──────────────────────────────────────────────────────

type Label = 'A' | 'B' | 'C' | 'D' | 'E'

const SHAPE_COMPONENTS: Record<Label, () => React.ReactElement> = {
  A: () => <HeartPath />,
  B: () => <CirclePath />,
  C: () => <ShieldPath />,
  D: () => <RectPath />,
  E: () => <CloverPath />,
}

const SHAPE_ARIA_EN: Record<Label, string> = {
  A: 'Option A: a heart shape.',
  B: 'Option B: a circle.',
  C: 'Option C: a shield or bell shape with straight sides and a rounded bottom.',
  D: 'Option D: a rectangle.',
  E: 'Option E: a three-leaf clover shape (three overlapping circles).',
}

// Note: SHAPE_ARIA_ID kept for future bilingual use; referenced by lang-aware callers.
const SHAPE_ARIA_ID: Record<Label, string> = {
  A: 'Pilihan A: bentuk hati.',
  B: 'Pilihan B: lingkaran.',
  C: 'Pilihan C: bentuk perisai atau lonceng dengan sisi lurus dan bagian bawah melengkung.',
  D: 'Pilihan D: persegi panjang.',
  E: 'Pilihan E: bentuk tiga daun semanggi (tiga lingkaran bertumpuk).',
}
// Export so callers (e.g. bilingual option components) can use the Indonesian labels.
export { SHAPE_ARIA_ID }

// ─── The 3 cut pieces as SVG paths ────────────────────────────────────────────
// From 032.jpg, three blue pieces on white background.
//
// The heart (100×90 viewport) can be cut into 3 pieces by two cuts:
//   Cut 1 (horizontal): across the waist of the left lobe → separates the
//          left half-lobe (piece 1, the curved quarter) from the rest.
//   Cut 2 (diagonal):   from the dip point down-right → separates the right
//          lobe (piece 2, a D-shape / half-disk) from the bottom triangle.
//
// Pieces (faithfully reconstructed from the scan):
//   Piece 1: top-left lobe — a quarter-circle arc shape with a diagonal cut edge.
//   Piece 2: right lobe — a D-shape (half-disk), flat edge on the left.
//   Piece 3: bottom triangle — a right triangle forming the bottom point.
//
// Each piece is its own <svg> so we can lay them side by side.

/** Piece 1 — the left lobe slice (big curved top-left with diagonal straight bottom). */
export function Piece1({ fill = BLUE, stroke = STROKE }: { fill?: string; stroke?: string }) {
  // In the assembled heart (50,82 to arcs), the left lobe occupies roughly:
  //   The curved portion left of x≈50 for y < 55, cut diagonally from (10,55) to (50,30).
  // Reconstructed as a self-contained piece in a 60×60 viewport.
  // Shape: starts at top (30,5), curves left/down as a quarter-arc, then diagonal line back.
  const d = [
    'M 30 5',          // top of the left lobe arc
    'C 5 5 5 25 5 35', // left arc curving down
    'C 5 48 12 55 30 58', // bottom of left lobe
    'L 55 20',         // diagonal cut edge going up-right
    'C 45 10 38 5 30 5', // closing arc back to top
    'Z',
  ].join(' ')
  return (
    <svg viewBox="0 0 60 65" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <path d={d} fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  )
}

/** Piece 2 — the right lobe (D-shape / half-disk). */
export function Piece2({ fill = BLUE, stroke = STROKE }: { fill?: string; stroke?: string }) {
  // D-shape: flat left + right half-circle. Centre at (10, 30), r=25.
  return (
    <svg viewBox="0 0 50 60" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <path
        d="M 10 5 L 10 55 A 25 25 0 0 0 10 5 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Piece 3 — the bottom triangle (right angle at bottom-left). */
export function Piece3({ fill = BLUE, stroke = STROKE }: { fill?: string; stroke?: string }) {
  // Right triangle: right angle bottom-left, hypotenuse from top-left to bottom-right.
  return (
    <svg viewBox="0 0 55 50" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <polygon
        points="5,5 5,45 50,45"
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Stem illustration ─────────────────────────────────────────────────────────

/**
 * Pieces19Illustration — shows the 3 cut pieces from the problem (NOT the answer).
 * The student must mentally reassemble these into a whole shape.
 */
export default function Pieces19Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga potongan berbentuk: (1) irisan lengkung dengan tepi diagonal, ' +
        '(2) setengah lingkaran (huruf D), ' +
        '(3) segitiga siku-siku. Bentuk utuh apa yang dipotong menjadi ketiga bagian ini?'
      }
    >
      <svg
        viewBox="0 0 280 100"
        width="280"
        style={{ display: 'block', background: BG }}
        aria-hidden="true"
      >
        {/* Piece 1 — curved quarter (left lobe) */}
        <g transform="translate(10, 10)">
          {/* Reconstructed from scan: large curve top-left, diagonal edge to right */}
          <path
            d="M 30 5 C 5 5 5 25 5 38 C 5 52 15 60 32 62 L 58 22 C 46 10 38 5 30 5 Z"
            fill={BLUE}
            stroke={STROKE}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </g>

        {/* Piece 2 — D-shape (half-disk), flat left edge */}
        <g transform="translate(100, 10)">
          {/* Centre of circle at (10, 40), r=38, clipped to right half */}
          <path
            d="M 10 2 L 10 78 A 38 38 0 0 0 10 2 Z"
            fill={BLUE}
            stroke={STROKE}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </g>

        {/* Piece 3 — right triangle */}
        <g transform="translate(180, 15)">
          <polygon
            points="5,5 5,72 72,72"
            fill={BLUE}
            stroke={STROKE}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  )
}

// ─── Option renderer ──────────────────────────────────────────────────────────

/**
 * Pieces19Option — renders one A/B/C/D/E choice as an SVG whole shape.
 * Registered in CHOICE_RENDERERS for IKMC-19-PE-Q19.
 */
export function Pieces19Option({ choice }: { choice: WmiChoice }) {
  const label = choice.label as Label
  const ShapeEl = SHAPE_COMPONENTS[label]
  if (!ShapeEl) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={SHAPE_ARIA_EN[label]}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}
    >
      <svg
        viewBox="0 0 100 100"
        width={80}
        height={80}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {ShapeEl()}
      </svg>
    </span>
  )
}
