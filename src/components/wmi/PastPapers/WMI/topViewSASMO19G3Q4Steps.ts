// Storyboard for SASMO-19-G3-Q4 — post-answer explainer.
// "Find the top view of the figure on the right." — answer: C
//
// Teaching beats:
//   intro       — show full 3D figure; "imagine looking straight down from above"
//   left_side   — highlight left section; "two wide columns on the left"
//   right_side  — highlight right section + cylinder; "one column with cylinder on right"
//   top_view    — show the flat top-view result (2 cells, circle right)
//   answer      — confirm answer C; left wider cell + right narrow cell with circle

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TopViewPhase =
  | 'intro'
  | 'left_side'
  | 'right_side'
  | 'top_view'
  | 'answer'

export interface TopViewStep {
  phase: TopViewPhase
  caption: string
  hold: number
  result: boolean
}

export interface TopViewStoryboard {
  steps: TopViewStep[]
  finalIndex: number
}

export function buildTopViewSASMO19G3Q4Steps(lang: Lang): TopViewStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: TopViewStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2400,
    result: false,
    caption: t(
      'Look at this 3D figure from the side. Now imagine flying above it and looking straight down.',
      'Lihat bangun 3D ini dari samping. Bayangkan kamu terbang di atasnya dan melihat langsung ke bawah.',
    ),
  })

  steps.push({
    phase: 'left_side',
    hold: 2400,
    result: false,
    caption: t(
      'Left section: two columns, two blocks tall — a wide block from above.',
      'Bagian kiri: dua kolom, dua balok tinggi — dari atas terlihat persegi panjang lebar.',
    ),
  })

  steps.push({
    phase: 'right_side',
    hold: 2400,
    result: false,
    caption: t(
      'Right section: one short column with a cylinder on top — a narrow block with a circle from above.',
      'Bagian kanan: satu kolom pendek dengan silinder di atas — dari atas terlihat persegi panjang sempit dengan lingkaran.',
    ),
  })

  steps.push({
    phase: 'top_view',
    hold: 2400,
    result: false,
    caption: t(
      'Top view: two cells — wide left, narrow right — with a circle in the right cell.',
      'Tampak atas: dua sel — kiri lebar, kanan sempit — lingkaran di sel kanan.',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    result: true,
    caption: t(
      'Option C matches: 2 cells (3 vertical lines only), circle in the right cell. Answer: C.',
      'Pilihan C cocok: 2 sel (hanya 3 garis tegak), lingkaran di sel kanan. Jawaban: C.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
