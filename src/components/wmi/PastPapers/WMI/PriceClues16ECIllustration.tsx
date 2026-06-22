// IKMC-19-EC-Q16 — stem illustration only (text-option choices).
//
// The original problem shows three rows of cartoon-fruit characters with speech
// bubbles stating their combined price, followed by a question asking how much
// all three together cost. The four answer options are plain text (8/9/10/11 cents).
//
// SOURCE FIGURE (OCR 2019.imgs/046–049):
//   Row 1 (046.jpg): apple + pear   → "Together we cost 5 cents."
//   Row 2 (047.jpg): banana + apple → "Together we cost 7 cents."
//   Row 3 (048.jpg): pear + banana  → "Together we cost 10 cents."
//   Question (049.jpg): banana + pear + apple → "How much do we cost together?"
//
// Note: the seed body_en describes these as "one pear and one apple / one pear
// and two apples / three apples and two pears" — that is an OCR misread; the
// actual scanned images confirm THREE DISTINCT FRUITS: apple (red), pear (green),
// banana (yellow).
//
// System:
//   a + p = 5       (apple + pear)
//   b + a = 7       (banana + apple)
//   p + b = 10      (pear + banana)
//   a + p + b = (5+7+10)/2 = 11   ← answer D
//
// This illustration shows ONLY the problem (three clue rows + the question row).
// It never reveals the individual prices or the answer.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.
// Co-exported primitive: `PriceClues16EC` with `litRow` prop for the animator.

// ── colour tokens (raw hex for figure components; matches qupu palette) ──────
export const COLOR = {
  BG: '#FFFDF9',           // qupu-shell warm white
  ROW_EVEN: '#FFF8EE',     // alternating stripe
  ROW_ODD: '#FFFDF9',
  BUBBLE: '#FFFFFF',       // speech bubble fill
  BUBBLE_STROKE: '#D1C0A8',
  BUBBLE_TEXT: '#1F2937',  // qupu-ink
  PRICE_TEXT: '#30598A',   // qupu-brand-blue
  LABEL_TEXT: '#1F2937',
  PLUS: '#6B7280',         // grey plus sign between fruits
  QUESTION_ROW_BG: '#FFF1E5', // qupu-cream for the question row
  QUESTION_TEXT: '#B5530F',   // qupu-brand-orange-dark
  LIT_STROKE: '#30598A',  // highlight ring when litRow is set
  APPLE_BODY: '#D63B2A',
  APPLE_SHINE: '#F7836A',
  APPLE_LEAF: '#3D8A3A',
  APPLE_STEM: '#5C3D1E',
  PEAR_BODY: '#7AB53A',
  PEAR_BELLY: '#A3D15A',
  PEAR_LEAF: '#3D8A3A',
  PEAR_STEM: '#5C3D1E',
  BANANA_BODY: '#EFD040',
  BANANA_SHADOW: '#C8A830',
  BANANA_TIP: '#5C3D1E',
} as const

// ── layout constants ─────────────────────────────────────────────────────────
export const ROW_H = 72       // height of each fruit row
export const SVG_W = 320      // viewBox width
export const SVG_H = ROW_H * 4 + 8  // 4 rows (3 clues + 1 question) + padding
export const FRUIT_R = 22     // radius of fruit "head" circle
export const COL_APPLE = 28   // x centre of item 1 in each row
export const COL_MID = SVG_W / 2   // centre — used for the speech bubble
export const COL_PEAR = 88    // x centre of item 2 (shifted right of plus)
export const COL_BANANA = 28
export const PLUS_X = 58      // x of the + sign between items
export const BUBBLE_W = 110
export const BUBBLE_H = 34
export const BUBBLE_X = SVG_W - BUBBLE_W - 8  // bubble anchored right
export const BUBBLE_Y_OFFSET = (ROW_H - BUBBLE_H) / 2

// ── fruit primitives ─────────────────────────────────────────────────────────

/** A simple drawn apple centred at (cx, cy). */
export function Apple({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* body */}
      <circle cx={cx} cy={cy + 3} r={FRUIT_R - 3} fill={COLOR.APPLE_BODY} />
      {/* shine */}
      <ellipse cx={cx - 5} cy={cy - 4} rx={7} ry={5} fill={COLOR.APPLE_SHINE} opacity={0.55} />
      {/* indent at top */}
      <path d={`M ${cx} ${cy - 18} Q ${cx + 3} ${cy - 22} ${cx + 1} ${cy - 19}`} fill={COLOR.APPLE_BODY} strokeWidth={0} />
      {/* stem */}
      <path d={`M ${cx} ${cy - 19} Q ${cx + 4} ${cy - 27} ${cx + 2} ${cy - 24}`} stroke={COLOR.APPLE_STEM} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* leaf */}
      <path d={`M ${cx} ${cy - 24} Q ${cx + 10} ${cy - 32} ${cx + 8} ${cy - 20}`} fill={COLOR.APPLE_LEAF} />
    </g>
  )
}

