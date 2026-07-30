export type Lang = 'en' | 'id'

// A10 `rank-computed-expressions`: four expressions are offered and the learner
// picks the one with the greatest computed value. The whole lesson is that the
// SHAPE of an expression tells you nothing — `20 + 5` looks bigger than `8 × 9`
// and is not. So the storyboard refuses to compare anything until every
// expression has collapsed into its own number, only then lines the numbers up,
// and lands the choice label last.

export type RankOp = '+' | '-' | '×'

/** One expression, as the generator emits it (api/services/wmi/concepts/rank-computed-expressions). */
export interface RankExpr {
  a: number
  op: RankOp
  b: number
}

/** One row of the animated board — an expression plus everything drawn about it. */
export interface RankRow {
  /** Position in the original (choice) order — also the index into `storyboard.rows`. */
  index: number
  /** Choice label the learner actually picks: A, B, C, D. */
  label: string
  a: number
  op: RankOp
  b: number
  /** Exactly the choice text the question shows, e.g. "12 + 7". */
  text: string
  /** The computed value — the only thing that may be compared. */
  value: number
  /** a + b: how "big" the expression LOOKS before you compute it. */
  operandSum: number
}

export type RankPhase = 'intro' | 'eval' | 'compare' | 'trap' | 'result'

export interface RankStep {
  phase: RankPhase
  caption: string
  /** Row indices in the order they are drawn top-to-bottom this beat (sorted once we compare). */
  order: number[]
  /** Row indices whose value has been worked out and may be shown. */
  revealed: number[]
  /** Row being collapsed from expression to value this beat. */
  focus: number | null
  /** Row flagged as the surface-shape trap this beat. */
  trap: number | null
  /** Winning row — only on the result beat. */
  win: number | null
  /** Values lined up biggest-first, shown once we are allowed to compare. */
  chain: number[] | null
  /** The choice label. `null` on every beat except the last. */
  answer: string | null
  result: boolean
  /** How long to hold this beat on screen, in ms (0 on the final beat). */
  hold: number
}

export interface RankStoryboard {
  rows: RankRow[]
  /** Index into `rows` of the greatest value — mirrors the generator's `values.indexOf(max)`. */
  answerIndex: number
  /** The choice label the learner must pick; '' only when params were unusable. */
  answer: string
  /** Greatest value, used to scale the bars. Never 0, so it is always safe to divide by. */
  maxValue: number
  /** Row whose operands look biggest but which does not win — null when there is no trap. */
  trapIndex: number | null
  steps: RankStep[]
  finalIndex: number
}

const HOLD_INTRO = 2000
const HOLD_EVAL = 1600
const HOLD_COMPARE = 2200
const HOLD_TRAP = 2600

const LABELS = 'ABCDEFGH'

/** Evaluate one expression. Mirrors `evalExpr` in the generator exactly. */
export function evalRankExpr(e: RankExpr): number {
  if (e.op === '+') return e.a + e.b
  if (e.op === '-') return e.a - e.b
  return e.a * e.b
}

/** Render one expression. Mirrors `exprText` in the generator exactly. */
export function rankExprText(e: RankExpr): string {
  return `${e.a} ${e.op} ${e.b}`
}

