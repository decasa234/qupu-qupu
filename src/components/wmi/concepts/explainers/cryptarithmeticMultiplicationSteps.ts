// cryptarithmetic-multiplication — post-answer storyboard.
//
// Letters cover digits in a written `top × multiplier = product`. The skill being
// taught is NOT "spot the missing number", it is COLUMN WORK: start at the ones
// column, take only what that column forces, push the carry left, repeat.
//
// So the beats are a real right-to-left walk of the columns, mirroring
// api/services/wmi/concepts/cryptarithmetic-multiplication/index.ts. A column is
// only skipped when it pins nothing AND carries nothing — a column that produces
// a carry always gets its own beat, so no later beat leans on a carry the child
// never saw worked out. Nothing before the final beat states the answer.
//
// Pure data: no React, no randomness, no dates — unit-testable and SSR-safe.

export type Lang = 'en' | 'id'

export type MulTone = 'plan' | 'work' | 'win'

export type MulStepKind = 'setup' | 'column' | 'answer'

export type MulAsk = 'the-product' | 'sum-of-hidden-digits' | 'one-named-digit'

export interface MulParams {
  top: number
  multiplier: number
  hiddenTop: number[]
  hiddenProduct: number[]
  ask: MulAsk
  askSlot: number
}

/** A digit covered by a letter. `col` is 0 for the ones column, counting leftwards. */
export interface MulSlot {
  row: 'top' | 'product'
  index: number
  col: number
  letter: string
  digit: number
}

export interface MulPuzzle {
  top: number
  multiplier: number
  product: number
  topStr: string
  prodStr: string
  topMask: string
  prodMask: string
  slots: MulSlot[]
  askedSlot: MulSlot
}

/** The 0-9 strip shown while one column narrows a covered top digit to a single digit. */
export interface MulCandidates {
  letter: string
  /** The only digit that survives — always one, the column forces it. */
  alive: number
  /** Every digit the column just ruled out. */
  cut: number[]
}

export interface MulStep {
  kind: MulStepKind
  /** Short chip naming the move, e.g. "Kolom satuan". */
  phase: string
  caption: string
  /** The arithmetic line under the board, e.g. "8 × 3 + 2 = 26". */
  work: string
  workSub: string | null
  tone: MulTone
  /** Spotlighted column, 0 = ones; null spotlights none. */
  focus: number | null
  /** Carry INTO column j, for j = 0…columnCount; null while not yet worked out. */
  carries: Array<number | null>
  /** Letter -> digit for every box uncovered so far. */
  revealed: Record<string, number>
  /** Letters uncovered BY THIS BEAT — drawn with a bloom ring. */
  justRevealed: string[]
  candidates: MulCandidates | null
  /** The asked value — null on every beat but the last. */
  answer: string | null
  result: boolean
  /** How long this beat holds on screen during a play-through, in ms. */
  hold: number
}

export interface MulStoryboard {
  puzzle: MulPuzzle
  askLetter: string | null
  answer: string
  steps: MulStep[]
  finalIndex: number
}

const SAMPLE: MulParams = {
  top: 24,
  multiplier: 3,
  hiddenTop: [1],
  hiddenProduct: [0],
  ask: 'one-named-digit',
  askSlot: 1,
}

const asc = (a: number, b: number) => a - b
const ASKS: MulAsk[] = ['the-product', 'sum-of-hidden-digits', 'one-named-digit']

function intIn(n: unknown, lo: number, hi: number): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= lo && n <= hi
}

function indices(v: unknown, hi: number): number[] {
  if (!Array.isArray(v)) return []
  return [...new Set(v.filter((n): n is number => intIn(n, 0, hi)))].sort(asc)
}

/** Coerces anything into a drawable puzzle; falls back to the sample. */
export function normalizeMulParams(params: unknown): MulParams {
  const p = (params ?? {}) as Partial<MulParams>
  const top = intIn(p.top, 10, 999) ? p.top : SAMPLE.top
  const multiplier = intIn(p.multiplier, 2, 9) ? p.multiplier : SAMPLE.multiplier
  const prodLen = String(top * multiplier).length
  return {
    top,
    multiplier,
    hiddenTop: indices(p.hiddenTop, String(top).length - 1),
    hiddenProduct: indices(p.hiddenProduct, prodLen - 1),
    ask: ASKS.includes(p.ask as MulAsk) ? (p.ask as MulAsk) : SAMPLE.ask,
    askSlot: intIn(p.askSlot, 0, 3) ? p.askSlot : 0,
  }
}

/**
 * Mirrors `buildPuzzle` on the backend: letters A, B, C in reading order, and a
 * column may never cover both its top digit and its product digit (that column
 * would pin neither, and the right-to-left chain would stall there).
 */
