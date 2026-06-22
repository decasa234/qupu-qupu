// IKMC-21-PE-Q4 — storyboard for "Michael's toy shelf" animation.
//
// The question: On Michael's toy shelf, there are neither turtles, nor rabbits,
// nor brown teddy bears. Which shelf is Michael's? (Answer: shelf 4 = D)
//
// Toy inventory (from paper figure):
//   Shelf 1: brown teddy bear · white rabbit · panda
//   Shelf 2: brown teddy bear · horse        · yellow duck
//   Shelf 3: turtle           · robot        · toy cart
//   Shelf 4: grey dog         · robot        · panda   ← correct
//   Shelf 5: turtle           · white rabbit · lion
//
// Teaching walk (one idea per beat):
//   0. intro          — show all shelves; read the three forbidden toys.
//   1. forbid-bear    — highlight brown bears on shelves 1 & 2; cross them out.
//   2. forbid-rabbit  — highlight rabbits on shelves 1 & 5; cross them out.
//   3. forbid-turtle  — highlight turtles on shelves 3 & 5; cross them out.
//   4. result         — spotlight shelf 4 (none forbidden) → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'forbid-bear' | 'forbid-rabbit' | 'forbid-turtle' | 'result'

/** Which shelves (0-indexed) are crossed out at each beat, and the glow shelf index (-1 = none). */
export interface AnimBeat {
  phase: PhaseId
  /** 0-indexed shelves with a red ✗ overlay. */
  crossedShelves: number[]
  /** 0-indexed shelf to highlight green (-1 = none). */
  glowShelf: number
  /** Equation / rule text. '' to hide. */
  equation: string
  /** Caption shown below the SVG. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Shelves4PEStoryboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildShelves4PESteps(lang: Lang): Shelves4PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      crossedShelves: [],
      glowShelf: -1,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Michael\'s shelf has NO turtles, NO rabbits, and NO brown teddy bears. Check each shelf!',
        'Rak Michael tidak ada kura-kura, kelinci, maupun beruang teddy coklat. Periksa setiap rak!',
      ),
    },

    // Beat 1 — eliminate shelves with brown teddy bears (shelves 1 & 2)
    {
      phase: 'forbid-bear',
      crossedShelves: [0, 1],
      glowShelf: -1,
      equation: t('No brown teddy bears → ✗ shelf 1, ✗ shelf 2', 'Tidak ada beruang coklat → ✗ rak 1, ✗ rak 2'),
      hold: 2400,
      result: false,
      caption: t(
        'Shelves 1 and 2 each have a brown teddy bear — eliminate them!',
        'Rak 1 dan 2 masing-masing punya beruang teddy coklat — eliminasi!',
      ),
    },

    // Beat 2 — eliminate shelves with rabbits (shelves 1 & 5; shelf 1 already crossed)
    {
      phase: 'forbid-rabbit',
      crossedShelves: [0, 1, 4],
      glowShelf: -1,
      equation: t('No rabbits → ✗ shelf 1, ✗ shelf 5', 'Tidak ada kelinci → ✗ rak 1, ✗ rak 5'),
      hold: 2400,
      result: false,
      caption: t(
        'Shelves 1 and 5 have white rabbits — shelf 5 is also eliminated!',
        'Rak 1 dan 5 punya kelinci putih — rak 5 juga dieliminasi!',
      ),
    },

    // Beat 3 — eliminate shelves with turtles (shelves 3 & 5; shelf 5 already crossed)
    {
      phase: 'forbid-turtle',
      crossedShelves: [0, 1, 2, 4],
      glowShelf: -1,
      equation: t('No turtles → ✗ shelf 3, ✗ shelf 5', 'Tidak ada kura-kura → ✗ rak 3, ✗ rak 5'),
      hold: 2400,
      result: false,
      caption: t(
        'Shelves 3 and 5 have turtles — shelf 3 is eliminated too!',
        'Rak 3 dan 5 punya kura-kura — rak 3 juga dieliminasi!',
      ),
    },

    // Beat 4 — result: only shelf 4 remains
    {
      phase: 'result',
      crossedShelves: [0, 1, 2, 4],
      glowShelf: 3,
      equation: t('Shelf 4: dog, robot, panda → D ✓', 'Rak 4: anjing, robot, panda → D ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Only shelf 4 has none of the forbidden toys. Answer D.',
        'Hanya rak 4 yang tidak memiliki mainan terlarang. Jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
