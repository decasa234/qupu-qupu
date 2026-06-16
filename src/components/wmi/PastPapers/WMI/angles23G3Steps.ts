// WMI-23F3A-Q2 (2023 Grade 3 Final) — order four angles by eye.
//
// "Measure with your eyes instead of using measuring tools. Arrange ∠1, ∠2,
// ∠3, and ∠4 from the largest to the smallest."  Answer: C = ∠4 > ∠3 > ∠2 > ∠1.
//
// The four angles live in the letters W M I:
//   ∠4 — the top-right corner of the I, marked with a right-angle square = 90°.
//        It is the ONLY right angle, so it must be the biggest.
//   ∠3 — the wide bottom "V" of the M: the most open of the remaining three.
//   ∠2 — the upper-left interior of the M: narrower than ∠3.
//   ∠1 — the very sharp bottom "V" of the W: the most pointed → smallest.
//
// METHOD (deduce, don't assert — one placement per beat):
//   1. State the goal: line them up largest → smallest by eye.
//   2. Spotlight ∠4. It carries a right-angle square ⇒ 90°, the only right angle,
//      so nothing can beat it. Place ∠4 first.
//   3. Of the three left, ∠3 (M's wide V) opens the widest ⇒ second.
//   4. ∠2 (M's upper-left) is narrower than ∠3 ⇒ third.
//   5. ∠1 (W's sharp point) is the most pointed ⇒ smallest, last.
//   6. Read the chain: ∠4 > ∠3 > ∠2 > ∠1 = choice C.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. Each beat names which angle the figure should spotlight
// (1|2|3|4|null) and whether to surface the 90° tag on ∠4.

export type Lang = 'en' | 'id'

/** The winning order, largest → smallest. Matches choice C. */
export const ANSWER_ORDER: Array<1 | 2 | 3 | 4> = [4, 3, 2, 1]
export const ANSWER_LABEL = '∠4 > ∠3 > ∠2 > ∠1'
export const ANSWER_CHOICE = 'C'

export interface AngleStep {
  /** Which angle the primitive should spotlight this beat (null = none). */
  highlight: 1 | 2 | 3 | 4 | null
  /** Surface the 90° right-angle tag on ∠4. */
  showValues: boolean
  /** Angles placed into the order so far, largest → smallest. */
  placed: Array<1 | 2 | 3 | 4>
  /** True only on the final winning beat (holds, hold 0). */
  result: boolean
  caption: string
  hold: number
}

export interface AngleStoryboard {
  order: Array<1 | 2 | 3 | 4>
  label: string
  choice: string
  steps: AngleStep[]
  finalIndex: number
}

export function buildAngles23G3Steps(lang: Lang): AngleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AngleStep[] = [
    // 1. Goal.
    {
      highlight: null,
      showValues: false,
      placed: [],
      result: false,
      hold: 2600,
      caption: t(
        'Four corners are marked: ∠1, ∠2, ∠3, ∠4. Just by looking, line them up from widest to most pointed.',
        'Ada empat sudut ditandai: ∠1, ∠2, ∠3, ∠4. Cukup dengan melihat, urutkan dari yang paling lebar ke paling lancip.',
      ),
    },
    // 2. ∠4 is the right angle → biggest.
    {
      highlight: 4,
      showValues: true,
      placed: [],
      result: false,
      hold: 2400,
      caption: t(
        '∠4 has a little square — that means a right angle, 90°. It is the only right angle, so nothing is wider.',
        '∠4 punya kotak kecil — tandanya sudut siku-siku, 90°. Hanya ini yang siku-siku, jadi tak ada yang lebih lebar.',
      ),
    },
    {
      highlight: 4,
      showValues: true,
      placed: [4],
      result: false,
      hold: 2100,
      caption: t(
        'So ∠4 is the LARGEST. Place it first.',
        'Jadi ∠4 yang TERBESAR. Taruh paling depan.',
      ),
    },
    // 3. ∠3 widest of the rest → second.
    {
      highlight: 3,
      showValues: false,
      placed: [4],
      result: false,
      hold: 2400,
      caption: t(
        'Now look at ∠3, ∠2, ∠1. ∠3 (the wide bottom V of the M) opens the widest of these three.',
        'Sekarang lihat ∠3, ∠2, ∠1. ∠3 (lembah V lebar di bawah M) paling terbuka di antara ketiganya.',
      ),
    },
    {
      highlight: 3,
      showValues: false,
      placed: [4, 3],
      result: false,
      hold: 2100,
      caption: t(
        'So ∠3 comes next: ∠4 > ∠3 so far.',
        'Jadi ∠3 berikutnya: sejauh ini ∠4 > ∠3.',
      ),
    },
    // 4. ∠2 narrower than ∠3 → third.
    {
      highlight: 2,
      showValues: false,
      placed: [4, 3],
      result: false,
      hold: 2400,
      caption: t(
        '∠2 (upper-left of the M) is narrower than ∠3 — but still wider than the sharp point left over.',
        '∠2 (kiri-atas M) lebih sempit dari ∠3 — tapi masih lebih lebar dari sudut lancip yang tersisa.',
      ),
    },
    {
      highlight: 2,
      showValues: false,
      placed: [4, 3, 2],
      result: false,
      hold: 2100,
      caption: t(
        'So ∠2 is third: ∠4 > ∠3 > ∠2.',
        'Jadi ∠2 di urutan ketiga: ∠4 > ∠3 > ∠2.',
      ),
    },
    // 5. ∠1 sharpest → smallest.
    {
      highlight: 1,
      showValues: false,
      placed: [4, 3, 2],
      result: false,
      hold: 2400,
      caption: t(
        '∠1 (the sharp point at the bottom of the W) is the most pointed — the tiniest opening of all.',
        '∠1 (ujung lancip di bawah W) paling runcing — bukaan paling kecil dari semuanya.',
      ),
    },
    // 6. Conclude.
    {
      highlight: 1,
      showValues: true,
      placed: [4, 3, 2, 1],
      result: true,
      hold: 0,
      caption: t(
        `Largest to smallest: ${ANSWER_LABEL} — that's choice ${ANSWER_CHOICE}.`,
        `Dari terbesar ke terkecil: ${ANSWER_LABEL} — itulah pilihan ${ANSWER_CHOICE}.`,
      ),
    },
  ]

  return {
    order: ANSWER_ORDER,
    label: ANSWER_LABEL,
    choice: ANSWER_CHOICE,
    steps,
    finalIndex: steps.length - 1,
  }
}
