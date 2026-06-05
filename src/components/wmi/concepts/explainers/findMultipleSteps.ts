import type { Lang } from './makeTenSteps'

export interface MultipleCheck {
  n: number
  q: number
  rem: number
  match: boolean
}

export interface FindMultipleStep {
  checked: number
  result: boolean
  caption: string
}

export interface FindMultipleStoryboard {
  d: number
  options: number[]
  checks: MultipleCheck[]
  correctIndex: number
  steps: FindMultipleStep[]
  finalIndex: number
}

export function buildFindMultipleSteps(d: number, options: number[], lang: Lang): FindMultipleStoryboard {
  const checks: MultipleCheck[] = options.map((n) => {
    const q = Math.floor(n / d)
    const rem = n % d
    const match = rem === 0
    return { n, q, rem, match }
  })

  const correctIndex = checks.findIndex((c) => c.match)
  const correct = options[correctIndex]
  const q = checks[correctIndex].q

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FindMultipleStep[] = [
    {
      checked: 0,
      result: false,
      caption: t(`Find a multiple of ${d}.`, `Cari kelipatan ${d}.`),
    },
    {
      checked: 1,
      result: false,
      caption: t(
        `Check ${options[0]}: ${options[0]} ÷ ${d} = ${checks[0].q} remainder ${checks[0].rem}.`,
        `Cek ${options[0]}: ${options[0]} ÷ ${d} = ${checks[0].q} sisa ${checks[0].rem}.`,
      ),
    },
    {
      checked: 2,
      result: false,
      caption: t(
        `Check ${options[1]}: ${options[1]} ÷ ${d} = ${checks[1].q} remainder ${checks[1].rem}.`,
        `Cek ${options[1]}: ${options[1]} ÷ ${d} = ${checks[1].q} sisa ${checks[1].rem}.`,
      ),
    },
    {
      checked: 3,
      result: false,
      caption: t(
        `Check ${options[2]}: ${options[2]} ÷ ${d} = ${checks[2].q} remainder ${checks[2].rem}.`,
        `Cek ${options[2]}: ${options[2]} ÷ ${d} = ${checks[2].q} sisa ${checks[2].rem}.`,
      ),
    },
    {
      checked: 4,
      result: false,
      caption: t(
        `Check ${options[3]}: ${options[3]} ÷ ${d} = ${checks[3].q} remainder ${checks[3].rem}.`,
        `Cek ${options[3]}: ${options[3]} ÷ ${d} = ${checks[3].q} sisa ${checks[3].rem}.`,
      ),
    },
    {
      checked: 4,
      result: true,
      caption: t(
        `${correct} = ${d} × ${q} — a multiple of ${d}.`,
        `${correct} = ${d} × ${q} — kelipatan ${d}.`,
      ),
    },
  ]

  return { d, options, checks, correctIndex, steps, finalIndex: steps.length - 1 }
}
