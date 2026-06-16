// WMI-22P3A-Q5 (2022 Grade 3 Semifinal) — order three angles by eye.
//
// "Compare the three angles. Which option lists them in the correct order?"
// Answer C: ∠3 > ∠2 > ∠1.
//
//   ∠3 — the widest opening ⇒ largest.
//   ∠2 — a medium opening ⇒ middle.
//   ∠1 — the narrowest, most pointed ⇒ smallest.
//
// METHOD (deduce, don't assert — one placement per beat):
//   1. State the rule: an angle's size is how WIDE it opens, not how long its
//      arms are.
//   2. Spotlight ∠3 — it opens the widest, so it is the largest. Place it first.
//   3. ∠2 is narrower than ∠3 but wider than ∠1 ⇒ middle.
//   4. ∠1 is the sharpest point ⇒ smallest, last.
//   5. Read the chain: ∠3 > ∠2 > ∠1 = choice C.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe &
// deterministic. Each beat names which angle the figure spotlights (1|2|3|null)
// and whether to surface the rough degree tags.

export type Lang = 'en' | 'id'

/** The winning order, largest → smallest. Matches choice C. */
export const ANSWER_ORDER: Array<1 | 2 | 3> = [3, 2, 1]
export const ANSWER_LABEL = '∠3 > ∠2 > ∠1'
export const ANSWER_CHOICE = 'C'

export interface AngleStep {
  /** Which angle the primitive spotlights this beat (null = none). */
  highlight: 1 | 2 | 3 | null
  /** Surface the rough degree tags on every angle. */
  showValues: boolean
  /** Angles placed into the order so far, largest → smallest. */
  placed: Array<1 | 2 | 3>
  /** True only on the final winning beat (holds, hold 0). */
  result: boolean
  caption: string
  hold: number
}

export interface AngleStoryboard {
  order: Array<1 | 2 | 3>
  label: string
  choice: string
  steps: AngleStep[]
  finalIndex: number
}

export function buildP22G3Q5Steps(lang: Lang): AngleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AngleStep[] = [
    // 1. The rule.
    {
      highlight: null,
      showValues: false,
      placed: [],
      result: false,
      hold: 2600,
      caption: t(
        "An angle's size is how WIDE the two arms open — not how long the arms are.",
        'Besar sudut adalah seberapa LEBAR kedua lengan terbuka — bukan panjang lengannya.',
      ),
    },
    // 2. ∠3 widest → biggest.
    {
      highlight: 3,
      showValues: true,
      placed: [],
      result: false,
      hold: 2400,
      caption: t(
        '∠3 opens the widest of the three — the biggest mouth.',
        '∠3 bukaannya paling lebar di antara ketiganya — mulutnya paling besar.',
      ),
    },
    {
      highlight: 3,
      showValues: true,
      placed: [3],
      result: false,
      hold: 2100,
      caption: t('So ∠3 is the LARGEST. Place it first.', 'Jadi ∠3 yang TERBESAR. Taruh paling depan.'),
    },
    // 3. ∠2 middle.
    {
      highlight: 2,
      showValues: true,
      placed: [3],
      result: false,
      hold: 2400,
      caption: t(
        '∠2 opens less than ∠3, but more than ∠1 — it sits in the middle.',
        '∠2 terbuka lebih sempit dari ∠3, tapi lebih lebar dari ∠1 — ada di tengah.',
      ),
    },
    {
      highlight: 2,
      showValues: true,
      placed: [3, 2],
      result: false,
      hold: 2100,
      caption: t('So ∠2 is next: ∠3 > ∠2 so far.', 'Jadi ∠2 berikutnya: sejauh ini ∠3 > ∠2.'),
    },
    // 4. ∠1 smallest.
    {
      highlight: 1,
      showValues: true,
      placed: [3, 2],
      result: false,
      hold: 2400,
      caption: t(
        '∠1 is the sharpest, most pointed — the tiniest opening of all.',
        '∠1 paling lancip dan runcing — bukaan paling kecil dari semuanya.',
      ),
    },
    // 5. Conclude.
    {
      highlight: 1,
      showValues: true,
      placed: [3, 2, 1],
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
