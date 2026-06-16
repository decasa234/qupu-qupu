import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-24P1A-Q11 (2024 Grade-1 Semifinal). Six jagged half-square pieces (1..6);
// pick the two that fill an empty square exactly. Answer: E ("6 + 6").
//
// Piece 6's cut edge is 180°-rotationally symmetric about the square's centre,
// so a SECOND copy of piece 6 — rotated a half turn — fills the part piece 6
// leaves empty: bump fits notch, notch fits bump, and the straight legs become
// the four sides of the square.
//
// The storyboard walks it one idea per beat: state the goal, lay piece 6 into the
// square (it covers one half, leaving a jagged gap), turn a second piece 6 a half
// turn so its bumps line up with the gap's notches, drop it in to complete the
// square, then read the option ("6 + 6" = E). A short trap beat names why 2 + 6
// (option A) leaves a gap.

export const ANSWER_LETTER = 'E'
export const ANSWER_TEXT = '6 + 6'

export type Q11Phase = 'goal' | 'placeFirst' | 'turnSecond' | 'lock' | 'trap' | 'result'

export interface Q11Step {
  phase: Q11Phase
  /** show the first copy of piece 6 (lower-left half) */
  showFirst: boolean
  /** show the second copy of piece 6 (upper-right half), rotated 180° */
  showSecond: boolean
  /** the second copy is sliding/locking in (vs fully seated) */
  secondSeated: boolean
  /** highlight the completed square (result) */
  complete: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q11Storyboard {
  answerLetter: string
  answerText: string
  steps: Q11Step[]
  finalIndex: number
}

export function buildP24G1Q11Steps(lang: Lang): Q11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q11Step[] = [
    {
      phase: 'goal',
      showFirst: false,
      showSecond: false,
      secondSeated: false,
      complete: false,
      hold: 2100,
      result: false,
      caption: t(
        'Fill the empty square with exactly two of the pieces.',
        'Isi persegi kosong dengan tepat dua potongan.',
      ),
    },
    {
      phase: 'placeFirst',
      showFirst: true,
      showSecond: false,
      secondSeated: false,
      complete: false,
      hold: 2200,
      result: false,
      caption: t(
        'Lay piece 6 in — it covers half and leaves a jagged gap.',
        'Letakkan potongan 6 — ia menutup separuh dan menyisakan celah bergerigi.',
      ),
    },
    {
      phase: 'turnSecond',
      showFirst: true,
      showSecond: true,
      secondSeated: false,
      complete: false,
      hold: 2300,
      result: false,
      caption: t(
        'Turn a SECOND piece 6 a half turn so its bumps face the gap’s notches.',
        'Putar potongan 6 KEDUA setengah putaran agar tonjolannya menghadap takik celah.',
      ),
    },
    {
      phase: 'lock',
      showFirst: true,
      showSecond: true,
      secondSeated: true,
      complete: true,
      hold: 2300,
      result: false,
      caption: t(
        'Bump fits notch, notch fits bump — the square is filled exactly.',
        'Tonjolan masuk takik, takik masuk tonjolan — persegi terisi tepat.',
      ),
    },
    {
      phase: 'trap',
      showFirst: true,
      showSecond: true,
      secondSeated: true,
      complete: true,
      hold: 2200,
      result: false,
      caption: t(
        'Pieces 2 and 6 (option A) do not interlock — they would leave a gap.',
        'Potongan 2 dan 6 (opsi A) tidak saling mengunci — akan menyisakan celah.',
      ),
    },
    {
      phase: 'result',
      showFirst: true,
      showSecond: true,
      secondSeated: true,
      complete: true,
      hold: 0,
      result: true,
      caption: t(
        'Two copies of piece 6 work — 6 + 6, answer E.',
        'Dua salinan potongan 6 berhasil — 6 + 6, jawaban E.',
      ),
    },
  ]

  return {
    answerLetter: ANSWER_LETTER,
    answerText: ANSWER_TEXT,
    steps,
    finalIndex: steps.length - 1,
  }
}