function normaliseOp(raw: unknown): RankOp | null {
  if (raw === '+') return '+'
  if (raw === '-' || raw === '−' || raw === '–') return '-'
  if (raw === '×' || raw === '*' || raw === 'x' || raw === 'X') return '×'
  return null
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

/**
 * Pull the expression list out of whatever the caller passes. The generator
 * emits `{ exprs: [{ a, op, b } × 4] }`; anything else (a stale instance, a
 * missing params blob) degrades to an empty list rather than throwing.
 */
export function normaliseRankExprs(raw: unknown): RankExpr[] {
  const list = (raw as { exprs?: unknown } | null | undefined)?.exprs
  if (!Array.isArray(list)) return []
  const out: RankExpr[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const { a, op, b } = item as { a?: unknown; op?: unknown; b?: unknown }
    const nOp = normaliseOp(op)
    if (nOp === null || !isFiniteNumber(a) || !isFiniteNumber(b)) continue
    out.push({ a, op: nOp, b })
  }
  return out
}

export function buildRankExpressionsSteps(rawParams: unknown, lang: Lang): RankStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const exprs = normaliseRankExprs(rawParams)
  const rows: RankRow[] = exprs.map((e, i) => ({
    index: i,
    label: LABELS[i] ?? String(i + 1),
    a: e.a,
    op: e.op,
    b: e.b,
    text: rankExprText(e),
    value: evalRankExpr(e),
    operandSum: e.a + e.b,
  }))

  const naturalOrder = rows.map((r) => r.index)

  // Nothing usable to animate: still emit a coherent three-beat storyboard so the
  // panel shows the method instead of blowing up.
  if (rows.length === 0) {
    const empty: RankStep[] = [
      {
        phase: 'intro',
        caption: t('Work out each expression, one at a time.', 'Hitung setiap ekspresi satu per satu.'),
        order: [],
        revealed: [],
        focus: null,
        trap: null,
        win: null,
        chain: null,
        answer: null,
        result: false,
        hold: HOLD_INTRO,
      },
      {
        phase: 'compare',
        caption: t('Then line the values up, biggest first.', 'Lalu jajarkan nilainya dari yang terbesar.'),
        order: [],
        revealed: [],
        focus: null,
        trap: null,
        win: null,
        chain: [],
        answer: null,
        result: false,
        hold: HOLD_COMPARE,
      },
      {
        phase: 'result',
        caption: t('The biggest value wins.', 'Nilai terbesar yang menang.'),
        order: [],
        revealed: [],
        focus: null,
        trap: null,
        win: null,
        chain: [],
        answer: '',
        result: true,
        hold: 0,
      },
    ]
    return {
      rows,
      answerIndex: -1,
      answer: '',
      maxValue: 1,
      trapIndex: null,
      steps: empty,
      finalIndex: empty.length - 1,
    }
  }

  const values = rows.map((r) => r.value)
  // `indexOf(max)` — identical tie-breaking to the generator's own answer pick.
  const answerIndex = values.indexOf(Math.max(...values))
  const winner = rows[answerIndex]
  const answer = winner.label
  const maxValue = Math.max(1, winner.value)

  // The surface-shape trap: the expression whose OPERANDS look biggest but whose
  // value is not the greatest. Same rule the authored breakdown uses, so the
  // animation and the trap card always name the same option.
  const operandSums = rows.map((r) => r.operandSum)
  const bigOperandIndex = operandSums.indexOf(Math.max(...operandSums))
  const trapIndex = bigOperandIndex !== answerIndex ? bigOperandIndex : null

  // Biggest value first; equal values (the generator forbids them, but be safe)
  // keep their original order so the board never jitters unpredictably.
  const sortedOrder = rows
    .slice()
    .sort((x, y) => y.value - x.value || x.index - y.index)
    .map((r) => r.index)
  const chain = sortedOrder.map((i) => rows[i].value)

  const steps: RankStep[] = []

  // 1 — the board, uncomputed. No value is on screen, so nothing CAN be compared yet.
  steps.push({
    phase: 'intro',
    caption: t('They look different. Work them out one at a time.', 'Bentuknya beda-beda. Hitung dulu satu per satu.'),
    order: naturalOrder,
    revealed: [],
    focus: null,
    trap: null,
    win: null,
    chain: null,
    answer: null,
    result: false,
    hold: HOLD_INTRO,
  })

  // 2..n+1 — one beat per expression, each collapsing into its own number.
  // Captions mirror the concept's own hint_steps: "A) 12 + 7 = 19".
  rows.forEach((row, i) => {
    steps.push({
      phase: 'eval',
      caption: `${row.label}) ${row.text} = ${row.value}`,
      order: naturalOrder,
      revealed: rows.slice(0, i + 1).map((r) => r.index),
      focus: row.index,
      trap: null,
      win: null,
      chain: null,
      answer: null,
      result: false,
      hold: HOLD_EVAL,
    })
  })

  // n+2 — every value is known, so now (and only now) they may be lined up.
  steps.push({
    phase: 'compare',
    caption: t('Now line the values up, biggest first.', 'Sekarang jajarkan nilainya dari yang terbesar.'),
    order: sortedOrder,
    revealed: naturalOrder,
    focus: null,
    trap: null,
    win: null,
    chain,
    answer: null,
    result: false,
    hold: HOLD_COMPARE,
  })

  // n+3 — the trap, seen from the line-up: the biggest-looking expression is not
  // at the top. Named without naming the winner.
  if (trapIndex !== null) {
    const trapRow = rows[trapIndex]
    steps.push({
      phase: 'trap',
      caption: t(
        `${trapRow.label}) ${trapRow.text} looks big, but it only makes ${trapRow.value}.`,
        `${trapRow.label}) ${trapRow.text} terlihat besar, hasilnya hanya ${trapRow.value}.`,
      ),
      order: sortedOrder,
      revealed: naturalOrder,
      focus: null,
      trap: trapIndex,
      win: null,
      chain,
      answer: null,
      result: false,
      hold: HOLD_TRAP,
    })
  }

  // last — the top of the line-up, and only here the choice label.
  steps.push({
    phase: 'result',
    caption: t(
      `The largest value is ${winner.value}, so the answer is ${answer}.`,
      `Nilai terbesar adalah ${winner.value}, jadi jawabannya ${answer}.`,
    ),
    order: sortedOrder,
    revealed: naturalOrder,
    focus: null,
    trap: null,
    win: answerIndex,
    chain,
    answer,
    result: true,
    hold: 0,
  })

  return {
    rows,
    answerIndex,
    answer,
    maxValue,
    trapIndex,
    steps,
    finalIndex: steps.length - 1,
  }
}
