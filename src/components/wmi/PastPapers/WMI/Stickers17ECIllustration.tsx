// Stickers17ECIllustration — IKMC-21-EC-Q17
//
// "Eva has the 5 stickers: triangle, circle, star, flower, apple. She stuck one
//  on each of the 5 squares (numbered 1–5) so that: star ≠ square 5, apple is
//  on square 1, and flower is adjacent to BOTH circle AND triangle.
//  On which square did Eva stick the flower?"
//
// The stem illustration shows:
//   • The 5 available sticker glyphs in a palette row above the numbered strip.
//   • A blank 5-square numbered strip (1–5) — no stickers placed.
//   • Three constraint labels below the strip (one per rule).
//
// It NEVER reveals the answer or the final placement.
//
// The primitive (Stickers17EC) is co-exported so the explainer can reuse it
// with optional `placement` and `highlighted` props to drive the animation.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const BLUE = '#30598A' // qupu-brand-blue
const GREEN = '#10B981'
const STRIP_FILL = '#FFFFFF'
const STRIP_STROKE = INK
const HIGHLIGHT_FILL = '#E1EFFB'
const ANSWER_STROKE = GREEN

/** The 5 sticker types in left→right palette order. */
export const STICKERS = ['triangle', 'circle', 'star', 'flower', 'apple'] as const
export type StickerType = (typeof STICKERS)[number]

/**
 * The solved placement (square 1-based → sticker), derived from constraint propagation:
 *   apple@1 (fixed), star@2 (not 5, only remaining once flower is at 4),
 *   circle@3, flower@4, triangle@5.
 */
export const SOLVED_PLACEMENT: Readonly<Record<number, StickerType>> = {
  1: 'apple',
  2: 'star',
  3: 'circle',
  4: 'flower',
  5: 'triangle',
}

/** The answer square (1-based). */
export const ANSWER_SQUARE = 4

// ---- colour tokens per sticker -----------------------------------------------
export const STICKER_COLOR: Record<StickerType, string> = {
  triangle: '#30598A', // blue
  circle:   '#f0853a', // orange
  star:     '#F5C518', // yellow
  flower:   '#C026D3', // magenta-purple
  apple:    '#DC2626', // red
}

// ---- layout ------------------------------------------------------------------
const CELL_W = 52
const CELL_H = 48
const GAP = 4
const PAD_X = 16
const PAD_TOP = 10
const GLYPH_AREA_H = 48 // palette row height
const GLYPH_PAD = 8
const LABEL_H = 18
const RULE_GAP = 6
const RULE_LINE = 16

const N = 5
const STRIP_W = N * CELL_W + (N - 1) * GAP
const SVG_W = PAD_X * 2 + STRIP_W
const PALETTE_Y = PAD_TOP
const STRIP_Y = PALETTE_Y + GLYPH_AREA_H + GLYPH_PAD
const NUM_Y = STRIP_Y + CELL_H + 4 + LABEL_H
const RULES_Y = NUM_Y + RULE_GAP + 6
const RULE_COUNT = 3
const SVG_H = RULES_Y + RULE_COUNT * RULE_LINE + PAD_TOP

function cellX(i: number): number {
  return PAD_X + i * (CELL_W + GAP)
}
function cellCX(i: number): number {
  return cellX(i) + CELL_W / 2
}

// ---- glyph renderers (pure SVG, plain geometry) ------------------------------

/** Render a sticker glyph centred at (cx, cy), radius r. */
function StickerGlyph({
  type,
  cx,
  cy,
  r = 16,
  fill,
}: {
  type: StickerType
  cx: number
  cy: number
  r?: number
  fill?: string
}) {
  const color = fill ?? STICKER_COLOR[type]
  switch (type) {
    case 'triangle': {
      const h = r * 1.65
      const hw = r * 0.95
      const points = `${cx},${cy - h * 0.6} ${cx - hw},${cy + h * 0.4} ${cx + hw},${cy + h * 0.4}`
      return <polygon points={points} fill={color} />
    }
    case 'circle':
      return <circle cx={cx} cy={cy} r={r * 0.88} fill={color} />
    case 'star': {
      // 5-pointed star using path
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI / 5) * i - Math.PI / 2
        const radius = i % 2 === 0 ? r * 0.95 : r * 0.42
        return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]
      })
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') + ' Z'
      return <path d={d} fill={color} />
    }
    case 'flower': {
      // 4-petal flower: 4 ellipses rotated around centre + centre circle
      const petalR = r * 0.5
      const petalOff = r * 0.44
      return (
        <g>
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const px = cx + Math.cos(rad) * petalOff
            const py = cy + Math.sin(rad) * petalOff
            return (
              <ellipse
                key={deg}
                cx={px}
                cy={py}
                rx={petalR}
                ry={petalR * 0.65}
                transform={`rotate(${deg}, ${px}, ${py})`}
                fill={color}
              />
            )
          })}
          <circle cx={cx} cy={cy} r={r * 0.32} fill="#F5C518" />
        </g>
      )
    }
    case 'apple': {
      // Simplified apple: rounded body + tiny leaf
      const bodyR = r * 0.78
      const leafD = `M ${cx} ${cy - bodyR + 2} Q ${cx + r * 0.55} ${cy - bodyR - r * 0.35} ${cx + r * 0.18} ${cy - bodyR - r * 0.55} Q ${cx - r * 0.12} ${cy - bodyR - r * 0.22} ${cx} ${cy - bodyR + 2} Z`
      return (
        <g>
          <circle cx={cx} cy={cy + 2} r={bodyR} fill={color} />
          {/* leaf */}
          <path d={leafD} fill="#16A34A" />
          {/* stem */}
          <line
            x1={cx}
            y1={cy - bodyR + 1}
            x2={cx}
            y2={cy - bodyR - r * 0.28}
            stroke="#78350F"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </g>
      )
    }
  }
}

