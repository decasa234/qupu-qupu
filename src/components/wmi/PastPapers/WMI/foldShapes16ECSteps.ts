// IKMC-22-EC-Q16 — "How many of the shapes on the left will fall exactly
// on top of shapes on the right when the paper is folded along the red line?"
// Answer: C = three.
//
// Storyboard for the post-answer beat-by-beat explainer:
//   beat 0 — plan: show the paper flat with fold line; state the strategy.
//   beat 1 — check shape 1: the right-pointing arrow (→) folds onto the
//             left-pointing arrow (←) — same row, equidistant from fold. MATCH.
//   beat 2 — check shape 2: the upper triangle on the left folds exactly onto
//             the upper triangle on the right — same row, equidistant. MATCH.
//   beat 3 — check shape 3: the down-pointing arrow (↓) on the left folds onto
//             the down-pointing arrow (↓) on the right — same row, equidistant.
//             MATCH.
//   beat 4 — check non-match 1: the lower triangle on the left lands on an
//             arrow cell, not a triangle — NO MATCH.
//   beat 5 — check non-match 2: the circle on the left lands on an empty cell,
//             not the right-side circle — NO MATCH.
//   beat 6 — RESULT: 3 shapes match. Answer = C (three).
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type FoldShapes16ECPhase =
  | 'plan'
  | 'check-match'
  | 'check-no-match'
  | 'result'

export interface FoldShapes16ECStep {
  phase: FoldShapes16ECPhase
  /** Index of the shape being highlighted (0-based left-side index), or -1 for plan/result. */
  highlightLeft: number
  /** Whether the highlighted shape is a match. */
  match: boolean | null
  /** Running count of confirmed matches so far. */
  matchCount: number
  caption: string
  hold: number
  result: boolean
}

export interface FoldShapes16ECStoryboard {
  answer: string
  steps: FoldShapes16ECStep[]
  finalIndex: number
}

export function buildFoldShapes16ECSteps(lang: Lang): FoldShapes16ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FoldShapes16ECStep[] = [
    {
      phase: 'plan',
      highlightLeft: -1,
      match: null,
      matchCount: 0,
      hold: 2400,
      result: false,
      caption: t(
        'The red line is the fold. When the left side folds over, each left shape moves to a mirror position on the right. Check each shape one by one.',
        'Garis merah adalah garis lipatan. Ketika sisi kiri dilipat ke kanan, setiap bentuk kiri berpindah ke posisi cermin di sebelah kanan. Periksa setiap bentuk satu per satu.',
      ),
    },
    {
      phase: 'check-match',
      highlightLeft: 0,
      match: true,
      matchCount: 1,
      hold: 2400,
      result: false,
      caption: t(
        'Shape 1 — the right arrow (→): it is 1 cell from the fold. Folded, it lands on the left arrow (←) which is also 1 cell away. Match! ✓',
        'Bentuk 1 — panah kanan (→): berjarak 1 sel dari lipatan. Saat dilipat, ia mendarat di atas panah kiri (←) yang juga berjarak 1 sel. Cocok! ✓',
      ),
    },
    {
      phase: 'check-match',
      highlightLeft: 1,
      match: true,
      matchCount: 2,
      hold: 2400,
      result: false,
      caption: t(
        'Shape 2 — the upper triangle: it is 2 cells from the fold. The mirror triangle on the right is also 2 cells away and the same shape after reflection. Match! ✓',
        'Bentuk 2 — segitiga atas: berjarak 2 sel dari lipatan. Segitiga cermin di sebelah kanan juga berjarak 2 sel dan bentuknya sama setelah dicerminkan. Cocok! ✓',
      ),
    },
    {
      phase: 'check-match',
      highlightLeft: 2,
      match: true,
      matchCount: 3,
      hold: 2400,
      result: false,
      caption: t(
        'Shape 3 — the down arrow (↓): it is 1 cell from the fold. The right-side down arrow is also 1 cell away. A down arrow stays a down arrow when reflected. Match! ✓',
        'Bentuk 3 — panah bawah (↓): berjarak 1 sel dari lipatan. Panah bawah di kanan juga berjarak 1 sel. Panah bawah tetap panah bawah saat dicerminkan. Cocok! ✓',
      ),
    },
    {
      phase: 'check-no-match',
      highlightLeft: 3,
      match: false,
      matchCount: 3,
      hold: 2400,
      result: false,
      caption: t(
        'Shape 4 — the lower triangle: it is 2 cells from the fold. But the position it lands on the right has a different shape — no triangle there. No match. ✗',
        'Bentuk 4 — segitiga bawah: berjarak 2 sel dari lipatan. Namun posisi di sebelah kanan yang dituju memiliki bentuk berbeda — tidak ada segitiga di sana. Tidak cocok. ✗',
      ),
    },
    {
      phase: 'check-no-match',
      highlightLeft: 4,
      match: false,
      matchCount: 3,
      hold: 2400,
      result: false,
      caption: t(
        'Shape 5 — the circle: it is 3 cells from the fold. The circle on the right is only 1 cell from the fold — different distances. The left circle lands on an empty cell. No match. ✗',
        'Bentuk 5 — lingkaran: berjarak 3 sel dari lipatan. Lingkaran di kanan hanya berjarak 1 sel dari lipatan — jaraknya berbeda. Lingkaran kiri mendarat di sel kosong. Tidak cocok. ✗',
      ),
    },
    {
      phase: 'result',
      highlightLeft: -1,
      match: null,
      matchCount: 3,
      hold: 0,
      result: true,
      caption: t(
        'Three shapes on the left land exactly on shapes on the right: the right arrow, the upper triangle, and the down arrow. Answer: three (C).',
        'Tiga bentuk di sebelah kiri tepat jatuh di atas bentuk di sebelah kanan: panah kanan, segitiga atas, dan panah bawah. Jawaban: tiga (C).',
      ),
    },
  ]

  return { answer: 'C', steps, finalIndex: steps.length - 1 }
}
