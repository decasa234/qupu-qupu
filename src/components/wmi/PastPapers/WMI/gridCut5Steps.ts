/**
 * IKMC-19-PE-Q5 — step data for GridCut5Explainer.
 *
 * Animation strategy:
 *   Beat 0  — show the full grid; intro caption.
 *   Beat 1  — highlight the wrong option A (triangle + square):
 *             check row 0 col 0→1 = triangle + circle ✗, row 1 col 0→1 = triangle + star ✗ → no match.
 *   Beat 2  — highlight wrong option B (triangle + circle):
 *             row 0 col 0→1 = triangle + circle → match, but the source option B has a
 *             DOWN-pointing triangle which is NOT in the grid → eliminated.
 *   Beat 3  — highlight wrong option C (star + left-arrow): left-arrow not in grid → eliminated.
 *   Beat 4  — highlight wrong option D (star + diamond): star is at (1,1), diamond at (2,0) —
 *             not horizontally adjacent → eliminated.
 *   Beat 5  — highlight CORRECT option E (square + circle): row 2, cols 1–2 match ✓
 *   Beat 6  — result: answer is E.
 */

export type Lang = 'en' | 'id'

export interface GridCut5Step {
  /** Which grid cells to highlight ([row, col] 0-indexed). Empty = no highlight. */
  highlight: Array<[number, number]>
  /** Which option label is being checked this beat ('A'–'E' or ''). */
  option: string
  /** True on the final answer beat. */
  result: boolean
  caption: string
  hold: number
}

export interface GridCut5Storyboard {
  steps: GridCut5Step[]
  finalIndex: number
}

export function buildGridCut5Steps(lang: Lang): GridCut5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridCut5Step[] = []

  // Beat 0 — intro: show the grid.
  steps.push({
    highlight: [],
    option: '',
    result: false,
    hold: 2000,
    caption: t(
      'Karen cuts a 1×2 piece from the grid. Find which A–E pair appears side-by-side in a row.',
      'Karen memotong satu bagian 1×2 dari petak. Temukan pasangan A–E yang berdampingan dalam satu baris.',
    ),
  })

  // Beat 1 — check A: triangle + square.
  // Row 0: [▲][●][■] → positions (0,0)+(0,1)=(▲●) not A; (0,1)+(0,2)=(●■) not A.
  // Row 1: [▲][★][●] → (1,0)+(1,1)=(▲★) not A.
  // Row 2: [◆][■][●] → no ▲.
  // No consecutive (▲,■) pair exists → A eliminated.
  steps.push({
    highlight: [],
    option: 'A',
    result: false,
    hold: 2000,
    caption: t(
      'A (triangle + square): no row has ▲ immediately left of ■ → eliminated.',
      'A (segitiga + kotak): tidak ada baris yang memiliki ▲ langsung di kiri ■ → gugur.',
    ),
  })

  // Beat 2 — check B: triangle + circle.
  // The source option B shows a DOWN-pointing triangle, which does not appear in the grid → eliminated.
  steps.push({
    highlight: [],
    option: 'B',
    result: false,
    hold: 2000,
    caption: t(
      'B shows a down-pointing triangle ▼ — that symbol is not in the grid → eliminated.',
      'B menunjukkan segitiga terbalik ▼ — simbol itu tidak ada di petak → gugur.',
    ),
  })

  // Beat 3 — check C: star + left-arrow.
  // Left-arrow is not in the grid at all → eliminated.
  steps.push({
    highlight: [],
    option: 'C',
    result: false,
    hold: 2000,
    caption: t(
      'C contains a left-arrow ◄ — that symbol does not appear anywhere in the grid → eliminated.',
      'C mengandung panah kiri ◄ — simbol itu tidak ada di mana pun dalam petak → gugur.',
    ),
  })

  // Beat 4 — check D: star + diamond.
  // Star is at (1,1); diamond at (2,0). They are NOT in the same row and column-adjacent → no cut.
  steps.push({
    highlight: [[1, 1], [2, 0]],
    option: 'D',
    result: false,
    hold: 2200,
    caption: t(
      'D (star + diamond): ★ is at row 2, col 2 and ◆ is at row 3, col 1 — not side-by-side in the same row → eliminated.',
      'D (bintang + berlian): ★ ada di baris 2 kolom 2 dan ◆ ada di baris 3 kolom 1 — tidak berdampingan dalam baris yang sama → gugur.',
    ),
  })

  // Beat 5 — spot E: square + circle at row 2, cols 1–2.
  steps.push({
    highlight: [[2, 1], [2, 2]],
    option: 'E',
    result: false,
    hold: 2200,
    caption: t(
      'E (square + circle): row 3 has ■ at col 2 and ● at col 3 — they ARE side-by-side! ✓',
      'E (kotak + lingkaran): baris 3 memiliki ■ di kolom 2 dan ● di kolom 3 — keduanya berdampingan! ✓',
    ),
  })

  // Beat 6 — result.
  steps.push({
    highlight: [[2, 1], [2, 2]],
    option: 'E',
    result: true,
    hold: 0,
    caption: t(
      'Karen cut the ■ + ● piece from the bottom-right of the grid. Answer: E.',
      'Karen memotong bagian ■ + ● dari pojok kanan bawah petak. Jawaban: E.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
