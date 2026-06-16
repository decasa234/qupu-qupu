// Symbol-position figure for WMI-19P1A-Q3 (2019 semifinal Grade 1, Paper A).
//
// Redrawn from db/seed/wmi/figures/2019-semifinal-g1-a-q3.jpg: two rows of nine
// symbols each, framed in a box. The hidden rule (read off the rows): a symbol's
// VALUE equals its POSITION in its row — position 1 = 1, position 2 = 2, … so the
// row is just a labelled 1..9 number line of glyphs. The boxed symbol on the
// right repeats the symbol that lives at POSITION 4, so it stands for 4 (answer D).
//
// The static figure shows ONLY the problem: the two glyph rows and the boxed
// query glyph, with NO position numbers and NO value revealed. The explainer adds
// the position numbers and matches the boxed glyph to position 4.
//
// Basic single-codepoint glyphs only; SSR-safe and deterministic (no params,
// no window/document, no Math.random/Date.now).

// Top row glyphs, positions 1..9 (single codepoints, basic shapes only).
export const TOP_ROW = ['◉', '▣', '◇', '⬣', '★', '✳', '❉', '▯', '◈']
// Bottom row glyphs, positions 1..9.
export const BOTTOM_ROW = ['●', '☾', '✚', '■', '◆', '◗', '✶', '⦸', '◐']

// The boxed query symbol is the glyph at POSITION 4 of the top row (1-indexed),
// so by the position rule it stands for 4.
export const BOXED_POSITION = 4 // 1-indexed
export const BOXED_GLYPH = TOP_ROW[BOXED_POSITION - 1] // '⬣'
export const ANSWER = BOXED_POSITION // 4

const INK = '#1F2937'
const BLUE = '#30598A'

export const SYMBOL_VIEW_W = 460
export const SYMBOL_VIEW_H = 210

const COL_X0 = 40 // centre x of position 1
const COL_GAP = 44 // spacing between glyph columns
const TOP_Y = 50
const BOTTOM_Y = 110
const NUM_DY = 30 // position number sits this far below a glyph row

/** x-centre of column c (0-indexed). */
export function colX(c: number): number {
  return COL_X0 + c * COL_GAP
}

export interface SymbolRowsProps {
  /** Show the 1..9 position numbers under both rows. */
  showPositions?: boolean
  /** Column index (0-indexed) to spotlight in both rows; null = none. */
  spotlightCol?: number | null
  /** Light up the link from the boxed glyph to its row position. */
  matchBoxed?: boolean
}

export function SymbolRows({ showPositions = false, spotlightCol = null, matchBoxed = false }: SymbolRowsProps) {
  const boxCenterX = colX(8) + COL_GAP + 28 // boxed query glyph, right of the rows
  const boxCenterY = (TOP_Y + BOTTOM_Y) / 2

  return (
    <svg
      viewBox={`0 0 ${SYMBOL_VIEW_W} ${SYMBOL_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* frame around the two rows */}
      <rect
        x={COL_X0 - 26}
        y={TOP_Y - 30}
        width={COL_GAP * 8 + 52}
        height={BOTTOM_Y - TOP_Y + 60}
        rx={10}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={2}
      />

      {/* top row */}
      {TOP_ROW.map((g, c) => (
        <g key={`t${c}`}>
          {spotlightCol === c && (
            <rect
              x={colX(c) - 18}
              y={TOP_Y - 20}
              width={36}
              height={40}
              rx={7}
              fill="#FEF3C7"
              stroke="#F59E0B"
              strokeWidth={2}
            />
          )}
          <text x={colX(c)} y={TOP_Y} textAnchor="middle" dominantBaseline="central" fontSize={24} fill={INK}>
            {g}
          </text>
          {showPositions && (
            <text x={colX(c)} y={TOP_Y + NUM_DY} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill={BLUE}>
              {c + 1}
            </text>
          )}
        </g>
      ))}

      {/* bottom row */}
      {BOTTOM_ROW.map((g, c) => (
        <g key={`b${c}`}>
          {spotlightCol === c && (
            <rect
              x={colX(c) - 18}
              y={BOTTOM_Y - 20}
              width={36}
              height={40}
              rx={7}
              fill="#FEF3C7"
              stroke="#F59E0B"
              strokeWidth={2}
            />
          )}
          <text x={colX(c)} y={BOTTOM_Y} textAnchor="middle" dominantBaseline="central" fontSize={24} fill={INK}>
            {g}
          </text>
          {showPositions && (
            <text x={colX(c)} y={BOTTOM_Y + NUM_DY} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill={BLUE}>
              {c + 1}
            </text>
          )}
        </g>
      ))}

      {/* matching link from boxed glyph to its position in the top row */}
      {matchBoxed && (
        <path
          d={`M ${boxCenterX} ${boxCenterY - 18} Q ${(boxCenterX + colX(BOXED_POSITION - 1)) / 2} ${TOP_Y - 44} ${colX(BOXED_POSITION - 1)} ${TOP_Y - 22}`}
          fill="none"
          stroke="#10B981"
          strokeWidth={2.5}
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
      )}

      {/* the boxed query glyph on the right */}
      <rect
        x={boxCenterX - 22}
        y={boxCenterY - 24}
        width={44}
        height={48}
        rx={7}
        fill="#E1EFFB"
        stroke={BLUE}
        strokeWidth={2.5}
      />
      <text x={boxCenterX} y={boxCenterY} textAnchor="middle" dominantBaseline="central" fontSize={26} fill={INK}>
        {BOXED_GLYPH}
      </text>
    </svg>
  )
}

export default function SymbolPos19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two rows of nine symbols inside a box, and one symbol shown in a box on the right. Each symbol stands for its position number in the row."
    >
      <SymbolRows />
    </div>
  )
}
