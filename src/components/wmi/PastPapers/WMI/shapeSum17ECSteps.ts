// IKMC-2019-Ecolier-Q17 — storyboard for the shape algebra animation.
//
// The question: 3 rows of 3 shapes each, row sums given.
//   Row 1: circle, star, heart = 15
//   Row 2: circle, circle, circle = 12  → circle = 4
//   Row 3: star, heart, heart = 16
//
// Teaching walk, one idea per beat:
//   0. intro   — show static grid with all sums; three shapes, three unknowns.
//   1. circle  — row 2 has three circles: 12 ÷ 3 = 4 → reveal circle = 4.
//   2. star+h  — row 1: 4 + star + heart = 15 → star + heart = 11.
//   3. row3    — row 3: star + 2 × heart = 16; subtract row-1 result → heart = 5.
//   4. star    — star = 11 − 5 = 6 → result beat.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ShapePhaseId = 'intro' | 'circle' | 'star-plus-heart' | 'heart' | 'star'

export interface ShapeSum17ECBeat {
  phase: ShapePhaseId
  /** Row to wash with amber highlight (0-based), or null. */
  highlightRow: number | null
  /** Shapes with their solved values to overlay inside the grid cells. */
  revealed: Record<string, number>
  /** Which row totals to highlight green (by index 0-2). */
  highlightTotals: boolean[]
  /** Equation pill text ('' to hide). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the last beat. */
  result: boolean
}

export interface ShapeSum17ECStoryboard {
  steps: ShapeSum17ECBeat[]
  finalIndex: number
}

export function buildShapeSum17ECSteps(lang: Lang): ShapeSum17ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeSum17ECBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightRow: null,
      revealed: {},
      highlightTotals: [false, false, false],
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Each shape stands for a different number. Three rows, three row sums — let\'s solve shape by shape.',
        'Setiap bentuk mewakili angka yang berbeda. Tiga baris, tiga jumlah baris — mari selesaikan satu per satu.',
      ),
    },

    // Beat 1 — circle = 4
    {
      phase: 'circle',
      highlightRow: 1,
      revealed: { circle: 4 },
      highlightTotals: [false, true, false],
      equation: t('12 ÷ 3 = 4', '12 ÷ 3 = 4'),
      hold: 2400,
      result: false,
      caption: t(
        'Row 2 has three identical circles adding to 12.  12 ÷ 3 = 4, so circle = 4.',
        'Baris 2 memiliki tiga lingkaran yang sama berjumlah 12.  12 ÷ 3 = 4, jadi lingkaran = 4.',
      ),
    },

    // Beat 2 — star + heart = 11
    {
      phase: 'star-plus-heart',
      highlightRow: 0,
      revealed: { circle: 4 },
      highlightTotals: [true, false, false],
      equation: t('15 − 4 = 11', '15 − 4 = 11'),
      hold: 2400,
      result: false,
      caption: t(
        'Row 1: circle + star + heart = 15.  Circle is 4, so star + heart = 15 − 4 = 11.',
        'Baris 1: lingkaran + bintang + hati = 15.  Lingkaran = 4, jadi bintang + hati = 15 − 4 = 11.',
      ),
    },

    // Beat 3 — heart = 5
    {
      phase: 'heart',
      highlightRow: 2,
      revealed: { circle: 4, heart: 5 },
      highlightTotals: [false, false, true],
      equation: t('16 − 11 = 5', '16 − 11 = 5'),
      hold: 2400,
      result: false,
      caption: t(
        'Row 3: star + 2 × heart = 16.  Star + heart = 11, so the extra heart = 16 − 11 = 5.  Heart = 5.',
        'Baris 3: bintang + 2 × hati = 16.  Bintang + hati = 11, jadi hati tambahan = 16 − 11 = 5.  Hati = 5.',
      ),
    },

    // Beat 4 — star = 6 (result)
    {
      phase: 'star',
      highlightRow: null,
      revealed: { circle: 4, heart: 5, star: 6 },
      highlightTotals: [true, true, true],
      equation: t('11 − 5 = 6', '11 − 5 = 6'),
      hold: 0,
      result: true,
      caption: t(
        'Star + heart = 11, heart = 5 → star = 11 − 5 = 6.  Answer E.',
        'Bintang + hati = 11, hati = 5 → bintang = 11 − 5 = 6.  Jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
