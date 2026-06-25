// SEAMO-22-A-Q10 — storyboard for the column-addition explainer.
//
// Problem: Find 3-digit number ABC such that AA + BB + CC = ABC.
// Key insight: AA = 11A, BB = 11B, CC = 11C → 11(A+B+C) = 100A+10B+C
//   → B + 10C = 89A.  Try A=1: B + 10C = 89 → C=8, B=9 → ABC = 198.
//   Verify: 11 + 99 + 88 = 198. ✓  Answer C.
//
// Animation beats:
//   0. intro     — show the blank column layout; pose the puzzle.
//   1. expand    — rewrite as 11A + 11B + 11C = 100A + 10B + C.
//   2. simplify  — rearrange: B + 10C = 89A.
//   3. try-a     — try A = 1: B + 10C = 89 → C = 8, B = 9.
//   4. verify    — 11 + 99 + 88 = 198. ✓
//   5. result    — ABC = 198 → answer C.

export type Lang = 'en' | 'id'

export type ColAddPhase = 'intro' | 'expand' | 'simplify' | 'try-a' | 'verify' | 'result'

export interface ColAddBeat {
  phase: ColAddPhase
  /** Highlight the A-row in the figure. */
  highlightA: boolean
  /** Highlight the B-row in the figure. */
  highlightB: boolean
  /** Highlight the C-row in the figure. */
  highlightC: boolean
  /** Highlight the result row. */
  highlightResult: boolean
  /** Show the check mark (verify + result beats). */
  showCheck: boolean
  /** Inline equation chip text; '' = hidden. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold ms (0 = final). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface ColAddStoryboard {
  steps: ColAddBeat[]
  finalIndex: number
}

export function buildColAdd22A10Steps(lang: Lang): ColAddStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ColAddBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightA: false,
      highlightB: false,
      highlightC: false,
      highlightResult: false,
      showCheck: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'We need AA + BB + CC = ABC where A, B, C are single digits.',
        'Kita perlu AA + BB + CC = ABC di mana A, B, C adalah digit.',
      ),
    },

    // Beat 1 — expand two-digit representations
    {
      phase: 'expand',
      highlightA: true,
      highlightB: true,
      highlightC: true,
      highlightResult: false,
      showCheck: false,
      equation: '11A + 11B + 11C',
      hold: 2400,
      result: false,
      caption: t(
        'AA = 11A, BB = 11B, CC = 11C — so the sum is 11(A + B + C).',
        'AA = 11A, BB = 11B, CC = 11C — sehingga jumlahnya adalah 11(A + B + C).',
      ),
    },

    // Beat 2 — rearrange
    {
      phase: 'simplify',
      highlightA: false,
      highlightB: false,
      highlightC: false,
      highlightResult: true,
      showCheck: false,
      equation: 'B + 10C = 89A',
      hold: 2400,
      result: false,
      caption: t(
        '11(A+B+C) = 100A + 10B + C rearranges to B + 10C = 89A.',
        '11(A+B+C) = 100A + 10B + C disederhanakan menjadi B + 10C = 89A.',
      ),
    },

    // Beat 3 — try A = 1
    {
      phase: 'try-a',
      highlightA: true,
      highlightB: true,
      highlightC: true,
      highlightResult: false,
      showCheck: false,
      equation: 'A=1 → C=8, B=9',
      hold: 2400,
      result: false,
      caption: t(
        'Try A = 1: B + 10C = 89. With C = 8: B = 9. So A=1, B=9, C=8 → ABC = 198.',
        'Coba A = 1: B + 10C = 89. Dengan C = 8: B = 9. Jadi A=1, B=9, C=8 → ABC = 198.',
      ),
    },

    // Beat 4 — verify
    {
      phase: 'verify',
      highlightA: true,
      highlightB: true,
      highlightC: true,
      highlightResult: true,
      showCheck: true,
      equation: '11 + 99 + 88 = 198 ✓',
      hold: 2200,
      result: false,
      caption: t(
        'Check: AA=11, BB=99, CC=88. Sum = 198. ✓  All three digits A=1, B=9, C=8 match.',
        'Cek: AA=11, BB=99, CC=88. Jumlah = 198. ✓  Ketiga digit A=1, B=9, C=8 cocok.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlightA: false,
      highlightB: false,
      highlightC: false,
      highlightResult: true,
      showCheck: true,
      equation: '198 → C',
      hold: 0,
      result: true,
      caption: t(
        'ABC = 198 — answer C.',
        'ABC = 198 — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