/** A simple drawn pear centred at (cx, cy). */
export function Pear({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* bottom bulge */}
      <ellipse cx={cx} cy={cy + 6} rx={FRUIT_R - 4} ry={FRUIT_R - 2} fill={COLOR.PEAR_BODY} />
      {/* top narrower part */}
      <ellipse cx={cx} cy={cy - 8} rx={FRUIT_R - 10} ry={FRUIT_R - 8} fill={COLOR.PEAR_BODY} />
      {/* belly highlight */}
      <ellipse cx={cx - 4} cy={cy + 4} rx={7} ry={9} fill={COLOR.PEAR_BELLY} opacity={0.5} />
      {/* stem */}
      <path d={`M ${cx} ${cy - 16} Q ${cx + 3} ${cy - 24} ${cx + 1} ${cy - 21}`} stroke={COLOR.PEAR_STEM} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* leaf */}
      <path d={`M ${cx} ${cy - 21} Q ${cx + 9} ${cy - 30} ${cx + 7} ${cy - 18}`} fill={COLOR.PEAR_LEAF} />
    </g>
  )
}

/** A simple drawn banana centred at (cx, cy). */
export function Banana({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* main curved body */}
      <path
        d={`M ${cx - 14} ${cy + 10}
            Q ${cx - 18} ${cy - 2} ${cx - 8} ${cy - 14}
            Q ${cx + 2} ${cy - 22} ${cx + 14} ${cy - 12}
            Q ${cx + 20} ${cy - 6} ${cx + 16} ${cy + 6}
            Q ${cx + 8} ${cy + 16} ${cx - 6} ${cy + 16}
            Q ${cx - 14} ${cy + 16} ${cx - 14} ${cy + 10} Z`}
        fill={COLOR.BANANA_BODY}
        stroke={COLOR.BANANA_SHADOW}
        strokeWidth={1.4}
      />
      {/* ridge line */}
      <path
        d={`M ${cx - 10} ${cy + 8} Q ${cx} ${cy - 18} ${cx + 12} ${cy - 10}`}
        stroke={COLOR.BANANA_SHADOW}
        strokeWidth={1.2}
        fill="none"
        opacity={0.6}
      />
      {/* tips */}
      <circle cx={cx - 13} cy={cy + 11} r={3.5} fill={COLOR.BANANA_TIP} />
      <circle cx={cx + 15} cy={cy - 11} r={3.5} fill={COLOR.BANANA_TIP} />
    </g>
  )
}

// ── row data ──────────────────────────────────────────────────────────────────
export type FruitId = 'apple' | 'pear' | 'banana'

export interface ClueRow {
  /** First fruit item in the row. */
  left: FruitId
  /** Second fruit item (or undefined for the question row which has all three). */
  right: FruitId
  /** Price in cents (the combined price shown in the speech bubble). */
  price: number
  /** EN caption text inside the bubble. */
  bubbleEn: string
  /** ID caption text inside the bubble. */
  bubbleId: string
  isQuestion?: false
}

export interface QuestionRow {
  isQuestion: true
  bubbleEn: string
  bubbleId: string
}

export type RowData = ClueRow | QuestionRow

/** The three given clue rows + the final question row, bound to the params. */
// eslint-disable-next-line react-refresh/only-export-components
export const ROWS: RowData[] = [
  { left: 'apple', right: 'pear', price: 5, bubbleEn: '= 5 cents', bubbleId: '= 5 sen', isQuestion: undefined },
  { left: 'banana', right: 'apple', price: 7, bubbleEn: '= 7 cents', bubbleId: '= 7 sen', isQuestion: undefined },
  { left: 'pear', right: 'banana', price: 10, bubbleEn: '= 10 cents', bubbleId: '= 10 sen', isQuestion: undefined },
  { isQuestion: true, bubbleEn: '= ? cents', bubbleId: '= ? sen' },
]

function renderFruit(id: FruitId, cx: number, cy: number) {
  if (id === 'apple') return <Apple cx={cx} cy={cy} />
  if (id === 'pear') return <Pear cx={cx} cy={cy} />
  return <Banana cx={cx} cy={cy} />
}

