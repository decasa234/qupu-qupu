// WMI-25F1A-Q12 (2025 Grade 1 Final).
// Observe the pattern of the numbers in the figure. What number replaces the "?".
//
// Layout (faithful to the source scan db/seed/wmi/figures/2025-final-g1-a-q12.jpg):
// a horizontal chain of four diamonds (squares rotated 45°). Adjacent diamonds
// touch at their pointed tips so the chain reads continuously. Each diamond has
// a vertical center line splitting it into a LEFT and a RIGHT triangle, each
// holding one number. In reading order the numbers are:
//   19 | 3   16 | 4   12 | 6   ? | (empty)
//
// Pattern (NOT shown in the static figure): the first number of each pair minus
// the second equals the first number of the next pair —
//   19 − 3 = 16,   16 − 4 = 12,   12 − 6 = 6.   So ? = 6 (choice B).
//
// The default export draws ONLY the bare numbers + the "?" cell — never the
// answer. The `NumberPattern25G1` primitive is co-exported so the post-answer
// animator can light the subtraction chain step-by-step and fill the "?".
//
// Pure render, SSR-safe, deterministic — no random, no dates, no effects.

// --- the figure's data -------------------------------------------------------
// Each entry is one diamond's [leftTriangle, rightTriangle] number. The final
// diamond's left triangle is the unknown ("?"), its right triangle is empty.
export const DIAMOND_PAIRS: ReadonlyArray<readonly [number | null, number | null]> = [
  [19, 3],
  [16, 4],
  [12, 6],
  [null, null], // [?, empty]
]

// The full subtraction chain (animator reveal only): firstOfPair − secondOfPair
// = firstOfNextPair. The last result fills the "?".
export const CHAIN_STEPS = [
  { a: 19, b: 3, result: 16 },
  { a: 16, b: 4, result: 12 },
  { a: 12, b: 6, result: 6 },
] as const

export const ANSWER = 6 // value that replaces "?" (NOT drawn statically)

// --- palette (qupu-* tokens expressed as raw hex, per the card reference) -----
const INK = '#1F2937' // qupu ink / slate — line work + printed numbers
const ORANGE_FILL = 'rgba(240,133,58,0.18)' // lit-triangle wash
const BLUE = '#30598A' // qupu-brand-blue
const BLUE_FILL = 'rgba(48,89,138,0.16)' // reveal wash for the "?" cell
const QMARK = '#9CA3AF' // faint placeholder color for the "?"

// --- layout ------------------------------------------------------------------
// Diamond half-width (horizontal radius) and half-height (vertical radius).
const HW = 56
const HH = 44
const PAD_X = 10
const PAD_Y = 10
const STROKE = 2

// Adjacent diamonds share a tip: the right tip of diamond i sits exactly on the
// left tip of diamond i+1, so the centers step by HW (not 2*HW).
const STEP = HW
const N = DIAMOND_PAIRS.length

// Center of diamond i.
const cx = (i: number) => PAD_X + HW + i * STEP
const CY = PAD_Y + HH

export const NP25_VIEW_W = PAD_X * 2 + HW + (N - 1) * STEP + HW
export const NP25_VIEW_H = PAD_Y * 2 + HH * 2

// Triangle centroid for placing a number inside the left or right half of a
// diamond. The split is the vertical center line; each half is a triangle whose
// centroid sits ~HW/3 from the center line, vertically centered.
const leftNumX = (i: number) => cx(i) - HW / 3
const rightNumX = (i: number) => cx(i) + HW / 3
const NUM_Y = CY

// Path for one full diamond (clockwise from the left tip).
function diamondPath(i: number): string {
  const x = cx(i)
  const t = x - HW // left tip
  const r = x + HW // right tip
  return `M ${t} ${CY} L ${x} ${CY - HH} L ${r} ${CY} L ${x} ${CY + HH} Z`
}

// Path for the LEFT triangle of diamond i (left tip → top → bottom).
function leftTriPath(i: number): string {
  const x = cx(i)
  const t = x - HW
  return `M ${t} ${CY} L ${x} ${CY - HH} L ${x} ${CY + HH} Z`
}

// Path for the RIGHT triangle of diamond i (top → right tip → bottom).
function rightTriPath(i: number): string {
  const x = cx(i)
  const r = x + HW
  return `M ${x} ${CY - HH} L ${r} ${CY} L ${x} ${CY + HH} Z`
}

