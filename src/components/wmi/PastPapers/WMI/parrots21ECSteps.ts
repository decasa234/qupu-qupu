/**
 * parrots21ECSteps — beat-by-beat storyboard for IKMC-20-EC-Q21.
 *
 * Strategy: 3! = 6 ways to assign R/G/B to head/wings/tail (each colour used
 * exactly once). One arrangement is already used (head=R, wings=G, tail=B),
 * so Jane can colour 6 − 1 = 5 more parrots. Answer D.
 *
 * Binding to seed quantities:
 *   quantities[0] → "3! = 6" total arrangements
 *   quantities[1] → "1" already used
 *   quantities[2] → "6 − 1 = 5" remaining
 */

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ── Colour key ────────────────────────────────────────────────────────────────
export type PartColor = 'R' | 'G' | 'B' | null

export interface ParrotState {
  head: PartColor
  wings: PartColor
  tail: PartColor
  /** true = this parrot is the "already used" one (struck out) */
  used: boolean
  /** true = this is the focused / newly-revealed parrot in this beat */
  active: boolean
}

// All 6 permutations of (R, G, B) for (head, wings, tail).
// The first one (R, G, B) is the already-used parrot.
export const ALL_PERMS: Array<[PartColor, PartColor, PartColor]> = [
  ['R', 'G', 'B'], // 0 — already used (Jane's first parrot)
  ['R', 'B', 'G'], // 1
  ['G', 'R', 'B'], // 2
  ['G', 'B', 'R'], // 3
  ['B', 'R', 'G'], // 4
  ['B', 'G', 'R'], // 5
]

export type P21Phase =
  | 'intro'
  | 'count-rule'
  | 'reveal-all'
  | 'cross-out'
  | 'count-remaining'
  | 'result'

export interface P21Step {
  phase: P21Phase
  /** Which parrots to show (0 = first/used parrot revealed). */
  visibleCount: number
  /** Index of the active (highlighted) parrot in this beat (-1 = none). */
  activeIndex: number
  /** Show the "used" cross on parrot 0. */
  showUsed: boolean
  caption: string
  equation: string
  result: boolean
  hold: number
}

export interface P21Storyboard {
  steps: P21Step[]
  finalIndex: number
  answer: string
}

export function buildParrots21ECSteps(lang: Lang): P21Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: P21Step[] = [
    {
      phase: 'intro',
      visibleCount: 0,
      activeIndex: -1,
      showUsed: false,
      equation: '',
      hold: 1600,
      result: false,
      caption: t(
        'Each parrot must use all 3 colours — one per body part (head, wings, tail).',
        'Setiap burung beo harus memakai 3 warna — satu per bagian tubuh (kepala, sayap, ekor).',
      ),
    },
    {
      phase: 'count-rule',
      visibleCount: 0,
      activeIndex: -1,
      showUsed: false,
      equation: '3 × 2 × 1 = 6',
      hold: 2200,
      result: false,
      caption: t(
        'There are 3 choices for the head, 2 for the wings (different colour), 1 for the tail — that is 3! = 6 ways in total.',
        'Ada 3 pilihan untuk kepala, 2 untuk sayap (warna berbeda), 1 untuk ekor — itu 3! = 6 cara.',
      ),
    },
    {
      phase: 'reveal-all',
      visibleCount: 6,
      activeIndex: -1,
      showUsed: false,
      equation: '6 ways',
      hold: 2000,
      result: false,
      caption: t(
        'Here are all 6 distinct colourings:',
        'Inilah 6 pewarnaan yang berbeda:',
      ),
    },
    {
      phase: 'cross-out',
      visibleCount: 6,
      activeIndex: 0,
      showUsed: true,
      equation: '6 − 1',
      hold: 2200,
      result: false,
      caption: t(
        'Jane already used one: head = red, wings = green, tail = blue. Cross it out.',
        'Jane sudah memakai satu: kepala = merah, sayap = hijau, ekor = biru. Coret.',
      ),
    },
    {
      phase: 'count-remaining',
      visibleCount: 6,
      activeIndex: -1,
      showUsed: true,
      equation: '6 − 1 = 5',
      hold: 2200,
      result: false,
      caption: t(
        '5 colourings remain — Jane can colour 5 more parrots.',
        '5 pewarnaan tersisa — Jane bisa mewarnai 5 burung beo lagi.',
      ),
    },
    {
      phase: 'result',
      visibleCount: 6,
      activeIndex: -1,
      showUsed: true,
      equation: '6 − 1 = 5',
      hold: 0,
      result: true,
      caption: t(
        'Answer D: 5 more parrots.',
        'Jawaban D: 5 burung beo lagi.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'D' }
}
