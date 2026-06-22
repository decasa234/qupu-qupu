// IKMC-22-PE-Q4 — "Sandwich and juice" stem illustration.
//
// Source figure: docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/011.jpg
// Two rows inside a rounded rectangle:
//   Row 1: [sandwich] + [juice box]  ……  12
//   Row 2: [sandwich] + [juice box] + [juice box]  ……  14
//
// Prices from breakdown.quantities:
//   sandwich + 1 juice = 12 euro
//   sandwich + 2 juices = 14 euro
// The illustration shows ONLY the problem — never the answer (juice = 2 euro).
//
// Adapted from ClothingPrices25G1Illustration (priced-item row pattern) and
// AppleAdd19P1Illustration (icon + operator + label layout).
//
// Pure render — no random, no dates, SSR-safe & deterministic.

const INK = '#1F2937'
const BLUE = '#30598A' // qupu-brand-blue — price labels
const ROW_FILL = '#FFFBF5' // qupu-shell — row background
const ROW_STROKE = '#E4DACB' // warm-grey border

// ── Glyph: drawn sandwich ────────────────────────────────────────────────────
// A simple stylised sandwich: two bread slices (yellow-tan) with a green
// lettuce peek and an orange filling layer in between.
// Centred on (cx, cy) inside a ~52 × 36 bounding box.
export function SandwichGlyph({ cx, cy }: { cx: number; cy: number }) {
  const W = 52
  const H = 36
  const x = cx - W / 2
  const y = cy - H / 2
  return (
    <g>
      {/* bottom bread slice */}
      <rect x={x} y={y + H - 12} width={W} height={12} rx={5} fill="#D4A64A" stroke="#A87A28" strokeWidth={1.4} />
      {/* filling layer — orange (tomato/meat) */}
      <rect x={x + 2} y={y + H - 22} width={W - 4} height={10} rx={3} fill="#E07040" stroke="#C25830" strokeWidth={1.2} />
      {/* lettuce peek — green wavy strip */}
      <path
        d={`M ${x + 1} ${y + H - 24}
            q 6 -6 12 0 q 6 6 12 0 q 6 -6 12 0 q 6 6 11 0`}
        fill="none"
        stroke="#4A9A4A"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* top bread slice */}
      <path
        d={`M ${x + 4} ${y + H - 24}
            Q ${x} ${y} ${cx} ${y - 4}
            Q ${x + W} ${y} ${x + W - 4} ${y + H - 24} Z`}
        fill="#D4A64A"
        stroke="#A87A28"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </g>
  )
}

// ── Glyph: drawn juice box ────────────────────────────────────────────────────
// A simple juice carton (orange, square body, straw, small circle logo).
// Centred on (cx, cy) inside a ~34 × 46 bounding box.
// `lit` = highlight mode (animator shows it in a brighter frame).
export function JuiceGlyph({ cx, cy, lit = false }: { cx: number; cy: number; lit?: boolean }) {
  const W = 34
  const H = 46
  const x = cx - W / 2
  const y = cy - H / 2
  const bodyFill = lit ? '#FFD080' : '#F4A830'
  const bodyStroke = lit ? '#C07800' : '#C07800'
  return (
    <g>
      {/* carton body */}
      <rect x={x} y={y + 8} width={W} height={H - 8} rx={4} fill={bodyFill} stroke={bodyStroke} strokeWidth={1.6} />
      {/* angled top flap */}
      <path
        d={`M ${x} ${y + 12} L ${x} ${y + 8} L ${cx} ${y} L ${x + W} ${y + 8} L ${x + W} ${y + 12} Z`}
        fill={lit ? '#FFE0A0' : '#F8BE60'}
        stroke={bodyStroke}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* straw */}
      <rect x={cx - 2} y={y - 12} width={4} height={18} rx={2} fill="#CCCCCC" stroke="#999999" strokeWidth={1} />
      {/* logo circle */}
      <circle cx={cx} cy={y + H / 2 + 4} r={9} fill={lit ? '#FFE0A0' : '#F8BE60'} stroke={bodyStroke} strokeWidth={1.2} />
      {/* stylised fruit dot */}
      <circle cx={cx} cy={y + H / 2 + 4} r={5} fill={lit ? '#FF9030' : '#E06010'} />
    </g>
  )
}

// ── Shared equation row ───────────────────────────────────────────────────────
// Renders: [sandwich] + [juice] [juice?] ……… <price>
// juiceCount = 1 or 2; lit controls juice highlight.
interface RowProps {
  cx: number    // horizontal centre of the whole row
  cy: number    // vertical centre of the row
  juiceCount: 1 | 2
  price: number
  lit?: boolean // highlight the juice glyph(s) in the explainer
}

