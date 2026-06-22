// Storyboard for SEAMO-16-A-Q24 — "How many friendly pairs are there in
// the triangular arrangement of 10 circles?" (answer = 18).
//
// STRATEGY: Count in two passes.
//   Pass 1 — Horizontal pairs (same row):
//     Row 4 (bottom, 4 circles): 3 pairs
//     Row 3 (3 circles):         2 pairs
//     Row 2 (2 circles):         1 pair
//     Row 1 (top, 1 circle):     0 pairs
//     Subtotal: 6
//   Pass 2 — Diagonal pairs (adjacent rows):
//     Row 3 → Row 4:  each of 3 circles in row 3 touches 2 in row 4 → 3×2 = 6
//     Row 2 → Row 3:  each of 2 circles in row 2 touches 2 in row 3 → 2×2 = 4
//     Row 1 → Row 2:  the 1 circle in row 1 touches 2 in row 2   → 1×2 = 2
//     Subtotal: 12
//   Grand total: 6 + 12 = 18.
//
// Beats (9 steps):
//   0 — Intro: 10-circle triangle, state the task.
//   1 — Horizontal: row 4 → 3 pairs (running = 3)
//   2 — Horizontal: row 3 → 2 more pairs (running = 5)
//   3 — Horizontal: row 2 → 1 more pair (running = 6); subtotal 6
//   4 — Transition: now count diagonal pairs.
//   5 — Diagonal: row3→row4 → 6 pairs (running = 12)
//   6 — Diagonal: row2→row3 → 4 pairs (running = 16)
//   7 — Diagonal: row1→row2 → 2 pairs (running = 18)
//   8 — Result: 6 + 12 = 18 friendly pairs.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { EdgeGroup, NodeId } from './FriendlyCircles16A24Illustration'

export const FRIENDLY_CIRCLES_ANSWER = 18

export interface FriendlyCircles16A24Step {
  /** Edge groups to highlight green this beat. */
  highlightGroups: Set<EdgeGroup>
  /** Nodes to tint amber this beat. */
  highlightNodes: Set<NodeId>
  /** Running count of pairs found (null = not showing yet). */
  runningCount: number | null
  /** True only on the winning beat. */
  result: boolean
  /** Short phase label. */
  phase: string
  /** Caption text. */
  caption: string
  /** Auto-advance hold time (ms). */
  hold: number
}

export interface FriendlyCircles16A24Storyboard {
  answer: number
  steps: FriendlyCircles16A24Step[]
  finalIndex: number
}

