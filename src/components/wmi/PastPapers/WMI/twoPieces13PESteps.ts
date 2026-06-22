/**
 * IKMC-21-PE-Q13 — storyboard for the puzzle-piece fitting animation.
 *
 * Question: Given two identical Z-shaped pieces (4 squares each = 8 total),
 * which of the five answer figures A–E can you make?  Answer: A.
 *
 * Strategy:
 *   1. Show both pieces; count 4 + 4 = 8 squares.
 *   2. Option B has 9 squares — too many → eliminated.
 *   3. Options C, D, E each have 8 squares but the Z-pieces cannot tile them.
 *   4. Option A has 8 squares and the two Z-pieces fit exactly:
 *        Piece 1 → (0,0)(0,1)(1,1)(1,2)  [top-left Z]
 *        Piece 2 turned 180° → (1,0)(2,0)(2,1)(2,2)  [bottom-right fills the rest]
 *
 * Beat sequence:
 *   0  pieces   — show both Z-pieces; state the rule.
 *   1  count    — count: each has 4 squares → together 4 + 4 = 8.
 *   2  reject_B — B has 9 squares → cannot be made.
 *   3  check_C  — C has 8 squares but the pieces don't tile it → eliminated.
 *   4  check_D  — D has 8 squares but the pieces don't tile it → eliminated.
 *   5  check_E  — E has 8 squares but the pieces don't tile it → eliminated.
 *   6  fit1     — slide piece 1 into A: fills top-left Z.
 *   7  fit2     — turn piece 2 180° and fill the remaining cells.
 *   8  answer   — together they make A!
 *
 * Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.
 */

export type Lang = 'en' | 'id'

export type TwoPieces13Stage =
  | 'pieces'
  | 'count'
  | 'reject_B'
  | 'check_C'
  | 'check_D'
  | 'check_E'
  | 'fit1'
  | 'fit2'
  | 'answer'

export interface TwoPieces13Step {
  stage: TwoPieces13Stage
  caption: string
  hold: number
  result: boolean
}

export interface TwoPieces13Storyboard {
  steps: TwoPieces13Step[]
  finalIndex: number
}

export function buildTwoPieces13PESteps(lang: Lang): TwoPieces13Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TwoPieces13Step[] = [
    {
      stage: 'pieces',
      hold: 1800,
      result: false,
      caption: t(
        'Two Z-shaped pieces. We may slide and turn them — but not break or fold them.',
        'Dua potongan berbentuk Z. Boleh digeser dan diputar — tapi tidak boleh dipotong atau dilipat.',
      ),
    },
    {
      stage: 'count',
      hold: 2000,
      result: false,
      caption: t(
        'Count the squares: each piece has 4 squares. Together: 4 + 4 = 8 squares.',
        'Hitung kotaknya: setiap potongan punya 4 kotak. Bersama: 4 + 4 = 8 kotak.',
      ),
    },
    {
      stage: 'reject_B',
      hold: 2200,
      result: false,
      caption: t(
        'B is a full 3×3 = 9 squares. We only have 8 — squares cannot disappear. B is out.',
        'B adalah 3×3 penuh = 9 kotak. Kita hanya punya 8 — kotak tidak bisa hilang. B gugur.',
      ),
    },
    {
      stage: 'check_C',
      hold: 2000,
      result: false,
      caption: t(
        'C has 8 squares but the Z-pieces cannot tile its top-left gap. C is out.',
        'C punya 8 kotak tapi potongan Z tidak bisa mengisi celah kiri atasnya. C gugur.',
      ),
    },
    {
      stage: 'check_D',
      hold: 2000,
      result: false,
      caption: t(
        'D has 8 squares but the gap is at the bottom-left — the Z-pieces leave an L-gap that cannot be tiled. D is out.',
        'D punya 8 kotak tapi celahnya di kiri bawah — potongan Z meninggalkan celah L yang tidak bisa diisi. D gugur.',
      ),
    },
    {
      stage: 'check_E',
      hold: 2000,
      result: false,
      caption: t(
        'E has 8 squares but the gap is at the bottom-right — the Z-pieces overlap rather than tile. E is out.',
        'E punya 8 kotak tapi celahnya di kanan bawah — potongan Z akan tumpang tindih, bukan mengisi. E gugur.',
      ),
    },
    {
      stage: 'fit1',
      hold: 2100,
      result: false,
      caption: t(
        'Try A! Slide piece 1 into the top-left: it fills cells (0,0)(0,1)(1,1)(1,2).',
        'Coba A! Geser potongan 1 ke kiri atas: mengisi sel (0,0)(0,1)(1,1)(1,2).',
      ),
    },
    {
      stage: 'fit2',
      hold: 2100,
      result: false,
      caption: t(
        'Turn piece 2 around (180°) and slide it in: it fills the remaining 4 cells — no gaps, no overlaps!',
        'Putar potongan 2 (180°) lalu geser masuk: mengisi 4 sel yang tersisa — tanpa celah, tanpa tumpukan!',
      ),
    },
    {
      stage: 'answer',
      hold: 0,
      result: true,
      caption: t(
        'The two Z-pieces fit perfectly into figure A!',
        'Dua potongan Z masuk pas sempurna ke gambar A!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
