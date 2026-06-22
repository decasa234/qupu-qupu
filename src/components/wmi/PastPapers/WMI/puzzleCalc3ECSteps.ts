// IKMC-2021-Ecolier-Q3 — storyboard for the puzzle-piece calculation explainer.
//
// The question: four jigsaw puzzle pieces each carry part of a calculation.
// When assembled into a rectangle (left→right) they read: 12 + 3 = ?
// What is the result?  Answer: B = 15.
//
// Teaching walk, one idea per beat:
//   0. intro     — show the four scattered pieces; state the task.
//   1. identify  — highlight all 4 pieces; name what each carries.
//   2. assemble  — show pieces joined into the rectangle: "1 2 + 3".
//   3. read      — the rectangle reads "12 + 3".
//   4. compute   — reveal "= 15"; answer B.
//
// Pure builder: (lang) → storyboard. No Math.random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PuzzleCalc3ECPhase =
  | 'intro'
  | 'identify'
  | 'assemble'
  | 'read'
  | 'compute'

export interface PuzzleCalc3ECBeat {
  /** Teaching phase. */
  phase: PuzzleCalc3ECPhase
  /** Show pieces assembled (joined) vs scattered. */
  showAssembled: boolean
  /** Which piece keys to highlight (A/B/C/D). */
  highlightPieces: string[] | null
  /** Show "= 15" beside the assembled rect. */
  showResult: boolean
  /** Arithmetic chip text ('' = hidden). */
  equation: string
  /** Caption. */
  caption: string
  /** Auto-hold in ms (0 = manual / final). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface PuzzleCalc3ECStoryboard {
  steps: PuzzleCalc3ECBeat[]
  finalIndex: number
}

export function buildPuzzleCalc3ECSteps(lang: Lang): PuzzleCalc3ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PuzzleCalc3ECBeat[] = [
    // Beat 0 — intro: four scattered pieces, state the goal
    {
      phase: 'intro',
      showAssembled: false,
      highlightPieces: null,
      showResult: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Four puzzle pieces each carry part of a calculation. Assemble them into a rectangle to find the calculation.',
        'Empat keping puzzle membawa bagian dari sebuah perhitungan. Susun menjadi persegi panjang untuk menemukan perhitungannya.',
      ),
    },

    // Beat 1 — identify: highlight all pieces, name what each carries
    {
      phase: 'identify',
      showAssembled: false,
      highlightPieces: ['A', 'B', 'C', 'D'],
      showResult: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The pieces carry: "1", "2", "+", "3". The jigsaw connectors tell us the order.',
        'Keping-keping membawa: "1", "2", "+", "3". Konektor puzzle memberi tahu urutan pemasangannya.',
      ),
    },

    // Beat 2 — assemble: show pieces joined into the rectangle
    {
      phase: 'assemble',
      showAssembled: true,
      highlightPieces: null,
      showResult: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Fit them together left-to-right: the tabs and notches connect "1" → "2" → "+" → "3".',
        'Susun dari kiri ke kanan: tab dan takik menyambung "1" → "2" → "+" → "3".',
      ),
    },

    // Beat 3 — read: highlight the left two pieces forming "12"
    {
      phase: 'read',
      showAssembled: true,
      highlightPieces: ['A', 'B'],
      showResult: false,
      equation: '12 + 3',
      hold: 2400,
      result: false,
      caption: t(
        'Reading the rectangle: pieces "1" and "2" together form the number 12. The full calculation is 12 + 3.',
        'Membaca persegi panjang: keping "1" dan "2" bersama-sama membentuk angka 12. Perhitungan lengkapnya adalah 12 + 3.',
      ),
    },

    // Beat 4 — compute: reveal = 15, answer B
    {
      phase: 'compute',
      showAssembled: true,
      highlightPieces: null,
      showResult: true,
      equation: '12 + 3 = 15',
      hold: 0,
      result: true,
      caption: t(
        '12 + 3 = 15 → answer B.',
        '12 + 3 = 15 → jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
