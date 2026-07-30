import type { Lang } from './makeTenSteps'

// L9 `solve-symbol-equations` — the storyboard behind the post-answer animation.
//
// What it has to teach is SUBSTITUTION, in four visible moves:
//   1. the first equation holds only stars, so its total shares out evenly and
//      pins what ONE star is worth;
//   2. that value is carried bodily across into the second equation (the star
//      there turns into its number);
//   3. the leftover is posed as a subtraction;
//   4. the subtraction is done — and only then does the circle's value appear.
// Nothing is asserted: every number a caption states is either printed on the
// question or falls out of the arithmetic shown in the beat before it.

export interface SymbolEqParams {
  s: number
  c: number
  n: number
  slip?: number
  totalKind?: string
}

export type Eq1State = 'idle' | 'share' | 'solved'
export type SubtractState = null | 'ask' | 'done'

export interface SymbolEqBeat {
  caption: string
  /** How the first equation is drawn this beat. */
  eq1: Eq1State
  /** True once the star in the SECOND equation has become its number. */
  swapped: boolean
  /** Which equation is spotlighted (0 = neither). */
  focus: 0 | 1 | 2
  /** Show the earned "one star = s" chip. */
  fact: boolean
  /** The subtraction strip under the second equation. */
  subtract: SubtractState
  /** True on the single beat that lands the answer. */
  result: boolean
  /** How long this beat holds on screen, in ms (the last one never advances). */
  hold: number
}

export interface SymbolEqStoryboard {
  s: number
  c: number
  n: number
  total1: number
  total2: number
  /** The four options, ascending — mirrored from the concept generator. */
  options: number[]
  /** The label of the option that equals the circle's value. */
  answerLabel: string
  steps: SymbolEqBeat[]
  finalIndex: number
}

const LABELS = ['A', 'B', 'C', 'D'] as const

/**
 * Clamp whatever arrives from the instance row into drawable maths. Pooled rows
 * written before `slip` / `totalKind` existed still land on a coherent board.
 */
export function normalizeSymbolEqParams(raw: unknown): Required<SymbolEqParams> {
  const p = (raw ?? {}) as Partial<SymbolEqParams>
  const int = (v: unknown, lo: number, hi: number, dflt: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : dflt
  return {
    s: int(p.s, 1, 20, 4),
    c: int(p.c, 1, 30, 5),
    n: int(p.n, 2, 4, 3),
    slip: p.slip === 1 ? 1 : -1,
    totalKind: p.totalKind === 'first' ? 'first' : 'second',
  }
}

/**
 * MIRROR of `optionValues` / `answerLabel` in
 * api/services/wmi/concepts/solve-symbol-equations/index.ts. Kept as a copy on
 * purpose: pulling the backend module (and zod) into this lazily-loaded chunk
 * would cost far more than nine lines. The concept's own smoke cross-checks the
 * label computed here against `render().answer` across the whole param space.
 */
export function symbolEqOptions(p: Required<SymbolEqParams>): number[] {
  const equationTotal = p.totalKind === 'first' ? p.n * p.s : p.s + p.c
  return [p.c, p.s, p.c + p.slip, equationTotal].sort((a, b) => a - b)
}

export function symbolEqAnswerLabel(p: Required<SymbolEqParams>): string {
  const i = symbolEqOptions(p).indexOf(p.c)
  return LABELS[i < 0 ? 0 : i]
}

export function buildSymbolEquationSteps(raw: unknown, lang: Lang): SymbolEqStoryboard {
  const p = normalizeSymbolEqParams(raw)
  const { s, c, n } = p
  const total1 = n * s
  const total2 = s + c
  const options = symbolEqOptions(p)
  const answerLabel = symbolEqAnswerLabel(p)

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SymbolEqBeat[] = [
    {
      caption: t(
        'Two equations. Start with the one that has only stars.',
        'Dua persamaan. Mulai dari yang isinya bintang saja.',
      ),
      eq1: 'idle',
      swapped: false,
      focus: 0,
      fact: false,
      subtract: null,
      result: false,
      hold: 2000,
    },
    {
      caption: t(
        `Share ${total1} equally among ${n} stars: ${total1} ÷ ${n} = ${s}.`,
        `${total1} dibagi rata ke ${n} bintang: ${total1} ÷ ${n} = ${s}.`,
      ),
      eq1: 'share',
      swapped: false,
      focus: 1,
      fact: true,
      subtract: null,
      result: false,
      hold: 2600,
    },
    {
      caption: t(
        `One star is worth ${s} everywhere. Swap it into the second equation.`,
        `Nilai bintang ${s} di mana pun. Tukar bintangnya di persamaan kedua.`,
      ),
      eq1: 'solved',
      swapped: true,
      focus: 2,
      fact: true,
      subtract: null,
      result: false,
      hold: 2600,
    },
    {
      caption: t(
        `From ${s} up to ${total2}, how much more? Work out ${total2} − ${s}.`,
        `Dari ${s} ke ${total2} kurang berapa? Hitung ${total2} − ${s}.`,
      ),
      eq1: 'solved',
      swapped: true,
      focus: 2,
      fact: true,
      subtract: 'ask',
      result: false,
      hold: 2400,
    },
    {
      caption: t(
        `${total2} − ${s} = ${c}. One circle = ${c}, answer ${answerLabel}.`,
        `${total2} − ${s} = ${c}. Satu lingkaran = ${c}, jawab ${answerLabel}.`,
      ),
      eq1: 'solved',
      swapped: true,
      focus: 2,
      fact: true,
      subtract: 'done',
      result: true,
      hold: 0,
    },
  ]

  return { s, c, n, total1, total2, options, answerLabel, steps, finalIndex: steps.length - 1 }
}
