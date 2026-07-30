// WMI-24F1A-Q16 (2024 Grade 1 Final) — answer = 9 (fill-in).
//
// Official stem: "The expressions below are arranged in a regular pattern. Find
// the result of the expression ★."  The stem does NOT say how far along ★ sits,
// so the figure alone has to make that countable: the paper prints a single
// LEFT-TO-RIGHT row of SEVEN chips, separated by small tick marks —
//
//   [28 − 1] 、[27 − 3] 、[26 − 5] 、[    ] 、[    ] 、[    ] 、[  ★  ]
//
// i.e. three given expressions, three blanks, then the ★ chip in seventh place.
// (Earlier revisions of this figure drew a VERTICAL list of five rows with "n="
// captions, so the reader could not tell that ★ is the 7th expression at all.)
//
// The n-th expression is (29 − n) − (2n − 1) = 30 − 3n, so the results run
//   n: 1  2  3  4  5  6  7
//   r: 27 24 21 18 15 12  9
// The 7th expression is 22 − 13 = 9 (minuend 29−7=22, subtrahend 2·7−1=13),
// so ★ = 9.
//
// The question figure shows ONLY what the paper prints: the three given
// expressions, three empty chips, and the ★ chip. It must NEVER reveal the
// hidden expressions or that ★ = 9. The co-exported primitive ExprPattern24G1
// lets the animator fill the blank chips (`revealUpTo`) and surface each chip's
// result (`showResults`) post-answer.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#2B2622' // expression text
const CHIP_FILL = '#E9F2DC' // pale green chip face (mirrors the printed paper)
const CHIP_LINE = '#B7CE96' // soft green chip edge
const ORD = '#A8997F' // muted tan — the 1..7 ordinal captions
const ORD_STAR = '#E0A000' // brand yellow — the 7th ordinal, tying ★ to "7th"
const SEP = '#C6BBA6' // tick separator between chips (the paper's "、")
const STAR_FILL = '#E0A000' // brand yellow ★ glyph
const RESULT_FILL = '#FFF2DF' // soft cream pill behind a revealed result
const RESULT_LINE = '#30598A' // brand blue pill edge + result text

export const EXPR_COUNT = 7

/** The minuend of the n-th expression: 28, 27, 26, … = 29 − n. */
export const exprMinuend = (n: number): number => 29 - n
/** The subtrahend of the n-th expression: 1, 3, 5, … = 2n − 1. */
export const exprSubtrahend = (n: number): number => 2 * n - 1
/** The result of the n-th expression: 30 − 3n (27, 24, 21, 18, 15, 12, 9). */
export const exprResult = (n: number): number => 30 - 3 * n

export interface ExprRow {
  /** 1-based index in the sequence. */
  n: number
  minuend: number
  subtrahend: number
  result: number
  /** True for the 7th chip — the ★ chip whose result is the answer. */
  star: boolean
}

/** All seven chips of the pattern, derived from the closed forms above. */
export const EXPR_ROWS: ExprRow[] = Array.from({ length: EXPR_COUNT }, (_, i) => {
  const n = i + 1
  return {
    n,
    minuend: exprMinuend(n),
    subtrahend: exprSubtrahend(n),
    result: exprResult(n),
    star: n === EXPR_COUNT,
  }
})

/** Chips whose expression is PRINTED on the paper (28 − 1, 27 − 3, 26 − 5). */
export const GIVEN_COUNT = 3

// ---- layout ----------------------------------------------------------------
const PAD_X = 12
const PAD_TOP = 12
const CHIP_W = 62
const CHIP_H = 40
const SEP_W = 14 // gap between chips, holding the tick separator
const PITCH = CHIP_W + SEP_W
const ORD_GAP = 16 // baseline offset of the ordinal caption below a chip
const ORD_H = 22
const RESULT_GAP = 6
const RESULT_H = 30
const PAD_BOTTOM = 8

const ROW_W = EXPR_COUNT * CHIP_W + (EXPR_COUNT - 1) * SEP_W
const VIEW_W = PAD_X * 2 + ROW_W

const chipX = (i: number) => PAD_X + i * PITCH
const CHIP_MID_Y = PAD_TOP + CHIP_H / 2

/** Five-pointed ★ glyph marking the seventh (★) chip. */
function StarGlyph({ cx, cy, r = 12 }: { cx: number; cy: number; r?: number }) {
  const inner = r * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill={STAR_FILL}
      stroke={INK}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  )
}

/** The paper's "、" separator, drawn as a short slanted tick (font-independent). */
function TickSeparator({ cx, cy }: { cx: number; cy: number }) {
  return (
    <line
      x1={cx + 2}
      y1={cy - 4}
      x2={cx - 2}
      y2={cy + 5}
      stroke={SEP}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  )
}

