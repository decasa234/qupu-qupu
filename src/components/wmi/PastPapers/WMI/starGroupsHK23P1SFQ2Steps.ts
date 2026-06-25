// HKIMO-23-P1SF-Q2 — storyboard builder for the cross star-groups explainer.
//
// Pattern: group n has (4n − 3) stars (cross/plus shape): 1, 5, 9, 13, 17, 21 …
// Arithmetic common difference = 4.
// Group 6 = 4 × 6 − 3 = 21.
//
// Note: the seed records answer 27, which does not match the +4 arithmetic
// pattern shown in groups 1–4. The correct answer per the visual formula is 21.
//
// Beats:
//   0. intro  — prompt to count stars in each cross-shaped group.
//   1. count  — all groups lit; sequence 1·5·9·13 surfaced.
//   2. extend — apply +4 rule to reach groups 5 and 6.
//   3. result — formula 4n−3 and final answer 21.
//
// Pure builder: (lang) → storyboard. No Math.random, no Date — SSR-safe.

export type Lang = 'en' | 'id'

export type StarGroupsPhase = 'intro' | 'count' | 'extend' | 'result'

export interface StarGroupsBeat {
  phase: StarGroupsPhase
  /** 0 = no group lit, −1 = all lit, 1–4 = that specific group lit. */
  activeGroup: number
  /** Equation strip text; empty string hides the strip. */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface StarGroupsStoryboard {
  beats: StarGroupsBeat[]
  finalIndex: number
}

export function buildStarGroupsHK23P1SFQ2Steps(lang: Lang): StarGroupsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats: StarGroupsBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeGroup: 0,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Each group forms a cross/plus shape of * stars — count how many stars are in each group.',
        'Setiap kelompok membentuk pola silang (+) dari bintang * — hitung berapa banyak bintang di setiap kelompok.',
      ),
    },

    // Beat 1 — count each group
    {
      phase: 'count',
      activeGroup: -1,
      equation: '1 · 5 · 9 · 13 · …',
      hold: 2400,
      result: false,
      caption: t(
        'Group 1=1, Group 2=5, Group 3=9, Group 4=13 — each group adds 4 more stars than the last!',
        'Kelompok 1=1, Kelompok 2=5, Kelompok 3=9, Kelompok 4=13 — setiap kelompok bertambah 4 bintang!',
      ),
    },

    // Beat 2 — extend the +4 pattern to group 6
    {
      phase: 'extend',
      activeGroup: 0,
      equation: '13 + 4 = 17  →  17 + 4 = 21',
      hold: 2600,
      result: false,
      caption: t(
        'Apply the +4 rule: Group 5 = 13 + 4 = 17, Group 6 = 17 + 4 = 21.',
        'Terapkan aturan +4: Kelompok 5 = 13 + 4 = 17, Kelompok 6 = 17 + 4 = 21.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      activeGroup: 0,
      equation: '4 × 6 − 3 = 21',
      hold: 0,
      result: true,
      caption: t(
        'Group 6 has 21 stars. Formula: 4 × group number − 3 = 4 × 6 − 3 = 21.',
        'Kelompok ke-6 memiliki 21 bintang. Rumus: 4 × nomor kelompok − 3 = 4 × 6 − 3 = 21.',
      ),
    },
  ]

  return { beats, finalIndex: beats.length - 1 }
}
