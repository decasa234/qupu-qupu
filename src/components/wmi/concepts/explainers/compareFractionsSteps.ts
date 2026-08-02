import type { Lang } from './makeTenSteps'

// Storyboard for `compare-fractions`: the option set is drawn as fraction BARS,
// one row each, and the beats knock the losers out one at a time using the rule
// the stem names — never "the answer is C", always "C is left because every other
// bar lost, and here is why each one lost".
//
// The comparison arithmetic here is re-derived from the params (cross-multiplying
// integers, never dividing) rather than imported from the backend concept, so the
// animation stays a plain browser module with no zod in the bundle.

export type CompareFractionsMode =
  | 'same-numerator'
  | 'same-denominator'
  | 'one-equivalent-pair'
  | 'benchmark-half'
export type CompareFractionsAsk = 'largest' | 'smallest' | 'closest-to-one'

export interface CompareFractionsParams {
  mode: CompareFractionsMode
  fractions: { num: number; den: number }[]
  ask: CompareFractionsAsk
}

export interface CompareFractionsBar {
  label: string
  num: number
  den: number
  /** The same amount written over the shared bottom number, when there is one. */
  scaledNum: number
  scaledDen: number
}

export interface CompareFractionsBeat {
  caption: string
  /** Options knocked out so far, cumulative. */
  rejected: number[]
  /** The bar under the spotlight this beat. */
  focus: number | null
  /** True on the final beat (the winner). */
  result: boolean
  /** Draw the one-half marker across every bar from this beat on. */
  half: boolean
  /** Re-cut the odd bar into the shared piece size from this beat on. */
  recut: boolean
  hold: number
}

export interface CompareFractionsStoryboard {
  bars: CompareFractionsBar[]
  mode: CompareFractionsMode
  ask: CompareFractionsAsk
  answerIndex: number
  answerLabel: string
  beats: CompareFractionsBeat[]
  finalIndex: number
}

const LABELS = ['A', 'B', 'C', 'D']

const text = (f: { num: number; den: number }): string => `${f.num}/${f.den}`

/** a − b as an exact sign. Integers only: a/b vs c/d is a*d vs c*b. */
const cmp = (a: { num: number; den: number }, b: { num: number; den: number }): number =>
  a.num * b.den - b.num * a.den

/**
 * For `one-equivalent-pair`: the bottom number all but one option share, and the
 * odd one out. `null` for every other mode (and for any set that is not of that
 * shape, so a bad params object degrades to plain bars instead of lying).
 */
function sharedDenominator(fs: { num: number; den: number }[]): { commonDen: number; oddIndex: number } | null {
  const counts = new Map<number, number>()
  for (const f of fs) counts.set(f.den, (counts.get(f.den) ?? 0) + 1)
  if (counts.size !== 2) return null
  const commonDen = [...counts.entries()].find(([, n]) => n === fs.length - 1)?.[0]
  if (commonDen === undefined) return null
  const oddIndex = fs.findIndex((f) => f.den !== commonDen)
  const odd = fs[oddIndex]
  if (odd.den >= commonDen || commonDen % odd.den !== 0) return null
  return { commonDen, oddIndex }
}

export function buildCompareFractionsSteps(
  params: CompareFractionsParams,
  lang: Lang,
): CompareFractionsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const { fractions, mode, ask } = params
  const wantBig = ask !== 'smallest'

  const shared = mode === 'one-equivalent-pair' ? sharedDenominator(fractions) : null
  const bars: CompareFractionsBar[] = fractions.map((f, i) => {
    const factor = shared === null || f.den === shared.commonDen ? 1 : shared.commonDen / f.den
    return {
      label: LABELS[i] ?? String(i + 1),
      num: f.num,
      den: f.den,
      scaledNum: f.num * factor,
      scaledDen: f.den * factor,
    }
  })

  // The winner, found by exact comparison. Every option is a proper fraction, so
  // "nearest to a whole" is the same option as "largest".
  let answerIndex = 0
  for (let i = 1; i < fractions.length; i++) {
    const wins = wantBig
      ? cmp(fractions[i], fractions[answerIndex]) > 0
      : cmp(fractions[i], fractions[answerIndex]) < 0
    if (wins) answerIndex = i
  }
  const answer = fractions[answerIndex]
  const answerBar = bars[answerIndex]

  const half = mode === 'benchmark-half'
  const recut = shared !== null

  const beats: CompareFractionsBeat[] = []
  const rejected: number[] = []

  // Beat 1 — the question, with every bar still standing.
  beats.push({
    caption:
      ask === 'largest'
        ? t('Which bar is the longest?', 'Batang mana yang paling panjang?')
        : ask === 'smallest'
          ? t('Which bar is the shortest?', 'Batang mana yang paling pendek?')
          : t('Which bar comes closest to full?', 'Batang mana yang paling dekat ke penuh?'),
    rejected: [],
    focus: null,
    result: false,
    half: false,
    recut: false,
    hold: 2100,
  })

  // Beat 2 — the rule, and the drawing change that makes it visible.
  beats.push({
    caption: ruleCaption(params, bars, shared, t),
    rejected: [],
    focus: shared === null ? null : shared.oddIndex,
    result: false,
    half,
    recut,
    hold: 2600,
  })

  // Beats 3.. — one loser at a time, each with the reason it lost.
  for (let i = 0; i < bars.length; i++) {
    if (i === answerIndex) continue
    rejected.push(i)
    beats.push({
      caption: rejectCaption(params, bars[i], answerBar, wantBig, t),
      rejected: [...rejected],
      focus: i,
      result: false,
      half,
      recut,
      hold: 2100,
    })
  }

  // Final beat — the one bar nobody beat.
  const gap = answer.den - answer.num
  beats.push({
    caption:
      ask === 'closest-to-one'
        ? t(
            `${text(answer)} is only ${gap} piece${gap === 1 ? '' : 's'} short of a whole — answer ${answerBar.label}.`,
            `${text(answer)} hanya kurang ${gap} bagian dari satu utuh — jawabannya ${answerBar.label}.`,
          )
        : t(
            `Nothing beat ${text(answer)} — answer ${answerBar.label}.`,
            `Tidak ada yang mengalahkan ${text(answer)} — jawabannya ${answerBar.label}.`,
          ),
    rejected: [...rejected],
    focus: answerIndex,
    result: true,
    half,
    recut,
    hold: 0,
  })

  return {
    bars,
    mode,
    ask,
    answerIndex,
    answerLabel: answerBar.label,
    beats,
    finalIndex: beats.length - 1,
  }
}

