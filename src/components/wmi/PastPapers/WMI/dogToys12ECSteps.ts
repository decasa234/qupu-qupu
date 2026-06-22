import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const DOG_TOY_ANSWER_KG = 11 // official answer key
export const DOG_TOY_ANSWER_EN = '11 kg'
export const DOG_TOY_ANSWER_ID = '11 kg'

export interface DogToys12Step {
  /** Which scale (1 or 2) is active this beat, or 0 for no emphasis. */
  litScale: 1 | 2 | null
  /** Inequality deduced this beat (e.g. "toy < 12"). */
  inequality: string
  caption: string
  hold: number
  /** True on the last beat when the answer is revealed. */
  result: boolean
}

export interface DogToys12Storyboard {
  steps: DogToys12Step[]
  finalIndex: number
}

/**
 * IKMC-19-EC-Q12 — dog toy weight from two tilted scales.
 *
 * Scale 1 (right/12 kg DOWN): 12 kg > 1 toy  →  toy < 12
 * Scale 2 (left/2 toys DOWN): 2 toys > 20 kg  →  toy > 10
 * Both constraints + whole-number → toy = 11 kg (E).
 */
export function buildDogToys12Steps(lang: Lang): DogToys12Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DogToys12Step[] = [
    // Beat 1 — present the two scales
    {
      litScale: null,
      inequality: '',
      hold: 1800,
      result: false,
      caption: t(
        'Two balance scales show dog toys against known kg weights. The heavier side tips DOWN.',
        'Dua timbangan menunjukkan mainan anjing melawan beban yang diketahui. Sisi yang lebih berat berada di BAWAH.',
      ),
    },
    // Beat 2 — read Scale 1
    {
      litScale: 1,
      inequality: t('toy < 12', 'mainan < 12'),
      hold: 2200,
      result: false,
      caption: t(
        'Scale 1: the 12 kg weight tips DOWN → 12 kg is heavier than one toy. So toy < 12 kg.',
        'Timbangan 1: beban 12 kg turun → 12 kg lebih berat dari satu mainan. Jadi mainan < 12 kg.',
      ),
    },
    // Beat 3 — read Scale 2
    {
      litScale: 2,
      inequality: t('toy > 10', 'mainan > 10'),
      hold: 2200,
      result: false,
      caption: t(
        'Scale 2: the two toys tip DOWN → 2 toys > 20 kg → each toy weighs more than 10 kg.',
        'Timbangan 2: dua mainan turun → 2 mainan > 20 kg → setiap mainan lebih dari 10 kg.',
      ),
    },
    // Beat 4 — combine the two constraints
    {
      litScale: null,
      inequality: t('10 < toy < 12', '10 < mainan < 12'),
      hold: 2400,
      result: false,
      caption: t(
        'Combine: toy > 10 AND toy < 12. The toy weight is a whole number, so the only candidate is 11.',
        'Gabungkan: mainan > 10 DAN mainan < 12. Berat mainan adalah bilangan bulat, satu-satunya kandidat adalah 11.',
      ),
    },
    // Beat 5 — reveal the answer
    {
      litScale: null,
      inequality: t('toy = 11 kg ✓', 'mainan = 11 kg ✓'),
      hold: 0,
      result: true,
      caption: t(
        'One dog toy weighs 11 kg. Answer: E.',
        'Satu mainan anjing beratnya 11 kg. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
