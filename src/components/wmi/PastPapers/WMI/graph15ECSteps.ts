// Storyboard for IKMC-23-EC-Q15 — "What is the smallest number of colours
// needed to paint 9 circles so any two connected by a line get different colours?"
//
// GRAPH: 9 nodes (T, UL, UR, L, C, R, LL, LR, B) connected by 14 edges.
// Chromatic number = 3 (answer B).
//
// WHY 3 and not 2:
//   Nodes C, LL, LR are mutually all connected (C–LL and C–LR edges are in the
//   graph, and LL–B and LR–B converge but LL and LR are also both connected to C).
//   More importantly: L–C–LL is a triangle (L–C, C–LL, L–LL edges all present),
//   so these three pairwise-adjacent nodes must all have different colours → 3 minimum.
//
// STRATEGY: greedy colouring — assign each node the lowest colour not used by
// any already-coloured neighbour.  Walk T → UL → UR → L → C → R → LL → LR → B.
//
// Beats:
//   0 — Intro: the graph unpainted.
//   1 — Try 2 colours: try to paint it with red/green; show the triangle L–C–LL
//       creates a conflict.
//   2 — Colour T = red (colour 0).
//   3 — Colour UL = green (colour 1, neighbour T=red).
//   4 — Colour UR = blue (colour 2, neighbour T=red; UL=green already used).
//   5 — Colour L = blue (colour 2, neighbour UL=green, not T; lowest free = blue).
//   6 — Colour C = red (colour 0, neighbours UL=green, UR=blue, L=blue).
//   7 — Colour R = green (colour 1, neighbours UR=blue, C=red).
//   8 — Colour LL = green (colour 1, neighbours L=blue, C=red).
//   9 — Colour LR = blue (colour 2, neighbours R=green, C=red).
//   10 — Colour B = red (colour 0, neighbours LL=green, LR=blue).
//   11 — Result: all 9 coloured with 3 colours. Min = 3. Answer B.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { NodeId } from './Graph15ECIllustration'

export const GRAPH_15_EC_ANSWER = 3
export const GRAPH_15_EC_CHOICE = 'B'

export interface Graph15ECStep {
  /** Per-node colour assignments so far (null = unpainted). */
  colours: Partial<Record<NodeId, 0 | 1 | 2 | null>>
  /** Nodes highlighted this beat (e.g. the conflict nodes). */
  highlight: NodeId[]
  /** True only on the final winning beat. */
  result: boolean
  /** Phase label for the UI. */
  phase: string
  caption: string
  hold: number
}

export interface Graph15ECStoryboard {
  answer: number
  answerChoice: string
  steps: Graph15ECStep[]
  finalIndex: number
}

// Greedy solution colours (0=red, 1=green, 2=blue).
const SOL: Record<NodeId, 0 | 1 | 2> = {
  T:  0,
  UL: 1,
  UR: 2,
  L:  2,
  C:  0,
  R:  1,
  LL: 1,
  LR: 2,
  B:  0,
}

