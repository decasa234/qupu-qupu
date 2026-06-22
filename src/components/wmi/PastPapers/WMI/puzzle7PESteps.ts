// IKMC-22-PE-Q7 — storyboard for the puzzle-assembly animation.
//
// The question: Peter puts 4 puzzle pieces together to make a square.
// Which picture can he make? Answer: B (yellow crescent moon on blue).
//
// Key insight: Each piece has a blue body with yellow and white shapes.
// When the 4 pieces are assembled:
//   - the white circular cutout from pieces 1 and 2 form a full white circle
//   - the yellow shape peeks around that circle forming a crescent moon
//
// Teaching walk, one idea per beat:
//   0. intro     — show the 4 separate pieces; identify the yellow and white shapes.
//   1. yellow    — notice each piece has yellow artwork; yellow parts will combine.
//   2. white     — notice the white circle notch shared across pieces 1 & 2.
//   3. crescent  — when assembled, yellow around the white circle = crescent moon.
//   4. eliminate — eliminate A (half-disc), C (full circle), D (teardrop), E (semi).
//   5. result    — the assembled square shows a crescent moon → answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Puzzle7Phase =
  | 'intro'
  | 'yellow'
  | 'white'
  | 'crescent'
  | 'eliminate'
  | 'result'

export interface Puzzle7Beat {
  phase: Puzzle7Phase
  /** Which option letter is highlighted/circled for elimination (or null). */
  highlightOption: string | null
  /** True when highlighting the option as CORRECT (green). */
  isCorrect: boolean
  /** True when highlighting the option as WRONG (red/strikethrough). */
  isWrong: boolean
  /** Equation / label shown in the animation. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Puzzle7Storyboard {
  steps: Puzzle7Beat[]
  finalIndex: number
}

export function buildPuzzle7PESteps(lang: Lang): Puzzle7Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Puzzle7Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightOption: null,
      isCorrect: false,
      isWrong: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Peter has 4 puzzle pieces. Each is a blue square with yellow and white artwork.',
        'Peter punya 4 potongan puzzle. Masing-masing adalah persegi biru dengan gambar kuning dan putih.',
      ),
    },

    // Beat 1 — notice yellow shapes
    {
      phase: 'yellow',
      highlightOption: null,
      isCorrect: false,
      isWrong: false,
      equation: t('yellow shapes', 'bentuk kuning'),
      hold: 2200,
      result: false,
      caption: t(
        'Each piece shows part of a yellow shape. When joined, the yellow parts meet.',
        'Setiap potongan menampilkan sebagian bentuk kuning. Saat disambung, bagian kuning bertemu.',
      ),
    },

    // Beat 2 — notice white circle
    {
      phase: 'white',
      highlightOption: null,
      isCorrect: false,
      isWrong: false,
      equation: t('white circle', 'lingkaran putih'),
      hold: 2200,
      result: false,
      caption: t(
        'Pieces 1 and 2 each have a white curved cutout. Together they form a complete white circle.',
        'Potongan 1 dan 2 masing-masing punya lekukan putih. Bersama-sama membentuk lingkaran putih penuh.',
      ),
    },

    // Beat 3 — crescent = yellow around white circle
    {
      phase: 'crescent',
      highlightOption: 'B',
      isCorrect: false,
      isWrong: false,
      equation: t('yellow − white = crescent', 'kuning − putih = bulan sabit'),
      hold: 2400,
      result: false,
      caption: t(
        'Yellow surrounding the white circle = a crescent moon shape. Look for that in the options.',
        'Kuning yang mengelilingi lingkaran putih = bentuk bulan sabit. Cari itu di pilihan jawaban.',
      ),
    },

    // Beat 4 — eliminate wrong options
    {
      phase: 'eliminate',
      highlightOption: null,
      isCorrect: false,
      isWrong: false,
      equation: t('A,C,D,E ✗', 'A,C,D,E ✗'),
      hold: 2400,
      result: false,
      caption: t(
        'A shows a half-disc, C a full circle, D a teardrop, E a semi-circle — none match the crescent.',
        'A menunjukkan setengah cakram, C lingkaran penuh, D tetesan, E setengah lingkaran — tidak ada yang cocok dengan bulan sabit.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlightOption: 'B',
      isCorrect: true,
      isWrong: false,
      equation: 'B ✓',
      hold: 0,
      result: true,
      caption: t(
        'Option B shows the crescent moon — that is the square Peter can make. Answer B.',
        'Pilihan B menunjukkan bulan sabit — itulah persegi yang bisa dibuat Peter. Jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
