// Storyboard for IKMC-20-PE-Q20 — "Who is the shortest?" (arrow diagram).
//
// Arrow diagram relationships (arrow = "taller than"):
//   B → A  (given as example: B is taller than A)
//   B → C
//   A → E
//   A → D
//   E → D
//   F → D
//   F → C
//
// Strategy: the shortest person has no outgoing arrows (no one is shorter
// than them). Trace all chains — every chain ends at C.
//   B → C  (direct)
//   F → C  (direct)
//   B → A → E → D  (D is beaten by four people)
//   Chain: B > A > E > D; B > C; F > D; F > C
// → C is beaten by B and F; C beats nobody → C is SHORTEST (answer C).
//
// Beats:
//   0 — Intro: show all nodes, explain arrow rule
//   1 — Highlight B→A (example): B taller than A
//   2 — Highlight A→E and A→D: A taller than E and D
//   3 — Highlight E→D: E also taller than D
//   4 — Highlight F→D and F→C: F taller than D and C
//   5 — Highlight B→C: B taller than C
//   6 — Result: C has no outgoing arrows → C is shortest

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { PersonName } from './Heights20PEIllustration'

export const HEIGHTS_20_PE_ANSWER = 'Person C'
export const HEIGHTS_20_PE_CHOICE = 'C'

export interface Heights20PEStep {
  phase: string
  /** Nodes to highlight (amber) in the diagram. */
  highlight: PersonName[]
  /** Whether to show C as the confirmed shortest (green). */
  shortestRevealed: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Heights20PEStoryboard {
  answer: string
  steps: Heights20PEStep[]
  finalIndex: number
}

export function buildHeights20PESteps(lang: Lang): Heights20PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Heights20PEStep[] = [
    {
      phase: 'intro',
      highlight: [],
      shortestRevealed: false,
      hold: 2400,
      result: false,
      caption: t(
        'Six people: A, B, C, D, E, F. An arrow from X to Y means X is taller than Y. We must find who has NO outgoing arrows — that person is shortest.',
        'Enam orang: A, B, C, D, E, F. Panah dari X ke Y berarti X lebih tinggi dari Y. Kita harus menemukan siapa yang tidak punya panah keluar — orang itu paling pendek.',
      ),
    },
    {
      phase: 'example',
      highlight: ['B', 'A'],
      shortestRevealed: false,
      hold: 2200,
      result: false,
      caption: t(
        'Example (given): B → A means B is taller than A. So A is beaten by at least B.',
        'Contoh (diberikan): B → A berarti B lebih tinggi dari A. Jadi A dikalahkan minimal oleh B.',
      ),
    },
    {
      phase: 'clueA',
      highlight: ['A', 'E', 'D'],
      shortestRevealed: false,
      hold: 2200,
      result: false,
      caption: t(
        'A → E and A → D: A is taller than both E and D. So E and D are each beaten by A.',
        'A → E dan A → D: A lebih tinggi dari E dan D. Jadi E dan D masing-masing dikalahkan oleh A.',
      ),
    },
    {
      phase: 'clueE',
      highlight: ['E', 'D'],
      shortestRevealed: false,
      hold: 2200,
      result: false,
      caption: t(
        'E → D: E is also taller than D. D is beaten by A, E, and F.',
        'E → D: E juga lebih tinggi dari D. D dikalahkan oleh A, E, dan F.',
      ),
    },
    {
      phase: 'clueF',
      highlight: ['F', 'D', 'C'],
      shortestRevealed: false,
      hold: 2200,
      result: false,
      caption: t(
        'F → D and F → C: F is taller than both D and C. Now C is beaten by B and F.',
        'F → D dan F → C: F lebih tinggi dari D dan C. Sekarang C dikalahkan oleh B dan F.',
      ),
    },
    {
      phase: 'clueB',
      highlight: ['B', 'C'],
      shortestRevealed: false,
      hold: 2200,
      result: false,
      caption: t(
        'B → C: B is taller than C. C is beaten by both B and F — and C beats nobody.',
        'B → C: B lebih tinggi dari C. C dikalahkan oleh B dan F — dan C tidak mengalahkan siapa pun.',
      ),
    },
    {
      phase: 'result',
      highlight: ['C'],
      shortestRevealed: true,
      hold: 0,
      result: true,
      caption: t(
        `C has NO outgoing arrows — nobody is shorter than C. Person C is the SHORTEST. Answer: ${HEIGHTS_20_PE_CHOICE}.`,
        `C tidak memiliki panah keluar — tidak ada yang lebih pendek dari C. Orang C paling PENDEK. Jawaban: ${HEIGHTS_20_PE_CHOICE}.`,
      ),
    },
  ]

  return {
    answer: HEIGHTS_20_PE_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
