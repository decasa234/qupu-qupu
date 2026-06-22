// diceRoll17ECSteps.ts
// IKMC-20-EC-Q17 — Storyboard for the dice-rolling explainer.
//
// The question: a standard die (opposite faces sum to 7) starts on square 1
// with top=1, front=2, right=3. It rolls right through 6 squares (5 rolls).
// Find the total dots on the three visible "?" faces at square 6.
//
// Teaching walk, one idea per beat:
//   0. intro       — show the static scene; state the standard-die rule (opp. faces = 7).
//   1. track       — highlight the 5 rightward rolls; "we need to track the top & right faces."
//   2. roll-1      — Die reaches square 2: top=4, right=1, front=2.
//   3. roll-2      — Die reaches square 3: top=6, right=4, front=2.
//   4. roll-3      — Die reaches square 4: top=3, right=6, front=2.
//   5. roll-4      — Die reaches square 5: top=1, right=3, front=2.
//   6. roll-5      — Die reaches square 6: top=4, right=1, front=2. Reveal the ? faces.
//   7. sum         — 4 + 2 + 1 = 7. Answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type DicePhase = 'intro' | 'track' | 'roll-1' | 'roll-2' | 'roll-3' | 'roll-4' | 'roll-5' | 'sum'

export interface DiceBeat {
  phase: DicePhase
  /** Which square (1-indexed) to highlight — 0 = none */
  activeSquare: number
  /** Show revealed values (top, front, right) on last die — empty string = show "?" */
  revealTop: string
  revealFront: string
  revealRight: string
  /** Arithmetic equation to show below the figure; '' to hide */
  equation: string
  /** Caption text */
  caption: string
  /** Auto-hold in ms (0 = final / manual) */
  hold: number
  /** True only on the result beat */
  result: boolean
}

export interface DiceStoryboard {
  steps: DiceBeat[]
  finalIndex: number
}

export function buildDiceRoll17ECSteps(lang: Lang): DiceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiceBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeSquare: 1,
      revealTop: '?', revealFront: '?', revealRight: '?',
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'A standard die: opposite faces always sum to 7  (1↔6, 2↔5, 3↔4).  The die starts on square 1 with top=1, front=2, right=3.',
        'Dadu standar: sisi berhadapan selalu berjumlah 7 (1↔6, 2↔5, 3↔4).  Dadu dimulai di kotak 1 dengan atas=1, depan=2, kanan=3.',
      ),
    },

    // Beat 1 — explain what we need to track
    {
      phase: 'track',
      activeSquare: 0,
      revealTop: '?', revealFront: '?', revealRight: '?',
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Each rightward roll: the left face rises to the top, the top face moves right, the right face drops to the bottom.  The front face stays the same (=2).',
        'Setiap guliran ke kanan: sisi kiri naik ke atas, sisi atas bergerak ke kanan, sisi kanan turun ke bawah. Sisi depan tetap sama (=2).',
      ),
    },

    // Beat 2 — Roll 1 → square 2
    {
      phase: 'roll-1',
      activeSquare: 2,
      revealTop: '?', revealFront: '?', revealRight: '?',
      equation: 'Roll 1: left(4)→top, top(1)→right, right(3)→bot',
      hold: 2200,
      result: false,
      caption: t(
        'Square 2: top=4, front=2, right=1.',
        'Kotak 2: atas=4, depan=2, kanan=1.',
      ),
    },

    // Beat 3 — Roll 2 → square 3
    {
      phase: 'roll-2',
      activeSquare: 3,
      revealTop: '?', revealFront: '?', revealRight: '?',
      equation: 'Roll 2: left(6)→top, top(4)→right, right(1)→bot',
      hold: 2200,
      result: false,
      caption: t(
        'Square 3: top=6, front=2, right=4.',
        'Kotak 3: atas=6, depan=2, kanan=4.',
      ),
    },

    // Beat 4 — Roll 3 → square 4
    {
      phase: 'roll-3',
      activeSquare: 4,
      revealTop: '?', revealFront: '?', revealRight: '?',
      equation: 'Roll 3: left(3)→top, top(6)→right, right(4)→bot',
      hold: 2200,
      result: false,
      caption: t(
        'Square 4: top=3, front=2, right=6.',
        'Kotak 4: atas=3, depan=2, kanan=6.',
      ),
    },

    // Beat 5 — Roll 4 → square 5
    {
      phase: 'roll-4',
      activeSquare: 5,
      revealTop: '?', revealFront: '?', revealRight: '?',
      equation: 'Roll 4: left(1)→top, top(3)→right, right(6)→bot',
      hold: 2200,
      result: false,
      caption: t(
        'Square 5: top=1, front=2, right=3.',
        'Kotak 5: atas=1, depan=2, kanan=3.',
      ),
    },

    // Beat 6 — Roll 5 → square 6 (final) — reveal the faces
    {
      phase: 'roll-5',
      activeSquare: 6,
      revealTop: '4', revealFront: '2', revealRight: '1',
      equation: 'Roll 5: left(4)→top, top(1)→right, right(3)→bot',
      hold: 2400,
      result: false,
      caption: t(
        'Square 6 (final): top=4, front=2, right=1.  Now add the three ? faces.',
        'Kotak 6 (akhir): atas=4, depan=2, kanan=1.  Sekarang jumlahkan ketiga sisi bertanda ?.',
      ),
    },

    // Beat 7 — sum → answer
    {
      phase: 'sum',
      activeSquare: 6,
      revealTop: '4', revealFront: '2', revealRight: '1',
      equation: '4 + 2 + 1 = 7',
      hold: 0,
      result: true,
      caption: t(
        '4 + 2 + 1 = 7 — answer B.',
        '4 + 2 + 1 = 7 — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
