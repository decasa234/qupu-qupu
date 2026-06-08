import type { Lang } from './makeTenSteps'

export type DigitFrequencyPhase = 'rule' | 'ones' | 'tens' | 'result'

export interface DigitFrequencyStep {
  phase: DigitFrequencyPhase
  caption: string
  result: boolean
}

export interface DigitFrequencyStoryboard {
  a: number
  b: number
  d: number
  numbers: number[]
  /** Times d appears in the ones place across [a,b]. */
  onesCount: number
  /** Times d appears in the tens place across [a,b]. */
  tensCount: number
  answer: number
  ruleEn: string
  ruleId: string
  steps: DigitFrequencyStep[]
  finalIndex: number
}

export function buildDigitFrequencySteps(a: number, b: number, d: number, lang: Lang): DigitFrequencyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const numbers: number[] = []
  for (let n = a; n <= b; n++) numbers.push(n)

  let onesCount = 0
  let tensCount = 0
  for (const n of numbers) {
    if (n % 10 === d) onesCount++
    if (n >= 10 && Math.floor(n / 10) % 10 === d) tensCount++
  }
  const answer = onesCount + tensCount

  const steps: DigitFrequencyStep[] = [
    {
      phase: 'rule',
      caption: t(
        `Don't count one by one — check the ones place and the tens place separately.`,
        `Jangan hitung satu per satu — periksa tempat satuan dan tempat puluhan secara terpisah.`,
      ),
      result: false,
    },
    {
      phase: 'ones',
      caption: t(
        `Ones place: a ${d} shows up once every ten numbers → ${onesCount}.`,
        `Tempat satuan: angka ${d} muncul sekali tiap sepuluh bilangan → ${onesCount}.`,
      ),
      result: false,
    },
    {
      phase: 'tens',
      caption: t(
        `Tens place: the whole ${d}0s block → ${tensCount}.`,
        `Tempat puluhan: seluruh blok ${d}0-an → ${tensCount}.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`${onesCount} + ${tensCount} = ${answer} times.`, `${onesCount} + ${tensCount} = ${answer} kali.`),
      result: true,
    },
  ]

  return {
    a,
    b,
    d,
    numbers,
    onesCount,
    tensCount,
    answer,
    ruleEn: 'Count the ones place and the tens place separately.',
    ruleId: 'Hitung tempat satuan dan tempat puluhan secara terpisah.',
    steps,
    finalIndex: steps.length - 1,
  }
}
