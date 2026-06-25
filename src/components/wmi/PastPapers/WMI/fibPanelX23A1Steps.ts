/**
 * SEAMOX-23-A-Q1 — Beat-by-beat storyboard for the Fibonacci-panel explainer.
 *
 * The solution walks through the rule in three phases:
 *  'intro'  — show all panels, prompt the student to look for a pattern
 *  'rule'   — demonstrate left_circle = box2+box3 and right_circle = prev+box3
 *  'apply'  — apply the rule to panel 3 to find the missing number
 *  'result' — reveal 55 with green highlight
 */

export type FibX23A1Phase = 'intro' | 'rule' | 'apply' | 'result'

export interface FibX23A1Beat {
  phase: FibX23A1Phase
  highlightPanel: 0 | 1 | 2 | null
  highlightCircle: 'left' | 'right' | null
  revealAnswer: boolean
  caption: string
  hold: number
}

export interface FibX23A1Storyboard {
  steps: FibX23A1Beat[]
  finalIndex: number
}

export function buildFibX23A1Steps(lang: 'en' | 'id'): FibX23A1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FibX23A1Beat[] = [
    {
      phase: 'intro',
      highlightPanel: null,
      highlightCircle: null,
      revealAnswer: false,
      hold: 1400,
      caption: t(
        'Three panels — boxes hold the numbers, circles below hold derived values. Find the rule!',
        'Tiga kelompok — kotak berisi bilangan, lingkaran di bawah berisi nilai turunannya. Temukan aturannya!',
      ),
    },
    {
      phase: 'rule',
      highlightPanel: 0,
      highlightCircle: 'left',
      revealAnswer: false,
      hold: 1600,
      caption: t(
        'Panel 1 — left circle = 2nd + 3rd box: 1 + 2 = 3 ✓',
        'Kelompok 1 — lingkaran kiri = kotak ke-2 + ke-3: 1 + 2 = 3 ✓',
      ),
    },
    {
      phase: 'rule',
      highlightPanel: 0,
      highlightCircle: 'right',
      revealAnswer: false,
      hold: 1600,
      caption: t(
        'Panel 1 — right circle = left circle + 3rd box: 3 + 2 = 5 ✓',
        'Kelompok 1 — lingkaran kanan = lingkaran kiri + kotak ke-3: 3 + 2 = 5 ✓',
      ),
    },
    {
      phase: 'rule',
      highlightPanel: 1,
      highlightCircle: 'left',
      revealAnswer: false,
      hold: 1400,
      caption: t(
        'Panel 2 — 5 + 8 = 13 ✓',
        'Kelompok 2 — 5 + 8 = 13 ✓',
      ),
    },
    {
      phase: 'rule',
      highlightPanel: 1,
      highlightCircle: 'right',
      revealAnswer: false,
      hold: 1400,
      caption: t(
        'Panel 2 — 13 + 8 = 21 ✓',
        'Kelompok 2 — 13 + 8 = 21 ✓',
      ),
    },
    {
      phase: 'apply',
      highlightPanel: 2,
      highlightCircle: 'left',
      revealAnswer: false,
      hold: 1600,
      caption: t(
        'Panel 3 — apply the rule: 2nd + 3rd box → 21 + 34 = ?',
        'Kelompok 3 — terapkan aturan: kotak ke-2 + ke-3 → 21 + 34 = ?',
      ),
    },
    {
      phase: 'result',
      highlightPanel: 2,
      highlightCircle: 'left',
      revealAnswer: true,
      hold: 0,
      caption: t(
        '21 + 34 = 55 — the missing number is 55!',
        '21 + 34 = 55 — bilangan yang hilang adalah 55!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
