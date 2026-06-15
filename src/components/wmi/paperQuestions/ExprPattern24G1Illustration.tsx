// WMI-24F1A-Q16 (2024 Grade 1 Final) — answer = 9 (fill-in).
//
// "The expressions are in a regular pattern: 28 − 1, 27 − 3, 26 − 5, …
//  Continuing the pattern, find the result of the 7th expression (marked ★)."
//
// The n-th expression is (29 − n) − (2n − 1) = 30 − 3n, so the results run
//   n: 1  2  3  4  5  6  7
//   r: 27 24 21 18 15 12  9
// The 7th expression is 22 − 13 = 9 (minuend 29−7=22, subtrahend 2·7−1=13),
// so ★ = 9.
//
// The pristine question figure shows ONLY the three GIVEN expressions
// (28 − 1, 27 − 3, 26 − 5), a "…" continuation gap, and the ★ row — it must
// NEVER reveal the later expressions or that ★ = 9. The co-exported primitive
// ExprPattern24G1 lets the animator fill in the hidden middle rows
// (`revealUpTo`) and surface each row's result (`showResults`) post-answer.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // expression text + row rule
const LABEL = '#30598A' // brand blue — row index "n=…" captions + results
const STAR_FILL = '#FBBF6B' // warm fill for the unknown ★ glyph
const RESULT_FILL = '#FFF2DF' // soft cream pill behind a revealed result
const ELLIPSIS = '#A8997F' // muted tan for the "…" continuation gap

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
  /** True for the 7th row — the ★ row whose result is the answer. */
  star: boolean
}

/** All seven rows of the pattern, derived from the closed forms above. */
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

/** Rows whose expression is GIVEN on the paper (28 − 1, 27 − 3, 26 − 5). */
export const GIVEN_COUNT = 3

// ---- layout ----------------------------------------------------------------
const VIEW_W = 260
const ROW_H = 38 // vertical pitch between successive rows
const PAD_TOP = 18
const PAD_BOTTOM = 16
const IDX_X = 30 // x-centre of the "n=" caption column
const EXPR_X = 150 // x-centre of the expression column
const RESULT_X = 224 // x-centre of the result pill column
const STAR_R = 12