export function buildMulPuzzle(p: MulParams): MulPuzzle {
  const topStr = String(p.top)
  const product = p.top * p.multiplier
  const prodStr = String(product)
  const topLen = topStr.length
  const prodLen = prodStr.length

  const topIdx = p.hiddenTop.filter((i) => i < topLen)
  const blocked = new Set(topIdx.map((i) => topLen - 1 - i))
  const prodIdx = p.hiddenProduct.filter((k) => k < prodLen && !blocked.has(prodLen - 1 - k))

  const slots: MulSlot[] = []
  for (const index of topIdx) {
    slots.push({
      row: 'top',
      index,
      col: topLen - 1 - index,
      letter: String.fromCharCode(65 + slots.length),
      digit: Number(topStr[index]),
    })
  }
  for (const index of prodIdx) {
    slots.push({
      row: 'product',
      index,
      col: prodLen - 1 - index,
      letter: String.fromCharCode(65 + slots.length),
      digit: Number(prodStr[index]),
    })
  }

  const mask = (str: string, row: 'top' | 'product') =>
    str
      .split('')
      .map((ch, i) => slots.find((s) => s.row === row && s.index === i)?.letter ?? ch)
      .join('')

  return {
    top: p.top,
    multiplier: p.multiplier,
    product,
    topStr,
    prodStr,
    topMask: mask(topStr, 'top'),
    prodMask: mask(prodStr, 'product'),
    slots,
    askedSlot: slots[Math.min(Math.max(p.askSlot, 0), Math.max(slots.length - 1, 0))],
  }
}

interface Col {
  col: number
  hasTop: boolean
  topDigit: number
  topLetter: string | null
  carryIn: number
  raw: number
  prodDigit: number
  prodLetter: string | null
  carryOut: number
}

function trace(p: MulParams, z: MulPuzzle): Col[] {
  const topLen = z.topStr.length
  const out: Col[] = []
  let carryIn = 0
  for (let col = 0; col < z.prodStr.length; col++) {
    const hasTop = col < topLen
    const topDigit = hasTop ? Number(z.topStr[topLen - 1 - col]) : 0
    const raw = topDigit * p.multiplier + carryIn
    const prodDigit = raw % 10
    const carryOut = (raw - prodDigit) / 10
    out.push({
      col,
      hasTop,
      topDigit,
      topLetter: z.slots.find((s) => s.row === 'top' && s.col === col)?.letter ?? null,
      carryIn,
      raw,
      prodDigit,
      prodLetter: z.slots.find((s) => s.row === 'product' && s.col === col)?.letter ?? null,
      carryOut,
    })
    carryIn = carryOut
  }
  return out
}

const COL_EN = ['Ones', 'Tens', 'Hundreds', 'Thousands']
const COL_ID = ['satuan', 'puluhan', 'ratusan', 'ribuan']

