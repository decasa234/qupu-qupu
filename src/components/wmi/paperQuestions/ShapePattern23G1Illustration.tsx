// WMI-23F1A-Q11 (2023 Grade 1 Final) — repeating shape pattern.
//
// Reconstructed pixel-for-pixel from db/seed/wmi/figures/2023-final-g1-a-q11.jpg.
// The strip is a horizontal repeating sequence; the scan shows three full
// repeats plus a trailing "……". Reading left to right, the repeating UNIT has
// FIVE shapes:
//
//   △ ▲ □ ☆ ★   (outline-triangle, FILLED-triangle, square, outline-star, FILLED-star)
//
// QUESTION: counting all shapes from the left, at which position is the ▲
// (filled triangle) that has exactly 12 star shapes (☆ AND ★) before it?
//
// SOLVER (throwaway, run with `npx tsx`, now deleted — see derivation below):
//   • Unit length = 5. Each unit contributes exactly 2 stars (☆ and ★), and the
//     ▲ is shape #2 within its unit, BEFORE that unit's two stars.
//   • So the stars before the ▲ of unit n (1-indexed) come only from units
//     1..(n-1): that is 2(n-1) stars.
//   • Need 2(n-1) = 12  ⇒  n - 1 = 6  ⇒  n = 7.
//   • The ▲ of unit 7 sits at position 5(7-1) + 2 = 30 + 2 = 32.
//   Enumerating the literal sequence confirms: the ▲ at global index 32 has
//   exactly 12 stars before it.  ANSWER = 32  (choice D). ✓
//
// The static figure draws ONLY the repeating strip (3 repeats + "……"). It NEVER
// reveals position 32 or marks the target ▲ — that is the animator's job, via the
// co-exported ShapePattern23G1 primitive (revealCountUpTo / markTriangleIndex).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// Shape colours sampled from the scan. Filled glyphs share the dark "ink".
const INK = '#2B2622' // filled triangle / filled star / outlines
const STAR_LABEL = '#30598A' // running star tally text (animator only)

/** One symbol in the unit. */
export type Glyph = 'otri' | 'ftri' | 'square' | 'ostar' | 'fstar'

/** The recovered repeating unit: △ ▲ □ ☆ ★. */
export const UNIT: readonly Glyph[] = ['otri', 'ftri', 'square', 'ostar', 'fstar']
export const UNIT_LEN = UNIT.length // 5

/** True for the two star glyphs (☆ and ★) the question counts. */
export function isStar(g: Glyph): boolean {
  return g === 'ostar' || g === 'fstar'
}

/** glyph at a 0-based global position in the infinite repeat. */
export function glyphAt(index0: number): Glyph {
  return UNIT[index0 % UNIT_LEN]
}

/** Stars (☆ + ★) strictly before the 0-based global position. */
export function starsBefore(index0: number): number {
  let n = 0
  for (let i = 0; i < index0; i++) if (isStar(glyphAt(i))) n++
  return n
}

/**
 * 1-based position of the ▲ that has exactly `target` stars before it.
 * (Derivation lives in the header; this is the closed form, verified by the
 * brute-force enumeration that produced 32.)
 */
export function triangleWithStarsBefore(target: number): number {
  // unit n (1-indexed) gives 2(n-1) stars before its ▲; solve 2(n-1)=target.
  const n = target / 2 + 1
  return UNIT_LEN * (n - 1) + 2 // ▲ is shape #2 within its unit
}

export const ANSWER = triangleWithStarsBefore(12) // 32

// ---- layout ----------------------------------------------------------------
const PAD_X = 14
const PAD_TOP = 18
const PAD_BOTTOM = 14
const SLOT = 40 // horizontal pitch per shape
const GLYPH = 26 // nominal glyph box
const ROW_Y = PAD_TOP + GLYPH / 2 // vertical centre of the glyph row
const ELLIPSIS_W = 34

/** Default static strip shows three full repeats, then an ellipsis. */
const STATIC_REPEATS = 3

// --- glyph paths (all centred on (cx, cy), identical everywhere) -------------

/** Equilateral-ish triangle pointing up, centred at (cx, cy). */
function trianglePoints(cx: number, cy: number, s: number): string {
  const h = (s * Math.sqrt(3)) / 2
  const top = `${cx},${(cy - h / 2).toFixed(2)}`
  const left = `${(cx - s / 2).toFixed(2)},${(cy + h / 2).toFixed(2)}`
  const right = `${(cx + s / 2).toFixed(2)},${(cy + h / 2).toFixed(2)}`
  return `${top} ${left} ${right}`
}

