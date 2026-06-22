// IKMC-21-EC-Q2 — storyboard for the brick-assembly animation.
//
// The question: Erik has 4 flat rectangular bricks (each 1×2×1 unit cubes).
// Which of the five 3-D assemblies (A–E) can he build with his 4 bricks?
// Answer: C (the complete 2×2×2 cube).
//
// Key insight:
//   - Each brick covers exactly 2 unit cubes.
//   - 4 bricks × 2 cubes = 8 unit cubes total.
//   - A valid assembly must use EXACTLY 8 unit cubes AND be tileable by
//     4 flat 1×2×1 bricks without overlap or gaps.
//   - A full 2×2×2 cube = 8 unit cubes → CAN be tiled (2 bricks per layer,
//     top layer bricks rotated 90° so no seam lines up).
//
//   Option brick-count check:
//     A: 8 cubes (2×2×2) but internal seam pattern not achievable
//     B: 6 cubes — NOT 8 → impossible (missing 2 cubes)
//     C: 8 cubes (2×2×2) → achievable! ← answer
//     D: 7 cubes — NOT 8 → impossible
//     E: 8 cubes but irregular shape → bricks would need to bend → impossible
//
// Teaching walk, one idea per beat:
//   0. intro    — each brick = 2 unit cubes; 4 bricks = 8 cubes needed.
//   1. checkB   — B uses only 6 cubes → can't fit 4 bricks → ✗.
//   2. checkD   — D uses only 7 cubes → can't fit 4 bricks → ✗.
//   3. checkA   — A has 8 cubes but bricks would overlap inside → ✗.
//   4. checkE   — E has 8 cubes but bricks would need to bend → ✗.
//   5. checkC   — C has 8 cubes in 2×2×2; layer 1: 2 bricks flat; layer 2: 2 bricks
//                 turned 90° → fits perfectly → ✓.
//   6. result   — only C can be built → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type BricksPhaseId =
  | 'intro'
  | 'checkB'
  | 'checkD'
  | 'checkA'
  | 'checkE'
  | 'checkC'
  | 'result'

export interface Bricks2ECBeat {
  /** Animation phase. */
  phase: BricksPhaseId
  /** Which option letter is being evaluated ('A'…'E' or null). */
  activeOption: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Unit cube count for the active option (or null). */
  cubeCount: number | null
  /** Whether this option is the correct answer. */
  isAnswer: boolean
  /** Whether this option passes the cube-count test. */
  passesCount: boolean | null
  /** Whether this option is fully achievable. */
  passes: boolean | null
  /** Equation or tally string shown; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Bricks2ECStoryboard {
  steps: Bricks2ECBeat[]
  finalIndex: number
}

export function buildBricks2ECSteps(lang: Lang): Bricks2ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Bricks2ECBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeOption: null,
      cubeCount: null,
      isAnswer: false,
      passesCount: null,
      passes: null,
      equation: '4 × 2 = 8',
      hold: 2600,
      result: false,
      caption: t(
        'Each brick covers 2 unit cubes. Erik has 4 bricks → he needs a shape that uses exactly 4 × 2 = 8 unit cubes.',
        'Setiap bata menutupi 2 unit kubus. Erik punya 4 bata → ia memerlukan bentuk yang menggunakan tepat 4 × 2 = 8 unit kubus.',
      ),
    },

    // Beat 1 — check B (6 cubes, wrong)
    {
      phase: 'checkB',
      activeOption: 'B',
      cubeCount: 6,
      isAnswer: false,
      passesCount: false,
      passes: false,
      equation: '6 ≠ 8',
      hold: 2200,
      result: false,
      caption: t(
        'B uses only 6 unit cubes. Erik has 4 bricks = 8 cubes — B is too small. ✗',
        'B hanya menggunakan 6 unit kubus. Erik punya 4 bata = 8 kubus — B terlalu kecil. ✗',
      ),
    },

    // Beat 2 — check D (7 cubes, wrong)
    {
      phase: 'checkD',
      activeOption: 'D',
      cubeCount: 7,
      isAnswer: false,
      passesCount: false,
      passes: false,
      equation: '7 ≠ 8',
      hold: 2200,
      result: false,
      caption: t(
        'D uses 7 unit cubes. Still not 8 — one cube short. ✗',
        'D menggunakan 7 unit kubus. Masih belum 8 — kurang satu kubus. ✗',
      ),
    },

    // Beat 3 — check A (8 cubes but wrong internal tiling)
    {
      phase: 'checkA',
      activeOption: 'A',
      cubeCount: 8,
      isAnswer: false,
      passesCount: true,
      passes: false,
      equation: '8 = 8, but…',
      hold: 2400,
      result: false,
      caption: t(
        'A has 8 cubes, but when you try to place 4 flat bricks inside, they overlap — it can\'t be tiled correctly. ✗',
        'A memiliki 8 kubus, tetapi saat mencoba menempatkan 4 bata datar di dalamnya, bata-bata itu saling tumpang tindih — tidak dapat disusun dengan benar. ✗',
      ),
    },

    // Beat 4 — check E (irregular, 8 cubes but unbrickable)
    {
      phase: 'checkE',
      activeOption: 'E',
      cubeCount: 8,
      isAnswer: false,
      passesCount: true,
      passes: false,
      equation: '8 = 8, but…',
      hold: 2400,
      result: false,
      caption: t(
        'E has 8 cubes but the shape is irregular — a flat brick would need to bend around a corner. ✗',
        'E memiliki 8 kubus tetapi bentuknya tidak beraturan — bata datar harus ditekuk di sudut. ✗',
      ),
    },

    // Beat 5 — check C (8 cubes, correct!)
    {
      phase: 'checkC',
      activeOption: 'C',
      cubeCount: 8,
      isAnswer: true,
      passesCount: true,
      passes: true,
      equation: '8 = 8 ✓',
      hold: 2600,
      result: false,
      caption: t(
        'C is a 2×2×2 cube — 8 unit cubes! Layer 1: 2 bricks side by side. Layer 2: 2 bricks turned 90°. All 4 bricks fit perfectly. ✓',
        'C adalah kubus 2×2×2 — 8 unit kubus! Lapisan 1: 2 bata berjajar. Lapisan 2: 2 bata diputar 90°. Semua 4 bata pas sempurna. ✓',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      activeOption: 'C',
      cubeCount: 8,
      isAnswer: true,
      passesCount: true,
      passes: true,
      equation: 'C ✓',
      hold: 0,
      result: true,
      caption: t(
        'Only option C (the 2×2×2 cube) uses exactly 4 bricks with no overlap — answer C.',
        'Hanya pilihan C (kubus 2×2×2) yang menggunakan tepat 4 bata tanpa tumpang tindih — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
