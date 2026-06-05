import type { Lang } from './makeTenSteps'

export type PyramidPhase = 'bottom' | 'middle' | 'top' | 'result'

export interface PyramidStep {
  phase: PyramidPhase
  caption: string
  result: boolean
}

export interface PyramidStoryboard {
  a: number
  b: number
  c: number
  mid: [number, number]
  top: number
  steps: PyramidStep[]
  finalIndex: number
}

export function buildPyramidSteps(a: number, b: number, c: number, lang: Lang): PyramidStoryboard {
  const mid: [number, number] = [a + b, b + c]
  const top = mid[0] + mid[1]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PyramidStep[] = [
    {
      phase: 'bottom',
      caption: t(`The bottom row is ${a}, ${b}, ${c}.`, `Baris bawah: ${a}, ${b}, ${c}.`),
      result: false,
    },
    {
      phase: 'middle',
      caption: t(
        `Add neighbours: ${a}+${b}=${a + b}, ${b}+${c}=${b + c}.`,
        `Jumlahkan tetangga: ${a}+${b}=${a + b}, ${b}+${c}=${b + c}.`,
      ),
      result: false,
    },
    {
      phase: 'top',
      caption: t(`Add the middle row: ${a + b} + ${b + c}.`, `Jumlahkan baris tengah: ${a + b} + ${b + c}.`),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`The top is ${top}.`, `Puncaknya ${top}.`),
      result: true,
    },
  ]

  return { a, b, c, mid, top, steps, finalIndex: steps.length - 1 }
}
