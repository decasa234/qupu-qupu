// Steps storyboard for IKMC-23-EC-Q24 (Ecolier 2023, Q24).
//
// PROBLEM: 7 circles in a heptagon ring; numbers 1–7 placed one per circle.
// Adjacent circles must sum to the value labeled on the connecting edge.
// Edge sums (clockwise from top): 7, 8, 9, 6, 9, 8, 9.
// Find the number in the GREEN circle (bottom-right, index 4). Answer: 4.
//
// SOLUTION METHOD — chain deduction starting from one anchor:
//   Let the node BEFORE green (index 3) = A, and the node AFTER (index 5) = B.
//   green+A (edge 3) = 6  → A = 6 − green
//   green+B (edge 4) = 9  → B = 9 − green
//   edge 2 (index2+A) = 9  → index2 = 9 − A = 9 − (6−green) = 3 + green
//   edge 1 (index1+index2) = 8  → index1 = 8 − (3+green) = 5 − green
//   edge 0 (index0+index1) = 7  → index0 = 7 − (5−green) = 2 + green
//   edge 5 (B+index5) = 8  → index5 = 8 − B = 8 − (9−green) = green − 1
//   edge 6 (index5+index0) must = 9:
//     (green−1) + (2+green) = 2×green + 1 = 9 → green = 4 ✓
//
// BEATS:
//   0  (orient)  — show the ring; identify the green circle and its two edges (6 and 9)
//   1  (chain)   — express the two neighbours of green in terms of green
//   2  (propagate) — propagate values around the ring: each node expressed as green±k
//   3  (close)   — closing-edge constraint forces 2×green + 1 = 9 → green = 4
//   4  (result)  — reveal 4 in the green circle; confirm all 7 numbers are distinct 1–7
//
// Pure builder — deterministic, no I/O, SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { EDGE_SUMS, NODE_VALUES, GREEN_IDX, N } from './PairSums24ECIllustration'

export type PairSumsPhase = 'orient' | 'chain' | 'propagate' | 'close' | 'result'

export interface PairSumsStep {
  phase: PairSumsPhase
  /** Which node indices to highlight (blue ring). */
  highlightNodes: Set<number>
  /** Which edge indices to highlight (orange stroke + label). */
  highlightEdges: Set<number>
  /** Whether to write 4 into the green circle. */
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PairSumsStoryboard {
  /** The correct value for the green circle. */
  answer: number
  steps: PairSumsStep[]
  finalIndex: number
}

export function buildPairSums24ECSteps(lang: Lang): PairSumsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const answer = NODE_VALUES[GREEN_IDX] // 4

  // Edges incident to the green circle (index GREEN_IDX=4):
  //   entering edge (between n3 and n4): index 3, sum = 6
  //   exiting edge  (between n4 and n5): index 4, sum = 9
  const enterEdge = GREEN_IDX - 1   // 3, sum = 6
  const exitEdge = GREEN_IDX        // 4, sum = 9

  const steps: PairSumsStep[] = [
    // Beat 0 — orient: point out the green circle and its two edges
    {
      phase: 'orient',
      highlightNodes: new Set([GREEN_IDX]),
      highlightEdges: new Set([enterEdge, exitEdge]),
      revealAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        `The green circle has two neighbours. Their edges show sums ${EDGE_SUMS[enterEdge]} and ${EDGE_SUMS[exitEdge]}.`,
        `Lingkaran hijau punya dua tetangga. Tepinya menunjukkan jumlah ${EDGE_SUMS[enterEdge]} dan ${EDGE_SUMS[exitEdge]}.`,
      ),
    },

    // Beat 1 — chain: name the two neighbours in terms of the unknown G
    {
      phase: 'chain',
      highlightNodes: new Set([GREEN_IDX - 1, GREEN_IDX, GREEN_IDX + 1]),
      highlightEdges: new Set([enterEdge, exitEdge]),
      revealAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        `Let the green circle = G. Left neighbour = ${EDGE_SUMS[enterEdge]} − G; right neighbour = ${EDGE_SUMS[exitEdge]} − G.`,
        `Misalkan lingkaran hijau = G. Tetangga kiri = ${EDGE_SUMS[enterEdge]} − G; tetangga kanan = ${EDGE_SUMS[exitEdge]} − G.`,
      ),
    },

    // Beat 2 — propagate: walk the remaining edges and express each node as G±k
    {
      phase: 'propagate',
      highlightNodes: new Set(Array.from({ length: N }, (_, i) => i)),
      highlightEdges: new Set(Array.from({ length: N }, (_, i) => i)),
      revealAnswer: false,
      hold: 2800,
      result: false,
      caption: t(
        `Continuing around the ring: each node becomes G + 3, G − 1, G + 2, G − 1, … every value in terms of G.`,
        `Melanjutkan keliling cincin: setiap simpul menjadi G+3, G−1, G+2, G−1, … semuanya dalam suku G.`,
      ),
    },

    // Beat 3 — close: the last edge must also equal its given sum → solve for G
    {
      phase: 'close',
      highlightNodes: new Set([0, N - 1]),
      highlightEdges: new Set([N - 1]),
      revealAnswer: false,
      hold: 2800,
      result: false,
      caption: t(
        `The closing edge must equal ${EDGE_SUMS[N - 1]}: (G − 1) + (G + 2) = 2G + 1 = 9, so G = 4.`,
        `Tepi penutup harus sama dengan ${EDGE_SUMS[N - 1]}: (G − 1) + (G + 2) = 2G + 1 = 9, jadi G = 4.`,
      ),
    },

    // Beat 4 — result: reveal 4, confirm 1–7 all present
    {
      phase: 'result',
      highlightNodes: new Set([GREEN_IDX]),
      highlightEdges: new Set(),
      revealAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `Green = ${answer}. All seven numbers 1–7 appear exactly once — answer D.`,
        `Hijau = ${answer}. Ketujuh angka 1–7 muncul tepat satu kali — jawaban D.`,
      ),
    },
  ]

  return { answer, steps, finalIndex: steps.length - 1 }
}
