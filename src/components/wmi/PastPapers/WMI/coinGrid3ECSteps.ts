// IKMC-22-EC-Q3 — storyboard for the coin-placement animation.
//
// The question: Rossitza wants 2 coins per row and 2 per column in a 4×4 grid.
// Initial placement has 8 coins (5 labelled A–E, 3 plain). Row 3 has 3 coins
// (B, C, E) and row 2 has only 1 coin (D). Moving coin C from (row3,col1) to
// the empty cell (row2,col1) fixes both rows. Answer: C.
//
// Teaching walk — one idea per beat:
//   0. intro    — show the initial grid; state the rule (2 per row + col).
//   1. rows     — check each row count; highlight row 2 (has 1) + row 3 (has 3).
//   2. target   — spotlight coin C as the troublemaker; show target cell.
//   3. move     — show C in its new position (row 2, col 1).
//   4. result   — confirm every row and column now has exactly 2 → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { CoinCell, CoinRing } from './CoinGrid3ECIllustration'
import { INITIAL_COINS, COIN_C_INITIAL, COIN_C_TARGET } from './CoinGrid3ECIllustration'

export type Lang = 'en' | 'id'
export type PhaseId = 'intro' | 'rows' | 'target' | 'move' | 'result'

export interface CoinBeat {
  phase: PhaseId
  /** Coins to render this beat. Undefined = use initial placement. */
  coins?: CoinCell[]
  /** Ring highlights keyed by "rowcol". */
  rings: CoinRing
  /** Draw the dashed-ring placeholder at COIN_C_TARGET. */
  emptyTarget: boolean
  /** Equation / label pill. Empty string = hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CoinStoryboard {
  steps: CoinBeat[]
  finalIndex: number
}

// Coins after C has moved from (3,1) to (2,1)
const MOVED_COINS: CoinCell[] = INITIAL_COINS
  .filter((c) => !(c.row === COIN_C_INITIAL.row && c.col === COIN_C_INITIAL.col))
  .concat([{ row: COIN_C_TARGET.row, col: COIN_C_TARGET.col, label: 'C' }])

export function buildCoinGrid3ECSteps(lang: Lang): CoinStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CoinBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      rings: {},
      emptyTarget: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Rossitza wants exactly 2 coins in every row and every column. Which coin is in the wrong place?',
        'Rossitza ingin tepat 2 koin di setiap baris dan setiap kolom. Koin mana yang berada di tempat yang salah?',
      ),
    },

    // Beat 1 — check row counts
    {
      phase: 'rows',
      rings: {
        // highlight row 3's coins (too many — row has 3)
        [`${COIN_C_INITIAL.row}${0}`]: 'bad',
        [`${COIN_C_INITIAL.row}${1}`]: 'bad',
        [`${COIN_C_INITIAL.row}${2}`]: 'bad',
      },
      emptyTarget: false,
      equation: t('Row 4: 3 coins ✗', 'Baris 4: 3 koin ✗'),
      hold: 2400,
      result: false,
      caption: t(
        'Count the coins per row: rows 1, 2, and 3 each have 2. But row 4 has 3 coins — one too many!',
        'Hitung koin per baris: baris 1, 2, dan 3 masing-masing punya 2. Tapi baris 4 punya 3 koin — kelebihan satu!',
      ),
    },

    // Beat 2 — spotlight coin C and target cell
    {
      phase: 'target',
      rings: {
        [`${COIN_C_INITIAL.row}${COIN_C_INITIAL.col}`]: 'bad',
      },
      emptyTarget: true,
      equation: t('Row 3: empty  →  Row 4: −1', 'Baris 3: kosong  →  Baris 4: −1'),
      hold: 2400,
      result: false,
      caption: t(
        'Row 3 (where D is) only has 1 coin — it needs one more. Coin C is the extra in row 4. Move C up to fill row 3!',
        'Baris 3 (tempat D berada) hanya punya 1 koin — perlu satu lagi. Koin C adalah kelebihan di baris 4. Pindahkan C ke atas untuk mengisi baris 3!',
      ),
    },

    // Beat 3 — show C in new position
    {
      phase: 'move',
      coins: MOVED_COINS,
      rings: {
        [`${COIN_C_TARGET.row}${COIN_C_TARGET.col}`]: 'ok',
      },
      emptyTarget: false,
      equation: t('C moves to row 3, col 2', 'C pindah ke baris 3, kol 2'),
      hold: 2400,
      result: false,
      caption: t(
        'C moves from row 4 to the empty cell in row 3. Now count again: every row has exactly 2 coins.',
        'C pindah dari baris 4 ke sel kosong di baris 3. Hitung lagi: setiap baris kini tepat punya 2 koin.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      coins: MOVED_COINS,
      rings: {
        [`${COIN_C_TARGET.row}${COIN_C_TARGET.col}`]: 'ok',
      },
      emptyTarget: false,
      equation: t('Coin C → Answer C', 'Koin C → Jawaban C'),
      hold: 0,
      result: true,
      caption: t(
        'Every row and column now has exactly 2 coins. Coin C was the one to move — answer C.',
        'Setiap baris dan kolom kini tepat punya 2 koin. Koin C yang harus dipindahkan — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
