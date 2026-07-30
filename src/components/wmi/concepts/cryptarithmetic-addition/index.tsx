/**
 * N16 = cryptarithmetic-addition — question figure.
 *
 * The stem writes the puzzle inline ("AB + CB = ADD"), which hides the one
 * structure the child has to reason about: the COLUMNS. This draws it the way
 * it is written on paper — the two addends stacked, right-aligned, a rule line,
 * the total underneath — so the ones column, the tens column and the hundreds
 * column line up and the carries have somewhere to go.
 *
 * Pure render from params: no random, no dates, SSR-safe, and it falls back to
 * a sample when params arrive malformed.
 *
 * LANGUAGE: concept illustrations are handed only `{ params }` (see
 * `IllustrationComponent` in ../registry.ts) and `params` carries no locale, so
 * the figure cannot know whether the stem is rendering in EN or ID. It is drawn
 * WORDLESS — letters, a plus sign, a rule line and a "= ?" prompt read the same
 * in both languages. Only the aria-label is necessarily prose; it is written in
 * Indonesian to match the page's `<html lang="id">`.
 */

// ── shared geometry, palette and puzzle maths ──────────────────────────────
// Exported so the animated explainer paints the SAME picture instead of keeping
// its own copy of these numbers — a copy silently desyncs when the figure moves.

export interface CryptaParams {
  addend1: number
  addend2: number
  askDigit: number
}

export const CRYPTA_INK = {
  /** A letter whose digit is still unknown. */
  letter: '#30598A',
  /** The letter the question asks about, and the carry chips. */
  ask: '#F0853A',
  /** A digit that has been pinned down. */
  settled: '#58A700',
  /** A candidate that has just been ruled out. */
  reject: '#D9534F',
  tile: '#FDF8F1',
  tileEdge: '#EADFCD',
  rule: '#B5A896',
  muted: '#9A8E7C',
} as const

/** Dash pattern that marks the asked letter as "this is what we are hunting". */
export const ASK_DASH = '5 4'

const SAMPLE: CryptaParams = { addend1: 11, addend2: 89, askDigit: 8 }

function isDigitCount(n: unknown, lo: number, hi: number): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= lo && n <= hi
}

/** Coerces anything into a drawable puzzle; falls back to the sample. */
export function normalizeCryptaParams(params: unknown): CryptaParams {
  const p = (params ?? {}) as Partial<CryptaParams>
  const addend1 = isDigitCount(p.addend1, 10, 99) ? p.addend1 : SAMPLE.addend1
  const addend2 = isDigitCount(p.addend2, 10, 99) ? p.addend2 : SAMPLE.addend2
  const m = buildCryptaMapping(addend1, addend2)
  // The asked digit must be one that actually appears, or there is no letter to
  // colour; pooled instances from an older generator could carry anything.
  const askDigit =
    isDigitCount(p.askDigit, 0, 9) && m.distinctDigits.includes(p.askDigit)
      ? p.askDigit
      : m.distinctDigits[0]
  return { addend1, addend2, askDigit }
}

export interface CryptaMapping {
  sum: number
  digitToLetter: Record<string, string>
  distinctDigits: number[]
  letters: string[]
  wordA: string
  wordB: string
  wordS: string
}

/**
 * Mirrors `buildMapping` in
 * api/services/wmi/concepts/cryptarithmetic-addition/index.ts: read the decimal
 * strings of addend1, then addend2, then the sum, left-to-right, and hand out
 * 'A','B','C',… to digits in first-appearance order.
 */
export function buildCryptaMapping(addend1: number, addend2: number): CryptaMapping {
  const sum = addend1 + addend2
  const scan = String(addend1) + String(addend2) + String(sum)
  const digitToLetter: Record<string, string> = {}
  const distinctDigits: number[] = []
  const letters: string[] = []
  for (const ch of scan) {
    if (!(ch in digitToLetter)) {
      const letter = String.fromCharCode(65 + distinctDigits.length)
      digitToLetter[ch] = letter
      distinctDigits.push(Number(ch))
      letters.push(letter)
    }
  }
  const wordOf = (n: number) =>
    String(n)
      .split('')
      .map((c) => digitToLetter[c])
      .join('')
  return {
    sum,
    digitToLetter,
    distinctDigits,
    letters,
    wordA: wordOf(addend1),
    wordB: wordOf(addend2),
    wordS: wordOf(sum),
  }
}

