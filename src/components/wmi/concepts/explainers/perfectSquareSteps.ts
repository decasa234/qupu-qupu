import type { Lang } from './makeTenSteps'

export type PerfectSquarePhase = 'intro' | 'squares' | 'locate' | 'result'

export interface PerfectSquareStep {
  phase: PerfectSquarePhase
  caption: string
  result: boolean
}

export interface PerfectSquareSquare {
  k: number
  value: number
}

export interface PerfectSquareStoryboard {
  n: number
  root: number
  answer: number
  squares: PerfectSquareSquare[]
  steps: PerfectSquareStep[]
  finalIndex: number
}

export function buildPerfectSquareSteps(n: number, lang: Lang): PerfectSquareStoryboard {
  const root = Math.floor(Math.sqrt(n))
  const answer = (root + 1) ** 2

  const kStart = Math.max(1, root - 1)
  const kEnd = root + 2
  const squares: PerfectSquareSquare[] = []
  for (let k = kStart; k <= kEnd; k++) {
    squares.push({ k, value: k * k })
  }

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PerfectSquareStep[] = [
    {
      phase: 'intro',
      caption: t(
        `Find the smallest perfect square bigger than ${n}.`,
        `Cari bilangan kuadrat terkecil yang lebih besar dari ${n}.`,
      ),
      result: false,
    },
    {
      phase: 'squares',
      caption: t(
        `Perfect squares are k × k: 1, 4, 9, 16, …`,
        `Bilangan kuadrat adalah k × k: 1, 4, 9, 16, …`,
      ),
      result: false,
    },
    {
      phase: 'locate',
      caption: t(
        `${root}² = ${root * root} is below ${n}; the next is ${root + 1}².`,
        `${root}² = ${root * root} di bawah ${n}; berikutnya ${root + 1}².`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        `The answer is ${answer} = ${root + 1} × ${root + 1}.`,
        `Jawabannya ${answer} = ${root + 1} × ${root + 1}.`,
      ),
      result: true,
    },
  ]

  return { n, root, answer, squares, steps, finalIndex: steps.length - 1 }
}
