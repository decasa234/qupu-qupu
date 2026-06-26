// Storyboard for SASMO-20-G4-Q21 — post-answer explainer.
// "Colour 8 circles (cube graph) so connected pairs differ — minimum colours?"
// Answer: 2 (the cube graph Q_3 is bipartite → chromatic number 2).
//
// Teaching beats:
//   intro      — plain graph: introduce the colouring rule
//   try_one    — colour node TL yellow; explain: start anywhere
//   propagate  — colour all outer-square nodes alternating Y/G
//   inner      — colour inner-square nodes (forced by adjacency)
//   check      — highlight all edges — confirm no two same-colour endpoints
//   answer     — 2 colours suffice; 1 is impossible (edges exist)

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type GraphColorPhase =
  | 'intro'
  | 'try_one'
  | 'propagate'
  | 'inner'
  | 'check'
  | 'answer'

export interface GraphColorStep {
  phase: GraphColorPhase
  caption: string
  hold: number
  result: boolean
}

export interface GraphColorStoryboard {
  steps: GraphColorStep[]
  finalIndex: number
  answer: number
}

export function buildGraphColorSASMO20G4Q21Steps(lang: Lang): GraphColorStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: GraphColorStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2400,
    result: false,
    caption: t(
      'Rule: two circles connected by a segment must have different colours. Can we use just 2 colours?',
      'Aturan: dua lingkaran yang dihubungkan garis harus berbeda warna. Bisakah kita hanya pakai 2 warna?',
    ),
  })

  steps.push({
    phase: 'try_one',
    hold: 2200,
    result: false,
    caption: t(
      'Start at the top-left corner: colour it Yellow.',
      'Mulai dari sudut kiri atas: beri warna Kuning.',
    ),
  })

  steps.push({
    phase: 'propagate',
    hold: 2400,
    result: false,
    caption: t(
      'Neighbours of Yellow must be Green. Colour the other 3 outer corners Green.',
      'Tetangga warna Kuning harus Hijau. Beri warna Hijau pada 3 sudut luar lainnya.',
    ),
  })

  steps.push({
    phase: 'inner',
    hold: 2400,
    result: false,
    caption: t(
      'Each inner circle connects to one outer corner, so inner circles get the opposite colour — no conflicts.',
      'Setiap lingkaran dalam terhubung ke satu sudut luar, sehingga lingkaran dalam mendapat warna berlawanan — tidak ada konflik.',
    ),
  })

  steps.push({
    phase: 'check',
    hold: 2400,
    result: false,
    caption: t(
      'Check every edge: each connects one Yellow and one Green circle — the rule holds everywhere!',
      'Periksa setiap tepi: setiap tepi menghubungkan satu lingkaran Kuning dan satu Hijau — aturan terpenuhi di mana-mana!',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    result: true,
    caption: t(
      'The graph is bipartite (no odd cycle) → minimum colours = 2.',
      'Graf ini bipartit (tidak ada siklus ganjil) → jumlah warna minimum = 2.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 2 }
}
