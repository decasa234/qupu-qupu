import type { Lang } from './makeTenSteps'

export type ClockPhase = 'show' | 'add' | 'wrap' | 'result'

export interface ClockStep {
  phase: ClockPhase
  caption: string
  result: boolean
}

export interface ClockAfterStoryboard {
  hour: number
  add: number
  result: number
  steps: ClockStep[]
  finalIndex: number
}

export function buildClockAfterSteps(hour: number, add: number, lang: Lang): ClockAfterStoryboard {
  const result = ((hour - 1 + add) % 12) + 1
  const sum = hour + add
  const wraps = sum > 12

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const wrapSuffix = wraps
    ? t(', and past 12 we start again from 1', ', lewat 12 mulai lagi dari 1')
    : ''

  const steps: ClockStep[] = [
    {
      phase: 'show',
      caption: t(`The clock shows ${hour} o'clock.`, `Jam menunjukkan pukul ${hour}.`),
      result: false,
    },
    {
      phase: 'add',
      caption: t(`Count forward ${add} hours.`, `Maju ${add} jam.`),
      result: false,
    },
    {
      phase: 'wrap',
      caption: t(`${hour} + ${add} = ${sum}${wrapSuffix}.`, `${hour} + ${add} = ${sum}${wrapSuffix}.`),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`It will show ${result} o'clock.`, `Akan menunjukkan pukul ${result}.`),
      result: true,
    },
  ]

  return { hour, add, result, steps, finalIndex: steps.length - 1 }
}
