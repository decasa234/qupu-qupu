import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TEMP_ANSWER, type ThermometerHighlight } from './Thermometer20Illustration'

export interface ThermometerStep {
  highlight: ThermometerHighlight
  caption: string
  hold: number
  result: boolean
}

export interface ThermometerStoryboard {
  answer: number
  steps: ThermometerStep[]
  finalIndex: number
}

export function buildThermometer20Steps(lang: Lang): ThermometerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ThermometerStep[] = [
    {
      highlight: 'none',
      hold: 1700,
      result: false,
      caption: t(
        'What is the temperature? Read where the top of the liquid stops.',
        'Berapa suhunya? Baca di mana puncak cairan berhenti.',
      ),
    },
    {
      highlight: 'scale',
      hold: 1900,
      result: false,
      caption: t(
        'The numbered lines go up by 10: 0, 10, 20, 30, 40, 50...',
        'Garis berangka naik 10-10: 0, 10, 20, 30, 40, 50...',
      ),
    },
    {
      highlight: 'between',
      hold: 2000,
      result: false,
      caption: t(
        'The top of the liquid is above 40 but below 50.',
        'Puncak cairan berada di atas 40 tapi di bawah 50.',
      ),
    },
    {
      highlight: 'half',
      hold: 2000,
      result: false,
      caption: t(
        'It stops exactly at the small halfway mark between them.',
        'Cairan berhenti tepat di garis kecil di tengah keduanya.',
      ),
    },
    {
      highlight: 'answer',
      hold: 0,
      result: true,
      caption: t(
        `Halfway between 40 and 50 is ${TEMP_ANSWER} — the temperature is ${TEMP_ANSWER} °F (B).`,
        `Tengah-tengah antara 40 dan 50 adalah ${TEMP_ANSWER} — suhunya ${TEMP_ANSWER} °F (B).`,
      ),
    },
  ]

  return { answer: TEMP_ANSWER, steps, finalIndex: steps.length - 1 }
}
