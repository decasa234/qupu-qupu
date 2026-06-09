import type { Lang } from '../concepts/explainers/makeTenSteps'
import { AGG2_ANSWER_CELLS, AGG2_ANSWER } from './ArrowGridG2Illustration'

export type ArrowGridG2Phase = 'show' | 'rule' | 'example' | 'fill' | 'result'

export interface ArrowGridG2Step {
  phase: ArrowGridG2Phase
  /** Number of ABCD corner answers revealed so far (0..4). */
  filled: number
  /** Index (0..3) of the corner being lit on this beat, or null. */
  active: number | null
  caption: string
  hold: number
  result: boolean
}

export interface ArrowGridG2Storyboard {
  answer: string
  steps: ArrowGridG2Step[]
  finalIndex: number
}

export function buildArrowGridG2Steps(lang: Lang): ArrowGridG2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ArrowGridG2Step[] = [
    {
      phase: 'show',
      filled: 0,
      active: null,
      caption: t('Each arrow holds a count. Find the corners ABCD.', 'Tiap panah memuat sebuah hitungan. Cari pojok-pojoknya ABCD.'),
      hold: 1700,
      result: false,
    },
    {
      phase: 'rule',
      filled: 0,
      active: null,
      caption: t(
        'An arrow’s number = how many DIFFERENT numbers are seen looking the way it points.',
        'Angka pada panah = berapa banyak angka BERBEDA yang terlihat ke arah panah itu.',
      ),
      hold: 2500,
      result: false,
    },
    {
      phase: 'rule',
      filled: 0,
      active: null,
      caption: t(
        'A two-way arrow counts the different numbers seen in both of its directions together.',
        'Panah dua arah menghitung angka berbeda dari kedua arahnya sekaligus.',
      ),
      hold: 2300,
      result: false,
    },
    {
      phase: 'example',
      filled: 0,
      active: null,
      caption: t(
        'The figure is the worked example: every arrow already shows its count, like the "←1" arrow seeing just one number.',
        'Gambarnya adalah contoh: tiap panah sudah menunjukkan hitungannya, seperti panah "←1" yang hanya melihat satu angka.',
      ),
      hold: 2500,
      result: false,
    },
    {
      phase: 'rule',
      filled: 0,
      active: null,
      caption: t(
        'Match the example, then read the four corner cells A, B, C, D.',
        'Cocokkan dengan contoh, lalu baca empat kotak pojok A, B, C, D.',
      ),
      hold: 2200,
      result: false,
    },
  ]

  // Reveal the four corner values one at a time, lighting each as it lands.
  AGG2_ANSWER_CELLS.forEach((cell, i) => {
    steps.push({
      phase: 'fill',
      filled: i + 1,
      active: i,
      caption: t(
        `Corner ${cell.label} reads ${cell.value}.`,
        `Pojok ${cell.label} terbaca ${cell.value}.`,
      ),
      hold: 1600,
      result: false,
    })
  })

  steps.push({
    phase: 'result',
    filled: AGG2_ANSWER_CELLS.length,
    active: null,
    caption: t(`Reading the corners: ABCD = ${AGG2_ANSWER}.`, `Membaca pojok-pojoknya: ABCD = ${AGG2_ANSWER}.`),
    hold: 0,
    result: true,
  })

  return { answer: AGG2_ANSWER, steps, finalIndex: steps.length - 1 }
}
