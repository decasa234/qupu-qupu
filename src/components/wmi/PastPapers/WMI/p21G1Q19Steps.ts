// Storyboard for the WMI-21P1A-Q19 explainer (loop "value" = animals enclosed).
//
// Rule: a red loop drawn around a group is worth the number of animals it
// encircles. The legend's small round loop holds a group of 2 (so "= 2"). The
// asked shape is a bigger red figure-eight (two lobes); placed over the field it
// encircles a cluster of 6 animals, so its value is 6 (answer B).
//
// One idea per beat. The static figure shows only the scatter + the legend.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { P21G1Q19_ANSWER } from './P21G1Q19Illustration'

export type Q19Phase = 'show' | 'demo' | 'place' | 'count' | 'result'

export interface Q19Step {
  phase: Q19Phase
  showRoundLoop: boolean
  showFigureEight: boolean
  countEnclosed: number
  caption: string
  hold: number
  result: boolean
}

export interface Q19Storyboard {
  answer: number
  steps: Q19Step[]
  finalIndex: number
}

export function buildP21G1Q19Steps(lang: Lang): Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q19Step[] = [
    {
      phase: 'show',
      showRoundLoop: false,
      showFigureEight: false,
      countEnclosed: 0,
      hold: 1700,
      result: false,
      caption: t(
        'A loop’s value is how many animals it wraps. Ignore the rest of the scatter.',
        'Nilai sebuah lingkaran adalah berapa hewan yang dilingkupinya. Abaikan sebaran lainnya.',
      ),
    },
    {
      phase: 'demo',
      showRoundLoop: true,
      showFigureEight: false,
      countEnclosed: 0,
      hold: 2000,
      result: false,
      caption: t(
        'The small round loop wraps a group of 2 animals — that is why it is worth 2.',
        'Lingkaran kecil melingkupi 2 hewan — itulah sebabnya nilainya 2.',
      ),
    },
    {
      phase: 'place',
      showRoundLoop: false,
      showFigureEight: true,
      countEnclosed: 0,
      hold: 1900,
      result: false,
      caption: t(
        'The asked shape is a bigger figure-eight loop. Drop it over the cluster.',
        'Bentuk yang ditanya adalah lingkaran angka-delapan yang lebih besar. Letakkan di atas kelompok.',
      ),
    },
    {
      phase: 'count',
      showRoundLoop: false,
      showFigureEight: true,
      countEnclosed: 6,
      hold: 2200,
      result: false,
      caption: t(
        'Count inside the two lobes: 3 penguins + 3 fish = 6 animals.',
        'Hitung di dalam dua lengkungnya: 3 penguin + 3 ikan = 6 hewan.',
      ),
    },
    {
      phase: 'result',
      showRoundLoop: false,
      showFigureEight: true,
      countEnclosed: 6,
      hold: 0,
      result: true,
      caption: t(
        `So the figure-eight loop is worth ${P21G1Q19_ANSWER} — answer B.`,
        `Jadi lingkaran angka-delapan bernilai ${P21G1Q19_ANSWER} — jawaban B.`,
      ),
    },
  ]

  return { answer: P21G1Q19_ANSWER, steps, finalIndex: steps.length - 1 }
}
