// Storyboard for IKMC-20-EC-Q2 — pattern-tile matrix, missing centre piece.
//
// Strategy: each row follows a +90° clockwise rotation rule per column.
//   Row 1 starts at 0°; col 0 = 0°, col 1 = 90°, so col 2 = 180° → answer E.
//
// Five beats:
//   1. Present the grid — notice each tile is the same design in different orientations.
//   2. Highlight row 1 (the row with the missing piece) — read col 0 (0°) and col 1 (90°).
//   3. Apply +90° rule: col 1 is 90°, so col 2 must be 90°+90° = 180°.
//   4. Confirm with the column: column 2 has 90°→?→0°, so middle = 180° checks out.
//   5. Reveal the answer as option E.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ANSWER_LABEL,
  ANSWER_ROT,
  MISSING_ROW,
  MISSING_COL,
} from './Pattern2ECIllustration'

export interface P2ECStep {
  /** Show the answer tile in the missing cell. */
  showAnswer: boolean
  /** Highlight this row (0-based), or null. */
  highlightRow: number | null
  /** Highlight this column (0-based), or null. */
  highlightCol: number | null
  caption: string
  /** Hold duration in ms (0 = final / stays). */
  hold: number
  /** True once the answer is confirmed. */
  result: boolean
}

export interface P2ECStoryboard {
  steps: P2ECStep[]
  finalIndex: number
}

export function buildPattern2ECSteps(lang: Lang): P2ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: P2ECStep[] = [
    // Beat 1: overview — same design, four rotations
    {
      showAnswer: false,
      highlightRow: null,
      highlightCol: null,
      hold: 2200,
      result: false,
      caption: t(
        'Every tile uses the same ornamental design — but rotated 0°, 90°, 180°, or 270°.',
        'Setiap ubin menggunakan desain yang sama — hanya diputar 0°, 90°, 180°, atau 270°.',
      ),
    },
    // Beat 2: highlight the missing row — read the pattern left of the "?"
    {
      showAnswer: false,
      highlightRow: MISSING_ROW,
      highlightCol: null,
      hold: 2600,
      result: false,
      caption: t(
        `Look at the middle row: left tile = 0°, next tile = 90° — each step adds 90°.`,
        `Perhatikan baris tengah: ubin kiri = 0°, ubin berikutnya = 90° — setiap langkah menambah 90°.`,
      ),
    },
    // Beat 3: deduce the missing cell from the row rule
    {
      showAnswer: false,
      highlightRow: MISSING_ROW,
      highlightCol: MISSING_COL,
      hold: 2600,
      result: false,
      caption: t(
        `So the missing tile (column 3) = 90° + 90° = 180°. The arc must face the bottom-right corner.`,
        `Jadi ubin yang hilang (kolom ke-3) = 90° + 90° = 180°. Busur harus menghadap sudut kanan bawah.`,
      ),
    },
    // Beat 4: confirm with the column
    {
      showAnswer: false,
      highlightRow: null,
      highlightCol: MISSING_COL,
      hold: 2400,
      result: false,
      caption: t(
        `Cross-check column 3: the top tile is 90°, the bottom is 0° — the middle must be 180°. ✓`,
        `Periksa silang kolom ke-3: ubin atas = 90°, ubin bawah = 0° — tengah harus 180°. ✓`,
      ),
    },
    // Beat 5: reveal answer E
    {
      showAnswer: true,
      highlightRow: MISSING_ROW,
      highlightCol: MISSING_COL,
      hold: 0,
      result: true,
      caption: t(
        `The missing piece is rotated ${ANSWER_ROT}° — that is answer (${ANSWER_LABEL})!`,
        `Potongan yang hilang diputar ${ANSWER_ROT}° — itu pilihan (${ANSWER_LABEL})!`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
