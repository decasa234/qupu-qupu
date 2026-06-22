// IKMC-23-PE-Q11 — Token row stem illustration.
//
// Figure (docs/reference/ocr-res/ikmc/contest/preecolier/2023.imgs/029.jpg):
//   Four coloured circles in a row:  10 + ? + ? + 2 = 18
//   • green  token: 10  (known)
//   • yellow token: ?   (hidden)
//   • yellow token: ?   (hidden, same value as the first ?)
//   • orange token: 2   (known)
//   Arithmetic between them: +  +  +  =
//   Sum label at the right: 18
//
// The stem illustration shows ONLY the problem — the ? circles stay hidden.
// The answer (x = 3) is revealed beat-by-beat by the explainer.
//
// Co-exports (shared primitive):
//   Tokens11PE             — bare row primitive; accepts `revealAnswer`
//   TOKEN_DATA             — layout constants consumed by the explainer
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ── palette ───────────────────────────────────────────────────────────────────
// Matches the source image colour palette faithfully.
export const C_GREEN_FILL   = '#A8D8A8'   // light green (known 10 token)
export const C_GREEN_STROKE = '#3A7D44'
export const C_YELLOW_FILL  = '#F9E07F'   // yellow (hidden ? tokens)
export const C_YELLOW_STROKE= '#C89B00'
export const C_ORANGE_FILL  = '#EDBA8C'   // peach-orange (known 2 token)
export const C_ORANGE_STROKE= '#B06000'
export const C_INK          = '#1F2937'   // digit ink
export const C_OP_INK       = '#374151'   // operator / equals ink
export const C_ANSWER_GREEN = '#10B981'   // reveal accent
export const C_SUM_INK      = '#1F2937'   // "= 18" label

// ── geometry ──────────────────────────────────────────────────────────────────
export const R     = 26    // token radius
const GAP   = 22    // gap between token edge and operator
const OP_W  = 18    // operator glyph horizontal space
const PAD_L = 24    // left padding
const PAD_R = 36    // right padding (more room for "= 18")
const CY    = 46    // vertical centre of all tokens

// Four tokens: indices 0..3
// Spacing: PAD_L + R, then (R + GAP + OP_W + GAP + R) × 3 gaps, then = 18
const N = 4
function tokenCX(i: number): number {
  // each token centre: PAD_L + R + i * (2R + 2*GAP + OP_W)
  return PAD_L + R + i * (2 * R + 2 * GAP + OP_W)
}

// Operator x sits between token i and i+1, at midpoint
function opCX(i: number): number {
  return (tokenCX(i) + tokenCX(i + 1)) / 2
}

// = 18 sits after the last token
const EQ_X    = tokenCX(N - 1) + R + GAP
export const VIEW_W = EQ_X + 38 + PAD_R
export const VIEW_H = CY * 2

// ── token data (used by explainer) ───────────────────────────────────────────
export interface TokenDef {
  index: number
  cx: number
  cy: number
  fill: string
  stroke: string
  /** The number shown; null means "?" (hidden) */
  value: number | null
}

// eslint-disable-next-line react-refresh/only-export-components
export const TOKEN_DATA: TokenDef[] = [
  { index: 0, cx: tokenCX(0), cy: CY, fill: C_GREEN_FILL,  stroke: C_GREEN_STROKE,  value: 10 },
  { index: 1, cx: tokenCX(1), cy: CY, fill: C_YELLOW_FILL, stroke: C_YELLOW_STROKE, value: null },
  { index: 2, cx: tokenCX(2), cy: CY, fill: C_YELLOW_FILL, stroke: C_YELLOW_STROKE, value: null },
  { index: 3, cx: tokenCX(3), cy: CY, fill: C_ORANGE_FILL, stroke: C_ORANGE_STROKE, value: 2 },
]

export const ANSWER = 3   // each ? = (18 − 10 − 2) / 2 = 3
export const TARGET_SUM = 18

// ── shared primitive ──────────────────────────────────────────────────────────

export interface Tokens11PEProps {
  /** When true, fill both ? tokens with the answer (3) in green. */
  revealAnswer?: boolean
  /** When 'sum', draw a green underline below the whole expression showing the total. */
  showSumLine?: boolean
}

