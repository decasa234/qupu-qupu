// In-card illustration for WMI-24F2A-Q13 (2024 Grade-2 Final, HARD).
//
// The printed stem shows a single elaborate tangram arrangement — a stylised
// "W"/crown figure built from seven flat pieces (triangles, a square and a
// parallelogram). The question text ("five figures spelling WMI24, which has
// the most right angles?") refers to the FIVE answer options W, M, I, 2, 4,
// each itself a small tangram figure. So this file ships two things:
//
//   * Tangram24G2Illustration — the stem target figure, reconstructed faithfully
//     from db/seed/wmi/figures/2024-final-g2-a-q13.jpg on a 20x20 grid (y down).
//   * Tangram24G2Option — the CHOICE renderer: given one option's label it draws
//     that tangram letter/digit, so answer chips show the figure, not a letter.
//
// All geometry is hard data (no params, no randomness) so it is SSR-safe and
// deterministic. The static figure NEVER marks which option wins — counting the
// right angles is the solver's job; revealing the answer is the animator's.


type Pt = [number, number]

// ---------------------------------------------------------------------------
// STEM FIGURE — the seven tangram pieces of the target "W" arrangement.
// Coordinates live on a 20x20 grid (origin top-left, y increases downward),
// traced from the scan. Each piece is a closed polygon; we also draw the outer
// silhouette so every visible edge of the original print is reproduced.
// ---------------------------------------------------------------------------
export const STEM_PIECES24G2: Pt[][] = [
  // 1. Left top triangle (apex up-right, hypotenuse down to the square corner).
  [[5, 0], [5, 5], [1, 5]],
  // 2. Left square.
  [[1, 5], [5, 5], [5, 10], [1, 10]],
  // 3. Centre top triangle (the middle peak of the W).
  [[10, 5], [15, 10], [5, 10]],
  // 4. Right tower — top parallelogram-triangle.
  [[15, 0], [20, 5], [15, 5]],
  // 5. Right tower — lower-right triangle.
  [[15, 5], [20, 5], [20, 10]],
  // 6. Right tower — lower-left triangle.
  [[15, 5], [20, 10], [15, 10]],
  // 7a. Bottom-left big right triangle.
  [[0, 10], [0, 20], [10, 10]],
  // 7b. Bottom-right big right triangle.
  [[20, 10], [20, 20], [10, 10]],
]

// The closed outer silhouette, so the rim is a single clean stroke.
const STEM_OUTLINE: Pt[] = [
  [5, 0],
  [1, 5],
  [1, 10],
  [0, 10],
  [0, 20],
  [10, 10],
  [20, 20],
  [20, 10],
  [15, 10],
  [15, 0],
  [20, 5],
  [20, 10],
]

function ptsToString(pts: Pt[], s: number, ox: number, oy: number): string {
  return pts.map(([x, y]) => `${ox + x * s},${oy + y * s}`).join(' ')
}

