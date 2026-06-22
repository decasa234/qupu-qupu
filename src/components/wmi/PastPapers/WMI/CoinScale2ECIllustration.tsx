// IKMC-23-EC-Q2 — "The 2 kangaroo coins with the question mark on them have
// the same value. 20 + 10 + 10 + ? + ? + 1 = 51. What is this value?"
//
// The figure from the paper (2023.imgs/002.jpg) shows six round coins in a
// horizontal row, each with a serrated/dashed outer ring and a number (or "?")
// inside. Between each coin is a "+" sign, and at the end "= 51".
//
//   Coin 1: 20 | + | Coin 2: 10 | + | Coin 3: 10 | + |
//   Coin 4: ?  | + | Coin 5: ?  | + | Coin 6:  1 | = 51
//
// Adapted from CoinFace in Coin25G3Illustration: the same circular coin ring
// geometry, but replacing the animal glyph with a plain number label and using
// a dashed/scalloped outer ring to match the IKMC scan.
//
// TYPE: stem illustration only (choices are text: 1, 2, 5, 10, 20).
// Does NOT reveal the answer.
// Pure render — no randomness, no Date. SSR-safe, deterministic.

// ── palette ─────────────────────────────────────────────────────────────────
const COIN_BG = '#F5F5F5'    // light grey coin face
const COIN_RING = '#4B5563'  // dark outer ring stroke
const COIN_INK = '#1F2937'   // number text
const QUESTION_INK = '#30598A'  // blue "?" on the unknown coins
const OP_INK = '#4B5563'     // operator text (+, =)
const TOTAL_INK = '#1F2937'  // "51" text

// ── coin geometry ───────────────────────────────────────────────────────────
const R = 26          // coin radius
const SCALLOPS = 18   // number of teeth on the serrated rim

/**
 * A single round coin with an optional serrated rim.
 * `label`: the text shown on the face ("20", "10", "1", "?").
 * `isQuestion`: renders the label in blue to signal the unknown.
 * `spotlight`: draws a highlight ring (used by the explainer).
 */
export function KangarooCoin({
  cx,
  cy,
  label,
  isQuestion = false,
  spotlight = false,
}: {
  cx: number
  cy: number
  label: string
  isQuestion?: boolean
  spotlight?: boolean
}) {
  // Build a path of small bumps around the rim (scalloped edge)
  const teeth: string[] = []
  for (let i = 0; i < SCALLOPS; i++) {
    const a0 = ((i - 0.5) / SCALLOPS) * Math.PI * 2
    const a1 = (i / SCALLOPS) * Math.PI * 2
    const a2 = ((i + 0.5) / SCALLOPS) * Math.PI * 2
    const innerR = R - 3
    const outerR = R + 3
    const x0 = cx + innerR * Math.cos(a0)
    const y0 = cy + innerR * Math.sin(a0)
    const x1 = cx + outerR * Math.cos(a1)
    const y1 = cy + outerR * Math.sin(a1)
    const x2 = cx + innerR * Math.cos(a2)
    const y2 = cy + innerR * Math.sin(a2)
    if (i === 0) {
      teeth.push(`M ${x0.toFixed(1)} ${y0.toFixed(1)}`)
    } else {
      teeth.push(`L ${x0.toFixed(1)} ${y0.toFixed(1)}`)
    }
    teeth.push(`L ${x1.toFixed(1)} ${y1.toFixed(1)}`)
    teeth.push(`L ${x2.toFixed(1)} ${y2.toFixed(1)}`)
  }
  teeth.push('Z')
  const rimPath = teeth.join(' ')

  // Font size: shrink slightly for 2-digit numbers
  const fontSize = label.length >= 2 ? 14 : 17
  const fontWeight = 900

  return (
    <g>
      {/* spotlight halo */}
      {spotlight && (
        <circle
          cx={cx}
          cy={cy}
          r={R + 8}
          fill="none"
          stroke="#2563EB"
          strokeWidth={2.5}
          strokeDasharray="5 3"
          opacity={0.7}
        />
      )}
      {/* serrated rim (filled path) */}
      <path d={rimPath} fill={COIN_BG} stroke={COIN_RING} strokeWidth={1.5} strokeLinejoin="round" />
      {/* inner circle */}
      <circle cx={cx} cy={cy} r={R - 3} fill={COIN_BG} stroke={COIN_RING} strokeWidth={1.5} />
      {/* face number or "?" */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={isQuestion ? QUESTION_INK : COIN_INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── whole-figure constants ───────────────────────────────────────────────────
// Six coins + five "+" operators + "= 51" at the end.
// Layout: [PAD] [coin] [OP_W] [coin] ... [OP_W] [coin] [EQ_W] [total] [PAD]
const COIN_SLOT = R * 2      // 52 px per coin
const OP_W = 20              // width of each "+" or "=" operator slot
const TOTAL_W = 30           // "51" text width
const PAD = 12

export const VIEW_H = COIN_SLOT + 4  // 108 px
const N = 6
export const VIEW_W = PAD * 2 + N * COIN_SLOT + (N - 1) * OP_W + OP_W + TOTAL_W  // ≈ 412 px

const CY = VIEW_H / 2 + 2

// Pre-compute coin centres and operator x positions.
// Coin i centre: PAD + i*(COIN_SLOT+OP_W) + R
function coinCX(i: number) {
  return PAD + i * (COIN_SLOT + OP_W) + R
}

const COIN_DEFS: { label: string; isQuestion: boolean }[] = [
  { label: '20', isQuestion: false },
  { label: '10', isQuestion: false },
  { label: '10', isQuestion: false },
  { label: '?',  isQuestion: true  },
  { label: '?',  isQuestion: true  },
  { label: '1',  isQuestion: false },
]

/**
 * The bare coin-row primitive — six coins with operators.
 * `spotlight`: set of coin indices (0-based) to highlight; empty = all neutral.
 * aria-hidden — must sit inside a labelled wrapper.
 */
export function CoinRow2EC({ spotlight = [] }: { spotlight?: number[] }) {
  const spotSet = new Set(spotlight)
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* white background */}
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />

      {/* coins */}
      {COIN_DEFS.map((def, i) => (
        <KangarooCoin
          key={i}
          cx={coinCX(i)}
          cy={CY}
          label={def.label}
          isQuestion={def.isQuestion}
          spotlight={spotlight.length > 0 ? spotSet.has(i) : false}
        />
      ))}

      {/* "+" operators between coins */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = coinCX(i) + R + OP_W / 2
        return (
          <text
            key={i}
            x={x}
            y={CY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={16}
            fontWeight={700}
            fill={OP_INK}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            +
          </text>
        )
      })}

      {/* "= 51" after the last coin */}
      <text
        x={coinCX(5) + R + 4}
        y={CY}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={900}
        fill={TOTAL_INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        = 51
      </text>
    </svg>
  )
}

// ── default export: question stem illustration ───────────────────────────────

/**
 * CoinScale2ECIllustration
 *
 * Static problem figure for IKMC-23-EC-Q2.
 * Shows six coins in a row: 20 + 10 + 10 + ? + ? + 1 = 51.
 * The two "?" coins have the same (unknown) value.
 * Does NOT reveal the answer (5).
 */
export default function CoinScale2ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Enam koin berjajar: 20 + 10 + 10 + ? + ? + 1 = 51. ' +
        'Dua koin bertanda tanya memiliki nilai yang sama. Berapakah nilainya?'
      }
    >
      <CoinRow2EC />
    </div>
  )
}
