// Steps for TIMO-22-P1H-Q20 — "Ada berapa ruas garis dalam gambar di bawah ini?"
// Answer: 12.
//
// Strategy: group by direction, count sub-segments per group, sum.
//
// Beat 0 — intro: figure shown, no highlights.
// Beat 1 — horizontal group (4 collinear pts → 6 segments).
// Beat 2 — diagonal group  (3 collinear pts → 3 segments).
// Beat 3 — branch group    (3 single edges  → 3 segments).
// Beat 4 — total: 6 + 3 + 3 = 12.

import type { EdgeGroup } from './LineSegTIMO22P1Q20Illustration'

export const LINE_SEG_22_P1_ANSWER = 12

export interface LineSeg22P1Step {
  label_en: string
  label_id: string
  /** Which edge group to highlight; undefined = no highlight (intro / final all-on). */
  highlight?: EdgeGroup | 'all'
  /** Running segment count shown in the counter chip. */
  countSoFar: number
  /** Milliseconds to hold this beat before auto-advancing. */
  hold: number
}

export const LINE_SEG_22_P1_STEPS: LineSeg22P1Step[] = [
  {
    label_en: 'Count line segments by direction — horizontal, diagonal, and branches.',
    label_id: 'Hitung ruas garis berdasarkan arah — horizontal, diagonal, dan cabang.',
    countSoFar: 0,
    hold: 2200,
  },
  {
    label_en: 'Horizontal: 4 collinear points → 4+3+2+1... = C(4,2) = 6 segments.',
    label_id: 'Horizontal: 4 titik segaris → C(4,2) = 6 ruas garis.',
    highlight: 'horizontal',
    countSoFar: 6,
    hold: 2800,
  },
  {
    label_en: 'Diagonal: 3 collinear points → C(3,2) = 3 segments.',
    label_id: 'Diagonal: 3 titik segaris → C(3,2) = 3 ruas garis.',
    highlight: 'diagonal',
    countSoFar: 9,
    hold: 2800,
  },
  {
    label_en: '3 remaining single branches → 3 segments.',
    label_id: '3 cabang tunggal tersisa → 3 ruas garis.',
    highlight: 'branch',
    countSoFar: 12,
    hold: 2800,
  },
  {
    label_en: 'Total: 6 + 3 + 3 = 12 line segments.',
    label_id: 'Total: 6 + 3 + 3 = 12 ruas garis.',
    highlight: 'all',
    countSoFar: 12,
    hold: 3200,
  },
]

export const LINE_SEG_22_P1_FINAL_INDEX = LINE_SEG_22_P1_STEPS.length - 1
