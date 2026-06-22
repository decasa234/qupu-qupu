/**
 * IKMC-19-EC-Q5 — step data for CutPiece5ECExplainer.
 *
 * Animation strategy:
 *   Beat 0  — show the full 4×4 card-suit grid; intro caption.
 *   Beat 1  — check option B (star + spade): row 2 has ★ at col 1, ♠ at col 3 —
 *             not adjacent → eliminated.
 *   Beat 2  — check option C (star + star): same symbol never placed
 *             side-by-side in the grid → eliminated.
 *   Beat 3  — check option D (heart + diamond): no row has ♥ immediately
 *             left of ♦ → eliminated.
 *   Beat 4  — check option E (heart + heart): same symbol never placed
 *             side-by-side in the grid → eliminated.
 *   Beat 5  — highlight CORRECT option A (star + club): row 2, cols 1–2
 *             has ★ then ♣ — exact match ✓
 *   Beat 6  — result: answer is A.
 */

export type Lang = 'en' | 'id'

export interface CutPiece5ECStep {
  /** Which grid cells to highlight ([row, col] 0-indexed). Empty = no highlight. */
  highlight: Array<[number, number]>
  /** Which option label is being checked this beat ('A'–'E' or ''). */
  option: string
  /** True on the final answer beat. */
  result: boolean
  caption: string
  hold: number
}

export interface CutPiece5ECStoryboard {
  steps: CutPiece5ECStep[]
  finalIndex: number
}

export function buildCutPiece5ECSteps(lang: Lang): CutPiece5ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CutPiece5ECStep[] = []

  // Beat 0 — intro: show the grid.
  steps.push({
    highlight: [],
    option: '',
    result: false,
    hold: 2000,
    caption: t(
      'Karina cuts a 1×2 piece from the grid. Find which A–E pair appears side-by-side in a row.',
      'Karina memotong satu bagian 1×2 dari petak. Temukan pasangan A–E yang berdampingan dalam satu baris.',
    ),
  })

  // Beat 1 — check B: star + spade.
  // Row 2: [♦][★][♣][♠] → ★ at col 1, ♠ at col 3 — not adjacent.
  // No other row has both ★ and ♠ → B eliminated.
  steps.push({
    highlight: [[2, 1], [2, 3]],
    option: 'B',
    result: false,
    hold: 2000,
    caption: t(
      'B (star + spade): in row 3, ★ is at col 2 and ♠ is at col 4 — not side-by-side → eliminated.',
      'B (bintang + sekop): di baris 3, ★ ada di kolom 2 dan ♠ ada di kolom 4 — tidak berdampingan → gugur.',
    ),
  })

  // Beat 2 — check C: star + star.
  // ★ appears only at (0,1) and (2,1). No two stars are adjacent in any row → eliminated.
  steps.push({
    highlight: [[0, 1], [2, 1]],
    option: 'C',
    result: false,
    hold: 2000,
    caption: t(
      'C (star + star): ★ appears at row 1 col 2 and row 3 col 2 — never two stars side-by-side → eliminated.',
      'C (bintang + bintang): ★ muncul di baris 1 kolom 2 dan baris 3 kolom 2 — tidak pernah dua bintang berdampingan → gugur.',
    ),
  })

  // Beat 3 — check D: heart + diamond.
  // ♥ appears at (0,3), (1,2), (1,3), (3,3). ♦ appears at (1,0), (2,0), (3,0).
  // No row has ♥ immediately left of ♦ → eliminated.
  steps.push({
    highlight: [],
    option: 'D',
    result: false,
    hold: 2000,
    caption: t(
      'D (heart + diamond): ♥ and ♦ are never adjacent in the same row with heart on the left → eliminated.',
      'D (hati + berlian): ♥ dan ♦ tidak pernah berdampingan dalam satu baris dengan hati di kiri → gugur.',
    ),
  })

  // Beat 4 — check E: heart + heart.
  // Row 1: [♦,♣,♥,♠] → (1,2)=♥, (1,3)=♠ — NOT two hearts adjacent.
  // Row 0: [♣,★,♣,♥] → only one ♥ in row 0. No row ever has ♥ at two adjacent columns → eliminated.
  steps.push({
    highlight: [],
    option: 'E',
    result: false,
    hold: 2200,
    caption: t(
      'E (heart + heart): ♥ never appears in two adjacent columns in the same row → eliminated.',
      'E (hati + hati): ♥ tidak pernah muncul di dua kolom yang berdampingan dalam baris yang sama → gugur.',
    ),
  })

  // Beat 5 — spot A: star + club at row 2, cols 1–2.
  steps.push({
    highlight: [[2, 1], [2, 2]],
    option: 'A',
    result: false,
    hold: 2200,
    caption: t(
      'A (star + club): row 3 has ★ at col 2 and ♣ at col 3 — they ARE side-by-side! ✓',
      'A (bintang + keriting): baris 3 memiliki ★ di kolom 2 dan ♣ di kolom 3 — keduanya berdampingan! ✓',
    ),
  })

  // Beat 6 — result.
  steps.push({
    highlight: [[2, 1], [2, 2]],
    option: 'A',
    result: true,
    hold: 0,
    caption: t(
      'Karina cut the ★ + ♣ piece from row 3 of the grid. Answer: A.',
      'Karina memotong bagian ★ + ♣ dari baris 3 petak. Jawaban: A.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
