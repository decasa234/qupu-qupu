import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { LOCK_CODE } from './LockCodeIllustration'

export type LockPhase = 'show' | 'eliminate' | 'deduce' | 'place' | 'result'

export interface LockStep {
  phase: LockPhase
  /** Lock slot contents on this beat; null = still unknown. */
  slots: (string | null)[]
  /** Cross out eliminated digits in the clue rows. */
  crossEliminated: boolean
  /** Guess digits to highlight as "fits": set of "rowIndex-colIndex". */
  highlight: string[]
  /** Mark the lock as solved (green). */
  solved: boolean
  caption: string
  hold: number
  result: boolean
}

export interface LockStoryboard {
  code: string
  steps: LockStep[]
  finalIndex: number
}

export function buildLockCodeSteps(lang: Lang): LockStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  // Code 527: position 0 = '5', position 1 = '2', position 2 = '7'.
  const [p0, p1, p2] = LOCK_CODE.split('')

  const steps: LockStep[] = [
    {
      phase: 'show',
      slots: [null, null, null],
      crossEliminated: false,
      highlight: [],
      solved: false,
      caption: t(
        'Five clues. Each guess says how many digits are correct. Find the 3-digit code.',
        'Lima petunjuk. Tiap tebakan memberi tahu berapa angka yang benar. Temukan kode 3 angka.',
      ),
      hold: 2100,
      result: false,
    },
    {
      phase: 'eliminate',
      slots: [null, null, null],
      crossEliminated: true,
      highlight: [],
      solved: false,
      caption: t(
        '164 and 831 have 0 correct, so 1, 6, 4, 8, 3 are all out.',
        '164 dan 831 punya 0 angka benar, jadi 1, 6, 4, 8, 3 semuanya dicoret.',
      ),
      hold: 2500,
      result: false,
    },
    {
      // 753 row index 2: digits 7 (col0) and 5 (col1) survive; 3 (col2) eliminated.
      phase: 'deduce',
      slots: [null, null, null],
      crossEliminated: true,
      highlight: ['2-0', '2-1'],
      solved: false,
      caption: t(
        '753 has 2 correct. The 3 is gone, so 7 and 5 are both in the code.',
        '753 punya 2 angka benar. Angka 3 sudah dicoret, jadi 7 dan 5 keduanya ada di kode.',
      ),
      hold: 2500,
      result: false,
    },
    {
      // 347 row index 0: only 7 (col2) survives, and it is in the right place -> last digit.
      phase: 'place',
      slots: [null, null, p2],
      crossEliminated: true,
      highlight: ['0-2'],
      solved: false,
      caption: t(
        '347 has 1 correct in the right place. Only 7 survives — so 7 is the last digit.',
        '347 punya 1 angka benar di tempat tepat. Hanya 7 yang tersisa — jadi 7 angka terakhir.',
      ),
      hold: 2600,
      result: false,
    },
    {
      // 392 (row 1): the surviving digits 2 and 9 both fit this clue; the official code uses 2.
      phase: 'deduce',
      slots: [null, null, p2],
      crossEliminated: true,
      highlight: ['1-2'],
      solved: false,
      caption: t(
        '392 has 1 correct in the WRONG place — the official solution takes 2. The clue shows 2 LAST, so it moves to the middle.',
        '392 punya 1 angka benar di tempat SALAH — solusi resmi memakai 2. Petunjuk menulis 2 TERAKHIR, jadi ia pindah ke tengah.',
      ),
      hold: 2600,
      result: false,
    },
    {
      // Fill 5 and 2 into the first two slots to match the official code 527.
      phase: 'place',
      slots: [p0, p1, p2],
      crossEliminated: true,
      highlight: [],
      solved: false,
      caption: t(
        'With 7 last and 2 in the middle, 5 fills the first spot: 5 2 7.',
        'Dengan 7 di akhir dan 2 di tengah, 5 mengisi tempat pertama: 5 2 7.',
      ),
      hold: 2100,
      result: false,
    },
    {
      phase: 'result',
      slots: [p0, p1, p2],
      crossEliminated: true,
      highlight: [],
      solved: true,
      caption: t(`The code is ${LOCK_CODE}.`, `Kodenya adalah ${LOCK_CODE}.`),
      hold: 0,
      result: true,
    },
  ]

  return { code: LOCK_CODE, steps, finalIndex: steps.length - 1 }
}