// ---- Props & primitive -------------------------------------------------------

export interface Stickers17ECProps {
  /**
   * Sticker placed in each square. Key = 1-based square number.
   * Omit or leave empty to show all squares blank (the problem state).
   */
  placement?: Partial<Record<number, StickerType>>
  /**
   * Squares to visually highlight (highlight ring / blue fill). 1-based.
   */
  highlighted?: number[]
  /**
   * Show the answer-square ring (green ring on square 4). Default false.
   */
  answerRing?: boolean
  /** Show bilingual rules below the strip. Default true. */
  showRules?: boolean
  lang?: 'en' | 'id'
}

// Text-only rules (no emoji, clean for SVG text)
const RULES_TEXT: Array<{ en: string; id: string }> = [
  { en: 'Star is NOT on square 5', id: 'Bintang BUKAN di kotak 5' },
  { en: 'Apple is on square 1', id: 'Apel ada di kotak 1' },
  { en: 'Flower is next to circle AND triangle', id: 'Bunga bersebelahan dng lingkaran & segitiga' },
]

/**
 * The reusable 5-square sticker strip primitive (palette + numbered strip).
 * With no `placement` it renders the blank problem state.
 */
export function Stickers17EC({
  placement = {},
  highlighted = [],
  answerRing = false,
  showRules = true,
  lang = 'en',
}: Stickers17ECProps = {}) {
  const hlSet = new Set(highlighted)

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${showRules ? SVG_H : RULES_Y}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Palette row: 5 sticker glyphs above the strip ── */}
      {STICKERS.map((type, i) => {
        const cx = cellCX(i)
        const cy = PALETTE_Y + GLYPH_AREA_H / 2
        return <StickerGlyph key={type} type={type} cx={cx} cy={cy} r={16} />
      })}

      {/* ── Numbered strip ── */}
      {Array.from({ length: N }, (_, i) => {
        const sq = i + 1
        const x = cellX(i)
        const isHl = hlSet.has(sq)
        const isAnswer = answerRing && sq === ANSWER_SQUARE
        const sticker = placement[sq]
        return (
          <g key={sq}>
            {/* Cell background */}
            <rect
              x={x}
              y={STRIP_Y}
              width={CELL_W}
              height={CELL_H}
              rx={6}
              fill={isHl ? HIGHLIGHT_FILL : STRIP_FILL}
              stroke={isAnswer ? ANSWER_STROKE : isHl ? BLUE : STRIP_STROKE}
              strokeWidth={isAnswer || isHl ? 2.8 : 1.8}
            />
            {/* Answer ring pulse overlay */}
            {isAnswer && (
              <rect
                x={x + 3}
                y={STRIP_Y + 3}
                width={CELL_W - 6}
                height={CELL_H - 6}
                rx={4}
                fill="none"
                stroke={GREEN}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            )}
            {/* Sticker glyph in cell */}
            {sticker && (
              <StickerGlyph
                type={sticker}
                cx={cellCX(i)}
                cy={STRIP_Y + CELL_H / 2}
                r={14}
              />
            )}
            {/* Square number label below cell */}
            <text
              x={cellCX(i)}
              y={NUM_Y}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={isHl ? BLUE : '#6B7280'}
            >
              {sq}
            </text>
          </g>
        )
      })}

      {/* ── Rules list ── */}
      {showRules &&
        RULES_TEXT.map((rule, i) => {
          const text = lang === 'id' ? rule.id : rule.en
          const y = RULES_Y + i * RULE_LINE
          return (
            <text
              key={i}
              x={PAD_X}
              y={y}
              textAnchor="start"
              fontSize={10.5}
              fontWeight={500}
              fill={INK}
              opacity={0.78}
            >
              {`${i + 1}. ${text}`}
            </text>
          )
        })}
    </svg>
  )
}

/** Default illustration export — blank strip + palette + rules (problem state only). */
export default function Stickers17ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Eva mempunyai 5 stiker: segitiga, lingkaran, bintang, bunga, apel. ' +
        'Dia menempelkannya di 5 kotak bernomor 1 sampai 5. ' +
        'Aturan: bintang bukan di kotak 5; apel di kotak 1; ' +
        'bunga bersebelahan dengan lingkaran maupun segitiga. ' +
        'Di kotak mana bunga ditempel?'
      }
    >
      <Stickers17EC />
    </div>
  )
}
