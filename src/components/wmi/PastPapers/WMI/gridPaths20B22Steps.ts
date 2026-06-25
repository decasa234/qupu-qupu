// SEAMO-20-B-Q22 — storyboard for the lattice-path explainer.
//
// Question: moving only → or ↓ on a 4×4 grid, how many paths go from A to B
// while passing through X?  (A = top-left, X = col 3 row 3, B = bottom-right)
//
// Teaching walk, one idea per beat:
//   0. intro     — show the grid; A, X, B labelled; state the rule.
//   1. axCount   — count paths A → X: need 3R + 3D in any order → C(6,3) = 20.
//   2. xbCount   — count paths X → B: need 1R + 1D → C(2,1) = 2.
//   3. multiply  — total = 20 × 2 = 40.
//   4. result    — answer 40 (highlighted).
//
// Pure builder: (lang) → storyboard. SSR-safe, no side-effects.

export type Lang = 'en' | 'id'

export type PathPhase = 'intro' | 'axCount' | 'xbCount' | 'multiply' | 'result'

export interface PathBeat {
  phase:       PathPhase
  /** Highlight the A→X sub-grid (cols 0-3, rows 0-3). */
  highlightAX: boolean
  /** Highlight the X→B sub-grid (cols 3-4, rows 3-4). */
  highlightXB: boolean
  /** Show the C(6,3)=20 annotation near the AX region. */
  showAXLabel: boolean
  /** Show the C(2,1)=2 annotation near the XB region. */
  showXBLabel: boolean
  equation:    string
  caption:     string
  hold:        number   // ms; 0 = manual / final beat
  result:      boolean
}

export interface PathStoryboard {
  steps: PathBeat[]
  finalIndex: number
}

export function buildGridPaths20B22Steps(lang: Lang): PathStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PathBeat[] = [
    {
      phase: 'intro',
      highlightAX: false,
      highlightXB: false,
      showAXLabel: false,
      showXBLabel: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'We can only move → (right) or ↓ (down). Count every path from A to B that passes through X.',
        'Kita hanya boleh bergerak → (kanan) atau ↓ (bawah). Hitung semua jalur dari A ke B yang melewati X.',
      ),
    },
    {
      phase: 'axCount',
      highlightAX: true,
      highlightXB: false,
      showAXLabel: true,
      showXBLabel: false,
      equation: 'C(6, 3) = 20',
      hold: 2400,
      result: false,
      caption: t(
        'A → X: 3 steps right + 3 steps down = 6 moves. Choose which 3 are "right": C(6,3) = 20 paths.',
        'A → X: 3 langkah kanan + 3 langkah bawah = 6 gerakan. Pilih 3 langkah kanan: C(6,3) = 20 jalur.',
      ),
    },
    {
      phase: 'xbCount',
      highlightAX: false,
      highlightXB: true,
      showAXLabel: false,
      showXBLabel: true,
      equation: 'C(2, 1) = 2',
      hold: 2400,
      result: false,
      caption: t(
        'X → B: 1 step right + 1 step down = 2 moves. Choose which 1 is "right": C(2,1) = 2 paths.',
        'X → B: 1 langkah kanan + 1 langkah bawah = 2 gerakan. Pilih 1 langkah kanan: C(2,1) = 2 jalur.',
      ),
    },
    {
      phase: 'multiply',
      highlightAX: true,
      highlightXB: true,
      showAXLabel: true,
      showXBLabel: true,
      equation: '20 × 2 = 40',
      hold: 2200,
      result: false,
      caption: t(
        'The two legs are independent: multiply. Total paths = 20 × 2 = 40.',
        'Kedua bagian jalur berdiri sendiri: kalikan. Total jalur = 20 × 2 = 40.',
      ),
    },
    {
      phase: 'result',
      highlightAX: true,
      highlightXB: true,
      showAXLabel: true,
      showXBLabel: true,
      equation: '40',
      hold: 0,
      result: true,
      caption: t(
        'There are 40 ways to travel from A to B while passing through X.',
        'Ada 40 cara untuk pergi dari A ke B sambil melewati X.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
