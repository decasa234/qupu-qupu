import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q3_ANSWER, Q3_PATH, START_VALUE } from './P19G2Q3Illustration'

// Storyboard for WMI-19P2A-Q3 — walking the arrow path on the 61..120 grid.
//
// Net moves: 4 down + 1 up = 3 rows down (+30); 3 right + 2 left = 1 right (+1).
// 63 + 30 + 1 = 94 (choice C). The trap (104) comes from counting 4 net-down
// rows; we make the +30 explicit by netting the up arrow against the downs.

export interface Q3Step {
  /** Cells of Q3_PATH (incl. start) marked visited on the grid; 0 = none yet. */
  pathLen: number
  caption: string
  hold: number
  result: boolean
}

export interface Q3Storyboard {
  answer: number
  steps: Q3Step[]
  finalIndex: number
}

export function buildP19G2Q3Steps(lang: Lang): Q3Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // path index just before the last two side-arrows + up (after the 4th down)
  const steps: Q3Step[] = [
    {
      pathLen: 1, // just the start cell
      hold: 1700,
      result: false,
      caption: t(
        `Turn each arrow into a number change: ↓ +10, ↑ −10, → +1, ← −1. Start at ${START_VALUE}.`,
        `Ubah tiap panah jadi perubahan angka: ↓ +10, ↑ −10, → +1, ← −1. Mulai dari ${START_VALUE}.`,
      ),
    },
    {
      pathLen: 5, // R, R, D, D  → 63→64→65→75→85
      hold: 2000,
      result: false,
      caption: t(
        'First → → step 2 right, then ↓ ↓ drop 2 rows: 63 → 65 → 85.',
        'Mula-mula → → maju 2 ke kanan, lalu ↓ ↓ turun 2 baris: 63 → 65 → 85.',
      ),
    },
    {
      pathLen: 8, // R, D, D → 85→86→96→106
      hold: 2000,
      result: false,
      caption: t(
        'Then → ↓ ↓: 1 right and 2 more rows down: 85 → 86 → 106.',
        'Lalu → ↓ ↓: 1 ke kanan dan 2 baris turun lagi: 85 → 86 → 106.',
      ),
    },
    {
      pathLen: 10, // L, L → 106→105→104
      hold: 1900,
      result: false,
      caption: t(
        '← ← go 2 left: 106 → 104. Careful — we are not done yet.',
        '← ← mundur 2 ke kiri: 106 → 104. Hati-hati — belum selesai.',
      ),
    },
    {
      pathLen: 11, // U → 104→94  (full path)
      hold: 0,
      result: true,
      caption: t(
        `Last ↑ goes up one row, −10: 104 → ${Q3_ANSWER}. So you land on ${Q3_ANSWER} — answer C.`,
        `Panah terakhir ↑ naik satu baris, −10: 104 → ${Q3_ANSWER}. Jadi mendarat di ${Q3_ANSWER} — jawaban C.`,
      ),
    },
  ]

  return { answer: Q3_PATH[Q3_PATH.length - 1], steps, finalIndex: steps.length - 1 }
}
