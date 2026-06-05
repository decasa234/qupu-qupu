import type { Lang } from './makeTenSteps'

export interface ParityCheck {
  x: number
  y: number
  xOdd: boolean
  yOdd: boolean
  sum: number
  sumOdd: boolean
  match: boolean
}

export interface OddEvenStep {
  checked: number
  result: boolean
  caption: string
}

export interface OddEvenStoryboard {
  options: { x: number; y: number }[]
  checks: ParityCheck[]
  correctIndex: number
  steps: OddEvenStep[]
  finalIndex: number
}

export function buildOddEvenSteps(options: { x: number; y: number }[], lang: Lang): OddEvenStoryboard {
  const checks: ParityCheck[] = options.map(({ x, y }) => {
    const xOdd = x % 2 === 1
    const yOdd = y % 2 === 1
    const sum = x + y
    const sumOdd = sum % 2 === 1
    const match = sumOdd
    return { x, y, xOdd, yOdd, sum, sumOdd, match }
  })

  const correctIndex = checks.findIndex((c) => c.match)
  const correct = checks[correctIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const xLabel = (xOdd: boolean) => t(xOdd ? 'odd' : 'even', xOdd ? 'ganjil' : 'genap')
  const yLabel = (yOdd: boolean) => t(yOdd ? 'odd' : 'even', yOdd ? 'ganjil' : 'genap')

  const steps: OddEvenStep[] = [
    {
      checked: 0,
      result: false,
      caption: t('Which sum is odd?', 'Penjumlahan mana yang ganjil?'),
    },
    {
      checked: 1,
      result: false,
      caption: t(
        `Check ${options[0].x} + ${options[0].y}: ${xLabel(checks[0].xOdd)} + ${yLabel(checks[0].yOdd)} = ${checks[0].sum}.`,
        `Cek ${options[0].x} + ${options[0].y}: ${xLabel(checks[0].xOdd)} + ${yLabel(checks[0].yOdd)} = ${checks[0].sum}.`,
      ),
    },
    {
      checked: 2,
      result: false,
      caption: t(
        `Check ${options[1].x} + ${options[1].y}: ${xLabel(checks[1].xOdd)} + ${yLabel(checks[1].yOdd)} = ${checks[1].sum}.`,
        `Cek ${options[1].x} + ${options[1].y}: ${xLabel(checks[1].xOdd)} + ${yLabel(checks[1].yOdd)} = ${checks[1].sum}.`,
      ),
    },
    {
      checked: 3,
      result: false,
      caption: t(
        `Check ${options[2].x} + ${options[2].y}: ${xLabel(checks[2].xOdd)} + ${yLabel(checks[2].yOdd)} = ${checks[2].sum}.`,
        `Cek ${options[2].x} + ${options[2].y}: ${xLabel(checks[2].xOdd)} + ${yLabel(checks[2].yOdd)} = ${checks[2].sum}.`,
      ),
    },
    {
      checked: 4,
      result: false,
      caption: t(
        `Check ${options[3].x} + ${options[3].y}: ${xLabel(checks[3].xOdd)} + ${yLabel(checks[3].yOdd)} = ${checks[3].sum}.`,
        `Cek ${options[3].x} + ${options[3].y}: ${xLabel(checks[3].xOdd)} + ${yLabel(checks[3].yOdd)} = ${checks[3].sum}.`,
      ),
    },
    {
      checked: 4,
      result: true,
      caption: t(
        `${correct.x} + ${correct.y} = ${correct.sum} is odd (odd + even).`,
        `${correct.x} + ${correct.y} = ${correct.sum} ganjil (ganjil + genap).`,
      ),
    },
  ]

  return { options, checks, correctIndex, steps, finalIndex: steps.length - 1 }
}
