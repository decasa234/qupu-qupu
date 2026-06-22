// IKMC-22-PE-Q3 — storyboard for the 5-brick staircase animation.
//
// The question: 5 identical bricks arranged in a staircase.
// How many bricks are touching exactly 3 other bricks?  Answer: B (2 bricks).
//
// Staircase layout (voxel index 0-4):
//           [4]
//        [3]
//   [0][1][2]
//
// Touching means sharing a face OR edge (real-world bricks in contact):
//   Brick 0 (B1, bottom-left)   → touches B2 (face)                      = 1
//   Brick 1 (B2, bottom-middle) → touches B1 (face), B3 (face), B4 (edge) = 3 ✓
//   Brick 2 (B3, bottom-right)  → touches B2 (face), B4 (face)            = 2
//   Brick 3 (B4, middle step)   → touches B3 (face), B5 (face), B2 (edge) = 3 ✓
//   Brick 4 (B5, top step)      → touches B4 (face)                       = 1
//
// Teaching walk — one idea per beat:
//   0. intro   — show the 5-brick staircase, set up the task.
//   1. checkB1 — highlight B1 (bottom-left): only touches B2 → 1 (not 3).
//   2. checkB2 — highlight B2 (bottom-middle): touches B1 + B3 + B4 → 3 ✓.
//   3. checkB3 — highlight B3 (bottom-right): touches B2 + B4 → 2 (not 3).
//   4. checkB4 — highlight B4 (middle step): touches B3 + B5 + B2 → 3 ✓.
//   5. checkB5 — highlight B5 (top step): only touches B4 → 1 (not 3).
//   6. result  — 2 bricks (B2 and B4) each touch exactly 3 → answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Bricks3PEPhaseId =
  | 'intro'
  | 'checkB1'
  | 'checkB2'
  | 'checkB3'
  | 'checkB4'
  | 'checkB5'
  | 'result'

export interface Bricks3PEBeat {
  /** Animation phase. */
  phase: Bricks3PEPhaseId
  /**
   * Which brick index (0–4) is currently being evaluated, or null in intro/result.
   * Index matches STAIRCASE_VOXELS order: 0=B1,1=B2,2=B3,3=B4,4=B5.
   */
  activeBrick: number | null
  /** How many neighbours this brick touches (null when not evaluating). */
  neighbourCount: number | null
  /** True when the active brick touches exactly 3 others. */
  passes: boolean | null
  /** Tally string shown in the equation chip. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
  /** Which brick indices to highlight green on the result beat. */
  correctBricks?: number[]
}

export interface Bricks3PEStoryboard {
  steps: Bricks3PEBeat[]
  finalIndex: number
}

export function buildBricks3PESteps(lang: Lang): Bricks3PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Bricks3PEBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeBrick: null,
      neighbourCount: null,
      passes: null,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Five identical bricks are stacked in a staircase. For each brick, count how many other bricks it is touching.',
        'Lima bata identik tersusun membentuk tangga. Untuk setiap bata, hitung berapa bata lain yang disentuhnya.',
      ),
    },

    // Beat 1 — check B1 (bottom-left, voxel index 0)
    {
      phase: 'checkB1',
      activeBrick: 0,
      neighbourCount: 1,
      passes: false,
      equation: '1 ≠ 3',
      hold: 2000,
      result: false,
      caption: t(
        'Brick 1 (bottom-left): only touches Brick 2. That is 1 neighbour — not 3. ✗',
        'Bata 1 (pojok kiri bawah): hanya menyentuh Bata 2. Itu 1 tetangga — bukan 3. ✗',
      ),
    },

    // Beat 2 — check B2 (bottom-middle, voxel index 1)
    {
      phase: 'checkB2',
      activeBrick: 1,
      neighbourCount: 3,
      passes: true,
      equation: '3 = 3 ✓',
      hold: 2400,
      result: false,
      caption: t(
        'Brick 2 (bottom-middle): touches Brick 1 (left), Brick 3 (right), and Brick 4 (above-right). That is 3 neighbours! ✓',
        'Bata 2 (tengah bawah): menyentuh Bata 1 (kiri), Bata 3 (kanan), dan Bata 4 (atas-kanan). Itu 3 tetangga! ✓',
      ),
    },

    // Beat 3 — check B3 (bottom-right, voxel index 2)
    {
      phase: 'checkB3',
      activeBrick: 2,
      neighbourCount: 2,
      passes: false,
      equation: '2 ≠ 3',
      hold: 2000,
      result: false,
      caption: t(
        'Brick 3 (bottom-right): touches Brick 2 (left) and Brick 4 (above). That is 2 neighbours — not 3. ✗',
        'Bata 3 (kanan bawah): menyentuh Bata 2 (kiri) dan Bata 4 (atas). Itu 2 tetangga — bukan 3. ✗',
      ),
    },

    // Beat 4 — check B4 (middle step, voxel index 3)
    {
      phase: 'checkB4',
      activeBrick: 3,
      neighbourCount: 3,
      passes: true,
      equation: '3 = 3 ✓',
      hold: 2400,
      result: false,
      caption: t(
        'Brick 4 (middle step): touches Brick 3 (below), Brick 5 (above), and Brick 2 (lower-left corner). That is 3 neighbours! ✓',
        'Bata 4 (langkah tengah): menyentuh Bata 3 (bawah), Bata 5 (atas), dan Bata 2 (sudut kiri bawah). Itu 3 tetangga! ✓',
      ),
    },

    // Beat 5 — check B5 (top step, voxel index 4)
    {
      phase: 'checkB5',
      activeBrick: 4,
      neighbourCount: 1,
      passes: false,
      equation: '1 ≠ 3',
      hold: 2000,
      result: false,
      caption: t(
        'Brick 5 (top step): only touches Brick 4 below it. That is 1 neighbour — not 3. ✗',
        'Bata 5 (langkah atas): hanya menyentuh Bata 4 di bawahnya. Itu 1 tetangga — bukan 3. ✗',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      activeBrick: null,
      neighbourCount: null,
      passes: null,
      equation: '2 bricks ✓',
      hold: 0,
      result: true,
      correctBricks: [1, 3], // B2 and B4 (0-based indices)
      caption: t(
        'Exactly 2 bricks touch 3 others: Brick 2 and Brick 4 (highlighted). Answer B.',
        'Tepat 2 bata menyentuh 3 bata lain: Bata 2 dan Bata 4 (disorot). Jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
