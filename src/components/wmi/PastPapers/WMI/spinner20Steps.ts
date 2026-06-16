import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { SpinnerFocus } from './Spinner20Illustration'

export interface SpinnerStep {
  focus: SpinnerFocus
  caption: string
  hold: number
  result: boolean
}

export interface SpinnerStoryboard {
  steps: SpinnerStep[]
  finalIndex: number
}

export function buildSpinner20Steps(lang: Lang): SpinnerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SpinnerStep[] = [
    {
      focus: 'none',
      hold: 1900,
      result: false,
      caption: t(
        'The bigger an area is, the more often the hand stops there.',
        'Makin besar suatu area, makin sering jarum berhenti di sana.',
      ),
    },
    {
      focus: 'purple',
      hold: 1900,
      result: false,
      caption: t(
        'Compare the areas: purple covers half the circle.',
        'Bandingkan luasnya: ungu menutupi setengah lingkaran.',
      ),
    },
    {
      focus: 'orange',
      hold: 1800,
      result: false,
      caption: t(
        'Orange with dots is smaller — less than half.',
        'Oranye berbintik lebih kecil — kurang dari setengah.',
      ),
    },
    {
      focus: 'green',
      hold: 1800,
      result: false,
      caption: t(
        'Green with stripes is the smallest of all.',
        'Hijau bergaris paling kecil dari semuanya.',
      ),
    },
    {
      focus: 'answer',
      hold: 0,
      result: true,
      caption: t(
        'Purple has the biggest area — the hand is most likely to stop on purple (B).',
        'Ungu paling luas — jarum paling mungkin berhenti di area ungu (B).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
