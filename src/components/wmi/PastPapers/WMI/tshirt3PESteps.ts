// IKMC-21-PE-Q3 — storyboard for the mirror-reflection animation.
//
// Question: Ella puts on this t-shirt (showing "2021") and stands in front of
// a mirror. Which image does she see?  Answer: A.
//
// The teaching walk builds up the mirror rule in three clear ideas:
//
//   Beat 0 — intro      : show original shirt; establish what "2021" looks like.
//   Beat 1 — reverse    : a mirror swaps left ↔ right, so the ORDER of digits
//                         reverses: 2-0-2-1 → 1-2-0-2.
//   Beat 2 — flip-ann   : spotlight the digit '2' and show it also flips
//                         horizontally (backwards 2).
//   Beat 3 — result     : full reflected image; highlight that it is answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type BeatPhase = 'intro' | 'reverse' | 'flip-ann' | 'result'

export interface Tshirt3PEBeat {
  /** Which rendering phase the explainer should show. */
  phase: BeatPhase
  /** Caption shown in the info box. */
  caption: string
  /** Auto-hold in ms (0 = final / user advances manually). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Tshirt3PEStoryboard {
  steps: Tshirt3PEBeat[]
  finalIndex: number
  answer: string
}

export function buildTshirt3PESteps(lang: Lang): Tshirt3PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Tshirt3PEBeat[] = [
    // Beat 0 — intro: the original shirt
    {
      phase: 'intro',
      hold: 2400,
      result: false,
      caption: t(
        'Ella\'s t-shirt shows "2021" — read left to right as she wears it.',
        'Kaos Ella bertuliskan "2021" — dibaca dari kiri ke kanan seperti yang dia pakai.',
      ),
    },

    // Beat 1 — reverse order
    {
      phase: 'reverse',
      hold: 2600,
      result: false,
      caption: t(
        'A mirror swaps left and right. So the digit ORDER reverses: 2-0-2-1 becomes 1-2-0-2.',
        'Cermin membalik kiri dan kanan. Jadi URUTAN digit terbalik: 2-0-2-1 menjadi 1-2-0-2.',
      ),
    },

    // Beat 2 — flip annotation: each digit is also mirror-flipped
    {
      phase: 'flip-ann',
      hold: 2600,
      result: false,
      caption: t(
        'In a mirror, each digit\'s shape also flips horizontally. "2" becomes a backwards 2. "0" stays the same (it\'s symmetric). "1" also flips.',
        'Di cermin, bentuk setiap digit juga dibalik secara horizontal. "2" menjadi 2 terbalik. "0" tetap sama (simetris). "1" juga dibalik.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        'Reversed order (1-2-0-2) with each digit flipped → choice A is what Ella sees in the mirror.',
        'Urutan terbalik (1-2-0-2) dengan setiap digit dibalik → pilihan A adalah yang Ella lihat di cermin.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'A' }
}