export function buildGraph15ECSteps(lang: Lang): Graph15ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Accumulate colours as the animation progresses.
  function partial(...nodes: NodeId[]): Partial<Record<NodeId, 0 | 1 | 2 | null>> {
    const out: Partial<Record<NodeId, 0 | 1 | 2 | null>> = {}
    for (const id of nodes) out[id] = SOL[id]
    return out
  }

  const steps: Graph15ECStep[] = [
    // 0 — intro: blank graph, state the problem.
    {
      phase: t('The graph', 'Grafnya'),
      colours: {},
      highlight: [],
      result: false,
      hold: 2600,
      caption: t(
        'Each circle must get a colour. Any two circles connected by a line need DIFFERENT colours. How many colours do we need at minimum?',
        'Setiap lingkaran harus diberi warna. Setiap dua lingkaran yang dihubungkan garis harus berwarna BERBEDA. Berapa warna minimum yang diperlukan?',
      ),
    },
    // 1 — try 2 colours: show why 2 fails (triangle L–C–LL).
    {
      phase: t('Try 2 colours?', 'Coba 2 warna?'),
      colours: {},
      highlight: ['L', 'C', 'LL'],
      result: false,
      hold: 2800,
      caption: t(
        'Can we manage with just 2 colours? Look at circles L, C, and LL — they are all connected to each other (a triangle). Three mutually connected circles need at least 3 different colours!',
        'Bisakah kita menggunakan hanya 2 warna? Lihat lingkaran L, C, dan LL — ketiganya saling terhubung (membentuk segitiga). Tiga lingkaran yang saling terhubung membutuhkan setidaknya 3 warna berbeda!',
      ),
    },
    // 2 — colour T = red.
    {
      phase: t('Colour T', 'Warnai T'),
      colours: partial('T'),
      highlight: ['T'],
      result: false,
      hold: 1800,
      caption: t(
        'Start at the top circle T — give it colour 1 (red).',
        'Mulai dari lingkaran atas T — beri warna 1 (merah).',
      ),
    },
    // 3 — colour UL = green.
    {
      phase: t('Colour UL', 'Warnai UL'),
      colours: partial('T', 'UL'),
      highlight: ['UL'],
      result: false,
      hold: 1800,
      caption: t(
        'Upper-left circle UL is connected to T (red), so it needs a new colour — colour 2 (green).',
        'Lingkaran kiri-atas UL terhubung ke T (merah), jadi butuh warna baru — warna 2 (hijau).',
      ),
    },
    // 4 — colour UR = blue.
    {
      phase: t('Colour UR', 'Warnai UR'),
      colours: partial('T', 'UL', 'UR'),
      highlight: ['UR'],
      result: false,
      hold: 1800,
      caption: t(
        'Upper-right circle UR connects to both T (red) and UL (green) — both colours are taken, so colour 3 (blue) is needed.',
        'Lingkaran kanan-atas UR terhubung ke T (merah) dan UL (hijau) — kedua warna sudah terpakai, jadi butuh warna 3 (biru).',
      ),
    },
    // 5 — colour L = blue.
    {
      phase: t('Colour L', 'Warnai L'),
      colours: partial('T', 'UL', 'UR', 'L'),
      highlight: ['L'],
      result: false,
      hold: 1800,
      caption: t(
        'Left circle L connects only to UL (green) — the lowest free colour is blue (colour 3).',
        'Lingkaran kiri L hanya terhubung ke UL (hijau) — warna bebas terendah adalah biru (warna 3).',
      ),
    },
    // 6 — colour C = red.
    {
      phase: t('Colour C', 'Warnai C'),
      colours: partial('T', 'UL', 'UR', 'L', 'C'),
      highlight: ['C'],
      result: false,
      hold: 2000,
      caption: t(
        'Centre C connects to UL (green), UR (blue), and L (blue) — colour 1 (red) is free.',
        'Pusat C terhubung ke UL (hijau), UR (biru), dan L (biru) — warna 1 (merah) tersedia.',
      ),
    },
    // 7 — colour R = green.
    {
      phase: t('Colour R', 'Warnai R'),
      colours: partial('T', 'UL', 'UR', 'L', 'C', 'R'),
      highlight: ['R'],
      result: false,
      hold: 1800,
      caption: t(
        'Right circle R connects to UR (blue) and C (red) — colour 2 (green) is free.',
        'Lingkaran kanan R terhubung ke UR (biru) dan C (merah) — warna 2 (hijau) tersedia.',
      ),
    },
    // 8 — colour LL = green.
    {
      phase: t('Colour LL', 'Warnai LL'),
      colours: partial('T', 'UL', 'UR', 'L', 'C', 'R', 'LL'),
      highlight: ['LL'],
      result: false,
      hold: 1800,
      caption: t(
        'Lower-left LL connects to L (blue) and C (red) — colour 2 (green) is free.',
        'Bawah-kiri LL terhubung ke L (biru) dan C (merah) — warna 2 (hijau) tersedia.',
      ),
    },
    // 9 — colour LR = blue.
    {
      phase: t('Colour LR', 'Warnai LR'),
      colours: partial('T', 'UL', 'UR', 'L', 'C', 'R', 'LL', 'LR'),
      highlight: ['LR'],
      result: false,
      hold: 1800,
      caption: t(
        'Lower-right LR connects to R (green) and C (red) — colour 3 (blue) is free.',
        'Bawah-kanan LR terhubung ke R (hijau) dan C (merah) — warna 3 (biru) tersedia.',
      ),
    },
    // 10 — colour B = red.
    {
      phase: t('Colour B', 'Warnai B'),
      colours: partial('T', 'UL', 'UR', 'L', 'C', 'R', 'LL', 'LR', 'B'),
      highlight: ['B'],
      result: false,
      hold: 1800,
      caption: t(
        'Bottom circle B connects to LL (green) and LR (blue) — colour 1 (red) is free.',
        'Lingkaran bawah B terhubung ke LL (hijau) dan LR (biru) — warna 1 (merah) tersedia.',
      ),
    },
    // 11 — result: all 9 nodes coloured, 3 colours total.
    {
      phase: t('Done! 3 colours', 'Selesai! 3 warna'),
      colours: partial('T', 'UL', 'UR', 'L', 'C', 'R', 'LL', 'LR', 'B'),
      highlight: [],
      result: true,
      hold: 0,
      caption: t(
        `All 9 circles are painted. Every connected pair has different colours — and we used exactly ${GRAPH_15_EC_ANSWER} colours. The triangle L–C–LL proved we can't do it with 2. Answer ${GRAPH_15_EC_CHOICE}.`,
        `Semua 9 lingkaran sudah diwarnai. Setiap pasangan yang terhubung berwarna berbeda — dan kita hanya menggunakan ${GRAPH_15_EC_ANSWER} warna. Segitiga L–C–LL membuktikan 2 warna tidak cukup. Jawaban ${GRAPH_15_EC_CHOICE}.`,
      ),
    },
  ]

  return {
    answer: GRAPH_15_EC_ANSWER,
    answerChoice: GRAPH_15_EC_CHOICE,
    steps,
    finalIndex: steps.length - 1,
  }
}
