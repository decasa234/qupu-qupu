import type { Lang } from './makeTenSteps'

export type DigitFrequencyPhase = 'range' | 'find' | 'count' | 'result'

export interface DigitFrequencyStep {
  phase: DigitFrequencyPhase
  caption: string
  result: boolean
}

export interface DigitFrequencyStoryboard {
  a: number
  b: number
  d: number
  /** Every whole number from a to b inclusive. */
  numbers: number[]
  /** Count of times digit d appears across all numbers a..b. */
  answer: number
  steps: DigitFrequencyStep[]
  finalIndex: number
}

export function buildDigitFrequencySteps(
  a: number,
  b: number,
  d: number,
  lang: Lang,
): DigitFrequencyStoryboard {
  const numbers: number[] = []
  for (let n = a; n <= b; n++) numbers.push(n)

  const digitChar = String(d)
  let answer = 0
  for (const n of numbers) {
    for (const ch of String(n)) {
      if (ch === digitChar) answer++
    }
  }

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DigitFrequencyStep[] = [
    {
      phase: 'range',
      caption: t(`Write every number from ${a} to ${b}.`, `Tulis setiap bilangan dari ${a} sampai ${b}.`),
      result: false,
    },
    {
      phase: 'find',
      caption: t(
        `Find every digit ${d} (ones and tens place).`,
        `Temukan setiap angka ${d} (tempat satuan dan puluhan).`,
      ),
      result: false,
    },
    {
      phase: 'count',
      caption: t(`Count them.`, `Hitung semuanya.`),
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        `The digit ${d} appears ${answer} times.`,
        `Angka ${d} muncul ${answer} kali.`,
      ),
      result: true,
    },
  ]

  return { a, b, d, numbers, answer, steps, finalIndex: steps.length - 1 }
}