/** Five-pointed ★ glyph marking the ★ (7th) expression row. */
function StarGlyph({ cx, cy }: { cx: number; cy: number }) {
  const inner = STAR_R * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? STAR_R : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill={STAR_FILL}
      stroke={INK}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

/** One sequence row: the "n=" caption, the expression, and (optionally) a result pill. */
function ExpressionRow({
  row,
  cy,
  showExpr,
  showResult,
}: {
  row: ExprRow
  cy: number
  /** Render the actual "a − b" expression (vs. a "?" placeholder for hidden rows). */
  showExpr: boolean
  /** Render the result pill ("= r") on the right. */
  showResult: boolean
}) {
  return (
    <g>
      {/* row index caption, e.g. "n=1" / "★" for the seventh */}
      <text
        x={IDX_X}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={LABEL}
      >
        {row.star ? '★' : `n=${row.n}`}
      </text>

      {/* the expression, or a "?" placeholder if this row is still hidden */}
      {showExpr ? (
        <text
          x={EXPR_X}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={800}
          fill={INK}
        >
          {`${row.minuend} − ${row.subtrahend}`}
        </text>
      ) : (
        <text
          x={EXPR_X}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={800}
          fill={ELLIPSIS}
        >
          ?
        </text>
      )}

      {/* result pill (post-answer only) */}
      {showResult && (
        <g>
          <rect
            x={RESULT_X - 22}
            y={cy - 13}
            width={44}
            height={26}
            rx={9}
            fill={RESULT_FILL}
            stroke={LABEL}
            strokeWidth={1.5}
          />
          <text
            x={RESULT_X}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={15}
            fontWeight={900}
            fill={LABEL}
          >
            {`= ${row.result}`}
          </text>
        </g>
      )}

      {/* ★ marker badge on the seventh row (kept even when the expression shows) */}
      {row.star && !showResult && (
        <StarGlyph cx={RESULT_X} cy={cy} />
      )}
    </g>
  )
}

export interface ExprPattern24G1Props {
  /**
   * Reveal expressions for rows 1..revealUpTo (the rest show "?"). Defaults to
   * GIVEN_COUNT (3) — the pristine question state: 28 − 1, 27 − 3, 26 − 5 given,
   * the ★ (7th) row's expression hidden. Pass 7 to fill the whole sequence.
   */
  revealUpTo?: number
  /**
   * Print each visible row's result pill ("= r"). Off by default — the question
   * never shows results. Animator passes true post-answer to surface the ★ = 9.
   */
  showResults?: boolean
}

/**
 * Primitive board for the expression-pattern sequence. With no props it renders
 * the pristine question: the three given expressions, a "…" continuation gap,
 * and the ★ row (7th) with its expression hidden and no results.
 *
 * The animator fills hidden rows via `revealUpTo` and surfaces results via
 * `showResults`. By itself the default reveals nothing about ★ = 9.
 */
export function ExprPattern24G1({
  revealUpTo = GIVEN_COUNT,
  showResults = false,
}: ExprPattern24G1Props = {}) {
  // Clamp so the ★ row's expression only appears once the whole pattern is shown.
  const upTo = Math.max(0, Math.min(EXPR_COUNT, revealUpTo))

  // The visible rows: always the given block + the ★; intermediate rows appear
  // only as they get revealed. While the middle (rows 4..6) is still hidden, a
  // single "…" gap row stands in for the continuation.
  const middleHidden = upTo < EXPR_COUNT - 1 // rows 4..6 (or some) still "?"

  // Rows we actually draw, top to bottom, paired with their y-centre.
  type Drawn =
    | { kind: 'row'; row: ExprRow }
    | { kind: 'gap' }
  const drawn: Drawn[] = []
  for (const row of EXPR_ROWS) {
    if (row.star) continue // the ★ row is appended last
    if (row.n <= upTo) {
      drawn.push({ kind: 'row', row })
    }
  }
  if (middleHidden) drawn.push({ kind: 'gap' })
  // the ★ row always sits at the bottom
  const starRow = EXPR_ROWS[EXPR_COUNT - 1]
  drawn.push({ kind: 'row', row: starRow })

  const rowCount = drawn.length
  const viewH = PAD_TOP + rowCount * ROW_H + PAD_BOTTOM

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      width={Math.min(240, VIEW_W)}
      aria-hidden="true"
    >
      {drawn.map((d, i) => {
        const cy = PAD_TOP + ROW_H / 2 + i * ROW_H
        if (d.kind === 'gap') {
          return (
            <text
              key="gap"
              x={EXPR_X}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={24}
              fontWeight={800}
              fill={ELLIPSIS}
              letterSpacing="2"
            >
              …
            </text>
          )
        }
        const { row } = d
        // A row's expression shows when it is given/revealed; the ★ row's
        // expression shows only when the full pattern (upTo === 7) is reached.
        const showExpr = row.star ? upTo >= EXPR_COUNT : row.n <= upTo
        const showResult = showResults && showExpr
        return (
          <ExpressionRow
            key={row.n}
            row={row}
            cy={cy}
            showExpr={showExpr}
            showResult={showResult}
          />
        )
      })}
    </svg>
  )
}

// Indonesian aria description (given expressions named, ★ NOT solved).
const ARIA =
  'Deret ekspresi berpola teratur: 28 − 1, 27 − 3, 26 − 5, dan seterusnya. ' +
  'Lanjutkan polanya, lalu tentukan hasil dari ekspresi ke-7 yang ditandai bintang.'

/** Question figure — three given expressions, a "…" gap, and the ★ row. */
export default function ExprPattern24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <ExprPattern24G1 />
    </div>
  )
}