// The stem target figure for the problem card. No box — sits in the card.
export function Tangram24G2Illustration() {
  const GRID = 20
  const PAD = 10
  const S = 12 // grid unit -> px
  const inner = GRID * S
  const W = inner + PAD * 2
  const H = inner + PAD * 2

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Gambar tangram berbentuk seperti huruf W: menara segitiga dan persegi di kiri, puncak segitiga di tengah, jajar genjang bertingkat di kanan, dan dua segitiga besar di bawah yang bertemu di puncak tengah."
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={Math.min(280, W)}
        style={{ display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Filled pieces (cream) so the tangram reads as a solid figure. */}
        {STEM_PIECES24G2.map((piece, i) => (
          <polygon
            key={i}
            points={ptsToString(piece, S, PAD, PAD)}
            className="fill-qupu-cream stroke-qupu-brand-orange"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        ))}
        {/* Outer silhouette redrawn a touch heavier for a crisp rim. */}
        <polygon
          points={ptsToString(STEM_OUTLINE, S, PAD, PAD)}
          fill="none"
          className="stroke-qupu-brand-orange"
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CHOICE FIGURES — each option is a tangram letter/digit drawn in its own
// 0..10 box (y down). Polygons only (triangles, squares, parallelograms), so
// every glyph looks tangram-built. Co-exported so an explainer can reuse them.
// ---------------------------------------------------------------------------
export type Tangram24Label = 'A' | 'B' | 'C' | 'D' | 'E'

// label -> the letter/digit the option spells, in WMI24 order.
export const TANGRAM24_GLYPH: Record<Tangram24Label, string> = {
  A: 'W',
  B: 'M',
  C: 'I',
  D: '2',
  E: '4',
}

const GLYPH_ARIA_ID: Record<Tangram24Label, string> = {
  A: 'huruf W dari kepingan tangram',
  B: 'huruf M dari kepingan tangram',
  C: 'huruf I dari kepingan tangram',
  D: 'angka 2 dari kepingan tangram',
  E: 'angka 4 dari kepingan tangram',
}

// Each glyph as a list of tangram polygons on a 0..10 grid (y down).
export const TANGRAM24_PIECES: Record<Tangram24Label, Pt[][]> = {
  // W — two V-troughs: four slanted bars meeting at a centre peak.
  A: [
    [[0, 1], [2, 1], [3.4, 9], [1.4, 9]],
    [[1.4, 9], [3.4, 9], [5, 4]],
    [[5, 4], [6.6, 9], [8.6, 9]],
    [[8, 1], [10, 1], [8.6, 9], [6.6, 9]],
  ],
  // M — two upright posts plus a centre V (the figure with the most right angles).
  B: [
    [[0, 1], [2.2, 1], [2.2, 9], [0, 9]],
    [[7.8, 1], [10, 1], [10, 9], [7.8, 9]],
    [[2.2, 1], [4.2, 1], [5, 5]],
    [[5, 5], [5.8, 1], [7.8, 1]],
  ],
  // I — a rectangular centre stem (4 square corners) between two trapezoid bars
  // whose tips are tangram-slanted (no square corners) → 4 in total, < M's 8.
  C: [
    [[2, 1], [8, 1], [6.8, 2.8], [3.2, 2.8]],
    [[3.8, 2.8], [6.2, 2.8], [6.2, 7.2], [3.8, 7.2]],
    [[3.2, 7.2], [6.8, 7.2], [8, 9], [2, 9]],
  ],
  // 2 — a top bar with a slanted left tip (2 square corners at its right end),
  // a long diagonal (0), and a rectangular base bar (4) → 6 in total, < M's 8.
  D: [
    [[3, 1], [8.5, 1], [8.5, 2.8], [1.5, 2.8]],
    [[6.7, 2.8], [8.5, 2.8], [3.3, 7.2], [1.5, 7.2]],
    [[1.5, 7.2], [8.5, 7.2], [8.5, 9], [1.5, 9]],
  ],
  // 4 — a slanted stroke (0), an upright rectangular stem (4 square corners),
  // and a cross-bar with slanted left tip tucked under the stem → 4 in total.
  E: [
    [[5, 1], [6.6, 1], [2.4, 6], [0.8, 6]],
    [[6.6, 1], [8.4, 1], [8.4, 9], [6.6, 9]],
    [[1.9, 6], [6.6, 6], [6.6, 7.6], [0.8, 7.6]],
  ],
}

function GlyphSvg({ label, size }: { label: Tangram24Label; size: number }) {
  const pieces = TANGRAM24_PIECES[label]
  const PAD = 0.8
  const S = size / (10 + PAD * 2)
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {pieces.map((piece, i) => (
        <polygon
          key={i}
          points={ptsToString(piece, S, PAD * S, PAD * S)}
          className="fill-qupu-cream stroke-qupu-brand-orange"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

// CHOICE_RENDERERS component: draws ONE option's tangram glyph given its label.
// Falls back to plain choice text for any label we don't know how to draw.
export function Tangram24G2Option({ choice }: { choice: WmiChoiceLike }) {
  const label = (choice?.label ?? '') as Tangram24Label
  if (!TANGRAM24_PIECES[label]) return <span>{choice?.text}</span>
  return (
    <span
      role="img"
      aria-label={GLYPH_ARIA_ID[label]}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <GlyphSvg label={label} size={64} />
    </span>
  )
}

// Minimal structural type so this file does not depend on the wmi types module.
type WmiChoiceLike = { label?: string; text?: string }

export default Tangram24G2Illustration
