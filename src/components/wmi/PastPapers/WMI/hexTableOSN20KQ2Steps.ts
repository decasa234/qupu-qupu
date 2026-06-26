/**
 * OSN-20-SD-KAB-Q2 — hexagonal table + chairs pattern.
 *
 * Storyboard (5 beats):
 *   0. Show 1 table, 6 chairs.
 *   1. Add 1 table → 2 tables, 10 chairs (+4 per join).
 *   2. Add 1 more  → 3 tables, 14 chairs (+4).
 *   3. Generalise pattern: n meja → 6 + 4(n−1).
 *   4. Apply for 10 tables → 42 chairs. Answer revealed.
 */

type Lang = 'en' | 'id'

export interface HexTableStep {
  /** How many tables to render (1–3 for animate, 3 for pattern/answer beats). */
  nTables: number
  /** Highlight the newly added chairs in this beat (side indices of NEW sides). */
  newSides: boolean
  showPattern: boolean
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface HexTableStoryboard {
  steps: HexTableStep[]
  finalIndex: number
}

// Quantities bound to the seed
export const N_TABLES = 10
export const ANSWER = 42
export const BASE_CHAIRS = 6
export const ADD_PER_TABLE = 4

export function buildHexTableOSN20KQ2Steps(lang: Lang): HexTableStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HexTableStep[] = [
    {
      nTables: 1,
      newSides: false,
      showPattern: false,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        `1 hexagonal table fits ${BASE_CHAIRS} chairs — one per side.`,
        `1 meja segienam muat ${BASE_CHAIRS} kursi — satu di setiap sisi.`,
      ),
    },
    {
      nTables: 2,
      newSides: true,
      showPattern: false,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Push 2 tables together: the shared side loses 2 chairs → 6 + 4 = 10 chairs.`,
        `2 meja dirapatkan: sisi yang berhimpitan kehilangan 2 kursi → 6 + 4 = 10 kursi.`,
      ),
    },
    {
      nTables: 3,
      newSides: true,
      showPattern: false,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `3 tables: one more join, 2 more chairs lost → 10 + 4 = 14 chairs.`,
        `3 meja: satu sambungan lagi, 2 kursi hilang lagi → 10 + 4 = 14 kursi.`,
      ),
    },
    {
      nTables: 3,
      newSides: false,
      showPattern: true,
      showAnswer: false,
      hold: 2500,
      result: false,
      caption: t(
        `Pattern: each extra table adds exactly ${ADD_PER_TABLE} chairs. For n tables: ${BASE_CHAIRS} + ${ADD_PER_TABLE}(n − 1) chairs.`,
        `Pola: setiap meja tambahan menambah ${ADD_PER_TABLE} kursi. Untuk n meja: ${BASE_CHAIRS} + ${ADD_PER_TABLE}(n − 1) kursi.`,
      ),
    },
    {
      nTables: 3,
      newSides: false,
      showPattern: true,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `${N_TABLES} tables: ${BASE_CHAIRS} + ${ADD_PER_TABLE} × ${N_TABLES - 1} = ${BASE_CHAIRS} + ${(N_TABLES - 1) * ADD_PER_TABLE} = ${ANSWER} chairs ✓`,
        `${N_TABLES} meja: ${BASE_CHAIRS} + ${ADD_PER_TABLE} × ${N_TABLES - 1} = ${BASE_CHAIRS} + ${(N_TABLES - 1) * ADD_PER_TABLE} = ${ANSWER} kursi ✓`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
