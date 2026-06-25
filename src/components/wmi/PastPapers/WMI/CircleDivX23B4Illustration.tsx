/**
 * SEAMOX-23-B-Q4 — "A straight line divides a circle into 2 parts as shown below.
 * Into how many parts can 6 lines divide the circle?"
 *
 * Source: docs/reference/ocr-res/seamo-x/contest/paper-b/2023.md Q4
 * Image: 2023.imgs/001.jpg — circle with one diagonal chord, lower-left to upper-right.
 * Answer: 22  (formula: 1 + n + C(n,2), n = 6 → 1 + 6 + 15 = 22)
 *
 * STEM: circle with 1 chord matching the source image.
 * Named export `CircleDivSVG` is shared with the explainer (renders first N chords).
 *
 * No primitive covers a plain circle-chord figure — fresh SVG, SSR-safe.
 */

// ── geometry ──────────────────────────────────────────────────────────────────

export const VW = 200
export const VH = 200

const CX = 100
const CY = 100
const R  = 80

/** One chord: angle from horizontal (degrees) + signed perpendicular offset (px). */
export interface ChordDef { angleDeg: number; offset: number }

/**
 * Six chords arranged so every pair of chords intersects inside the circle
 * (maximum-region configuration).  The first chord matches the source image
 * (diagonal from lower-left to upper-right ≈ 135°).
 */
export const CHORDS: ChordDef[] = [
  { angleDeg: 135, offset:   0 },   // Line 1 — matches source image
  { angleDeg:  60, offset:   8 },   // Line 2
  { angleDeg: 100, offset:  12 },   // Line 3
  { angleDeg:  25, offset: -10 },   // Line 4
  { angleDeg: 150, offset:   6 },   // Line 5
  { angleDeg:  75, offset:  -8 },   // Line 6
]

/**
 * Chord endpoints for a chord at `angleDeg` with perpendicular offset `offset`
 * inside a circle at (cx, cy) with radius r.
 * Returns [x1, y1, x2, y2].
 */
export function chordEndpoints(
  cx: number, cy: number, r: number,
  angleDeg: number, offset: number,
): [number, number, number, number] {
  const rad  = (angleDeg * Math.PI) / 180
  const cos  = Math.cos(rad)
  const sin  = Math.sin(rad)
  // Shift the midpoint of the chord perpendicularly by `offset`
  const midX = cx - offset * sin
  const midY = cy + offset * cos
  const halfLen = Math.sqrt(Math.max(0, r * r - offset * offset))
  return [
    midX - halfLen * cos,
    midY - halfLen * sin,
    midX + halfLen * cos,
    midY + halfLen * sin,
  ]
}

// ── Shared SVG primitive ───────────────────────────────────────────────────────

export interface CircleDivSVGProps {
  /** How many chords to draw (1–6). Default 1 = stem figure. */
  lineCount?: number
}

/**
 * Circle with the first `lineCount` chords drawn.
 * Root `<svg>` — SSR-safe, no hooks.
 */
export function CircleDivSVG({ lineCount = 1 }: CircleDivSVGProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Circle */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="#F9FAFB"
        stroke="#1F2937"
        strokeWidth={2}
      />

      {/* Chords */}
      {CHORDS.slice(0, lineCount).map((ch, i) => {
        const [x1, y1, x2, y2] = chordEndpoints(CX, CY, R, ch.angleDeg, ch.offset)
        return (
          <line
            key={i}
            x1={x1.toFixed(2)} y1={y1.toFixed(2)}
            x2={x2.toFixed(2)} y2={y2.toFixed(2)}
            stroke="#1F2937"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

// ── Default export: stem illustration ─────────────────────────────────────────

/**
 * SEAMOX-23-B-Q4 stem illustration.
 * Shows a circle divided by ONE diagonal chord into 2 parts (matching source image).
 */
export default function CircleDivX23B4Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'A circle with one diagonal straight line dividing it into 2 regions. ' +
        'Sebuah lingkaran dengan satu garis diagonal membaginya menjadi 2 bagian.'
      }
    >
      <CircleDivSVG lineCount={1} />
    </div>
  )
}