function ruleCaption(
  params: CompareFractionsParams,
  bars: CompareFractionsBar[],
  shared: { commonDen: number; oddIndex: number } | null,
  t: (en: string, id: string) => string,
): string {
  const { mode, fractions } = params
  if (mode === 'same-numerator') {
    const n = fractions[0].num
    return t(
      `Every bar takes ${n} piece${n === 1 ? '' : 's'} — so the fewer the cuts, the bigger the piece.`,
      `Setiap batang mengambil ${n} bagian — jadi makin sedikit potongannya, makin besar tiap bagian.`,
    )
  }
  if (mode === 'same-denominator') {
    const d = fractions[0].den
    return t(
      `Every bar is cut into ${d} equal pieces — so just count the shaded ones.`,
      `Setiap batang dipotong menjadi ${d} bagian sama besar — jadi tinggal hitung yang diarsir.`,
    )
  }
  if (mode === 'one-equivalent-pair' && shared !== null) {
    const odd = bars[shared.oddIndex]
    return t(
      `Cut ${odd.num}/${odd.den} into smaller pieces: same length, now ${odd.scaledNum}/${odd.scaledDen}.`,
      `Potong ${odd.num}/${odd.den} jadi bagian lebih kecil: panjangnya sama, sekarang ${odd.scaledNum}/${odd.scaledDen}.`,
    )
  }
  return t(
    'Mark one half on every bar and see who reaches past it.',
    'Tandai setengah di tiap batang, lalu lihat siapa yang melewatinya.',
  )
}

function rejectCaption(
  params: CompareFractionsParams,
  bar: CompareFractionsBar,
  answerBar: CompareFractionsBar,
  wantBig: boolean,
  t: (en: string, id: string) => string,
): string {
  const { mode } = params
  const me = `${bar.num}/${bar.den}`

  if (mode === 'same-numerator') {
    return t(
      `${me} is cut into ${bar.den}, ${wantBig ? 'more' : 'fewer'} than ${answerBar.den} — ${wantBig ? 'smaller' : 'bigger'} pieces.`,
      `${me} dipotong jadi ${bar.den}, ${wantBig ? 'lebih banyak' : 'lebih sedikit'} dari ${answerBar.den} — bagiannya ${wantBig ? 'lebih kecil' : 'lebih besar'}.`,
    )
  }
  if (mode === 'same-denominator') {
    return t(
      `${me} takes ${bar.num} pieces, ${wantBig ? 'fewer' : 'more'} than ${answerBar.num}.`,
      `${me} mengambil ${bar.num} bagian, ${wantBig ? 'lebih sedikit' : 'lebih banyak'} dari ${answerBar.num}.`,
    )
  }
  if (mode === 'one-equivalent-pair') {
    const mine = `${bar.scaledNum}/${bar.scaledDen}`
    return t(
      `${me} is ${mine}: ${bar.scaledNum} pieces, ${wantBig ? 'fewer' : 'more'} than ${answerBar.scaledNum}.`,
      `${me} sama dengan ${mine}: ${bar.scaledNum} bagian, ${wantBig ? 'lebih sedikit' : 'lebih banyak'} dari ${answerBar.scaledNum}.`,
    )
  }
  const over = 2 * bar.num > bar.den
  return t(
    `${me} stops ${over ? 'past' : 'short of'} one half — ${over ? 'above' : 'below'} the mark.`,
    `${me} berhenti ${over ? 'melewati' : 'sebelum'} setengah — ${over ? 'di atas' : 'di bawah'} tanda.`,
  )
}
