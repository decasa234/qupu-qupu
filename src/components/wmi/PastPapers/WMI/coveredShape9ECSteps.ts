/**
 * IKMC-23-EC-Q9 — storyboard for the "covered shape with dot" animation.
 *
 * Problem: an L-shaped figure is covered by 5 pieces (A–E). A dot is placed
 * at the 4th cell from the left in the bottom row. Which piece covers the dot?
 * Answer: A (the parallelogram).
 *
 * Strategy: mentally fit the 5 pieces into the L-shape. The dot sits in the
 * rightmost part of the bottom row — the region covered by piece A.
 *
 * Animation beats:
 *   0. intro  — show the L-shape with the dot; state the task.
 *   1. locate — identify the dot's position (4th cell from the left, bottom row).
 *   2. piece-A — highlight the parallelogram region on the shape; match piece A.
 *   3. result — confirm: the dot falls under piece A; answer is A.
 *
 * Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.
 */

export type Lang = 'en' | 'id'

export type CoveredShape9ECPhase = 'intro' | 'locate' | 'piece-a' | 'result'

export interface CoveredShape9ECBeat {
  phase: CoveredShape9ECPhase
  /** Whether to highlight the piece-A region on the shape */
  highlightA: boolean
  /** Caption text for the beat */
  caption: string
  /** Auto-hold in ms (0 = final beat, stays) */
  hold: number
  /** True only on the result beat */
  result: boolean
}

export interface CoveredShape9ECStoryboard {
  steps: CoveredShape9ECBeat[]
  finalIndex: number
}

export function buildCoveredShape9ECSteps(lang: Lang): CoveredShape9ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CoveredShape9ECBeat[] = [
    // Beat 0 — intro: show the shape with the dot
    {
      phase: 'intro',
      highlightA: false,
      hold: 2400,
      result: false,
      caption: t(
        'The L-shaped figure is covered by 5 puzzle pieces. A dot marks a spot. We must find which piece covers the dot.',
        'Bentuk huruf L ditutupi oleh 5 potongan puzzle. Sebuah titik menandai satu tempat. Kita harus mencari potongan mana yang menutupi titik tersebut.',
      ),
    },

    // Beat 1 — locate the dot
    {
      phase: 'locate',
      highlightA: false,
      hold: 2200,
      result: false,
      caption: t(
        'The dot is on the 4th cell from the left in the bottom row — in the right half of the wide bottom strip.',
        'Titik berada di kotak ke-4 dari kiri pada baris bawah — di bagian kanan dari strip bawah yang lebar.',
      ),
    },

    // Beat 2 — show piece-A region
    {
      phase: 'piece-a',
      highlightA: true,
      hold: 2400,
      result: false,
      caption: t(
        'Piece A is a parallelogram that covers the right part of the bottom row — the region where the dot sits.',
        'Potongan A adalah jajar genjang yang menutupi bagian kanan baris bawah — wilayah di mana titik berada.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      highlightA: true,
      hold: 0,
      result: true,
      caption: t(
        'The dot falls inside the region covered by piece A — the answer is A.',
        'Titik jatuh di dalam wilayah yang ditutupi potongan A — jawabannya adalah A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
