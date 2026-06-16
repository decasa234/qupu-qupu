import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ClockPhase = 'show' | 'hour' | 'minute' | 'result'

export interface ClockReadG2Step {
  phase: ClockPhase
  caption: string
  hold: number
  result: boolean
}

export interface ClockReadG2Storyboard {
  timeStr: string
  steps: ClockReadG2Step[]
  finalIndex: number
}

/** Storyboard explaining how to read the analog clock that shows 06:45. */
export function buildClockReadG2Steps(lang: Lang): ClockReadG2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const timeStr = '06:45'

  const steps: ClockReadG2Step[] = [
    {
      phase: 'show',
      hold: 1700,
      result: false,
      caption: t('What time does the clock show?', 'Pukul berapa yang ditunjukkan jam?'),
    },
    {
      phase: 'hour',
      hold: 1700,
      result: false,
      caption: t('The short (hour) hand is just before 7 → the hour is 6.', 'Jarum pendek (jam) tepat sebelum 7 → jamnya 6.'),
    },
    {
      phase: 'minute',
      hold: 1700,
      result: false,
      caption: t('The long (minute) hand points to 9 → 45 minutes.', 'Jarum panjang (menit) menunjuk ke 9 → 45 menit.'),
    },
    {
      phase: 'result',
      hold: 0,
      result: true,
      caption: t('So the time is 06:45.', 'Jadi waktunya pukul 06:45.'),
    },
  ]

  return { timeStr, steps, finalIndex: steps.length - 1 }
}
