import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { Corner } from './P20G1Q22Illustration'
import { Q22_STAR_VALUE } from './P20G1Q22Illustration'

export type Q22Phase = 'show' | 'largest' | 'smallest' | 'star' | 'result'

export interface Q22Step {
  phase: Q22Phase
  values: Partial<Record<Corner, number>>
  focus: Corner | null
  litEdges: Array<[Corner, Corner]>
  caption: string
  hold: number
  result: boolean
}

export interface Q22Storyboard {
  answer: number
  steps: Q22Step[]
  finalIndex: number
}

// Final placement, derived from out-degree (how many boxes each one beats):
//   BL beats 3 → 81 (largest), TR beats 2 → 68 (star), TL beats 1 → 56, BR beats 0 → 45.
const FINAL: Record<Corner, number> = { BL: 81, TR: 68, TL: 56, BR: 45 }

export function buildP20G1Q22Steps(lang: Lang): Q22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q22Step[] = [
    {
      phase: 'show',
      values: {},
      focus: null,
      litEdges: [],
      hold: 1700,
      result: false,
      caption: t(
        'An arrow out of a box means that box is the bigger number. Count the arrows leaving each box.',
        'Panah keluar dari kotak berarti kotak itu lebih besar. Hitung panah yang keluar dari tiap kotak.',
      ),
    },
    {
      phase: 'largest',
      values: { BL: 81 },
      focus: 'BL',
      litEdges: [
        ['BL', 'TL'],
        ['BL', 'TR'],
        ['BL', 'BR'],
      ],
      hold: 2200,
      result: false,
      caption: t(
        'Bottom-left has 3 arrows out — it beats everyone, so it is the biggest: 81.',
        'Kiri-bawah punya 3 panah keluar — mengalahkan semua, jadi paling besar: 81.',
      ),
    },
    {
      phase: 'smallest',
      values: { BL: 81, BR: 45 },
      focus: 'BR',
      litEdges: [],
      hold: 2100,
      result: false,
      caption: t(
        'Bottom-right has 0 arrows out — every arrow points in, so it is the smallest: 45.',
        'Kanan-bawah punya 0 panah keluar — semua panah masuk, jadi paling kecil: 45.',
      ),
    },
    {
      phase: 'star',
      values: { BL: 81, BR: 45, TL: 56 },
      focus: 'TL',
      litEdges: [['TL', 'BR']],
      hold: 2100,
      result: false,
      caption: t(
        'Top-left beats only bottom-right (1 arrow out) → 56. So the star beats 2 boxes.',
        'Kiri-atas hanya mengalahkan kanan-bawah (1 panah keluar) → 56. Jadi bintang mengalahkan 2 kotak.',
      ),
    },
    {
      phase: 'result',
      values: FINAL,
      focus: 'TR',
      litEdges: [
        ['TR', 'TL'],
        ['TR', 'BR'],
      ],
      hold: 0,
      result: true,
      caption: t(
        `The star beats 2 boxes — second biggest. ★ = ${Q22_STAR_VALUE} — answer C.`,
        `Bintang mengalahkan 2 kotak — terbesar kedua. ★ = ${Q22_STAR_VALUE} — jawaban C.`,
      ),
    },
  ]

  return { answer: Q22_STAR_VALUE, steps, finalIndex: steps.length - 1 }
}