export interface NumberPattern25G1Props {
  /**
   * Reveal the answer (6) inside the "?" cell instead of the "?" glyph.
   * The animator flips this on once the chain has been walked.
   */
  revealAnswer?: boolean
  /**
   * Light one subtraction step (0-based index into CHAIN_STEPS) to show
   *   first − second = nextFirst.
   * Step k tints the right triangle of diamond k (the "− second") and both the
   * left triangle of diamond k (the "first") and the left triangle of diamond
   * k+1 (the result "= nextFirst"). Pass null/undefined for the bare figure.
   * Step 2 lighting the final result lands on the "?" cell.
   */
  litStep?: number | null
}

/**
 * Primitive for the animator. Default render (no props) = the four bare
 * diamonds with 19, 3, 16, 4, 12, 6 and a "?" in the last left triangle, last
 * right triangle empty. `litStep` tints the triangles of one subtraction step;
 * `revealAnswer` fills the "?" with 6.
 */
export function NumberPattern25G1({ revealAnswer = false, litStep = null }: NumberPattern25G1Props = {}) {
  const step =
    typeof litStep === 'number' && litStep >= 0 && litStep < CHAIN_STEPS.length ? litStep : null

  // Which (diamond, side) cells are tinted for the active step.
  // side: 'L' = left triangle, 'R' = right triangle.
  const litCells = new Set<string>()
  let litColor = ORANGE_FILL
  if (step !== null) {
    litCells.add(`${step}-L`) // the "first" number
    litCells.add(`${step}-R`) // the "− second" number
    litCells.add(`${step + 1}-L`) // the "= next first" result (step 2 → the "?" cell)
    litColor = ORANGE_FILL
  }

  // The "?" cell (last diamond, left triangle) is special: it can be revealed.
  const lastIdx = N - 1
  const qLit = step === CHAIN_STEPS.length - 1 // step 2 result lands here

  return (
    <svg
      viewBox={`0 0 ${NP25_VIEW_W} ${NP25_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* lit-triangle washes (drawn first, under the line work) */}
      {DIAMOND_PAIRS.map((_, i) => {
        const cells: Array<{ side: 'L' | 'R'; d: string }> = [
          { side: 'L', d: leftTriPath(i) },
          { side: 'R', d: rightTriPath(i) },
        ]
        return cells.map(({ side, d }) => {
          const isQ = i === lastIdx && side === 'L'
          const lit = litCells.has(`${i}-${side}`)
          if (isQ && (revealAnswer || qLit)) {
            return <path key={`fill-${i}-${side}`} d={d} fill={BLUE_FILL} stroke="none" />
          }
          if (!lit) return null
          return <path key={`fill-${i}-${side}`} d={d} fill={litColor} stroke="none" />
        })
      })}

      {/* diamond outlines + vertical split lines */}
      {DIAMOND_PAIRS.map((_, i) => (
        <g key={`dia-${i}`}>
          <path d={diamondPath(i)} fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <line
            x1={cx(i)}
            y1={CY - HH}
            x2={cx(i)}
            y2={CY + HH}
            stroke={INK}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* printed numbers (left + right of each diamond) */}
      {DIAMOND_PAIRS.map((pair, i) => {
        const [left, right] = pair
        const isLastQ = i === lastIdx
        return (
          <g key={`num-${i}`}>
            {/* left triangle number, or the "?" / revealed answer on the last diamond */}
            {left !== null ? (
              <text
                x={leftNumX(i)}
                y={NUM_Y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-display"
                fontSize={26}
                fontWeight={800}
                fill={INK}
              >
                {left}
              </text>
            ) : isLastQ ? (
              <text
                x={leftNumX(i)}
                y={NUM_Y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-display"
                fontSize={26}
                fontWeight={900}
                fill={revealAnswer ? BLUE : QMARK}
              >
                {revealAnswer ? ANSWER : '?'}
              </text>
            ) : null}

            {/* right triangle number (none on the last diamond) */}
            {right !== null && (
              <text
                x={rightNumX(i)}
                y={NUM_Y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-display"
                fontSize={26}
                fontWeight={800}
                fill={INK}
              >
                {right}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function NumberPattern25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Rangkaian empat belah ketupat yang saling bersentuhan di ujungnya. Tiap belah ketupat terbagi menjadi dua segitiga berisi angka: 19 dan 3, lalu 16 dan 4, lalu 12 dan 6, dan terakhir tanda tanya dengan segitiga kanan kosong. Amati polanya dan tentukan angka yang menggantikan tanda tanya."
    >
      <NumberPattern25G1 />
    </div>
  )
}
