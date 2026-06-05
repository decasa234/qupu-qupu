import type { Lang } from './makeTenSteps'

export type MoreLessPhase = 'start' | 'hop' | 'land' | 'result'

export interface MoreLessStep {
  phase: MoreLessPhase
  caption: string
  result: boolean
}

export interface MoreLessStoryboard {
  x: number
  k: number
  dir: 'more' | 'less'
  answer: number
  lo: number
  hi: number
  steps: MoreLessStep[]
  finalIndex: number
}

export function buildMoreLessSteps(
  x: number,
  k: number,
  dir: 'more' | 'less',
  lang: Lang,
): MoreLessStoryboard {
  const answer = dir === 'more' ? x + k : x - k
  const margin = Math.max(2, Math.round(k * 0.5))
  const lo = Math.max(0, Math.min(x, answer) - margin)
  const hi = Math.max(x, answer) + margin

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MoreLessStep[] = [
    {
      phase: 'start',
      caption: t(`Start at ${x}.`, `Mulai dari ${x}.`),
      result: false,
    },
    {
      phase: 'hop',
      caption: t(
        `${k} ${dir === 'more' ? 'more' : 'less'}: hop ${dir === 'more' ? 'forward' : 'back'} ${k}.`,
        `${k} ${dir === 'more' ? 'lebih' : 'kurang'}: lompat ${dir === 'more' ? 'maju' : 'mundur'} ${k}.`,
      ),
      result: false,
    },
    {
      phase: 'land',
      caption: t(
        `${x} ${dir === 'more' ? '+' : '−'} ${k} = ${answer}.`,
        `${x} ${dir === 'more' ? '+' : '−'} ${k} = ${answer}.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`The answer is ${answer}.`, `Jawabannya ${answer}.`),
      result: true,
    },
  ]

  return { x, k, dir, answer, lo, hi, steps, finalIndex: steps.length - 1 }
}
