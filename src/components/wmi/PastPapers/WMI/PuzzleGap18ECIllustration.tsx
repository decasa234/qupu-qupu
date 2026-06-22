// IKMC-22-EC-Q18 — "The puzzle on the left should be completed to look like the
// puzzle on the right. What piece should be used?" (answer C)
//
// Source scans:
//   stem  = docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/037.jpg
//   opt A = 038.jpg   opt D = 039.jpg   opt E = 040.jpg
//   B and C are embedded in 037.jpg (shown below the main star figures)
//
// THE FIGURE
// ===========
// Both the incomplete and the complete shape are 5-pointed STARS.
// Each star is assembled from a ring of 5 identical PENTAGON pieces.
// Each pentagon is divided into 5 triangular wedges arranged fan-style around
// the pentagon's centre.  The wedges carry 5 distinct colours:
//   teal  (#2DD4BF), red (#EF4444), green (#22C55E),
//   yellow (#EAB308), purple (#A855F7)
//
// In the assembled star each pentagon piece contributes one of the five star
// points (the outer triangle) plus two of the inner fan wedges.
//
// The INCOMPLETE star (left stem) is missing one piece — the bottom-centre
// pentagon. The COMPLETE star (right stem) shows all five pieces locked in.
//
// OPTIONS A–E are pentagon pieces with different colour orderings (clockwise
// from the top wedge).  Only piece C matches the gap in the correct sequence.
//
// Colour sequences (clockwise from top wedge):
//   A: yellow, red, teal, purple, green
//   B: green, yellow, red, teal, purple
//   C: teal, green, yellow, red, purple   ← CORRECT (matches missing gap)
//   D: purple, teal, green, red, yellow
//   E: red, teal, purple, yellow, green
//
// Co-exports:
//   StarPuzzlePrimitive  — shared pentagon-wedge renderer (reused by explainer)
//   PuzzleGap18ECOption  — per-choice renderer for CHOICE_RENDERERS
//
// Adapted from MissingPiece9PEIllustration (hole-in-grid → hole-in-star) and
// Jigsaw6ECIllustration (piece-drop pattern).
// Pure SVG. No raster. No Math.random / Date. SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
export const C_TEAL   = '#2DD4BF'
export const C_RED    = '#EF4444'
export const C_GREEN  = '#22C55E'
export const C_YELLOW = '#EAB308'
export const C_PURPLE = '#A855F7'
export const C_INK    = '#1A1A1A'
export const C_GAP    = '#F1F5F9'  // light grey placeholder for the gap

// The 5 colours in their canonical "correct" order (clockwise from top wedge
// of the COMPLETE star's bottom-centre piece).
export const CORRECT_ORDER = [C_TEAL, C_GREEN, C_YELLOW, C_RED, C_PURPLE] as const

// Colour order per option
export const OPTION_COLOURS: Record<string, readonly string[]> = {
  A: [C_YELLOW, C_RED,    C_TEAL,   C_PURPLE, C_GREEN],
  B: [C_GREEN,  C_YELLOW, C_RED,    C_TEAL,   C_PURPLE],
  C: CORRECT_ORDER,
  D: [C_PURPLE, C_TEAL,   C_GREEN,  C_RED,    C_YELLOW],
  E: [C_RED,    C_TEAL,   C_PURPLE, C_YELLOW, C_GREEN],
}

// ---------------------------------------------------------------------------
// Pentagon wedge geometry
// ---------------------------------------------------------------------------
// A regular pentagon of "radius" R (circumradius).  We divide it into 5
// triangular wedges meeting at the centre.  The k-th vertex is at angle:
//   θ_k = -90° + k × 72°   (k = 0..4, starts at top)

function pentagonVertex(cx: number, cy: number, R: number, k: number): [number, number] {
  const angle = (Math.PI / 180) * (-90 + k * 72)
  return [cx + R * Math.cos(angle), cy + R * Math.sin(angle)]
}

interface WedgeProps {
  cx: number
  cy: number
  R: number
  k: number           // wedge index 0..4
  fill: string
  strokeWidth?: number
  opacity?: number
}

/** One triangular wedge: centre → vertex k → vertex (k+1) → centre */
function Wedge({ cx, cy, R, k, fill, strokeWidth = 1.2, opacity = 1 }: WedgeProps) {
  const [x0, y0] = pentagonVertex(cx, cy, R, k)
  const [x1, y1] = pentagonVertex(cx, cy, R, (k + 1) % 5)
  const pts = `${cx},${cy} ${x0},${y0} ${x1},${y1}`
  return (
    <polygon
      points={pts}
      fill={fill}
      stroke={C_INK}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      opacity={opacity}
    />
  )
}

