// Storyboard for WMI-22F1A-Q14 (Grade 1) — order four children by height.
//
// Clues, applied ONE per beat:
//   (1) Dan is the tallest.
//   (2) Pan is taller than Ken.
//   (3) Ken is taller than Ann.
// Deduction → tallest to shortest: Dan, Pan, Ken, Ann → answer B.
//
// `heights` is a relative-height map fed straight into the illustrator's
// <HeightBars heights/>: 4 = tallest, 1 = shortest. We start everyone equal
// (all 2, "unknown") and let each clue push a bar up or down until the final
// order {Dan:4, Pan:3, Ken:2, Ann:1} emerges.

import type { Lang } from '../concepts/explainers/makeTenSteps'

export const HEIGHT_ORDER_ANSWER = 'Dan - Pan - Ken - Ann'
export const HEIGHT_ORDER_CHOICE = 'B'

export type ChildName = 'Dan' | 'Pan' | 'Ken' | 'Ann'
export type HeightMap = Record<ChildName, number>

export type HeightOrderPhase = 'unknown' | 'clue1' | 'clue2' | 'clue3' | 'result'

export interface HeightOrderStep {
  phase: HeightOrderPhase
  /** Relative heights 1 (shortest) → 4 (tallest), fed to <HeightBars />. */
  heights: HeightMap
  /** Children touched by THIS clue (so the explainer can ring them). */
  focus: ChildName[]
  caption: string
  hold: number
  result: boolean
}

export interface HeightOrderStoryboard {
  answer: string
  /** The final tallest→shortest order, for the result strip. */
  order: ChildName[]
  steps: HeightOrderStep[]
  finalIndex: number
}

export function buildHeightOrder22G1Steps(lang: Lang): HeightOrderStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Everyone starts at the same "we don't know yet" height.
  const start: HeightMap = { Dan: 2, Pan: 2, Ken: 2, Ann: 2 }
  // Clue 1: Dan goes to the top, the other three drop a little so Dan reads tallest.
  const afterClue1: HeightMap = { Dan: 4, Pan: 2, Ken: 2, Ann: 2 }
  // Clue 2: Pan rises above Ken (Pan 3, Ken 2), Ann still tucked at 2.
  const afterClue2: HeightMap = { Dan: 4, Pan: 3, Ken: 2, Ann: 2 }
  // Clue 3: Ann becomes the shortest. Final order locks in.
  const afterClue3: HeightMap = { Dan: 4, Pan: 3, Ken: 2, Ann: 1 }

  const steps: HeightOrderStep[] = [
    {
      phase: 'unknown',
      heights: start,
      focus: [],
      hold: 2300,
      result: false,
      caption: t(
        'Four kids: Dan, Pan, Ken, Ann. We do not know who is tallest yet — so all the bars start the same. Let us use the clues one at a time.',
        'Empat anak: Dan, Pan, Ken, Ann. Kita belum tahu siapa yang paling tinggi — jadi semua batang mulai sama. Mari pakai petunjuk satu per satu.',
      ),
    },
    {
      phase: 'clue1',
      heights: afterClue1,
      focus: ['Dan'],
      hold: 2200,
      result: false,
      caption: t(
        'Clue 1: Dan is the TALLEST. So Dan goes all the way to the top.',
        'Petunjuk 1: Dan paling TINGGI. Jadi Dan naik ke paling atas.',
      ),
    },
    {
      phase: 'clue2',
      heights: afterClue2,
      focus: ['Pan', 'Ken'],
      hold: 2200,
      result: false,
      caption: t(
        'Clue 2: Pan is taller than Ken. So Pan stands above Ken — Pan goes higher.',
        'Petunjuk 2: Pan lebih tinggi dari Ken. Jadi Pan berdiri di atas Ken — Pan naik lebih tinggi.',
      ),
    },
    {
      phase: 'clue3',
      heights: afterClue3,
      focus: ['Ken', 'Ann'],
      hold: 2200,
      result: false,
      caption: t(
        'Clue 3: Ken is taller than Ann. Ann is left under everyone — Ann is the SHORTEST.',
        'Petunjuk 3: Ken lebih tinggi dari Ann. Ann tersisa di bawah semua — Ann paling PENDEK.',
      ),
    },
    {
      phase: 'result',
      heights: afterClue3,
      focus: ['Dan', 'Pan', 'Ken', 'Ann'],
      hold: 0,
      result: true,
      caption: t(
        `Tallest to shortest: Dan, Pan, Ken, Ann. The answer is ${HEIGHT_ORDER_CHOICE}.`,
        `Tertinggi ke terpendek: Dan, Pan, Ken, Ann. Jawabannya ${HEIGHT_ORDER_CHOICE}.`,
      ),
    },
  ]

  return {
    answer: HEIGHT_ORDER_ANSWER,
    order: ['Dan', 'Pan', 'Ken', 'Ann'],
    steps,
    finalIndex: steps.length - 1,
  }
}
