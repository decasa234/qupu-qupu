import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ClockPhase = 'show' | 'minute' | 'hour' | 'result'

export interface ClockReadStep {
  phase: ClockPhase
  caption: string
  hold: number
  result: boolean
}

export interface ClockReadStoryboard {
  timeStr: string
  steps: ClockReadStep[]
  finalIndex: number
}

/** Storyboard explaining how to read the analog clock that shows 12:30. */
export function buildClockReadSteps(lang: Lang): ClockReadStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const timeStr = '12:30'

  const steps: ClockReadStep[] = [
    {
      phase: 'show',
      hold: 1700,
      result: false,
      caption: t('What time does the clock show?', 'Pukul berapa yang ditunjukkan jam?'),
    },
    {
      phase: 'minute',
      hold: 1700,
      result: false,
      caption: t('The long (minute) hand points to 6 → 30 minutes.', 'Jarum panjang (menit) menunjuk ke 6 → 30 menit.'),
    },
    {
      phase: 'hour',
      hold: 1700,
      result: false,
      caption: t('The short (hour) hand is just past 12 → 12 o’clock.', 'Jarum pendek (jam) baru lewat 12 → pukul 12.'),
    },
    {
      phase: 'result',
      hold: 0,
      result: true,
      caption: t('So the time is 12:30.', 'Jadi waktunya pukul 12:30.'),
    },
  ]

  return { timeStr, steps, finalIndex: steps.length - 1 }
}