export function buildFriendlyCircles16A24Steps(lang: Lang): FriendlyCircles16A24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FriendlyCircles16A24Step[] = [
    // 0 — intro
    {
      highlightGroups: new Set(),
      highlightNodes:  new Set(),
      runningCount: null,
      result: false,
      phase: t('The figure', 'Gambarnya'),
      hold: 2600,
      caption: t(
        '10 circles in a triangular arrangement (like bowling pins). Two circles are "friendly" if they touch. Count every touching pair!',
        '10 lingkaran dalam susunan segitiga (seperti pin bowling). Dua lingkaran disebut "bersahabat" jika bersentuhan. Hitung setiap pasang yang bersentuhan!',
      ),
    },
    // 1 — row 4 horizontal: 3 pairs
    {
      highlightGroups: new Set<EdgeGroup>(['horiz-row4']),
      highlightNodes:  new Set<NodeId>(['B1', 'B2', 'B3', 'B4']),
      runningCount: 3,
      result: false,
      phase: t('Row 4 → 3 pairs', 'Baris 4 → 3 pasang'),
      hold: 2400,
      caption: t(
        'Bottom row (4 circles): the 3 green connections are friendly pairs. Count = 3.',
        'Baris bawah (4 lingkaran): 3 sambungan hijau adalah pasang bersahabat. Jumlah = 3.',
      ),
    },
    // 2 — row 3 horizontal: 2 more pairs
    {
      highlightGroups: new Set<EdgeGroup>(['horiz-row4', 'horiz-row3']),
      highlightNodes:  new Set<NodeId>(['L1', 'L2', 'L3']),
      runningCount: 5,
      result: false,
      phase: t('Row 3 → +2 pairs', 'Baris 3 → +2 pasang'),
      hold: 2400,
      caption: t(
        'Next row (3 circles): 2 more horizontal pairs. Running count = 3 + 2 = 5.',
        'Baris berikutnya (3 lingkaran): 2 pasang horizontal lagi. Jumlah = 3 + 2 = 5.',
      ),
    },
    // 3 — row 2 horizontal: 1 more pair; horizontal subtotal = 6
    {
      highlightGroups: new Set<EdgeGroup>(['horiz-row4', 'horiz-row3', 'horiz-row2']),
      highlightNodes:  new Set<NodeId>(['M1', 'M2']),
      runningCount: 6,
      result: false,
      phase: t('Row 2 → +1 pair', 'Baris 2 → +1 pasang'),
      hold: 2600,
      caption: t(
        'Next row (2 circles): 1 pair. Row 1 has only 1 circle → 0 pairs. Horizontal total = 6.',
        'Baris berikutnya (2 lingkaran): 1 pasang. Baris 1 punya 1 lingkaran → 0 pasang. Total horizontal = 6.',
      ),
    },
    // 4 — transition to diagonal
    {
      highlightGroups: new Set(),
      highlightNodes:  new Set(),
      runningCount: 6,
      result: false,
      phase: t('Now diagonals', 'Sekarang diagonal'),
      hold: 2200,
      caption: t(
        'Horizontal done (6 pairs). Now count diagonal pairs — each circle in an upper row touches 2 circles in the row below.',
        'Horizontal selesai (6 pasang). Sekarang hitung pasang diagonal — setiap lingkaran di baris atas menyentuh 2 lingkaran di baris bawahnya.',
      ),
    },
    // 5 — diagonal row3→row4: 3×2 = 6 pairs; running = 12
    {
      highlightGroups: new Set<EdgeGroup>(['diag-34']),
      highlightNodes:  new Set<NodeId>(['L1', 'L2', 'L3', 'B1', 'B2', 'B3', 'B4']),
      runningCount: 12,
      result: false,
      phase: t('Row 3→4: 3×2 = 6', 'Baris 3→4: 3×2 = 6'),
      hold: 2600,
      caption: t(
        'Row 3 → Row 4: each of 3 circles touches 2 circles below → 3 × 2 = 6 diagonal pairs. Running = 6 + 6 = 12.',
        'Baris 3 → Baris 4: setiap 3 lingkaran menyentuh 2 lingkaran di bawahnya → 3 × 2 = 6 pasang diagonal. Jumlah = 6 + 6 = 12.',
      ),
    },
    // 6 — diagonal row2→row3: 2×2 = 4 pairs; running = 16
    {
      highlightGroups: new Set<EdgeGroup>(['diag-34', 'diag-23']),
      highlightNodes:  new Set<NodeId>(['M1', 'M2', 'L1', 'L2', 'L3']),
      runningCount: 16,
      result: false,
      phase: t('Row 2→3: 2×2 = 4', 'Baris 2→3: 2×2 = 4'),
      hold: 2400,
      caption: t(
        'Row 2 → Row 3: 2 circles, each touching 2 below → 2 × 2 = 4 pairs. Running = 12 + 4 = 16.',
        'Baris 2 → Baris 3: 2 lingkaran, masing-masing menyentuh 2 di bawahnya → 2 × 2 = 4 pasang. Jumlah = 12 + 4 = 16.',
      ),
    },
    // 7 — diagonal row1→row2: 1×2 = 2 pairs; running = 18
    {
      highlightGroups: new Set<EdgeGroup>(['diag-34', 'diag-23', 'diag-12']),
      highlightNodes:  new Set<NodeId>(['T1', 'M1', 'M2']),
      runningCount: 18,
      result: false,
      phase: t('Row 1→2: 1×2 = 2', 'Baris 1→2: 1×2 = 2'),
      hold: 2400,
      caption: t(
        'Row 1 → Row 2: 1 circle touches 2 below → 1 × 2 = 2 pairs. Running = 16 + 2 = 18.',
        'Baris 1 → Baris 2: 1 lingkaran menyentuh 2 di bawahnya → 1 × 2 = 2 pasang. Jumlah = 16 + 2 = 18.',
      ),
    },
    // 8 — result
    {
      highlightGroups: new Set<EdgeGroup>(['horiz-row4', 'horiz-row3', 'horiz-row2', 'diag-34', 'diag-23', 'diag-12']),
      highlightNodes:  new Set<NodeId>(),
      runningCount: 18,
      result: true,
      phase: t('Total = 18', 'Total = 18'),
      hold: 0,
      caption: t(
        'Horizontal: 3 + 2 + 1 = 6. Diagonal: 6 + 4 + 2 = 12. Grand total = 6 + 12 = 18 friendly pairs.',
        'Horizontal: 3 + 2 + 1 = 6. Diagonal: 6 + 4 + 2 = 12. Total keseluruhan = 6 + 12 = 18 pasang bersahabat.',
      ),
    },
  ]

  return {
    answer: FRIENDLY_CIRCLES_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
