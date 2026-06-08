import type { BasicStep } from './logicSteps'

export interface EquivalentFractionStory {
  num: number
  den: number
  m: number
  newDen: number
  answer: number
  steps: BasicStep[]
  finalIndex: number
}

// N15: scale a fraction to an equivalent one. The denominator was multiplied
// by m (den × m = newDen), so the numerator must be multiplied by the same m.
export function buildEquivalentFractionStory(
  numRaw: number,
  denRaw: number,
  mRaw: number,
  lang: 'en' | 'id' = 'en',
): EquivalentFractionStory {
  const num = Math.max(1, Math.round(numRaw))
  const den = Math.max(2, Math.round(denRaw))
  const m = Math.max(2, Math.round(mRaw))
  const newDen = den * m
  const answer = num * m

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BasicStep[] = [
    {
      phase: 'show',
      caption: T(`Find the top number: ${num}/${den} = ?/${newDen}.`, `Cari bilangan atas: ${num}/${den} = ?/${newDen}.`),
      hold: 1700,
    },
    {
      phase: 'denom',
      caption: T(`The bottom was ×${m}: ${den} × ${m} = ${newDen}.`, `Penyebut dikali ${m}: ${den} × ${m} = ${newDen}.`),
      hold: 2000,
    },
    {
      phase: 'same',
      caption: T(`Multiply the top by the same ${m}.`, `Kalikan bagian atas dengan ${m} yang sama.`),
      hold: 1800,
    },
    {
      phase: 'solve',
      caption: T(`${num} × ${m} = ${answer}.`, `${num} × ${m} = ${answer}.`),
      hold: 1700,
    },
    {
      phase: 'answer',
      caption: T(`So ${num}/${den} = ${answer}/${newDen}.`, `Jadi ${num}/${den} = ${answer}/${newDen}.`),
      hold: 0,
      result: true,
    },
  ]

  return { num, den, m, newDen, answer, steps, finalIndex: steps.length - 1 }
}
