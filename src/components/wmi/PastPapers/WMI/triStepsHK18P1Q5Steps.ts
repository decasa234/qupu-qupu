// HKIMO-18-P1H-Q5 — storyboard for the triangular staircase group pattern.
//
// Question: "According to the pattern shown below, how many ⊕ are there in the 10th group?"
// Answer: 55 (triangular number: 10×11/2).
//
// Beats:
//   0. intro   — show all 4 groups; identify the counting task.
//   1. group1  — highlight group 1: count = 1.
//   2. group2  — highlight group 2: 1+2 = 3.
//   3. group3  — highlight group 3: 1+2+3 = 6.
//   4. group4  — highlight group 4: 1+2+3+4 = 10.
//   5. formula — all groups highlighted; establish n(n+1)/2 rule.
//   6. result  — apply n=10: 10×11÷2 = 55.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'group1' | 'group2' | 'group3' | 'group4' | 'formula' | 'result'

export interface TriStepsBeat {
  phase: PhaseId
  /** 1-indexed group numbers to highlight with accent fill. Empty = none. */
  highlightGroups: number[]
  /** Arithmetic line shown below the figure ('' = hidden). */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface TriStepsStoryboard {
  steps: TriStepsBeat[]
  finalIndex: number
}

export function buildTriStepsHK18P1Q5Steps(lang: Lang): TriStepsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriStepsBeat[] = [
    {
      phase: 'intro',
      highlightGroups: [],
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Each group is a staircase of ⊕ squares. Count the ⊕ symbols in groups 1–4.',
        'Setiap kelompok adalah tangga kotak ⊕. Hitung simbol ⊕ di kelompok 1–4.',
      ),
    },
    {
      phase: 'group1',
      highlightGroups: [1],
      equation: '1',
      hold: 2000,
      result: false,
      caption: t(
        'Group 1 has 1 row with 1 symbol — total: 1.',
        'Kelompok 1 punya 1 baris berisi 1 simbol — total: 1.',
      ),
    },
    {
      phase: 'group2',
      highlightGroups: [2],
      equation: '1 + 2 = 3',
      hold: 2000,
      result: false,
      caption: t(
        'Group 2 has 2 rows (top: 1, bottom: 2) — total: 1 + 2 = 3.',
        'Kelompok 2 punya 2 baris (atas: 1, bawah: 2) — total: 1 + 2 = 3.',
      ),
    },
    {
      phase: 'group3',
      highlightGroups: [3],
      equation: '1 + 2 + 3 = 6',
      hold: 2000,
      result: false,
      caption: t(
        'Group 3 has 3 rows — total: 1 + 2 + 3 = 6.',
        'Kelompok 3 punya 3 baris — total: 1 + 2 + 3 = 6.',
      ),
    },
    {
      phase: 'group4',
      highlightGroups: [4],
      equation: '1 + 2 + 3 + 4 = 10',
      hold: 2000,
      result: false,
      caption: t(
        'Group 4 has 4 rows — total: 1 + 2 + 3 + 4 = 10.',
        'Kelompok 4 punya 4 baris — total: 1 + 2 + 3 + 4 = 10.',
      ),
    },
    {
      phase: 'formula',
      highlightGroups: [1, 2, 3, 4],
      equation: 'Group n = n × (n + 1) ÷ 2',
      hold: 2200,
      result: false,
      caption: t(
        'Pattern: group n has n rows, total = 1+2+…+n = n(n+1)/2 (triangular number).',
        'Pola: kelompok n punya n baris, total = 1+2+…+n = n(n+1)/2 (bilangan segitiga).',
      ),
    },
    {
      phase: 'result',
      highlightGroups: [],
      equation: '10 × 11 ÷ 2 = 55',
      hold: 0,
      result: true,
      caption: t(
        'Group 10: n = 10 → 10 × 11 ÷ 2 = 55. The answer is 55.',
        'Kelompok 10: n = 10 → 10 × 11 ÷ 2 = 55. Jawabannya adalah 55.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
