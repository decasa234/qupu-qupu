import type { Lang } from './makeTenSteps'

export type ClockPhase = 'show' | 'hour' | 'minute' | 'result'

export interface ClockStep {
  phase: ClockPhase
  caption: string
  result: boolean
}

export interface ClockStoryboard {
  hour: number
  minute: number
  timeStr: string
  steps: ClockStep[]
  finalIndex: number
}

export function buildClockReadSteps(hour: number, minute: number, lang: Lang): ClockStoryboard {
  const timeStr = `${hour}:${String(minute).padStart(2, '0')}`
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockStep[] = [
    {
      phase: 'show',
      caption: t(
        'What time does the clock show?',
        'Pukul berapa yang ditunjukkan jam?',
      ),
      result: false,
    },
    {
      phase: 'hour',
      caption: t(
        `The short hand points to the hour: ${hour}.`,
        `Jarum pendek menunjuk jam: ${hour}.`,
      ),
      result: false,
    },
    {
      phase: 'minute',
      caption: t(
        `The long hand points to ${minute} minutes.`,
        `Jarum panjang menunjuk ${minute} menit.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        `The time is ${timeStr}.`,
        `Waktunya ${timeStr}.`,
      ),
      result: true,
    },
  ]

  return { hour, minute, timeStr, steps, finalIndex: steps.length - 1 }
}
