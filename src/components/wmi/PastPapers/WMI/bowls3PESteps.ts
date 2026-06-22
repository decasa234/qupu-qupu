// IKMC-23-PE-Q3 — storyboard for the bowl-sum explainer.
// Strategy: add the four numbers in each bowl A→E, compare totals, land on A (28).
//
// Sums (derived from BOWL_DATA so captions never drift):
//   A: 8+7+4+9 = 28  ← largest → ANSWER
//   B: 4+6+7+9 = 26
//   C: 7+9+4+7 = 27  (trap: 2nd largest)
//   D: 9+7+4+4 = 24
//   E: 7+4+9+5 = 25
//
// Beat structure (7 beats):
//   0. Intro  — show all five bowls, prompt "add each bowl"
//   1–5. Per-bowl — show bowl label + addend string + running sum
//   6. Result — highlight A as winner (28 > 27 > 26 > 25 > 24)

import { BOWL_DATA } from './Bowls3PEIllustration'

export type Label = 'A' | 'B' | 'C' | 'D' | 'E'

export interface BowlsStep {
  /** Which bowl is the focus of this beat (undefined on intro/result). */
  focus?: Label
  /** Running sum for the bowl under focus. */
  sum?: number
  /** Addend string shown (e.g. "8 + 7 + 4 + 9"). */
  addString?: string
  caption: string
  hold: number
  /** True only on the final winning beat (green styling). */
  result: boolean
}

export interface BowlsStoryboard {
  answer: Label
  steps: BowlsStep[]
  finalIndex: number
}

const ORDER: Label[] = ['A', 'B', 'C', 'D', 'E']

function computeSum(label: Label): number {
  return BOWL_DATA[label].reduce((acc, b) => acc + b.num, 0)
}

function addString(label: Label): string {
  return BOWL_DATA[label].map((b) => b.num).join(' + ')
}

type Lang = 'en' | 'id'

export function buildBowls3PESteps(lang: Lang): BowlsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer: Label = 'A'

  const steps: BowlsStep[] = []

  // Beat 0: intro
  steps.push({
    hold: 2000,
    result: false,
    caption: t(
      'Add the four numbers in each bowl — find the bowl with the largest total!',
      'Jumlahkan empat angka di setiap mangkuk — temukan mangkuk dengan total terbesar!',
    ),
  })

  // Beats 1–5: one beat per bowl
  for (const label of ORDER) {
    const s = computeSum(label)
    const expr = addString(label)
    const isAnswer = label === answer

    steps.push({
      focus: label,
      sum: s,
      addString: expr,
      hold: isAnswer ? 2400 : 2000,
      result: false,
      caption: t(
        `Bowl ${label}: ${expr} = ${s}`,
        `Mangkuk ${label}: ${expr} = ${s}`,
      ),
    })
  }

  // Beat 6: result
  const winSum = computeSum(answer)
  steps.push({
    focus: answer,
    sum: winSum,
    addString: addString(answer),
    hold: 0,
    result: true,
    caption: t(
      `Bowl ${answer} has the largest sum: ${addString(answer)} = ${winSum}. The answer is ${answer}.`,
      `Mangkuk ${answer} memiliki jumlah terbesar: ${addString(answer)} = ${winSum}. Jawabannya adalah ${answer}.`,
    ),
  })

  return {
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