/** Five-pointed star path centred at (cx, cy). */
function starPath(cx: number, cy: number, rOut: number): string {
  const rIn = rOut * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOut : rIn
    const a = (-90 + i * 36) * (Math.PI / 180)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

/** Draw one glyph centred at (cx, cy). Identical rendering at every position. */
function GlyphMark({ g, cx, cy }: { g: Glyph; cx: number; cy: number }) {
  const triS = GLYPH
  const sqS = GLYPH * 0.78
  const starR = GLYPH * 0.56
  switch (g) {
    case 'otri':
      return <polygon points={trianglePoints(cx, cy, triS)} fill="none" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
    case 'ftri':
      return <polygon points={trianglePoints(cx, cy, triS)} fill={INK} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
    case 'square':
      return (
        <rect
          x={cx - sqS / 2}
          y={cy - sqS / 2}
          width={sqS}
          height={sqS}
          fill="none"
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      )
    case 'ostar':
      return <path d={starPath(cx, cy, starR)} fill="none" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
    case 'fstar':
      return <path d={starPath(cx, cy, starR)} fill={INK} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
  }
}

export interface ShapePattern23G1Props {
  /**
   * Animator only — render the running star count under each shape, for every
   * position strictly LEFT of this 1-based bound (i.e. the tally "before" that
   * position). Omit/undefined ⇒ no numbers (the static figure default).
   */
  revealCountUpTo?: number
  /**
   * Animator only — 1-based global position of a ▲ to ring (the target). Null
   * or undefined ⇒ nothing marked (the static figure default).
   */
  markTriangleIndex?: number | null
  /** How many shapes to draw before the trailing "……". */
  length?: number
}

/**
 * Bare repeating strip primitive, with optional post-answer overlays. By itself
 * it reveals nothing about the target position — both overlay props default off.
 */
export function ShapePattern23G1({
  revealCountUpTo,
  markTriangleIndex = null,
  length = STATIC_REPEATS * UNIT_LEN,
}: ShapePattern23G1Props = {}) {
  const count = Math.max(1, Math.floor(length))
  const stripW = count * SLOT
  const viewW = PAD_X * 2 + stripW + ELLIPSIS_W
  const labelRow = revealCountUpTo != null
  const viewH = PAD_TOP + GLYPH + (labelRow ? 20 : 0) + PAD_BOTTOM
  const x0 = PAD_X + SLOT / 2

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} width={Math.min(320, viewW)} aria-hidden="true">
      {/* the shapes, left to right */}
      {Array.from({ length: count }, (_, i) => {
        const g = glyphAt(i)
        const cx = x0 + i * SLOT
        const pos1 = i + 1 // 1-based global position
        const isTarget = markTriangleIndex != null && pos1 === markTriangleIndex && g === 'ftri'
        return (
          <g key={i}>
            {isTarget && (
              <circle cx={cx} cy={ROW_Y} r={GLYPH * 0.92} fill="rgba(240,133,58,0.16)" stroke="#f0853a" strokeWidth={3} />
            )}
            <GlyphMark g={g} cx={cx} cy={ROW_Y} />
            {labelRow && revealCountUpTo != null && pos1 < revealCountUpTo && isStar(g) && (
              <text
                x={cx}
                y={ROW_Y + GLYPH / 2 + 16}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill={STAR_LABEL}
              >
                {starsBefore(pos1)}
              </text>
            )}
          </g>
        )
      })}

      {/* trailing ellipsis showing the pattern continues */}
      <text
        x={PAD_X + stripW + ELLIPSIS_W / 2}
        y={ROW_Y + 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={24}
        fontWeight={800}
        fill={INK}
      >
        ……
      </text>
    </svg>
  )
}

/** Default export: bare repeating strip (3 repeats + ellipsis), no answer shown. */
export default function ShapePattern23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Pola berulang dari kiri ke kanan: segitiga garis, segitiga hitam, persegi, bintang garis, bintang hitam — lalu berulang lagi, dan seterusnya (……). Cari posisi segitiga hitam yang tepat memiliki 12 bintang sebelumnya."
    >
      <ShapePattern23G1 />
    </div>
  )
}
