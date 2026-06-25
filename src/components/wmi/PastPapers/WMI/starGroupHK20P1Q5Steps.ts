// HKIMO-20-P1H-Q5 — storyboard builder for the star-group explainer.
//
// Pattern: group n has (2n − 1) stars (odd numbers: 1, 3, 5, 7, 9, 11 …).
// Answer for n=6: 2×6 − 1 = 11.
//
// Beats:
//   0. intro  — prompt to count stars in each group.
//   1. count  — all groups lit; sequence 1·3·5·7 surfaced.
//   2. extend — extend pattern to group 5 and 6: 7+2=9, 9+2=11.
//   3. result — formula and final answer 11.
//
// Pure builder: (lang) → storyboard. No Math.random, no Date — SSR-safe.

export type Lang = 'en' | 'id'

export type StarGroupPhase = 'intro' | 'count' | 'extend' | 'result'

export interface StarGroupBeat {
  phase: StarGroupPhase
  /**
   * 0 = no group lit, -1 = all lit, 1–4 = that specific group lit.
   * Passed to StarGroupHK20P1Q5Illustration as `activeGroup`.
   */
  activeGroup: number
  /** Equation strip text; empty string hides the strip. */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface StarGroupStoryboard {
  beats: StarGroupBeat[]
  finalIndex: number
}

export function buildStarGroupHK20P1Q5Steps(lang: Lang): StarGroupStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats: StarGroupBeat[] = [
    {
      phase: 'intro',
      activeGroup: 0,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Each group forms an L-shape of * stars — count how many in each group.',
        'Setiap kelompok membentuk huruf L dari bintang * — hitung berapa banyak di setiap kelompok.',
      ),
    },
    {
      phase: 'count',
      activeGroup: -1,
      equation: '1 · 3 · 5 · 7 · …',
      hold: 2400,
      result: false,
      caption: t(
        'Group 1=1, Group 2=3, Group 3=5, Group 4=7 — each group adds 2 more stars than the last!',
        'Kelompok 1=1, Kelompok 2=3, Kelompok 3=5, Kelompok 4=7 — setiap kelompok bertambah 2 bintang!',
      ),
    },
    {
      phase: 'extend',
      activeGroup: 0,
      equation: '7 + 2 = 9  →  9 + 2 = 11',
      hold: 2600,
      result: false,
      caption: t(
        'Continue the +2 rule: Group 5 = 9, Group 6 = 9 + 2 = 11.',
        'Lanjutkan aturan +2: Kelompok 5 = 9, Kelompok 6 = 9 + 2 = 11.',
      ),
    },
    {
      phase: 'result',
      activeGroup: 0,
      equation: '2 × 6 − 1 = 11',
      hold: 0,
      result: true,
      caption: t(
        'Group 6 has 11 stars (2×6 − 1 = 11). Answer: 11.',
        'Kelompok 6 memiliki 11 bintang (2×6 − 1 = 11). Jawaban: 11.',
      ),
    },
  ]

  return { beats, finalIndex: beats.length - 1 }
}
