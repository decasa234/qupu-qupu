// HKIMO-20-P3H-Q5 — storyboard for the star-group pattern explainer.
//
// Question: "According to the pattern shown below, how many * in the 13th group?"
// G1=1, G2=2, G3=5, G4=8 → differences: +1, +3, +3 → rule: +3 from G3 onward.
// Answer: G13 = 8 + 9×3 = 35.
//
// Beats (5 total):
//   0. intro   — show all 4 groups; identify the task.
//   1. count   — highlight all groups; note the 4 counts.
//   2. pattern — highlight G2→G4; show +1, +3, +3 gap labels; identify +3 rule.
//   3. extend  — highlight G4; show "9 steps × 3" formula.
//   4. result  — G13 = 8 + 27 = 35 (green).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'count' | 'pattern' | 'extend' | 'result'

export interface StarGroupBeat {
  phase: PhaseId
  /** 1-indexed group numbers to highlight (amber accent). Empty = none. */
  highlightGroups: number[]
  /** When true, render the +1 / +3 / +3 gap labels between groups. */
  showGaps: boolean
  /** Arithmetic line below the figure ('' = hidden). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface StarGroupStoryboard {
  steps: StarGroupBeat[]
  finalIndex: number
}

export function buildStarGroupsHK20P3Q5Steps(lang: Lang): StarGroupStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StarGroupBeat[] = [
    {
      phase: 'intro',
      highlightGroups: [],
      showGaps: false,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Groups 1–4 show a growing star (*) pattern. Count the stars in each group.',
        'Kelompok 1–4 menunjukkan pola bintang (*) yang bertumbuh. Hitung bintang di setiap kelompok.',
      ),
    },
    {
      phase: 'count',
      highlightGroups: [1, 2, 3, 4],
      showGaps: false,
      equation: 'G1=1  G2=2  G3=5  G4=8',
      hold: 2400,
      result: false,
      caption: t(
        'G1=1, G2=2, G3=5, G4=8. The differences: 2−1=1, 5−2=3, 8−5=3.',
        'K1=1, K2=2, K3=5, K4=8. Selisih: 2−1=1, 5−2=3, 8−5=3.',
      ),
    },
    {
      phase: 'pattern',
      highlightGroups: [2, 3, 4],
      showGaps: true,
      equation: 'rule: +3 each group (from G3)',
      hold: 2400,
      result: false,
      caption: t(
        'From G3 onward the gap is always +3. Each group gains 3 more stars.',
        'Dari K3 ke atas selisihnya selalu +3. Setiap kelompok bertambah 3 bintang.',
      ),
    },
    {
      phase: 'extend',
      highlightGroups: [4],
      showGaps: false,
      equation: 'G13 = G4 + 9×3 = 8 + 27',
      hold: 2400,
      result: false,
      caption: t(
        'From G4 to G13 is 9 more steps of +3. G13 = 8 + 9×3 = 8 + 27.',
        'Dari K4 ke K13 ada 9 langkah lagi. K13 = 8 + 9×3 = 8 + 27.',
      ),
    },
    {
      phase: 'result',
      highlightGroups: [],
      showGaps: false,
      equation: '8 + 27 = 35',
      hold: 0,
      result: true,
      caption: t(
        'Group 13 has 35 stars.',
        'Kelompok 13 memiliki 35 bintang.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
