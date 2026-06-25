// HKIMO-20-P2H-Q5 — storyboard builder for the staircase star-group explainer.
//
// Pattern: group n has n²−n−1 stars (for n≥2); group 1 = 0.
//   Sequence: 0, 1, 5, 11, 19, 29, 41, 55, 71 …
//   Differences: +1, +4, +6, +8, +10, +12, +14, +16 (increase by 2 from step 3 onward).
// Answer for group 9: 55 + 16 = 71.
//
// Beats:
//   0. intro  — prompt to count stars in each group.
//   1. count  — all groups lit; sequence 0·1·5·11 surfaced.
//   2. extend — dim groups; extend differences to group 9.
//   3. result — final answer 71.
//
// Pure builder: (lang) → storyboard. No Math.random, no Date — SSR-safe.

export type Lang = 'en' | 'id'

export type StarGroupP2Phase = 'intro' | 'count' | 'extend' | 'result'

export interface StarGroupP2Beat {
  phase: StarGroupP2Phase
  /**
   * 0 = no group lit, -1 = all lit, 1–4 = that specific group lit.
   * Passed to StarGroupHK20P2Q5Illustration as `activeGroup`.
   */
  activeGroup: number
  /** Equation strip text; empty string hides the strip. */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface StarGroupP2Storyboard {
  beats: StarGroupP2Beat[]
  finalIndex: number
}

export function buildStarGroupHK20P2Q5Steps(lang: Lang): StarGroupP2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats: StarGroupP2Beat[] = [
    {
      phase: 'intro',
      activeGroup: 0,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Each group shows * stars arranged in a staircase grid — count how many stars in each group.',
        'Setiap kelompok menampilkan bintang * dalam pola tangga — hitung berapa banyak bintang di setiap kelompok.',
      ),
    },
    {
      phase: 'count',
      activeGroup: -1,
      equation: '0 · 1 · 5 · 11 · …',
      hold: 2400,
      result: false,
      caption: t(
        'Group 1=0, Group 2=1, Group 3=5, Group 4=11 — gaps are +1, +4, +6 and grow by 2 each step!',
        'Kelompok 1=0, Kelompok 2=1, Kelompok 3=5, Kelompok 4=11 — selisih +1, +4, +6 dan bertambah 2 setiap langkah!',
      ),
    },
    {
      phase: 'extend',
      activeGroup: 0,
      equation: '11 +8 +10 +12 +14 +16 = 71',
      hold: 2800,
      result: false,
      caption: t(
        'Extend: +8 → 19, +10 → 29, +12 → 41, +14 → 55, +16 → 71. Group 9 = 55 + 16.',
        'Lanjutkan: +8 → 19, +10 → 29, +12 → 41, +14 → 55, +16 → 71. Kelompok 9 = 55 + 16.',
      ),
    },
    {
      phase: 'result',
      activeGroup: 0,
      equation: 'Group 9 = 71',
      hold: 0,
      result: true,
      caption: t(
        'Group 9 has 71 stars. Answer: 71.',
        'Kelompok 9 memiliki 71 bintang. Jawaban: 71.',
      ),
    },
  ]

  return { beats, finalIndex: beats.length - 1 }
}
