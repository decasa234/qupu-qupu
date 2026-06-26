// Steps for TIMO-22-P3H-Q2 — post-answer explainer.
// "27 transparent boxes in a 3×3×3 cube. Find the number of black marbles."
// Answer: 7.
//
// Strategy (5 beats):
//   Beat 1 — intro: three views given; read each view to count occupied columns
//   Beat 2 — top view: 4 filled cells (cross) → positions visible from above
//   Beat 3 — front view: 4 filled cells (bottom row + centre middle) → z-levels
//   Beat 4 — right view: 6 filled cells (staircase) → depth constraints
//   Beat 5 — conclude: combining all three constraints → exactly 7 marbles

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ViewPhase = 'intro' | 'top' | 'front' | 'right' | 'answer'

export interface ProjectionsTIMO22P3Q2Step {
  phase: ViewPhase
  /** Which view to highlight ('none' = all plain). */
  activeView: 'none' | 'top' | 'front' | 'right'
  caption: string
  hold: number
  result: boolean
}

export interface ProjectionsTIMO22P3Q2Storyboard {
  steps: ProjectionsTIMO22P3Q2Step[]
  finalIndex: number
  answer: number
}

export function buildProjectionsTIMO22P3Q2Steps(lang: Lang): ProjectionsTIMO22P3Q2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ProjectionsTIMO22P3Q2Step[] = []

  steps.push({
    phase: 'intro',
    activeView: 'none',
    hold: 2000,
    result: false,
    caption: t(
      '27 transparent boxes in a 3×3×3 cube. A black marble makes a cell appear filled. Read the three projection views.',
      '27 kotak transparan disusun 3×3×3. Kelereng hitam membuat kotak tampak gelap. Baca tiga tampilan proyeksi.',
    ),
  })

  steps.push({
    phase: 'top',
    activeView: 'top',
    hold: 2400,
    result: false,
    caption: t(
      'Top view: 4 filled cells form a cross — those 4 columns (↕) each hold at least 1 marble.',
      'Tampak Atas: 4 sel terisi membentuk tanda plus — 4 kolom vertikal itu masing-masing ada ≥1 kelereng.',
    ),
  })

  steps.push({
    phase: 'front',
    activeView: 'front',
    hold: 2400,
    result: false,
    caption: t(
      'Front view: bottom row (3 cells) + centre middle filled — tells us which layers and columns have marbles.',
      'Tampak Depan: baris bawah (3 sel) + tengah baris ke-2 — menunjukkan lapisan dan kolom yang ada kelereng.',
    ),
  })

  steps.push({
    phase: 'right',
    activeView: 'right',
    hold: 2400,
    result: false,
    caption: t(
      'Right view: staircase pattern (6 cells) — bottom layer needs 3 marbles front→back; upper layers need 1 each.',
      'Tampak Kanan: pola tangga (6 sel) — lapisan bawah butuh 3 kelereng depan→belakang; lapisan atas masing-masing 1.',
    ),
  })

  steps.push({
    phase: 'answer',
    activeView: 'none',
    hold: 0,
    result: true,
    caption: t(
      'Combining all three views: exactly 7 marbles satisfy every projection. Answer = 7.',
      'Menggabungkan ketiga tampilan: tepat 7 kelereng memenuhi semua proyeksi. Jawaban = 7.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 7 }
}
