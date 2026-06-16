import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ORIGINAL, W, Y, type WedgeColor } from './P21G2Q20Illustration'

export type Q20Phase = 'show' | 'rule' | 'checkA' | 'checkBC' | 'checkD' | 'result'

/** One option umbrella: a colour cycle + a rotation. A/B/C are rotations of the
 * original; D's wedge order is scrambled (two yellows made adjacent), so it can
 * never be reached by rotating the original. */
export interface OptionDef {
  label: string
  colors: WedgeColor[]
  rotate: number
  /** True when this option is a genuine rotation of the original. */
  isRotation: boolean
}

/** Two yellows adjacent — impossible to get by rotating [W,Y,W,Y,W]. */
const SCRAMBLED: WedgeColor[] = [W, Y, Y, W, W]

export const OPTIONS: OptionDef[] = [
  { label: 'A', colors: ORIGINAL, rotate: 1, isRotation: true },
  { label: 'B', colors: ORIGINAL, rotate: 2, isRotation: true },
  { label: 'C', colors: ORIGINAL, rotate: 3, isRotation: true },
  { label: 'D', colors: SCRAMBLED, rotate: 0, isRotation: false },
]

export interface Q20Step {
  phase: Q20Phase
  /** Option label to spotlight, '' = none, '*' = all. */
  highlight: string
  caption: string
  hold: number
  result: boolean
}

export interface Q20Storyboard {
  answerLabel: string
  steps: Q20Step[]
  finalIndex: number
}

export function buildP21G2Q20Steps(lang: Lang, answerLabel: string): Q20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q20Step[] = [
    {
      phase: 'show',
      highlight: '',
      hold: 1700,
      result: false,
      caption: t(
        'The original wedges read white, yellow, white, yellow, white around the rim.',
        'Bagian asli berurutan putih, kuning, putih, kuning, putih mengelilingi tepi.',
      ),
    },
    {
      phase: 'rule',
      highlight: '',
      hold: 2000,
      result: false,
      caption: t(
        'Rotating an umbrella keeps that order — the two yellows stay spread apart.',
        'Memutar payung tidak mengubah urutan — dua bagian kuning tetap berjauhan.',
      ),
    },
    {
      phase: 'checkA',
      highlight: 'A',
      hold: 2000,
      result: false,
      caption: t(
        'Option A is the original turned one step — same order. It matches.',
        'Pilihan A adalah aslinya yang diputar satu langkah — urutan sama. Cocok.',
      ),
    },
    {
      phase: 'checkBC',
      highlight: 'B',
      hold: 2100,
      result: false,
      caption: t(
        'Options B and C are also just rotations — they match too.',
        'Pilihan B dan C juga sekadar rotasi — keduanya cocok juga.',
      ),
    },
    {
      phase: 'checkD',
      highlight: 'D',
      hold: 2300,
      result: false,
      caption: t(
        'Option D puts the two yellows side by side — no rotation can do that.',
        'Pilihan D menaruh dua bagian kuning berdampingan — tak ada rotasi yang bisa.',
      ),
    },
    {
      phase: 'result',
      highlight: 'D',
      hold: 0,
      result: true,
      caption: t(
        `So D is the different umbrella — answer ${answerLabel}.`,
        `Jadi D adalah payung yang berbeda — jawaban ${answerLabel}.`,
      ),
    },
  ]

  return { answerLabel, steps, finalIndex: steps.length - 1 }
}
