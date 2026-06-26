// SASMO-19-G2-Q24 — explainer storyboard builder.
//
// Puzzle: complete the cross-calculation grid in Picture 3, find "?".
// Answer: ? = R2C1 in Pic 3 = R0C1 × R1C1 = 1 × 8 = 8.
//
// Teaching walk (4 beats):
//   0. intro     — show both panels; state the task.
//   1. rule-row  — Pic 2, rows 0–1: A × B = C (row multiply rule).
//   2. rule-col  — Pic 2, cols 0 & 2: A × B = C / A + B = C.
//   3. result    — fill Pic 3 fully; highlight ? = 8.
//
// Pure builder: (lang) → storyboard. No hooks, no side effects, SSR-safe.

export type Lang = 'en' | 'id'

export type GridCalcPhase = 'intro' | 'rule-row' | 'rule-col' | 'result'

export interface GridCalcBeat {
  phase: GridCalcPhase
  /** [r, c] pairs to highlight (amber ring) in the Example panel (Pic 2). */
  hlExample: [number, number][]
  /**
   * When true the explainer shows SOLVED_P3_CELLS instead of PUZZLE_CELLS
   * (all deduced values filled in for Pic 3).
   */
  showDeduced: boolean
  /** When true the answer cell [2,1] in Pic 3 gets a green overlay. */
  hlAnswer: boolean
  /** Equation string shown below the panels; '' = hidden. */
  equation: string
  /** Caption text rendered in the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = last beat / manual advance only). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface GridCalcStoryboard {
  steps: GridCalcBeat[]
  finalIndex: number
}

export function buildGridCalcSASMO19G2Q24Steps(lang: Lang): GridCalcStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridCalcBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      hlExample: [],
      showDeduced: false,
      hlAnswer: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Picture 2 is the solved example. Find the rule, then apply it to Picture 3 to find "?".',
        'Gambar 2 adalah contoh yang sudah selesai. Temukan aturannya, lalu terapkan ke Gambar 3 untuk mencari "?".',
      ),
    },

    // Beat 1 — row rule
    {
      phase: 'rule-row',
      hlExample: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
      showDeduced: false,
      hlAnswer: false,
      equation: t('4 × 2 = 8  ·  6 × 2 = 12', '4 × 2 = 8  ·  6 × 2 = 12'),
      hold: 2500,
      result: false,
      caption: t(
        'Row rule (rows 1 & 2): left × middle = right.',
        'Aturan baris (baris 1 & 2): kiri × tengah = kanan.',
      ),
    },

    // Beat 2 — column rule
    {
      phase: 'rule-col',
      hlExample: [[0, 0], [1, 0], [2, 0], [0, 2], [1, 2], [2, 2]],
      showDeduced: false,
      hlAnswer: false,
      equation: t('4×6 = 24 (col 1)  ·  8+12 = 20 (col 3)', '4×6 = 24 (kol 1)  ·  8+12 = 20 (kol 3)'),
      hold: 2500,
      result: false,
      caption: t(
        'Column rule (cols 1, 2): top × middle = bottom. Column 3: top + middle = bottom.',
        'Aturan kolom (kol 1, 2): atas × tengah = bawah. Kolom 3: atas + tengah = bawah.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      hlExample: [],
      showDeduced: true,
      hlAnswer: true,
      equation: t('? = 1 × 8 = 8', '? = 1 × 8 = 8'),
      hold: 0,
      result: true,
      caption: t(
        'In Picture 3 the missing top-middle number is 1 (col-1 rule: 1×9 = 9 → 10×9−1×8 = 90−8 = 82 ✓). So ? = 1 × 8 = 8.',
        'Di Gambar 3, angka atas-tengah yang hilang adalah 1 (aturan kol-1: 1×9=9→10×9−1×8=90−8=82 ✓). Jadi ? = 1 × 8 = 8.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
