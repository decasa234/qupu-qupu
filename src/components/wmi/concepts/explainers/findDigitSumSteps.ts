import type { Lang } from './makeTenSteps'

export interface DigitCheck {
  n: number
  tens: number
  ones: number
  sum: number
  match: boolean
}

export interface FindDigitSumStep {
  checked: number
  result: boolean
  caption: string
}

export interface FindDigitSumStoryboard {
  k: number
  options: number[]
  checks: DigitCheck[]
  correctIndex: number
  steps: FindDigitSumStep[]
  finalIndex: number
}

export function buildFindDigitSumSteps(k: number, options: number[], lang: Lang): FindDigitSumStoryboard {
  const checks: DigitCheck[] = options.map((n) => {
    const tens = Math.floor(n / 10)
    const ones = n % 10
    const sum = tens + ones
    const match = sum === k
    return { n, tens, ones, sum, match }
  })

  const correctIndex = checks.findIndex((c) => c.match)
  const correct = options[correctIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FindDigitSumStep[] = [
    {
      checked: 0,
      result: false,
      caption: t(`Find the number whose digits add up to ${k}.`, `Cari bilangan yang jumlah digitnya ${k}.`),
    },
    {
      checked: 1,
      result: false,
      caption: t(`Check ${options[0]}: ${checks[0].tens} + ${checks[0].ones} = ${checks[0].sum}.`, `Cek ${options[0]}: ${checks[0].tens} + ${checks[0].ones} = ${checks[0].sum}.`),
    },
    {
      checked: 2,
      result: false,
      caption: t(`Check ${options[1]}: ${checks[1].tens} + ${checks[1].ones} = ${checks[1].sum}.`, `Cek ${options[1]}: ${checks[1].tens} + ${checks[1].ones} = ${checks[1].sum}.`),
    },
    {
      checked: 3,
      result: false,
      caption: t(`Check ${options[2]}: ${checks[2].tens} + ${checks[2].ones} = ${checks[2].sum}.`, `Cek ${options[2]}: ${checks[2].tens} + ${checks[2].ones} = ${checks[2].sum}.`),
    },
    {
      checked: 4,
      result: false,
      caption: t(`Check ${options[3]}: ${checks[3].tens} + ${checks[3].ones} = ${checks[3].sum}.`, `Cek ${options[3]}: ${checks[3].tens} + ${checks[3].ones} = ${checks[3].sum}.`),
    },
    {
      checked: 4,
      result: true,
      caption: t(`${correct} works: its digits add up to ${k}.`, `${correct} cocok: jumlah digitnya ${k}.`),
    },
  ]

  return { k, options, checks, correctIndex, steps, finalIndex: steps.length - 1 }
}