/** One chip of the row: the pale-green plate plus whatever it currently holds. */
function ExpressionChip({
  row,
  x,
  showExpr,
  showResult,
}: {
  row: ExprRow
  x: number
  /** Render the "a − b" expression (blank chip, or the ★ glyph, otherwise). */
  showExpr: boolean
  /** Render the result pill ("= r") under the chip. */
  showResult: boolean
}) {
  const cx = x + CHIP_W / 2
  return (
    <g>
      <rect
        x={x}
        y={PAD_TOP}
        width={CHIP_W}
        height={CHIP_H}
        rx={11}
        fill={CHIP_FILL}
        stroke={CHIP_LINE}
        strokeWidth={1.6}
      />

      {/* chip contents: the expression, or the ★ glyph, or nothing at all */}
      {showExpr ? (
        <text
          x={cx}
          y={CHIP_MID_Y}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={18}
          fontWeight={800}
          fill={INK}
        >
          {`${row.minuend} − ${row.subtrahend}`}
        </text>
      ) : row.star ? (
        <StarGlyph cx={cx} cy={CHIP_MID_Y} />
      ) : null}

      {/* ordinal caption 1..7 — makes "★ is the 7th expression" countable */}
      <text
        x={cx}
        y={PAD_TOP + CHIP_H + ORD_GAP}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={12}
        fontWeight={800}
        fill={row.star ? ORD_STAR : ORD}
      >
        {row.n}
      </text>

      {/* result pill (animator only) */}
      {showResult && (
        <g>
          <rect
            x={cx - 24}
            y={PAD_TOP + CHIP_H + ORD_H + RESULT_GAP}
            width={48}
            height={RESULT_H - 6}
            rx={9}
            fill={RESULT_FILL}
            stroke={RESULT_LINE}
            strokeWidth={1.5}
          />
          <text
            x={cx}
            y={PAD_TOP + CHIP_H + ORD_H + RESULT_GAP + (RESULT_H - 6) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={15}
            fontWeight={900}
            fill={RESULT_LINE}
          >
            {`= ${row.result}`}
          </text>
        </g>
      )}
    </g>
  )
}

export interface ExprPattern24G1Props {
  /**
   * Fill in expressions for chips 1..revealUpTo (the rest stay blank). Defaults
   * to GIVEN_COUNT (3) — the pristine question state: 28 − 1, 27 − 3, 26 − 5
   * printed, chips 4–6 blank and the ★ chip still just a ★. Pass 7 to fill the
   * whole row (that is what turns the ★ chip into 22 − 13).
   */
  revealUpTo?: number
  /**
   * Print each filled chip's result pill ("= r"). Off by default — the question
   * never shows results. Animator passes true post-answer to surface ★ = 9.
   */
  showResults?: boolean
}

/**
 * Primitive board for the expression-pattern row. With no props it renders the
 * pristine question: seven chips left to right — three given expressions, three
 * blanks, and the ★ chip — with ordinals 1..7 beneath and no results.
 *
 * The animator fills blank chips via `revealUpTo` and surfaces results via
 * `showResults`. By itself the default reveals nothing about ★ = 9.
 */
export function ExprPattern24G1({
  revealUpTo = GIVEN_COUNT,
  showResults = false,
}: ExprPattern24G1Props = {}) {
  // Clamp so the ★ chip's expression only appears once the whole row is filled.
  const upTo = Math.max(0, Math.min(EXPR_COUNT, revealUpTo))

  const viewH =
    PAD_TOP + CHIP_H + ORD_H + (showResults ? RESULT_GAP + RESULT_H : 0) + PAD_BOTTOM

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 480 }}
      aria-hidden="true"
    >
      {/* tick separators sitting in the gaps, exactly as the paper prints them */}
      {EXPR_ROWS.slice(0, EXPR_COUNT - 1).map((row, i) => (
        <TickSeparator
          key={`sep-${row.n}`}
          cx={chipX(i) + CHIP_W + SEP_W / 2}
          cy={CHIP_MID_Y}
        />
      ))}

      {EXPR_ROWS.map((row, i) => {
        const showExpr = row.n <= upTo
        return (
          <ExpressionChip
            key={row.n}
            row={row}
            x={chipX(i)}
            showExpr={showExpr}
            showResult={showResults && showExpr}
          />
        )
      })}
    </svg>
  )
}

// Indonesian aria description — names the printed chips and the blanks, and
// states ★ sits seventh. It never states the ★ result (9).
const ARIA =
  'Tujuh kotak berderet dari kiri ke kanan. Kotak ke-1 sampai ke-3 berisi 28 − 1, 27 − 3, dan 26 − 5. ' +
  'Kotak ke-4, ke-5, dan ke-6 masih kosong. Kotak ke-7 bertanda bintang. ' +
  'Deret ini berpola teratur; tentukan hasil perhitungan pada kotak bintang.'

/** Question figure — the seven-chip row exactly as printed, no results. */
export default function ExprPattern24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <ExprPattern24G1 />
    </div>
  )
}
