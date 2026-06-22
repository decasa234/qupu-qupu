// IKMC-21-PE-Q17 — storyboard for the square-pieces animation.
//
// The question: Mara built a 4×4 square using FOUR of the five shapes shown.
// Which shape was NOT used? Answer: D
//
// Teaching walk, one idea per beat:
//   0. intro    — show the completed 4×4 square; 16 cells total.
//   1. piece A  — highlight A, show it placed in the top-left 2×2 zone.
//   2. piece B  — highlight B, show it placed covering the diamond-square L area.
//   3. piece C  — highlight C, show it placed covering remaining star+square cells.
//   4. piece E  — highlight E, show it placed as the bottom 1×4 row.
//   5. piece D  — D is left over — no space remains; NOT used!
//   6. result   — answer = D (crossed out / red).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId =
  | 'intro'
  | 'pieceA'
  | 'pieceB'
  | 'pieceC'
  | 'pieceE'
  | 'pieceD'
  | 'result'

export interface SquarePiecesBeat {
  phase: PhaseId
  /** Which piece labels are currently highlighted. */
  highlighted: string[]
  /** Whether the "missing" piece D is shown as the answer. */
  showAnswer: boolean
  /** Equation or count chip text; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface SquarePiecesStoryboard {
  steps: SquarePiecesBeat[]
  finalIndex: number
}

export function buildSquarePieces17PESteps(lang: Lang): SquarePiecesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquarePiecesBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlighted: [],
      showAnswer: false,
      equation: '4 × 4 = 16',
      hold: 2400,
      result: false,
      caption: t(
        'The completed square has 4 × 4 = 16 cells. Four pieces cover all 16 cells — one piece is left over.',
        'Persegi yang sudah jadi memiliki 4 × 4 = 16 sel. Empat potongan menutupi semua 16 sel — satu potongan tersisa.',
      ),
    },

    // Beat 1 — piece A fits
    {
      phase: 'pieceA',
      highlighted: ['A'],
      showAnswer: false,
      equation: '4 cells ✓',
      hold: 2200,
      result: false,
      caption: t(
        'Piece A (2×2 block of stars and diamonds) fits perfectly in the top-left corner.',
        'Potongan A (blok 2×2 bintang dan berlian) cocok sempurna di sudut kiri atas.',
      ),
    },

    // Beat 2 — piece B fits
    {
      phase: 'pieceB',
      highlighted: ['B'],
      showAnswer: false,
      equation: '4 cells ✓',
      hold: 2200,
      result: false,
      caption: t(
        'Piece B (L-shape) fits alongside, covering diamonds and squares.',
        'Potongan B (bentuk L) cocok di samping, menutupi berlian dan kotak.',
      ),
    },

    // Beat 3 — piece C fits
    {
      phase: 'pieceC',
      highlighted: ['C'],
      showAnswer: false,
      equation: '4 cells ✓',
      hold: 2200,
      result: false,
      caption: t(
        'Piece C (L-shape) fills in more of the remaining star and square cells.',
        'Potongan C (bentuk L) mengisi lebih banyak sel bintang dan kotak yang tersisa.',
      ),
    },

    // Beat 4 — piece E fits
    {
      phase: 'pieceE',
      highlighted: ['E'],
      showAnswer: false,
      equation: '4 cells ✓',
      hold: 2200,
      result: false,
      caption: t(
        'Piece E (1×4 row of arrows) fills the last row — the square is complete!',
        'Potongan E (baris 1×4 panah) mengisi baris terakhir — persegi sudah lengkap!',
      ),
    },

    // Beat 5 — piece D left over
    {
      phase: 'pieceD',
      highlighted: ['D'],
      showAnswer: false,
      equation: 'No space!',
      hold: 2400,
      result: false,
      caption: t(
        'Piece D cannot fit — the square is already full with A, B, C, and E.',
        'Potongan D tidak bisa masuk — persegi sudah penuh dengan A, B, C, dan E.',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      highlighted: ['D'],
      showAnswer: true,
      equation: 'D → not used',
      hold: 0,
      result: true,
      caption: t(
        'Piece D was NOT used — it is the odd one out. Answer: D.',
        'Potongan D TIDAK digunakan — itulah yang tersisa. Jawaban: D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
