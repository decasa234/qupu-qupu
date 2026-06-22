// IKMC-22-EC-Q2 — storyboard for the Great Wheel / Ferris wheel animation.
//
// The question: "Four of the following are a picture of the Great Wheel at the
// Luna park. Which one is the different one?" Answer: E.
//
// Teaching walk — one idea per beat:
//   0. intro    — show all five pictures; state the task.
//   1. rule     — the wheel has 10 gondolas that strictly alternate blue and yellow.
//   2. check-A  — A: strictly alternating ✓ (a valid rotation of the wheel).
//   3. check-B  — B: strictly alternating ✓ (a different rotation).
//   4. check-C  — C: strictly alternating ✓ (another rotation).
//   5. check-D  — D: strictly alternating ✓ (another rotation).
//   6. spot-E   — E: TWO yellow gondolas next to each other at the top — breaks the rule ✗
//   7. result   — E is the odd one out.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type WheelPhaseId =
  | 'intro'
  | 'rule'
  | 'check-A'
  | 'check-B'
  | 'check-C'
  | 'check-D'
  | 'spot-E'
  | 'result'

export interface WheelBeat {
  phase: WheelPhaseId
  /** Which option label is highlighted in this beat ('none' = all neutral). */
  highlight: 'none' | 'A' | 'B' | 'C' | 'D' | 'E'
  /** Whether to show the "check" mark on the highlighted option (true = ✓ valid). */
  showCheck: boolean
  /** Whether to show the "X" cross on option E. */
  showCross: boolean
  /** Caption text for the explanation box below the figure. */
  caption: string
  /** Auto-hold in ms (0 = final / manual-only). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface WheelStoryboard {
  steps: WheelBeat[]
  finalIndex: number
}

export function buildWheel2ECSteps(lang: Lang): WheelStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: WheelBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: 'none',
      showCheck: false,
      showCross: false,
      hold: 2000,
      result: false,
      caption: t(
        'Four pictures show the SAME Great Wheel. One picture is different. Look carefully at each one.',
        'Empat gambar menunjukkan Kincir Besar yang SAMA. Satu gambar berbeda. Perhatikan setiap gambar dengan seksama.',
      ),
    },

    // Beat 1 — rule
    {
      phase: 'rule',
      highlight: 'none',
      showCheck: false,
      showCross: false,
      hold: 2200,
      result: false,
      caption: t(
        'The Great Wheel has 10 gondolas (seats). They alternate: blue, yellow, blue, yellow… all the way around.',
        'Kincir Besar memiliki 10 gondola (kursi). Warnanya bergantian: biru, kuning, biru, kuning… sampai melingkar.',
      ),
    },

    // Beat 2 — check A
    {
      phase: 'check-A',
      highlight: 'A',
      showCheck: true,
      showCross: false,
      hold: 1800,
      result: false,
      caption: t(
        'A: blue, yellow, blue, yellow … all the way round — strictly alternating ✓',
        'A: biru, kuning, biru, kuning … mengelilingi seluruh roda — bergantian dengan sempurna ✓',
      ),
    },

    // Beat 3 — check B
    {
      phase: 'check-B',
      highlight: 'B',
      showCheck: true,
      showCross: false,
      hold: 1800,
      result: false,
      caption: t(
        'B: same wheel, rotated slightly — still strictly alternating ✓',
        'B: kincir yang sama, sedikit diputar — tetap bergantian dengan sempurna ✓',
      ),
    },

    // Beat 4 — check C
    {
      phase: 'check-C',
      highlight: 'C',
      showCheck: true,
      showCross: false,
      hold: 1800,
      result: false,
      caption: t(
        'C: another rotation — still strictly alternating ✓',
        'C: rotasi lain — tetap bergantian dengan sempurna ✓',
      ),
    },

    // Beat 5 — check D
    {
      phase: 'check-D',
      highlight: 'D',
      showCheck: true,
      showCross: false,
      hold: 1800,
      result: false,
      caption: t(
        'D: another rotation — still strictly alternating ✓',
        'D: rotasi lain — tetap bergantian dengan sempurna ✓',
      ),
    },

    // Beat 6 — spot E
    {
      phase: 'spot-E',
      highlight: 'E',
      showCheck: false,
      showCross: true,
      hold: 2400,
      result: false,
      caption: t(
        'E: look at the top — two YELLOW gondolas are next to each other! That breaks the alternating rule ✗',
        'E: lihat bagian atas — dua gondola KUNING berdampingan! Itu melanggar aturan bergantian ✗',
      ),
    },

    // Beat 7 — result
    {
      phase: 'result',
      highlight: 'E',
      showCheck: false,
      showCross: true,
      hold: 0,
      result: true,
      caption: t(
        'E is the different one — two yellow gondolas sit next to each other, which cannot happen on the real wheel. Answer: E.',
        'E adalah yang berbeda — dua gondola kuning berdampingan, yang tidak mungkin terjadi pada kincir aslinya. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