/**
 * The columns of the written sum, RIGHT TO LEFT: index 0 is the ones column.
 * `a`/`b` are null where an addend is shorter than the total (the hundreds
 * column of a two-digit + two-digit sum receives only a carry).
 */
export interface CryptaColumn {
  index: number
  a: string | null
  b: string | null
  s: string
}

export function cryptaColumns(m: CryptaMapping): CryptaColumn[] {
  const A = m.wordA.split('').reverse()
  const B = m.wordB.split('').reverse()
  const S = m.wordS.split('').reverse()
  return S.map((s, index) => ({ index, a: A[index] ?? null, b: B[index] ?? null, s }))
}

/** The leading letters — the ones that may never stand for 0. */
export function cryptaLeading(m: CryptaMapping): Set<string> {
  return new Set([m.wordA[0], m.wordB[0], m.wordS[0]])
}

// ── coordinate maths ───────────────────────────────────────────────────────

export interface CryptaGeom {
  /** How many digit columns the written sum has. */
  cols: number
  cellW: number
  cellH: number
  colPitch: number
  /** Left edge of column k, counted LEFT to RIGHT (k = 0 is the leftmost). */
  colX: (k: number) => number
  rowAY: number
  rowBY: number
  rowSY: number
  ruleY: number
  plusX: number
  /** viewBox width of the sum block. */
  width: number
  /** viewBox height of the sum block on its own (no legend, no carry row). */
  blockHeight: number
  /** Height of the carry strip the explainer adds above the block. */
  carryH: number
  /** On-screen width the static figure renders at. */
  drawWidth: number
}

const CELL_W = 40
const CELL_H = 40
const COL_PITCH = 46
const ROW_PITCH = 48
const PAD_LEFT = 34
const PAD_RIGHT = 8
const PAD_TOP = 4

export function cryptaGeometry(cols: number): CryptaGeom {
  const rowAY = PAD_TOP
  const rowBY = rowAY + ROW_PITCH
  const ruleY = rowBY + CELL_H + 7
  const rowSY = ruleY + 9
  return {
    cols,
    cellW: CELL_W,
    cellH: CELL_H,
    colPitch: COL_PITCH,
    colX: (k: number) => PAD_LEFT + k * COL_PITCH,
    rowAY,
    rowBY,
    rowSY,
    ruleY,
    plusX: PAD_LEFT / 2 + 2,
    width: PAD_LEFT + cols * COL_PITCH - (COL_PITCH - CELL_W) + PAD_RIGHT,
    blockHeight: rowSY + CELL_H + PAD_TOP,
    carryH: 26,
    drawWidth: 224,
  }
}

/** Where one letter of a word sits: words are RIGHT-aligned in the columns. */
export function cryptaSlots(word: string, cols: number): Array<{ k: number; letter: string }> {
  const offset = cols - word.length
  return word.split('').map((letter, i) => ({ k: offset + i, letter }))
}

/** The y of a row, and the baseline the letter/digit sits on inside it. */
export function cryptaRowY(geom: CryptaGeom, row: 'a' | 'b' | 's'): number {
  return row === 'a' ? geom.rowAY : row === 'b' ? geom.rowBY : geom.rowSY
}

// ── screen-reader label ────────────────────────────────────────────────────
// Policy: describe the layout and spell out every letter (they are the puzzle,
// freely readable), name the letter being hunted, and NEVER speak a digit —
// the digits are exactly what the child has to work out.

export function cryptaAriaLabel(p: CryptaParams): string {
  const m = buildCryptaMapping(p.addend1, p.addend2)
  const askLetter = m.digitToLetter[String(p.askDigit)]
  const spell = (word: string) => word.split('').join(' ')
  return (
    `Penjumlahan bersusun. Baris atas ${spell(m.wordA)}, baris bawah ${spell(m.wordB)}, ` +
    `lalu garis, dan hasilnya ${spell(m.wordS)}. Huruf-huruf sejajar dalam kolom. ` +
    `Tiap huruf mewakili satu angka yang berbeda. Huruf ${askLetter} adalah yang dicari.`
  )
}

// ── the figure ─────────────────────────────────────────────────────────────

