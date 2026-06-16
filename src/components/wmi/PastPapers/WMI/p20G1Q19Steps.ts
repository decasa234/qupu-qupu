import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q19_STAR_VALUE } from './P20G1Q19Illustration'

export type Q19Phase = 'show' | 'rule1' | 'rule2' | 'apply' | 'result'

export interface Q19Step {
  phase: Q19Phase
  /** Circle to tint (0..3) or -1. */
  highlightCircle: number
  highlightQuarter: 'none' | 'tl' | 'bl' | 'br' | 'tr'
  revealStar: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q19Storyboard {
  answer: number
  steps: Q19Step[]
  finalIndex: number
}

export function buildP20G1Q19Steps(lang: Lang): Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q19Step[] = [
    {
      phase: 'show',
      highlightCircle: -1,
      highlightQuarter: 'none',
      revealStar: false,
      hold: 1700,
      result: false,
      caption: t(
        'Each circle hides one rule that links its four numbers.',
        'Tiap lingkaran menyimpan satu aturan yang menghubungkan empat angkanya.',
      ),
    },
    {
      phase: 'rule1',
      highlightCircle: 0,
      highlightQuarter: 'tr',
      revealStar: false,
      hold: 2100,
      result: false,
      caption: t(
        'Circle 1: 4 + 5 + 11 = 20 — the top-right is the other three added up.',
        'Lingkaran 1: 4 + 5 + 11 = 20 — kanan-atas adalah jumlah tiga lainnya.',
      ),
    },
    {
      phase: 'rule2',
      highlightCircle: 1,
      highlightQuarter: 'tr',
      revealStar: false,
      hold: 2100,
      result: false,
      caption: t(
        'Circle 2 checks: 30 + 12 + 7 = 49. Same rule.',
        'Lingkaran 2 cek: 30 + 12 + 7 = 49. Aturan yang sama.',
      ),
    },
    {
      phase: 'apply',
      highlightCircle: 2,
      highlightQuarter: 'tr',
      revealStar: false,
      hold: 2200,
      result: false,
      caption: t(
        'Star circle: 12 + 8 + 3 = ★.',
        'Lingkaran bintang: 12 + 8 + 3 = ★.',
      ),
    },
    {
      phase: 'result',
      highlightCircle: 2,
      highlightQuarter: 'tr',
      revealStar: true,
      hold: 0,
      result: true,
      caption: t(
        `12 + 8 + 3 = ${Q19_STAR_VALUE}. The star is ${Q19_STAR_VALUE} — answer C.`,
        `12 + 8 + 3 = ${Q19_STAR_VALUE}. Bintangnya ${Q19_STAR_VALUE} — jawaban C.`,
      ),
    },
  ]

  return { answer: Q19_STAR_VALUE, steps, finalIndex: steps.length - 1 }
}
