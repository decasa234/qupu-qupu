import type { Lang } from './makeTenSteps'

/**
 * A11 `common-factor-shortcut` — a × c + b × c = (a + b) × c.
 *
 * The storyboard walks the long way (two separate multiplications), spots that
 * both terms carry the same ×c, lifts that shared factor out so the two blocks
 * can be pushed into one, adds inside the bracket, and only then multiplies once.
 *
 * The picture the beats describe: every term is drawn as a stack of columns,
 * each column holding `c`. `a × c` is a columns, `b × c` is b columns — same
 * height, so they slide together into a + b columns of the same c. That is the
 * child-level reason the regrouping is allowed, not a stated rule.
 */

export type CommonFactorPhase = 'long' | 'share' | 'lift' | 'group' | 'result'

/** Ink roles for the on-board equation; the component maps them to the palette. */
export type EqTone = 'ink' | 'muted' | 'shared' | 'group' | 'answer'

export interface EqToken {
  text: string
  tone: EqTone
}

export interface CommonFactorStep {
  phase: CommonFactorPhase
  caption: string
  /** The equation printed on the board this beat. */
  equation: EqToken[]
  /** Blocks pushed together — true once the shared factor has been lifted out. */
  joined: boolean
  /** The shared ×c is lit (orange) rather than plain ink. */
  sharedLit: boolean
  /** Dashed guides proving the two blocks are exactly the same height. */
  heightGuides: boolean
  /** The curved "it came out of there" trail from the second ×c to the first. */
  liftTrail: boolean
  /** The seam where the two blocks met is still drawn. */
  seam: boolean
  /** What the measurement under the block(s) reads. */
  widthLabel: 'terms' | 'bracket' | 'sum'
  /** Plate sitting on the block(s): '?' until the last beat, then the answer. */
  plate: string
  result: boolean
  /** How long this beat holds on screen, in ms (the last beat holds forever). */
  hold: number
}

export interface CommonFactorStoryboard {
  a: number
  b: number
  c: number
  /** a + b — what the bracket collapses to. */
  sum: number
  /** (a + b) × c, which is also a × c + b × c. */
  answer: number
  /** True when a + b lands on a multiple of ten (the generator aims for this). */
  roundSum: boolean
  steps: CommonFactorStep[]
  finalIndex: number
}

const TIMES = '×'

// A generator instance is always { a, b, c }; these fallbacks only matter for a
// stale/garbled row, and they keep every caption internally consistent.
const FALLBACK_A = 3
const FALLBACK_B = 2
const FALLBACK_C = 4

function norm(v: unknown, min: number, max: number, fallback: number): number {
  const n =
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : Number.NaN
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.round(n)))
}

/** Reads the concept's `{ a, b, c }` params defensively (schema: a,b ∈ 2..18, c ∈ 2..12). */
export function readCommonFactorParams(params: unknown): { a: number; b: number; c: number } {
  const p = (params ?? {}) as Record<string, unknown>
  return {
    a: norm(p.a, 1, 30, FALLBACK_A),
    b: norm(p.b, 1, 30, FALLBACK_B),
    c: norm(p.c, 1, 20, FALLBACK_C),
  }
}

export function buildCommonFactorSteps(params: unknown, lang: Lang): CommonFactorStoryboard {
  const { a, b, c } = readCommonFactorParams(params)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const sum = a + b
  const answer = sum * c
  const roundSum = sum % 10 === 0

  // Long form: a × c + b × c = ?  — the ×c pair turns orange once it is spotted.
  const longEquation = (lit: boolean): EqToken[] => {
    const times: EqToken = { text: TIMES, tone: lit ? 'shared' : 'muted' }
    const shared: EqToken = { text: String(c), tone: lit ? 'shared' : 'ink' }
    return [
      { text: String(a), tone: 'ink' },
      times,
      shared,
      { text: '+', tone: 'muted' },
      { text: String(b), tone: 'ink' },
      times,
      shared,
      { text: '=', tone: 'muted' },
      { text: '?', tone: 'muted' },
    ]
  }

  const steps: CommonFactorStep[] = [
    {
      phase: 'long',
      caption: t(
        `The long way: work out ${a} ${TIMES} ${c}, then ${b} ${TIMES} ${c}.`,
        `Cara panjang: hitung ${a} ${TIMES} ${c}, lalu ${b} ${TIMES} ${c}.`,
      ),
      equation: longEquation(false),
      joined: false,
      sharedLit: false,
      heightGuides: false,
      liftTrail: false,
      seam: false,
      widthLabel: 'terms',
      plate: '?',
      result: false,
      hold: 2400,
    },
    {
      phase: 'share',
      caption: t(
        `Both have ${TIMES}${c} — same height.`,
        `Dua-duanya punya ${TIMES}${c} — tingginya sama.`,
      ),
      equation: longEquation(true),
      joined: false,
      sharedLit: true,
      heightGuides: true,
      liftTrail: false,
      seam: false,
      widthLabel: 'terms',
      plate: '?',
      result: false,
      hold: 2400,
    },
    {
      phase: 'lift',
      caption: t(
        `${a} columns and ${b} columns, each holding ${c}.`,
        `${a} kolom dan ${b} kolom, tiap kolom isi ${c}.`,
      ),
      equation: [
        { text: '(', tone: 'group' },
        { text: String(a), tone: 'group' },
        { text: '+', tone: 'group' },
        { text: String(b), tone: 'group' },
        { text: ')', tone: 'group' },
        { text: TIMES, tone: 'shared' },
        { text: String(c), tone: 'shared' },
        { text: '=', tone: 'muted' },
        { text: '?', tone: 'muted' },
      ],
      joined: true,
      sharedLit: true,
      heightGuides: false,
      liftTrail: true,
      seam: true,
      widthLabel: 'bracket',
      plate: '?',
      result: false,
      hold: 2800,
    },
    {
      phase: 'group',
      caption: roundSum
        ? t(`${a} + ${b} = ${sum} columns — a round number!`, `${a} + ${b} = ${sum} kolom — angka bulat!`)
        : t(`${a} + ${b} = ${sum} columns.`, `${a} + ${b} = ${sum} kolom.`),
      equation: [
        { text: String(sum), tone: 'group' },
        { text: TIMES, tone: 'shared' },
        { text: String(c), tone: 'shared' },
        { text: '=', tone: 'muted' },
        { text: '?', tone: 'muted' },
      ],
      joined: true,
      sharedLit: true,
      heightGuides: false,
      liftTrail: false,
      seam: false,
      widthLabel: 'sum',
      plate: '?',
      result: false,
      hold: 2200,
    },
    {
      phase: 'result',
      caption: t(
        `Just one multiplication: ${sum} ${TIMES} ${c} = ${answer}.`,
        `Tinggal sekali kali: ${sum} ${TIMES} ${c} = ${answer}.`,
      ),
      equation: [
        { text: String(sum), tone: 'ink' },
        { text: TIMES, tone: 'shared' },
        { text: String(c), tone: 'shared' },
        { text: '=', tone: 'muted' },
        { text: String(answer), tone: 'answer' },
      ],
      joined: true,
      sharedLit: true,
      heightGuides: false,
      liftTrail: false,
      seam: false,
      widthLabel: 'sum',
      plate: String(answer),
      result: true,
      hold: 0,
    },
  ]

  return { a, b, c, sum, answer, roundSum, steps, finalIndex: steps.length - 1 }
}
