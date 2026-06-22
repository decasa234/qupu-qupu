// IKMC-22-PE-Q5 — storyboard for the coin placement grid animation.
//
// Problem: place exactly 2 coins in each row and each column of a 4×4 grid.
// Seven coins are pre-placed; one of five labelled cells (A–E) gets the last coin.
//
// Pre-placed layout:
//   Row 0: (0,0) (0,1)              → row 0 already has 2
//   Row 1: (1,1)       (1,3)        → row 1 already has 2
//   Row 2: (2,0)                    → row 2 has only 1 — needs 1 more
//   Row 3:             (3,2) (3,3)  → row 3 already has 2
//
// Column tallies (before the final coin):
//   col 0: (0,0),(2,0) → 2 full
//   col 1: (0,1),(1,1) → 2 full
//   col 2: (3,2)       → 1 needs 1 more
//   col 3: (1,3),(3,3) → 2 full
//
// Row 2 needs one more coin, and that coin must go in col 2 → position D.
//
// Teaching walk, one idea per beat:
//   0. intro     — show the grid as-is with the constraint stated
//   1. scan-rows — scan each row to find which row still needs a coin (row 2)
//   2. scan-cols — scan each column to find which column still needs a coin (col 2)
//   3. intersect — row 2 ∩ col 2 = cell D
//   4. result    — place coin at D → answer D
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CoinPhase5PE = 'intro' | 'scan-rows' | 'scan-cols' | 'intersect' | 'result'

export interface CoinBeat5PE {
  phase: CoinPhase5PE
  /** Amber row scan overlay (0–3 or null) */
  highlightRow: number | null
  /** Amber col scan overlay (0–3 or null) */
  highlightCol: number | null
  /** Green border on these [row,col] cells */
  highlightCells: Array<[number, number]>
  /** Render the answer coin at (2,2) */
  showAnswer: boolean
  /** Dim non-D candidate labels */
  dimOtherLabels: boolean
  /** Caption text */
  caption: string
  /** Equation/maths displayed below the grid; '' to hide */
  equation: string
  /** Auto-hold in ms (0 = manual / final) */
  hold: number
  /** True only on the result beat */
  result: boolean
}

export interface CoinStoryboard5PE {
  steps: CoinBeat5PE[]
  finalIndex: number
}

export function buildCoinGrid5PESteps(lang: Lang): CoinStoryboard5PE {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CoinBeat5PE[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightRow: null,
      highlightCol: null,
      highlightCells: [],
      showAnswer: false,
      dimOtherLabels: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Rule: every row and every column must contain exactly 2 coins. Seven coins are already placed — find where the last one goes.',
        'Aturan: setiap baris dan setiap kolom harus berisi tepat 2 koin. Tujuh koin sudah ditempatkan — temukan di mana koin terakhir harus diletakkan.',
      ),
    },

    // Beat 1 — scan rows to find the incomplete one
    {
      phase: 'scan-rows',
      highlightRow: 2,
      highlightCol: null,
      highlightCells: [[2, 0]],
      showAnswer: false,
      dimOtherLabels: false,
      equation: t('Row 3 has only 1 coin → needs 1 more', 'Baris 3 hanya punya 1 koin → butuh 1 lagi'),
      hold: 2400,
      result: false,
      caption: t(
        'Scan each row: rows 1, 2, and 4 already have 2 coins. Row 3 has only 1 coin at the left — it needs one more.',
        'Periksa setiap baris: baris 1, 2, dan 4 sudah punya 2 koin. Baris 3 hanya punya 1 koin di kiri — perlu satu lagi.',
      ),
    },

    // Beat 2 — scan columns to find the incomplete one
    {
      phase: 'scan-cols',
      highlightRow: null,
      highlightCol: 2,
      highlightCells: [[3, 2]],
      showAnswer: false,
      dimOtherLabels: false,
      equation: t('Column 3 has only 1 coin → needs 1 more', 'Kolom 3 hanya punya 1 koin → butuh 1 lagi'),
      hold: 2400,
      result: false,
      caption: t(
        'Scan each column: columns 1, 2, and 4 already have 2 coins. Column 3 has only 1 coin at the bottom — it needs one more.',
        'Periksa setiap kolom: kolom 1, 2, dan 4 sudah punya 2 koin. Kolom 3 hanya punya 1 koin di bawah — perlu satu lagi.',
      ),
    },

    // Beat 3 — intersection
    {
      phase: 'intersect',
      highlightRow: 2,
      highlightCol: 2,
      highlightCells: [[2, 2]],
      showAnswer: false,
      dimOtherLabels: true,
      equation: t('Row 3 ∩ Column 3 = cell D', 'Baris 3 ∩ Kolom 3 = sel D'),
      hold: 2400,
      result: false,
      caption: t(
        'Row 3 needs a coin in column 3, and column 3 needs a coin in row 3. Their intersection is cell D — that is where the final coin goes.',
        'Baris 3 butuh koin di kolom 3, dan kolom 3 butuh koin di baris 3. Perpotongannya adalah sel D — itulah tempat koin terakhir.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightRow: null,
      highlightCol: null,
      highlightCells: [[2, 2]],
      showAnswer: true,
      dimOtherLabels: true,
      equation: t('Place coin at D → answer D', 'Letakkan koin di D → jawaban D'),
      hold: 0,
      result: true,
      caption: t(
        'Placing the coin at D gives every row and every column exactly 2 coins — answer D.',
        'Meletakkan koin di D memberi setiap baris dan kolom tepat 2 koin — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