/**
 * Tokens11PE
 *
 * Shared primitive for IKMC-23-PE-Q11.
 * Renders the four tokens + operators as in the source figure.
 * By default the two yellow tokens show "?" — the explainer sets `revealAnswer`.
 */
export function Tokens11PE({ revealAnswer = false, showSumLine = false }: Tokens11PEProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* sum underline bracket (shown on final beat) */}
      {showSumLine && (
        <g stroke={C_ANSWER_GREEN} strokeWidth={2} fill="none">
          {/* horizontal line spanning all tokens */}
          <line
            x1={tokenCX(0) - R}
            y1={CY + R + 10}
            x2={tokenCX(N - 1) + R}
            y2={CY + R + 10}
          />
          {/* left tick */}
          <line x1={tokenCX(0) - R} y1={CY + R + 5} x2={tokenCX(0) - R} y2={CY + R + 15} />
          {/* right tick */}
          <line x1={tokenCX(N - 1) + R} y1={CY + R + 5} x2={tokenCX(N - 1) + R} y2={CY + R + 15} />
          {/* "= 18" label below */}
          <text
            x={(tokenCX(0) + tokenCX(N - 1)) / 2}
            y={CY + R + 28}
            textAnchor="middle"
            dominantBaseline="hanging"
            fontSize={13}
            fontWeight={800}
            fill={C_ANSWER_GREEN}
            stroke="none"
            fontFamily="Nunito, ui-sans-serif, sans-serif"
          >
            = {TARGET_SUM}
          </text>
        </g>
      )}

      {/* operator symbols between tokens: + + + */}
      {[0, 1, 2].map((i) => (
        <text
          key={`op-${i}`}
          x={opCX(i)}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill={C_OP_INK}
          fontFamily="Nunito, ui-sans-serif, sans-serif"
        >
          +
        </text>
      ))}

      {/* equals + 18 */}
      <text
        x={EQ_X}
        y={CY}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={900}
        fill={C_SUM_INK}
        fontFamily="Nunito, ui-sans-serif, sans-serif"
      >
        = {TARGET_SUM}
      </text>

      {/* tokens */}
      {TOKEN_DATA.map((tok) => {
        const isHidden = tok.value === null
        const isRevealed = isHidden && revealAnswer
        const strokeColor = isRevealed ? C_ANSWER_GREEN : tok.stroke
        const strokeWidth = isRevealed ? 3 : 2.5
        const displayValue = isHidden ? (revealAnswer ? ANSWER : null) : tok.value
        const textFill = isRevealed ? C_ANSWER_GREEN : C_INK

        return (
          <g key={`tok-${tok.index}`}>
            <circle
              cx={tok.cx}
              cy={tok.cy}
              r={R}
              fill={tok.fill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* number or "?" glyph */}
            {displayValue !== null ? (
              <text
                x={tok.cx}
                y={tok.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={displayValue >= 10 ? 16 : 20}
                fontWeight={900}
                fill={textFill}
                fontFamily="Nunito, ui-sans-serif, sans-serif"
              >
                {displayValue}
              </text>
            ) : (
              <text
                x={tok.cx}
                y={tok.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={900}
                fill={C_YELLOW_STROKE}
                fontFamily="Nunito, ui-sans-serif, sans-serif"
              >
                ?
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── default export: stem illustration ─────────────────────────────────────────

/**
 * Tokens11PEIllustration
 *
 * Static problem figure for IKMC-23-PE-Q11.
 * Shows the four tokens in a row: 10 + ? + ? + 2 = 18.
 * The two question-mark tokens do NOT reveal the answer.
 */
export default function Tokens11PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Empat keping warna-warni berjajar: keping hijau bertuliskan 10, ' +
        'dua keping kuning masing-masing bertanda tanya, dan keping jingga bertuliskan 2. ' +
        'Di antara keempat keping terdapat tanda tambah, dan di akhir tertulis sama dengan 18. ' +
        'Kedua keping tanda tanya memiliki angka yang sama — berapa nilainya?'
      }
    >
      <Tokens11PE />
    </div>
  )
}
