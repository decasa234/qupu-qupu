// IKMC-23-EC-Q1 — "Which candle stopped burning first?" (5 candles, varying heights).
//
// OCR source: docs/reference/ocr-res/ikmc/contest/ecolier/2023.md Q1,
// crop: 2023.imgs/001.jpg
//
// Figure: 5 grey trapezoidal candles (A–E) on a shared rectangular base.
// All started at the same height and were lit simultaneously. They stopped
// burning at different times — the TALLEST remaining candle burned the LEAST
// wax, so it stopped burning FIRST.
//
// Heights from the source image (tallest → shortest): D > B > A > C > E.
// Answer: D (tallest = stopped first).
//
// The STATIC illustration reproduces the figure exactly from the paper.
// It does NOT reveal that D is the answer.
//
// Primitive co-exported: `CandleRow` — reused by the explainer.
// Pure render, SSR-safe & deterministic.

export type CandleName = 'A' | 'B' | 'C' | 'D' | 'E'
export const CANDLE_NAMES: CandleName[] = ['A', 'B', 'C', 'D', 'E']

// Relative height levels 1 (shortest) … 5 (tallest).
// From the source image: D=5, B=4, A=3, C=2, E=1.
export const CANDLE_HEIGHTS: Record<CandleName, number> = {
  A: 3,
  B: 4,
  C: 2,
  D: 5,
  E: 1,
}

// Layout constants
const PAD_X = 14
const SLOT_W = 52
const SLOT_GAP = 8
const MAX_BODY_H = 110   // height of a level-5 candle body
const BODY_W_TOP = 28    // trapezoid top width
const BODY_W_BOT = 38    // trapezoid bottom width (slightly wider)
const WICK_H = 10
const FLAME_RY = 8
const FLAME_RX = 5
const BASE_H = 22
const BASE_RADIUS = 4
const LABEL_H = 20
const LABEL_GAP = 5

// Scale body height linearly: level 1 → 35%, level 5 → 100%.
function levelScale(level: number): number {
  return 0.35 + ((level - 1) / 4) * 0.65
}

// Colours
const CANDLE_FILL = '#9CA3AF'
const CANDLE_STROKE = '#4B5563'
const BASE_FILL = '#E5E7EB'
const BASE_STROKE = '#4B5563'
const FLAME_FILL = '#FCD34D'
const FLAME_STROKE = '#F59E0B'
const WICK_COLOR = '#374151'

/**
 * CandleRow — shared five-candle SVG primitive.
 *
 * Renders candles A–E as grey trapezoids with wicks and flame nubs on a
 * common rectangular base, with letter labels below.
 *
 * @param heights   relative height per candle, 1 (shortest) … 5 (tallest).
 * @param highlight candle names to ring in amber (explainer beats).
 * @param winner    when set, that candle gets a green ring (answer reveal).
 */
export function CandleRow({
  heights,
  highlight = new Set<CandleName>(),
  winner,
}: {
  heights: Record<CandleName, number>
  highlight?: Set<CandleName>
  winner?: CandleName
}) {
  const N = CANDLE_NAMES.length
  const contentW = N * SLOT_W + (N - 1) * SLOT_GAP
  const W = PAD_X * 2 + contentW
  const TOP_PAD = (FLAME_RY + WICK_H) * 2 + 6
  const groundY = TOP_PAD + MAX_BODY_H
  const H = groundY + BASE_H + LABEL_GAP + LABEL_H + PAD_X

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={Math.min(340, W)}
      aria-hidden="true"
    >
      {/* Shared rectangular base */}
      <rect
        x={PAD_X}
        y={groundY}
        width={contentW}
        height={BASE_H}
        rx={BASE_RADIUS}
        fill={BASE_FILL}
        stroke={BASE_STROKE}
        strokeWidth={2}
      />

      {CANDLE_NAMES.map((name, i) => {
        const level = heights[name] ?? 3
        const bodyH = MAX_BODY_H * levelScale(level)

        const cx = PAD_X + SLOT_W / 2 + i * (SLOT_W + SLOT_GAP)
        const bodyTopY = groundY - bodyH

        // Trapezoid corners (top narrower, bottom wider, sits on base)
        const btl = cx - BODY_W_TOP / 2
        const btr = cx + BODY_W_TOP / 2
        const bbl = cx - BODY_W_BOT / 2
        const bbr = cx + BODY_W_BOT / 2

        const wickTopY = bodyTopY - WICK_H
        const flameCy = wickTopY - FLAME_RY

        const isHighlighted = highlight.has(name)
        const isWinner = winner === name

        const ringStroke = isWinner
          ? '#10B981'
          : isHighlighted
            ? '#F59E0B'
            : CANDLE_STROKE
        const ringW = isWinner || isHighlighted ? 3 : 2
        const fill = isWinner ? '#D1FAE5' : CANDLE_FILL

        const bodyPath = [
          `M ${btl} ${bodyTopY}`,
          `L ${btr} ${bodyTopY}`,
          `L ${bbr} ${groundY}`,
          `L ${bbl} ${groundY}`,
          'Z',
        ].join(' ')

        return (
          <g key={name}>
            {/* Candle trapezoid body */}
            <path
              d={bodyPath}
              fill={fill}
              stroke={ringStroke}
              strokeWidth={ringW}
              strokeLinejoin="round"
            />

            {/* Wick */}
            <line
              x1={cx}
              y1={bodyTopY}
              x2={cx}
              y2={wickTopY}
              stroke={WICK_COLOR}
              strokeWidth={1.8}
              strokeLinecap="round"
            />

            {/* Flame (small filled ellipse) */}
            <ellipse
              cx={cx}
              cy={flameCy}
              rx={FLAME_RX}
              ry={FLAME_RY}
              fill={FLAME_FILL}
              stroke={FLAME_STROKE}
              strokeWidth={1.2}
            />

            {/* Letter label below the base */}
            <text
              x={cx}
              y={groundY + BASE_H + LABEL_GAP + LABEL_H * 0.75}
              textAnchor="middle"
              fontSize="15"
              fontWeight="bold"
              fill="#374151"
            >
              {name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Candles1ECIllustration — static problem figure for IKMC-23-EC-Q1.
 *
 * Shows five candles (A–E) at their post-burn heights as in the printed
 * paper. The question asks which stopped burning first — the figure presents
 * the evidence but does NOT reveal the answer (D).
 */
export default function Candles1ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lima lilin A sampai E dengan tinggi berbeda di atas alas yang sama. Lilin yang lebih tinggi berarti lebih sedikit terbakar, yaitu berhenti lebih awal."
    >
      <CandleRow heights={CANDLE_HEIGHTS} />
    </div>
  )
}