export default function CryptarithmeticAdditionIllustration({ params }: { params: unknown }) {
  const p = normalizeCryptaParams(params)
  const m = buildCryptaMapping(p.addend1, p.addend2)
  const askLetter = m.digitToLetter[String(p.askDigit)]
  const geom = cryptaGeometry(m.wordS.length)

  const legendGap = 12
  const legendH = 30
  // +4 so the legend's dashed ring is not clipped by the viewBox edge.
  const height = geom.blockHeight + legendGap + legendH + 4

  // One position of the written sum: a soft tile with the letter on it. The
  // letter under question wears the orange dashed ring so the child can see
  // where the hunted letter actually sits in the columns.
  const tile = (key: string, k: number, y: number, letter: string) => {
    const isAsk = letter === askLetter
    const x = geom.colX(k)
    return (
      <g key={key}>
        <rect
          x={x}
          y={y}
          width={geom.cellW}
          height={geom.cellH}
          rx={10}
          fill={CRYPTA_INK.tile}
          stroke={isAsk ? CRYPTA_INK.ask : CRYPTA_INK.tileEdge}
          strokeWidth={isAsk ? 3 : 2}
          strokeDasharray={isAsk ? ASK_DASH : undefined}
        />
        <text
          x={x + geom.cellW / 2}
          y={y + geom.cellH / 2 + 9}
          textAnchor="middle"
          fontSize={26}
          fontWeight="bold"
          fill={isAsk ? CRYPTA_INK.ask : CRYPTA_INK.letter}
        >
          {letter}
        </text>
      </g>
    )
  }

  // Centred under the DIGIT COLUMNS, not the whole viewBox — the block carries a
  // wide left margin for the plus sign, and centring on that reads as skewed.
  const legendCx = (geom.colX(0) + geom.colX(geom.cols - 1) + geom.cellW) / 2
  const legendY = geom.blockHeight + legendGap

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={cryptaAriaLabel(p)}>
      <svg viewBox={`0 0 ${geom.width} ${height}`} width={geom.drawWidth}>
        {/* the two addends, right-aligned into the columns */}
        {cryptaSlots(m.wordA, geom.cols).map((slot) =>
          tile(`a${slot.k}`, slot.k, geom.rowAY, slot.letter),
        )}
        {cryptaSlots(m.wordB, geom.cols).map((slot) =>
          tile(`b${slot.k}`, slot.k, geom.rowBY, slot.letter),
        )}

        {/* the plus sign, against the second addend */}
        <text
          x={geom.plusX}
          y={geom.rowBY + geom.cellH / 2 + 9}
          textAnchor="middle"
          fontSize={26}
          fontWeight="bold"
          fill={CRYPTA_INK.muted}
        >
          +
        </text>

        {/* the rule line */}
        <line
          x1={6}
          y1={geom.ruleY}
          x2={geom.width - 6}
          y2={geom.ruleY}
          stroke={CRYPTA_INK.rule}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* the total */}
        {cryptaSlots(m.wordS, geom.cols).map((slot) =>
          tile(`s${slot.k}`, slot.k, geom.rowSY, slot.letter),
        )}

        {/* "asked letter = ?" prompt, wordless on purpose */}
        <g>
          <rect
            x={legendCx - 46}
            y={legendY}
            width={28}
            height={legendH}
            rx={8}
            fill={CRYPTA_INK.tile}
            stroke={CRYPTA_INK.ask}
            strokeWidth={2.5}
            strokeDasharray={ASK_DASH}
          />
          <text
            x={legendCx - 32}
            y={legendY + legendH / 2 + 7}
            textAnchor="middle"
            fontSize={19}
            fontWeight="bold"
            fill={CRYPTA_INK.ask}
          >
            {askLetter}
          </text>
          <text
            x={legendCx + 4}
            y={legendY + legendH / 2 + 7}
            textAnchor="middle"
            fontSize={19}
            fontWeight="bold"
            fill={CRYPTA_INK.muted}
          >
            =
          </text>
          <text
            x={legendCx + 30}
            y={legendY + legendH / 2 + 8}
            textAnchor="middle"
            fontSize={22}
            fontWeight="bold"
            fill={CRYPTA_INK.ask}
          >
            ?
          </text>
        </g>
      </svg>
    </div>
  )
}
