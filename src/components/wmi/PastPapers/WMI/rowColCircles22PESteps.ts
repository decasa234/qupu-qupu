import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for IKMC-20-PE-Q22 (IKMC 2020 Pre-Ecolier).
//
// Five circles in a plus shape (top, left, CENTER, right, bottom).
// Numbers 1, 2, 3, 4, 5 fill the circles (each exactly once).
// Row sum (left + center + right) = Column sum (top + center + bottom).
//
// KEY INSIGHT (one idea per beat):
//
//   beat 1 (total)    — 1+2+3+4+5 = 15. Label row arms a,b and col arms c,d.
//                        Center = x. Row = x+a+b, Col = x+c+d.
//
//   beat 2 (balance)  — Row = Col means a+b = c+d (center cancels).
//                        So: x + (a+b) + (c+d) = 15  → x + 2(a+b) = 15.
//
//   beat 3 (parity)   — x = 15 − 2(a+b). Since 15 is odd and 2(a+b) is always
//                        even, x MUST be odd. From {1,2,3,4,5} only 1, 3, 5 are odd.
//
//   beat 4 (verify-1) — Center = 1: arm pair sum = (15−1)/2 = 7.
//                        top=2, left=3, right=4, bottom=5:
//                        Row: 3+1+4 = 8; Col: 2+1+5 = 8. ✓
//
//   beat 5 (verify-3) — Center = 3: arm pair sum = (15−3)/2 = 6.
//                        top=1, left=2, right=4, bottom=5:
//                        Row: 2+3+4 = 9; Col: 1+3+5 = 9. ✓
//
//   beat 6 (verify-5) — Center = 5: arm pair sum = (15−5)/2 = 5.
//                        top=2, left=1, right=4, bottom=3:
//                        Row: 1+5+4 = 10; Col: 2+5+3 = 10. ✓
//
//   beat 7 (result)   — All three odd values work → answer E (1, 3 or 5).
//
// Pure builder — deterministic, SSR-safe.

export type RowColPhase =
  | 'total'
  | 'balance'
  | 'parity'
  | 'verify-1'
  | 'verify-3'
  | 'verify-5'
  | 'result'

export interface RowColStep {
  phase: RowColPhase
  /** Center value to show in the circle on verify/result beats; null = show "?". */
  revealCenter: number | null
  /**
   * Arm values [top, left, right, bottom] for verify beats; null = blank arms.
   * Layout matches the cross: top and bottom are column arms, left and right are row arms.
   */
  revealArms: [number, number, number, number] | null
  caption: string
  hold: number
  result: boolean
}

export interface RowColStoryboard {
  steps: RowColStep[]
  finalIndex: number
}

export function buildRowColCircles22PESteps(lang: Lang): RowColStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RowColStep[] = [
    {
      phase: 'total',
      revealCenter: null,
      revealArms: null,
      hold: 2400,
      result: false,
      caption: t(
        '1+2+3+4+5 = 15. Call the center circle x, the two row arms a, b, and the two column arms c, d.',
        '1+2+3+4+5 = 15. Sebut lingkaran tengah x, dua lengan baris a, b, dan dua lengan kolom c, d.',
      ),
    },
    {
      phase: 'balance',
      revealCenter: null,
      revealArms: null,
      hold: 2600,
      result: false,
      caption: t(
        'Row = Col means x+a+b = x+c+d, so a+b = c+d. Then: x + 2×(a+b) = 15.',
        'Baris = Kolom berarti x+a+b = x+c+d, sehingga a+b = c+d. Maka: x + 2×(a+b) = 15.',
      ),
    },
    {
      phase: 'parity',
      revealCenter: null,
      revealArms: null,
      hold: 2600,
      result: false,
      caption: t(
        'x = 15 − 2×(a+b). Since 15 is odd and 2×(a+b) is even, x must be ODD. Odd values in {1–5}: 1, 3, 5.',
        'x = 15 − 2×(a+b). Karena 15 ganjil dan 2×(a+b) genap, x harus GANJIL. Nilai ganjil di {1–5}: 1, 3, 5.',
      ),
    },
    {
      // top=2, left=3, right=4, bottom=5 → row 3+1+4=8, col 2+1+5=8 ✓
      phase: 'verify-1',
      revealCenter: 1,
      revealArms: [2, 3, 4, 5],
      hold: 2400,
      result: false,
      caption: t(
        'Center = 1: arm pairs each sum to 7. Row: 3+1+4 = 8 ✓  Col: 2+1+5 = 8 ✓',
        'Pusat = 1: pasangan lengan masing-masing = 7. Baris: 3+1+4 = 8 ✓  Kolom: 2+1+5 = 8 ✓',
      ),
    },
    {
      // top=1, left=2, right=4, bottom=5 → row 2+3+4=9, col 1+3+5=9 ✓
      phase: 'verify-3',
      revealCenter: 3,
      revealArms: [1, 2, 4, 5],
      hold: 2400,
      result: false,
      caption: t(
        'Center = 3: arm pairs each sum to 6. Row: 2+3+4 = 9 ✓  Col: 1+3+5 = 9 ✓',
        'Pusat = 3: pasangan lengan masing-masing = 6. Baris: 2+3+4 = 9 ✓  Kolom: 1+3+5 = 9 ✓',
      ),
    },
    {
      // top=2, left=1, right=4, bottom=3 → row 1+5+4=10, col 2+5+3=10 ✓
      phase: 'verify-5',
      revealCenter: 5,
      revealArms: [2, 1, 4, 3],
      hold: 2400,
      result: false,
      caption: t(
        'Center = 5: arm pairs each sum to 5. Row: 1+5+4 = 10 ✓  Col: 2+5+3 = 10 ✓',
        'Pusat = 5: pasangan lengan masing-masing = 5. Baris: 1+5+4 = 10 ✓  Kolom: 2+5+3 = 10 ✓',
      ),
    },
    {
      phase: 'result',
      revealCenter: null,
      revealArms: null,
      hold: 0,
      result: true,
      caption: t(
        'Center can be 1, 3 or 5 — any odd number from {1–5}. Answer: E.',
        'Pusat bisa berisi 1, 3, atau 5 — bilangan ganjil mana pun dari {1–5}. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