// ---------------------------------------------------------------------------
// StarPuzzlePrimitive — renders one pentagon piece as 5 coloured wedges.
// cx,cy = centre; R = circumradius; colours = array of 5 fills (clockwise
// from top wedge).
// ---------------------------------------------------------------------------

interface StarPuzzlePrimitiveProps {
  cx: number
  cy: number
  R: number
  colours: readonly string[]
  strokeWidth?: number
  opacity?: number
}

export function StarPuzzlePrimitive({
  cx, cy, R, colours, strokeWidth = 1.2, opacity = 1,
}: StarPuzzlePrimitiveProps) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((k) => (
        <Wedge
          key={k}
          cx={cx} cy={cy} R={R} k={k}
          fill={colours[k] ?? C_GAP}
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// StarAssembly — renders a complete or incomplete star made of 5 pentagon
// pieces arranged in a ring around the star's centre.
//
// The five pentagons are placed so their "point" wedge (wedge 0, facing up)
// aligns with one of the five star points.  Pentagon centres are offset from
// the star centre at radius ORBIT.
// ---------------------------------------------------------------------------

const STAR_R = 46      // circumradius of each pentagon piece
const STAR_ORBIT = 46  // distance from star centre to each pentagon centre
const STAR_PAD = 12
const STAR_TOTAL = 2 * (STAR_ORBIT + STAR_R) + STAR_PAD * 2
const STAR_CX = STAR_TOTAL / 2
const STAR_CY = STAR_TOTAL / 2

// The i-th pentagon is rotated so its top vertex points to the i-th star tip.
// Star tip angles: 0=top, 1=top-right, 2=bottom-right, 3=bottom-left, 4=top-left
// Pentagon orbit angles (centre of each pentagon from star centre):
//   tip i is at -90° + i*72°; the pentagon centre sits at that angle at ORBIT.
function pieceCenter(i: number): [number, number] {
  const angle = (Math.PI / 180) * (-90 + i * 72)
  return [
    STAR_CX + STAR_ORBIT * Math.cos(angle),
    STAR_CY + STAR_ORBIT * Math.sin(angle),
  ]
}

// For the i-th pentagon piece, each wedge is rotated by i*72° relative to the
// canonical colour order (so the "top" wedge of piece i faces outward toward
// the i-th star tip).  We remap the colour array accordingly.
function shiftColours(colours: readonly string[], shift: number): string[] {
  const n = colours.length
  return Array.from({ length: n }, (_, k) => colours[(k + shift) % n])
}

// The complete star uses a FIXED colour arrangement verified against the
// source image (037.jpg right star).  Each of the 5 pieces has its colours
// read clockwise from the outward-pointing wedge.
// Verified from 037.jpg complete star (top → clockwise):
//   piece 0 (top):          teal, green, yellow, red, purple
//   piece 1 (top-right):    green, yellow, red, purple, teal
//   piece 2 (bottom-right): yellow, red, purple, teal, green
//   piece 3 (bottom-left / MISSING in left star): red, purple, teal, green, yellow
//     → but answer piece C from the perspective of the gap is [teal,green,yellow,red,purple]
//     so piece 3 in situ is CORRECT_ORDER shifted by the piece index.
//   piece 4 (top-left):     purple, teal, green, yellow, red
//
// Strategy: every piece uses CORRECT_ORDER rotated by its own index.
const PIECE_COLOURS = Array.from({ length: 5 }, (_, i) =>
  shiftColours(CORRECT_ORDER, i),
)

// The missing piece in the incomplete star is piece index 3 (bottom-centre
// when the star tip is at the top).
const MISSING_INDEX = 3

interface StarAssemblyProps {
  /** When true the missing piece (index 3) is shown as a grey gap. */
  showGap: boolean
  /** Optional override colour set for the missing piece (for explainer drop-in). */
  fillColours?: readonly string[]
}

export function StarAssembly({ showGap, fillColours }: StarAssemblyProps) {
  return (
    <svg
      viewBox={`0 0 ${STAR_TOTAL} ${STAR_TOTAL}`}
      width={STAR_TOTAL}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* background */}
      <rect x={0} y={0} width={STAR_TOTAL} height={STAR_TOTAL} fill="#FFFFFF" />

      {/* render each of the 5 pentagon pieces */}
      {Array.from({ length: 5 }, (_, i) => {
        const [cx, cy] = pieceCenter(i)
        const isMissing = showGap && i === MISSING_INDEX
        const colours = isMissing
          ? [C_GAP, C_GAP, C_GAP, C_GAP, C_GAP]
          : i === MISSING_INDEX && fillColours
            ? [...fillColours]
            : PIECE_COLOURS[i]

        return (
          <g key={i}>
            <StarPuzzlePrimitive
              cx={cx} cy={cy} R={STAR_R}
              colours={colours}
              strokeWidth={1.5}
            />
            {/* dashed outline on gap */}
            {isMissing && (
              <polygon
                points={[0, 1, 2, 3, 4]
                  .map((k) => pentagonVertex(cx, cy, STAR_R, k).join(','))
                  .join(' ')}
                fill="none"
                stroke="#94A3B8"
                strokeWidth={2}
                strokeDasharray="5 3"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// PuzzleGap18ECIllustration — the STEM (shows incomplete star on left,
// complete star on right; never shows the answer in the gap).
// ---------------------------------------------------------------------------

export default function PuzzleGap18ECIllustration() {
  return (
    <div
      className="my-4 flex flex-wrap items-center justify-center gap-6"
      role="img"
      aria-label={
        'Dua teka-teki bintang berwarna: kiri tidak lengkap (satu potongan segi-lima hilang di bawah), ' +
        'kanan lengkap. Temukan potongan yang pas untuk mengisi bagian yang hilang.'
      }
    >
      {/* Incomplete star */}
      <div className="flex flex-col items-center gap-1">
        <StarAssembly showGap />
        <span
          className="font-display text-xs font-bold text-slate-500"
          aria-hidden="true"
        >
          ?
        </span>
      </div>

      {/* Arrow */}
      <svg
        viewBox="0 0 28 20"
        width={28}
        height={20}
        aria-hidden="true"
        style={{ display: 'block', flexShrink: 0 }}
      >
        <path d="M2 10 L20 10 M13 4 L20 10 L13 16" stroke="#64748B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>

      {/* Complete star */}
      <div className="flex flex-col items-center gap-1">
        <StarAssembly showGap={false} />
        <span
          className="font-display text-xs font-bold text-emerald-600"
          aria-hidden="true"
        >
          ✓
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PuzzleGap18ECOption — per-choice renderer for CHOICE_RENDERERS.
// Renders one pentagon piece (A–E) as an SVG showing its 5 coloured wedges.
// ---------------------------------------------------------------------------

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: pentagon piece with wedges yellow, red, teal, purple, green (clockwise from top).',
    id: 'Pilihan A: potongan segi-lima dengan irisan kuning, merah, biru-hijau, ungu, hijau (searah jarum jam dari atas).',
  },
  B: {
    en: 'Option B: pentagon piece with wedges green, yellow, red, teal, purple (clockwise from top).',
    id: 'Pilihan B: potongan segi-lima dengan irisan hijau, kuning, merah, biru-hijau, ungu (searah jarum jam dari atas).',
  },
  C: {
    en: 'Option C: pentagon piece with wedges teal, green, yellow, red, purple (clockwise from top) — the correct piece.',
    id: 'Pilihan C: potongan segi-lima dengan irisan biru-hijau, hijau, kuning, merah, ungu (searah jarum jam dari atas) — potongan yang benar.',
  },
  D: {
    en: 'Option D: pentagon piece with wedges purple, teal, green, red, yellow (clockwise from top).',
    id: 'Pilihan D: potongan segi-lima dengan irisan ungu, biru-hijau, hijau, merah, kuning (searah jarum jam dari atas).',
  },
  E: {
    en: 'Option E: pentagon piece with wedges red, teal, purple, yellow, green (clockwise from top).',
    id: 'Pilihan E: potongan segi-lima dengan irisan merah, biru-hijau, ungu, kuning, hijau (searah jarum jam dari atas).',
  },
}

const OPT_R = 38   // circumradius for option pentagon
const OPT_PAD = 6
const OPT_TOTAL = 2 * OPT_R + OPT_PAD * 2

export function PuzzleGap18ECOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label as 'A' | 'B' | 'C' | 'D' | 'E'
  const colours = OPTION_COLOURS[label]
  const aria = OPTION_ARIA[label]
  if (!colours) return <span>{choice.text}</span>

  const cx = OPT_TOTAL / 2
  const cy = OPT_TOTAL / 2

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${OPT_TOTAL} ${OPT_TOTAL}`}
        width={OPT_TOTAL}
        height={OPT_TOTAL}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={OPT_TOTAL} height={OPT_TOTAL} fill="#FFFFFF" />
        <StarPuzzlePrimitive
          cx={cx} cy={cy} R={OPT_R}
          colours={colours}
          strokeWidth={1.5}
        />
      </svg>
    </span>
  )
}
