// Storyboard for WMI-24F3A-Q22 (2024 Grade 3 Final).
//
// Six face-down number cards 1,1,2,2,3,3 hide behind labelled cards A..F.
// Four players each flip two; flipping a matching pair WINS:
//   Ava   A=2, E=3  (Lose)   Bella  A, C  (Lose)
//   Cindy A, F      (Lose)   Donna  C, D  (Win)
//
// We deduce one card per beat, revealing it through the CardLayout24G3 primitive,
// and assemble the 6-digit number ABCDEF (= 221133). Every digit is read from
// SOLUTION so the storyboard can never drift from the static figure / answer.
//
// Pure function (params + lang) -> ordered beats. Deterministic, SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { POSITIONS, SOLUTION, ANSWER } from './CardLayout24G3Illustration'
import type { Position } from './CardLayout24G3Illustration'

export interface CardLayoutStep {
  caption: string
  /** Cards whose hidden digit is shown so far this beat (cumulative). */
  reveal: Position[]
  /** Letters tinted blue for the player being discussed this beat. */
  pickBlue: Position[]
  /** Letters tinted orange for the player being discussed this beat. */
  pickOrange: Position[]
  /** The card pinned down on this beat (null on intro / summary). */
  decide: Position | null
  /** The running 6-char readout, '?' for cards not yet decided. */
  readout: string
  /** True only on the final winning beat. */
  result: boolean
  /** Hold time in ms; the winner lands at 0, deductions linger so the logic reads. */
  hold: number
}

export interface CardLayoutStoryboard {
  answer: string
  steps: CardLayoutStep[]
  finalIndex: number
}

/** Build the running readout: SOLUTION digit for decided letters, '?' otherwise. */
function readoutFor(decided: Set<Position>): string {
  return POSITIONS.map((p) => (decided.has(p) ? String(SOLUTION[p]) : '?')).join('')
}

export function buildCardLayout24G3Steps(lang: Lang): CardLayoutStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const decided = new Set<Position>()
  const steps: CardLayoutStep[] = []

  // Order in which we pin the cards down (one per beat): A, E, C, D, F, B.
  // Each push reads its digit from SOLUTION so nothing is hardcoded twice.
  const a = SOLUTION.A // 2
  const e = SOLUTION.E // 3
  const c = SOLUTION.C // 1
  const f = SOLUTION.F // 3
  const b = SOLUTION.B // 2

  // 0) Goal — six cards still face-down.
  steps.push({
    caption: t(
      'Six hidden cards are 1,1,2,2,3,3. A match wins. Find each card!',
      'Enam kartu tersembunyi: 1,1,2,2,3,3. Pasangan sama menang. Cari tiap kartu!',
    ),
    reveal: [],
    pickBlue: [],
    pickOrange: [],
    decide: null,
    readout: readoutFor(decided),
    hold: 2600,
    result: false,
  })

  // 1) Ava flipped A = 2.
  decided.add('A')
  steps.push({
    caption: t(`Ava turned A and E. A shows ${a}, so A = ${a}.`, `Ava membalik A dan E. A menunjukkan ${a}, jadi A = ${a}.`),
    reveal: ['A'],
    pickBlue: ['A'],
    pickOrange: ['E'],
    decide: 'A',
    readout: readoutFor(decided),
    hold: 2200,
    result: false,
  })

  // 2) Ava also flipped E = 3 (and lost, since 2 != 3).
  decided.add('E')
  steps.push({
    caption: t(
      `E shows ${e}, so E = ${e}. ${a} ≠ ${e}, Ava loses — but A and E are pinned.`,
      `E menunjukkan ${e}, jadi E = ${e}. ${a} ≠ ${e}, Ava kalah — tapi A dan E sudah pasti.`,
    ),
    reveal: ['A', 'E'],
    pickBlue: ['A', 'E'],
    pickOrange: [],
    decide: 'E',
    readout: readoutFor(decided),
    hold: 2400,
    result: false,
  })

  // 3) Donna won with C and D, so C = D (the equal pair).
  steps.push({
    caption: t(
      'Donna won with C and D — a match! So C = D, an equal pair.',
      'Donna menang dengan C dan D — cocok! Jadi C = D, sepasang sama.',
    ),
    reveal: ['A', 'E'],
    pickBlue: ['C', 'D'],
    pickOrange: [],
    decide: null,
    readout: readoutFor(decided),
    hold: 2300,
    result: false,
  })

  // 4) Bella lost with A(=2) and C, so C != 2. The only equal pair left is the
  //    two 1s, so C = D = 1.
  decided.add('C')
  decided.add('D')
  steps.push({
    caption: t(
      `Bella lost with A=${a} and C, so C ≠ ${a}. The only equal pair left is the two 1s → C = D = ${c}.`,
      `Bella kalah dengan A=${a} dan C, jadi C ≠ ${a}. Pasangan sama satu-satunya yang tersisa adalah dua angka 1 → C = D = ${c}.`,
    ),
    reveal: ['A', 'E', 'C', 'D'],
    pickBlue: ['C', 'D'],
    pickOrange: ['A'],
    decide: 'C',
    readout: readoutFor(decided),
    hold: 2500,
    result: false,
  })

  // 5) Remaining digits {2,3} go to B and F. Cindy lost with A(=2) and F, so F != 2 -> F = 3.
  decided.add('F')
  steps.push({
    caption: t(
      `Now 2 and 3 are left for B and F. Cindy lost with A=${a} and F, so F ≠ ${a} → F = ${f}.`,
      `Sekarang 2 dan 3 tersisa untuk B dan F. Cindy kalah dengan A=${a} dan F, jadi F ≠ ${a} → F = ${f}.`,
    ),
    reveal: ['A', 'E', 'C', 'D', 'F'],
    pickBlue: ['F'],
    pickOrange: ['A'],
    decide: 'F',
    readout: readoutFor(decided),
    hold: 2400,
    result: false,
  })

  // 6) Last card: B must be the leftover 2. Reveal everything → 221133.
  decided.add('B')
  steps.push({
    caption: t(
      `B is the last digit left → B = ${b}. Read A to F: ${ANSWER}.`,
      `B adalah angka terakhir yang tersisa → B = ${b}. Baca A sampai F: ${ANSWER}.`,
    ),
    reveal: [...POSITIONS],
    pickBlue: [],
    pickOrange: [],
    decide: 'B',
    readout: ANSWER,
    hold: 0,
    result: true,
  })

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
