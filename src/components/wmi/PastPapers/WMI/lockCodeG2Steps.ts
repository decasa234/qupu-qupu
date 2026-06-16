import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { LOCK_CODE_G2 } from './LockCodeG2Illustration'

export type LockPhaseG2 = 'show' | 'eliminate' | 'deduce' | 'place' | 'result'

export interface LockStepG2 {
  phase: LockPhaseG2
  /** Lock slot contents on this beat; null = still unknown. */
  slots: (string | null)[]
  /** Cross out eliminated digits in the clue rows. */
  crossEliminated: boolean
  /** Extra digit characters to cross out (deduced out, beyond the 164 clue). */
  extraCrossed?: string[]
  /** Guess digits to highlight as "fits": set of "rowIndex-colIndex". */
  highlight: string[]
  /** Mark the lock as solved (green). */
  solved: boolean
  caption: string
  hold: number
  result: boolean
}

export interface LockStoryboardG2 {
  code: string
  steps: LockStepG2[]
  finalIndex: number
}

export function buildLockCodeG2Steps(lang: Lang): LockStoryboardG2 {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  // Code 527: position 0 = '5', position 1 = '2', position 2 = '7'.
  const [p0, p1, p2] = LOCK_CODE_G2.split('')

  // Clue row indexes: 0=347, 1=392, 2=753, 3=164, 4=415.
  const steps: LockStepG2[] = [
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
      // 164 row index 3: 0 correct -> eliminate 1, 6, 4 everywhere.
      phase: 'eliminate',
      slots: [null, null, null],
      crossEliminated: true,
      highlight: [],
      solved: false,
      caption: t(
        '164 has 0 correct, so 1, 6 and 4 are all out.',
        '164 punya 0 angka benar, jadi 1, 6, dan 4 semuanya dicoret.',
      ),
      hold: 2400,
      result: false,
    },
    {
      // 415 row index 4: 1 correct. 4 and 1 are out, so 5 (col2) is the correct digit.
      phase: 'deduce',
      slots: [null, null, null],
      crossEliminated: true,
      highlight: ['4-2'],
      solved: false,
      caption: t(
        '415 has 1 correct. 4 and 1 are gone, so 5 is in the code.',
        '415 punya 1 angka benar. 4 dan 1 sudah dicoret, jadi 5 ada di kode.',
      ),
      hold: 2500,
      result: false,
    },
    {
      // 753 row index 2: 2 correct. 5 is known in the code, so the other is 7 or 3.
      phase: 'deduce',
      slots: [null, null, null],
      crossEliminated: true,
      highlight: ['2-1'],
      solved: false,
      caption: t(
        '753 has 2 correct digits. We know 5 is in the code, so the other one is 7 or 3.',
        '753 punya 2 angka benar. Kita tahu 5 ada di kode, jadi satunya lagi 7 atau 3.',
      ),
      hold: 2500,
      result: false,
    },
    {
      // 4a — suppose 3 IS in the code: 347 (right place) would put it in the first spot.
      phase: 'deduce',
      slots: [null, null, null],
      crossEliminated: true,
      highlight: ['0-0'],
      solved: false,
      caption: t(
        'Could 3 be in the code? 347 has 1 digit correct AND in the right place — that would put 3 in the first spot.',
        'Mungkinkah 3 ada di kode? 347 punya 1 angka benar DAN di tempat tepat — itu menaruh 3 di tempat pertama.',
      ),
      hold: 2600,
      result: false,
    },
    {
      // 4b — but 392 has 3 in the first spot too, with its correct digit in the WRONG place.
      phase: 'deduce',
      slots: [null, null, null],
      crossEliminated: true,
      highlight: ['0-0', '1-0'],
      solved: false,
      caption: t(
        'But 392 also has 3 in the first spot — and its 1 correct digit is in the WRONG spot. 3 cannot be right here and wrong there.',
        'Tapi 392 juga punya 3 di tempat pertama — dan 1 angka benarnya di tempat SALAH. 3 tak bisa benar di sini tetapi salah di sana.',
      ),
      hold: 2800,
      result: false,
    },
    {
      // 4c — and 3 would over-fill 753's count (it would be 3 correct, not 2).
      phase: 'deduce',
      slots: [null, null, null],
      crossEliminated: true,
      highlight: ['2-0', '2-1', '2-2'],
      solved: false,
      caption: t(
        'And if 3 were correct, 753 would have 7, 5 AND 3 — that is 3 correct, but 753 says only 2.',
        'Dan jika 3 benar, 753 akan punya 7, 5, DAN 3 — itu 3 angka benar, padahal 753 cuma 2.',
      ),
      hold: 2800,
      result: false,
    },
    {
      // 4d — conclusion: cross out 3; 753's two correct are 5 and 7; 347 places 7 last.
      phase: 'place',
      slots: [null, null, p2],
      crossEliminated: true,
      extraCrossed: ['3'],
      highlight: ['0-2', '2-0', '2-1'],
      solved: false,
      caption: t(
        'So 3 is crossed out. The 2 correct in 753 are 5 and 7, and 347 puts 7 in the last spot.',
        'Jadi 3 dicoret. Dua angka benar di 753 adalah 5 dan 7, dan 347 menaruh 7 di tempat terakhir.',
      ),
      hold: 2600,
      result: false,
    },
    {
      // 392 row index 1: 1 correct, wrong place -> 2 (col2 in the clue) but in 2nd place in code.
      phase: 'place',
      slots: [null, p1, p2],
      crossEliminated: true,
      extraCrossed: ['3'],
      highlight: ['1-2'],
      solved: false,
      caption: t(
        '392 has 1 correct in the wrong place: it is 2. The clue puts 2 last, so 2 goes in the middle.',
        '392 punya 1 angka benar di tempat salah: yaitu 2. Petunjuk menaruh 2 di akhir, jadi 2 di tengah.',
      ),
      hold: 2700,
      result: false,
    },
    {
      // Place 5 in the first slot to complete 527.
      phase: 'place',
      slots: [p0, p1, p2],
      crossEliminated: true,
      extraCrossed: ['3'],
      highlight: [],
      solved: false,
      caption: t(
        'With 7 last and 2 in the middle, 5 takes the first spot: 5, 2, 7.',
        'Dengan 7 di akhir dan 2 di tengah, 5 mengisi tempat pertama: 5, 2, 7.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      slots: [p0, p1, p2],
      crossEliminated: true,
      extraCrossed: ['3'],
      highlight: [],
      solved: true,
      caption: t(`The code is ${LOCK_CODE_G2}.`, `Kodenya adalah ${LOCK_CODE_G2}.`),
      hold: 0,
      result: true,
    },
  ]

  return { code: LOCK_CODE_G2, steps, finalIndex: steps.length - 1 }
}
