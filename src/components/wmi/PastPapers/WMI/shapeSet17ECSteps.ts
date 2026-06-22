// Storyboard for IKMC-22-EC-Q17 — "Wanda's minimum chosen shapes".
//
// Wanda's claim: among chosen shapes, exactly 2 are coloured, 2 are large,
// and 2 are round. Find the minimum number of shapes she chose.
//
// Answer: B = 3.  Optimal pick: shapes 2 (large red □), 5 (large white ○),
// 6 (small red ●) — together they cover all three attribute pairs exactly.
//
// Pure function of `lang` — SSR-safe, deterministic.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ── shape attribute data ──────────────────────────────────────────────────────

export interface ShapeData {
  index: number       // 0-based
  type: 'square' | 'triangle' | 'circle'
  large: boolean
  coloured: boolean
  round: boolean
}

export const SHAPE_DATA: ShapeData[] = [
  { index: 0, type: 'square',   large: false, coloured: false, round: false }, // 1
  { index: 1, type: 'square',   large: true,  coloured: true,  round: false }, // 2
  { index: 2, type: 'triangle', large: false, coloured: true,  round: false }, // 3
  { index: 3, type: 'triangle', large: true,  coloured: false, round: false }, // 4
  { index: 4, type: 'circle',   large: true,  coloured: false, round: true  }, // 5
  { index: 5, type: 'circle',   large: false, coloured: true,  round: true  }, // 6
]

// ── step type ─────────────────────────────────────────────────────────────────

export interface ShapeStep {
  caption: string
  /** Which shape indices (0-based) to highlight */
  highlighted: number[]
  /** Which attribute rule is currently being checked */
  ruleCheck?: 'coloured' | 'large' | 'round'
  /** Verdicts per rule: undefined = not yet checked */
  colouredVerdict?: 'pass' | 'fail'
  largeVerdict?: 'pass' | 'fail'
  roundVerdict?: 'pass' | 'fail'
  result: boolean
  hold: number
}

export interface ShapeStoryboard {
  steps: ShapeStep[]
  finalIndex: number
  answer: string
}

// ── builder ───────────────────────────────────────────────────────────────────

export function buildShapeSet17ECSteps(lang: Lang): ShapeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: ShapeStep[] = []

  // Beat 1 — intro: show all 6 shapes, state the goal
  steps.push({
    caption: t(
      'We need to pick shapes so that exactly 2 are coloured, 2 are large, and 2 are round. Find the minimum!',
      'Kita harus memilih bentuk agar tepat 2 berwarna, 2 besar, dan 2 bulat. Cari yang paling sedikit!',
    ),
    highlighted: [],
    result: false,
    hold: 2800,
  })

  // Beat 2 — try 2 shapes: best attempt with 2 shapes: shapes 2+5 (large red □, large white ○)
  // → coloured count = 1 (only #2), large = 2, round = 1 (only #5)
  steps.push({
    caption: t(
      'Try 2 shapes: large red □ + large white ○. Large: 2 ✓ — but coloured: 1 ✗, round: 1 ✗. Not enough!',
      'Coba 2 bentuk: □ merah besar + ○ putih besar. Besar: 2 ✓ — tapi berwarna: 1 ✗, bulat: 1 ✗. Belum cukup!',
    ),
    highlighted: [1, 4],
    ruleCheck: 'large',
    largeVerdict: 'pass',
    colouredVerdict: 'fail',
    roundVerdict: 'fail',
    result: false,
    hold: 2800,
  })

  // Beat 3 — conclusion that 2 shapes can't work
  steps.push({
    caption: t(
      'With only 2 shapes from this set, we cannot satisfy all three pairs at once. We need at least 3!',
      'Dengan hanya 2 bentuk dari kumpulan ini, kita tidak bisa memenuhi ketiga pasangan sekaligus. Butuh minimal 3!',
    ),
    highlighted: [1, 4],
    colouredVerdict: 'fail',
    largeVerdict: 'pass',
    roundVerdict: 'fail',
    result: false,
    hold: 2600,
  })

  // Beat 4 — try 3 shapes: highlight shapes 2, 5, 6
  steps.push({
    caption: t(
      'Try 3 shapes: large red □ (2), large white ○ (5), small red ● (6). Let\'s check each rule!',
      'Coba 3 bentuk: □ merah besar (2), ○ putih besar (5), ● merah kecil (6). Cek tiap aturan!',
    ),
    highlighted: [1, 4, 5],
    result: false,
    hold: 2600,
  })

  // Beat 5 — check coloured: shapes 2 and 6 are coloured → 2 ✓
  steps.push({
    caption: t(
      'Coloured: □ red (2) and ● red (6) → count = 2 ✓',
      'Berwarna: □ merah (2) dan ● merah (6) → jumlah = 2 ✓',
    ),
    highlighted: [1, 4, 5],
    ruleCheck: 'coloured',
    colouredVerdict: 'pass',
    result: false,
    hold: 2400,
  })

  // Beat 6 — check large: shapes 2 and 5 are large → 2 ✓
  steps.push({
    caption: t(
      'Large: □ large (2) and ○ large (5) → count = 2 ✓',
      'Besar: □ besar (2) dan ○ besar (5) → jumlah = 2 ✓',
    ),
    highlighted: [1, 4, 5],
    ruleCheck: 'large',
    colouredVerdict: 'pass',
    largeVerdict: 'pass',
    result: false,
    hold: 2400,
  })

  // Beat 7 — check round: shapes 5 and 6 are round → 2 ✓
  steps.push({
    caption: t(
      'Round: ○ (5) and ● (6) → count = 2 ✓',
      'Bulat: ○ (5) dan ● (6) → jumlah = 2 ✓',
    ),
    highlighted: [1, 4, 5],
    ruleCheck: 'round',
    colouredVerdict: 'pass',
    largeVerdict: 'pass',
    roundVerdict: 'pass',
    result: false,
    hold: 2400,
  })

  // Beat 8 — final: all three rules satisfied with 3 shapes!
  steps.push({
    caption: t(
      'All three rules satisfied with just 3 shapes! The minimum is 3 — Answer B.',
      'Ketiga aturan terpenuhi hanya dengan 3 bentuk! Minimum adalah 3 — Jawaban B.',
    ),
    highlighted: [1, 4, 5],
    colouredVerdict: 'pass',
    largeVerdict: 'pass',
    roundVerdict: 'pass',
    result: true,
    hold: 0,
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: 'B',
  }
}
