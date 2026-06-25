// HKIMO-19-P1H-Q5 — storyboard builder for the triangular-groups explainer.
//
// Pattern: group n has n rows; row k (top=1) has k right-aligned cells.
// Total per group = T(n) = n(n+1)/2.  Answer for n=10: 10×11÷2 = 55.
//
// Beats:
//   0. intro   — static scene, prompt to look at the groups.
//   1. count   — observe 1, 3, 6, 10 — triangular numbers.
//   2. formula — T(n) = n×(n+1)÷2.
//   3. apply   — T(10) = 10×11÷2 = 55.
//   4. result  — answer 55.
//
// Pure builder: (lang) → storyboard. No Math.random, no Date — SSR-safe.

export type Lang = 'en' | 'id'

export type GroupsPhase = 'intro' | 'count' | 'formula' | 'apply' | 'result'

export interface GroupsBeat {
  phase: GroupsPhase
  /** Math expression to show beneath the figure; '' hides the strip. */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface GroupsStoryboard {
  beats: GroupsBeat[]
  finalIndex: number
}

export function buildTriangleGroupsHK19P1Q5Steps(lang: Lang): GroupsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats: GroupsBeat[] = [
    {
      phase: 'intro',
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Each group forms a staircase of ⊕ cells — count how many.',
        'Setiap kelompok membentuk tangga simbol ⊕ — hitung berapa banyak.',
      ),
    },
    {
      phase: 'count',
      equation: '1   ·   3   ·   6   ·   10   ·   …',
      hold: 2600,
      result: false,
      caption: t(
        'Group 1=1, Group 2=3, Group 3=6, Group 4=10 — triangular numbers!',
        'Kelompok 1=1, Kelompok 2=3, Kelompok 3=6, Kelompok 4=10 — bilangan segitiga!',
      ),
    },
    {
      phase: 'formula',
      equation: 'T(n) = n × (n + 1) ÷ 2',
      hold: 2600,
      result: false,
      caption: t(
        'Group n always has T(n) = n×(n+1)÷2 symbols.',
        'Kelompok ke-n selalu memiliki T(n) = n×(n+1)÷2 simbol.',
      ),
    },
    {
      phase: 'apply',
      equation: 'T(10) = 10 × 11 ÷ 2 = 55',
      hold: 2800,
      result: false,
      caption: t(
        'For the 10th group: 10 × 11 ÷ 2 = 55.',
        'Untuk kelompok ke-10: 10 × 11 ÷ 2 = 55.',
      ),
    },
    {
      phase: 'result',
      equation: '= 55',
      hold: 0,
      result: true,
      caption: t(
        'Answer: 55 ⊕ symbols in the 10th group.',
        'Jawaban: 55 simbol ⊕ pada kelompok ke-10.',
      ),
    },
  ]

  return { beats, finalIndex: beats.length - 1 }
}