// ── primitive ─────────────────────────────────────────────────────────────────

/**
 * The four-row price-clue layout.
 *
 * @param litRow  0-based row index to highlight (animator use). null = no highlight.
 * @param lang    'en' | 'id' — controls bubble text.
 *
 * The three clue rows are always shown with their combined prices. The question
 * row shows "= ? cents" and never reveals the answer.
 */
export function PriceClues16EC({ litRow, lang = 'en' }: { litRow?: number | null; lang?: 'en' | 'id' }) {
  const isId = lang === 'id'

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ROWS.map((row, ri) => {
        const ry = ri * ROW_H + 4   // top of this row
        const cy = ry + ROW_H / 2   // vertical centre
        const isLit = litRow === ri
        const isQ = 'isQuestion' in row && row.isQuestion === true
        const rowBg = isQ ? COLOR.QUESTION_ROW_BG : ri % 2 === 0 ? COLOR.ROW_ODD : COLOR.ROW_EVEN

        return (
          <g key={ri}>
            {/* row background stripe */}
            <rect
              x={2}
              y={ry + 1}
              width={SVG_W - 4}
              height={ROW_H - 2}
              rx={10}
              fill={rowBg}
              stroke={isLit ? COLOR.LIT_STROKE : 'none'}
              strokeWidth={isLit ? 2.5 : 0}
            />

            {isQ ? (
              // Question row: all three fruits in a row
              <>
                <Banana cx={28} cy={cy} />
                <text x={55} y={cy + 5} textAnchor="middle" fontSize={16} fontWeight="bold" fill={COLOR.PLUS}>+</text>
                <Pear cx={78} cy={cy} />
                <text x={105} y={cy + 5} textAnchor="middle" fontSize={16} fontWeight="bold" fill={COLOR.PLUS}>+</text>
                <Apple cx={128} cy={cy} />
              </>
            ) : (
              // Clue row: two fruits with a + between them
              <>
                {renderFruit((row as ClueRow).left, 28, cy)}
                <text x={55} y={cy + 5} textAnchor="middle" fontSize={16} fontWeight="bold" fill={COLOR.PLUS}>+</text>
                {renderFruit((row as ClueRow).right, 80, cy)}
              </>
            )}

            {/* speech bubble */}
            <rect
              x={BUBBLE_X}
              y={ry + BUBBLE_Y_OFFSET}
              width={BUBBLE_W}
              height={BUBBLE_H}
              rx={8}
              fill={isQ ? '#FFF1E5' : COLOR.BUBBLE}
              stroke={isLit ? COLOR.LIT_STROKE : COLOR.BUBBLE_STROKE}
              strokeWidth={isLit ? 2.2 : 1.4}
            />
            {/* bubble tail pointing left */}
            <path
              d={`M ${BUBBLE_X} ${ry + BUBBLE_Y_OFFSET + BUBBLE_H / 2 - 5}
                  L ${BUBBLE_X - 10} ${ry + BUBBLE_Y_OFFSET + BUBBLE_H / 2}
                  L ${BUBBLE_X} ${ry + BUBBLE_Y_OFFSET + BUBBLE_H / 2 + 5} Z`}
              fill={isQ ? '#FFF1E5' : COLOR.BUBBLE}
              stroke={isLit ? COLOR.LIT_STROKE : COLOR.BUBBLE_STROKE}
              strokeWidth={isLit ? 2.2 : 1.4}
            />
            {/* bubble text */}
            <text
              x={BUBBLE_X + BUBBLE_W / 2}
              y={ry + BUBBLE_Y_OFFSET + BUBBLE_H / 2 + 5}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill={isQ ? COLOR.QUESTION_TEXT : COLOR.PRICE_TEXT}
            >
              {isId ? (row as { bubbleId: string }).bubbleId : (row as { bubbleEn: string }).bubbleEn}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the static stem illustration for the card (no lit row). */
export default function PriceClues16ECIllustration({ lang = 'en' }: { lang?: 'en' | 'id' } = {}) {
  const label =
    lang === 'id'
      ? 'Tiga baris buah dengan harga gabungan: apel+pir=5 sen, pisang+apel=7 sen, pir+pisang=10 sen. Pertanyaan: harga pisang+pir+apel bersama?'
      : 'Three rows of fruit with combined prices: apple+pear=5 cents, banana+apple=7 cents, pear+banana=10 cents. Question: how much do banana+pear+apple cost together?'

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={label}>
      <PriceClues16EC lang={lang} />
    </div>
  )
}