export function buildCryptarithmeticMultiplicationSteps(
  params: unknown,
  lang: Lang = 'en',
): MulStoryboard {
  const p = normalizeMulParams(params)
  const z = buildMulPuzzle(p)
  const cols = trace(p, z)
  const m = p.multiplier
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const answer =
    p.ask === 'the-product'
      ? String(z.product)
      : p.ask === 'sum-of-hidden-digits'
        ? String(z.slots.reduce((sum, s) => sum + s.digit, 0))
        : String(z.askedSlot?.digit ?? 0)
  const askLetter = p.ask === 'one-named-digit' ? (z.askedSlot?.letter ?? null) : null

  const nCols = cols.length
  const blankCarries = (): Array<number | null> => new Array(nCols + 1).fill(null)
  const carriesUpTo = (upTo: number): Array<number | null> => {
    const out = blankCarries()
    for (let j = 0; j <= upTo && j < cols.length; j++) out[j] = cols[j].carryIn
    if (upTo >= 0 && upTo < cols.length) out[upTo + 1] = cols[upTo].carryOut
    return out
  }

  const steps: MulStep[] = []
  const revealed: Record<string, number> = {}

  const zero = blankCarries()
  zero[0] = 0
  steps.push({
    kind: 'setup',
    phase: T('Write it down', 'Tulis bersusun'),
    caption: T(
      'Stack it up and start at the ones column, on the right.',
      'Susun ke bawah, lalu mulai dari kolom satuan di paling kanan.',
    ),
    work: `${z.topMask} × ${m} = ${z.prodMask}`,
    workSub: T('nothing carried into the ones column', 'kolom satuan belum dapat simpanan'),
    tone: 'plan',
    focus: 0,
    carries: zero,
    revealed: {},
    justRevealed: [],
    candidates: null,
    answer: null,
    result: false,
    hold: 2200,
  })

  const lastDecisive = cols.reduce((last, c) => (c.topLetter || c.prodLetter ? c.col : last), 0)

  for (const c of cols) {
    if (c.col > lastDecisive) break
    const decisive = !!(c.topLetter || c.prodLetter)
    if (!decisive && c.col !== 0 && c.carryOut === 0) continue

    const phase = T(`${COL_EN[c.col] ?? 'Next'} column`, `Kolom ${COL_ID[c.col] ?? 'berikutnya'}`)
    const plus = c.carryIn > 0 ? ` + ${c.carryIn}` : ''
    const carrySub =
      c.carryOut > 0
        ? T(`carry ${c.carryOut} to the left`, `simpan ${c.carryOut} ke kiri`)
        : T('nothing to carry', 'tidak ada simpanan')

    let caption: string
    let work: string
    let workSub: string
    let candidates: MulCandidates | null = null
    const justRevealed: string[] = []

    if (c.topLetter) {
      // The product digit here is written, so the column asks which digit could
      // possibly sit above it — and exactly one can.
      candidates = {
        letter: c.topLetter,
        alive: c.topDigit,
        cut: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
          (d) => (d * m + c.carryIn) % 10 !== c.prodDigit,
        ),
      }
      caption = T(
        `Only one digit times ${m} can end in ${c.prodDigit} here.`,
        `Cuma satu angka yang kalau dikali ${m} berakhir ${c.prodDigit} di sini.`,
      )
      work = `${c.topLetter} × ${m}${plus} → …${c.prodDigit}`
      workSub = `${c.topLetter} = ${c.topDigit} · ${carrySub}`
      revealed[c.topLetter] = c.topDigit
      justRevealed.push(c.topLetter)
    } else if (!c.hasTop) {
      caption = T(
        'Nothing left to multiply — only the carry lands here.',
        'Tidak ada yang dikali lagi — tinggal simpanan yang turun ke sini.',
      )
      work = T(`carry ${c.carryIn}`, `simpanan ${c.carryIn}`)
      if (c.prodLetter) {
        workSub = `${c.prodLetter} = ${c.carryIn}`
        revealed[c.prodLetter] = c.carryIn
        justRevealed.push(c.prodLetter)
      } else {
        workSub = T(`matches the ${c.prodDigit} written here`, `cocok dengan ${c.prodDigit} di sini`)
      }
    } else {
      work = `${c.topDigit} × ${m}${plus} = ${c.raw}`
      if (c.prodLetter) {
        caption = T(
          'Multiply, add the carry, write the ones digit.',
          'Kalikan, tambah simpanan, tulis angka satuannya.',
        )
        workSub = `${c.prodLetter} = ${c.prodDigit} · ${carrySub}`
        revealed[c.prodLetter] = c.prodDigit
        justRevealed.push(c.prodLetter)
      } else {
        caption = T(
          'This column already matches — take its carry along.',
          'Kolom ini sudah cocok — simpanannya ikut dibawa.',
        )
        workSub = T(
          `matches the ${c.prodDigit} written here · ${carrySub}`,
          `cocok dengan ${c.prodDigit} di sini · ${carrySub}`,
        )
      }
    }

    steps.push({
      kind: 'column',
      phase,
      caption,
      work,
      workSub,
      tone: 'work',
      focus: c.col,
      carries: carriesUpTo(c.col),
      revealed: { ...revealed },
      justRevealed,
      candidates,
      answer: null,
      result: false,
      hold: candidates ? 2600 : 2200,
    })
  }

  const digits = z.slots.map((s) => s.digit)
  const finalWork =
    p.ask === 'the-product'
      ? `${z.top} × ${m} = ${z.product}`
      : p.ask === 'sum-of-hidden-digits'
        ? `${digits.join(' + ')} = ${answer}`
        : `${askLetter ?? '?'} = ${answer}`
  const finalCaption =
    p.ask === 'the-product'
      ? T('Every box is filled, so read the whole product.', 'Semua kotak terisi, tinggal baca hasilnya.')
      : p.ask === 'sum-of-hidden-digits'
        ? T('Add the digits the letters were hiding.', 'Jumlahkan angka yang tadi tertutup huruf.')
        : T('Every column agreed, so this letter is settled.', 'Semua kolom cocok, jadi huruf ini sudah pasti.')

  steps.push({
    kind: 'answer',
    phase: T('Answer', 'Jawaban'),
    caption: finalCaption,
    work: finalWork,
    workSub: null,
    tone: 'win',
    focus: null,
    carries: carriesUpTo(cols.length - 1),
    revealed: { ...revealed },
    justRevealed: [],
    candidates: null,
    answer,
    result: true,
    hold: 2800,
  })

  return { puzzle: z, askLetter, answer, steps, finalIndex: steps.length - 1 }
}
