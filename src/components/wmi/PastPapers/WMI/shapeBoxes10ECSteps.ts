/**
 * IKMC-21-EC-Q10 — step builder for the constraint-elimination explainer.
 *
 * Strategy: the diamond (belah ketupat) only appears in box 4, so box 4 MUST
 * pick the diamond. The animation walks through each box, highlights it, notes
 * which shapes it contains, and ends with box 4 being forced.
 *
 * Beats (10 total):
 *   0  — goal statement; no box lit
 *   1  — box 1: star, pentagon → can contribute star or pentagon
 *   2  — box 2: star, circle, pentagon → nothing new forced yet
 *   3  — box 3: circle, pentagon, triangle → can contribute triangle
 *   4  — box 4: star, circle, diamond → DIAMOND is unique here!
 *   5  — box 5: star, circle, triangle → nothing new forced
 *   6  — deduction: only box 4 has diamond → box 4 picks diamond
 *   7  — reveal: highlight diamond orange; answer E confirmed
 */

export type Lang = 'en' | 'id'

export type BoxPhase =
  | 'goal'
  | 'scanBox1'
  | 'scanBox2'
  | 'scanBox3'
  | 'scanBox4'
  | 'scanBox5'
  | 'deduction'
  | 'result'

export interface ShapeBoxesStep {
  phase: BoxPhase
  /** 0-based index of the lit box (null = none). */
  litBox: number | null
  /** Whether to draw box-4's diamond in orange. */
  highlightDiamond: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ShapeBoxesStory {
  steps: ShapeBoxesStep[]
  finalIndex: number
}

export function buildShapeBoxes10ECSteps(lang: Lang): ShapeBoxesStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeBoxesStep[] = [
    // Beat 0 — introduce the goal
    {
      phase: 'goal',
      litBox: null,
      highlightDiamond: false,
      hold: 2000,
      result: false,
      caption: t(
        'Pick 1 shape from each box — all 5 picks must be different shapes.',
        'Pilih 1 bentuk dari tiap kotak — semua 5 pilihan harus bentuk yang berbeda.',
      ),
    },

    // Beat 1 — scan box 1
    {
      phase: 'scanBox1',
      litBox: 0,
      highlightDiamond: false,
      hold: 1800,
      result: false,
      caption: t(
        'Box 1 holds a star and a pentagon. It can provide either one.',
        'Kotak 1 berisi bintang dan segi lima. Bisa menyediakan salah satunya.',
      ),
    },

    // Beat 2 — scan box 2
    {
      phase: 'scanBox2',
      litBox: 1,
      highlightDiamond: false,
      hold: 1800,
      result: false,
      caption: t(
        'Box 2 has a star, circle, and pentagon — multiple options here.',
        'Kotak 2 punya bintang, lingkaran, dan segi lima — ada beberapa pilihan.',
      ),
    },

    // Beat 3 — scan box 3
    {
      phase: 'scanBox3',
      litBox: 2,
      highlightDiamond: false,
      hold: 1800,
      result: false,
      caption: t(
        'Box 3 has a circle, pentagon, and triangle. It could supply the triangle.',
        'Kotak 3 punya lingkaran, segi lima, dan segitiga. Bisa menyediakan segitiga.',
      ),
    },

    // Beat 4 — scan box 4 (diamond spotted!)
    {
      phase: 'scanBox4',
      litBox: 3,
      highlightDiamond: false,
      hold: 2200,
      result: false,
      caption: t(
        'Box 4 has a star, circle, and… a diamond! Is the diamond in any other box?',
        'Kotak 4 punya bintang, lingkaran, dan… belah ketupat! Apakah belah ketupat ada di kotak lain?',
      ),
    },

    // Beat 5 — scan box 5 (no diamond)
    {
      phase: 'scanBox5',
      litBox: 4,
      highlightDiamond: false,
      hold: 1800,
      result: false,
      caption: t(
        'Box 5 has a star, circle, and triangle — NO diamond.',
        'Kotak 5 punya bintang, lingkaran, dan segitiga — TIDAK ada belah ketupat.',
      ),
    },

    // Beat 6 — deduction: diamond is unique to box 4
    {
      phase: 'deduction',
      litBox: 3,
      highlightDiamond: false,
      hold: 2200,
      result: false,
      caption: t(
        'Diamond only appears in box 4! So box 4 MUST pick the diamond.',
        'Belah ketupat hanya ada di kotak 4! Jadi kotak 4 HARUS memilih belah ketupat.',
      ),
    },

    // Beat 7 — result: highlight the diamond orange
    {
      phase: 'result',
      litBox: 3,
      highlightDiamond: true,
      hold: 0,
      result: true,
      caption: t(
        'Answer E — Sofie must pick the diamond from box 4.',
        'Jawaban E — Sofie harus mengambil belah ketupat dari kotak 4.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