const SANDWICH_W = 58   // slot width for the sandwich glyph
const JUICE_W    = 42   // slot width for one juice glyph
const OP_W       = 28   // width for "+" operator
const DOTS_W     = 40   // "……" ellipsis band
const PRICE_W    = 36   // price number width

function EquationRow({ cx, cy, juiceCount, price, lit = false }: RowProps) {
  const itemsW = SANDWICH_W + OP_W + juiceCount * (JUICE_W + (juiceCount > 1 ? OP_W : 0))
  const totalW = itemsW + DOTS_W + PRICE_W
  const x0 = cx - totalW / 2   // left edge of the row

  // element x-positions (all centred within their slot)
  const sandX = x0 + SANDWICH_W / 2
  const op1X  = x0 + SANDWICH_W + OP_W / 2
  const j1X   = x0 + SANDWICH_W + OP_W + JUICE_W / 2
  const op2X  = x0 + SANDWICH_W + OP_W + JUICE_W + OP_W / 2
  const j2X   = x0 + SANDWICH_W + OP_W + JUICE_W + OP_W + JUICE_W / 2
  const dotsX = x0 + itemsW + DOTS_W / 2
  const priceX = x0 + itemsW + DOTS_W + PRICE_W / 2

  return (
    <g>
      {/* sandwich icon */}
      <SandwichGlyph cx={sandX} cy={cy} />

      {/* + between sandwich and first juice */}
      <text
        x={op1X}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={900}
        fill={INK}
      >
        +
      </text>

      {/* first juice */}
      <JuiceGlyph cx={j1X} cy={cy} lit={lit} />

      {/* optional second juice with its own + */}
      {juiceCount === 2 && (
        <>
          <text
            x={op2X}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fontWeight={900}
            fill={INK}
          >
            +
          </text>
          <JuiceGlyph cx={j2X} cy={cy} lit={lit} />
        </>
      )}

      {/* dotted leader */}
      <text
        x={dotsX}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fill="#888888"
        letterSpacing={3}
      >
        ……
      </text>

      {/* price */}
      <text
        x={priceX}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={900}
        fill={BLUE}
      >
        {price}
      </text>
    </g>
  )
}

// ── Exportable primitive for the explainer ────────────────────────────────────
export interface SandwichJuice4PEProps {
  /** When true, highlight the juice glyph(s) to draw attention for the diff beat. */
  litJuice?: boolean
  /** When provided, show the answer label (= X euro) under the juices. */
  answerLabel?: string | null
}

const SVG_W = 400
const SVG_H = 170
const PAD   = 18
const ROW_H = 62   // height per row band
const ROW_GAP = 14 // gap between rows
const BOX_X = PAD
const BOX_W = SVG_W - PAD * 2
const ROW1_Y = PAD + ROW_H / 2
const ROW2_Y = PAD + ROW_H + ROW_GAP + ROW_H / 2

export function SandwichJuice4PE({ litJuice = false, answerLabel = null }: SandwichJuice4PEProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* outer panel */}
      <rect
        x={BOX_X}
        y={PAD / 2}
        width={BOX_W}
        height={SVG_H - PAD}
        rx={10}
        fill={ROW_FILL}
        stroke={ROW_STROKE}
        strokeWidth={2}
      />

      {/* divider between rows */}
      <line
        x1={BOX_X + 16}
        y1={PAD + ROW_H + ROW_GAP / 2}
        x2={BOX_X + BOX_W - 16}
        y2={PAD + ROW_H + ROW_GAP / 2}
        stroke={ROW_STROKE}
        strokeWidth={1.4}
        strokeDasharray="4 4"
      />

      {/* row 1: sandwich + 1 juice = 12 */}
      <EquationRow
        cx={SVG_W / 2}
        cy={ROW1_Y}
        juiceCount={1}
        price={12}
        lit={litJuice}
      />

      {/* row 2: sandwich + 2 juices = 14 */}
      <EquationRow
        cx={SVG_W / 2}
        cy={ROW2_Y}
        juiceCount={2}
        price={14}
        lit={litJuice}
      />

      {/* optional answer annotation */}
      {answerLabel && (
        <text
          x={SVG_W / 2}
          y={SVG_H - 6}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={14}
          fontWeight={700}
          fill="#065F46"
        >
          {answerLabel}
        </text>
      )}
    </svg>
  )
}

// ── Default export — bare illustration card ───────────────────────────────────
export default function SandwichJuice4PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dua baris harga: baris pertama, satu sandwich dan satu jus berharga 12 euro. ' +
        'Baris kedua, satu sandwich dan dua jus berharga 14 euro.'
      }
    >
      <SandwichJuice4PE />
    </div>
  )
}
