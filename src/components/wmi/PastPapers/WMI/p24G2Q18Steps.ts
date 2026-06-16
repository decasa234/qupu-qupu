import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FRUIT_GLYPH, Q18_BIGGEST, Q18_COUNTS, Q18_REMOVE, Q18_TOTAL, type FruitKind } from './P24G2Q18Illustration'

// Storyboard for WMI-24P2A-Q18 (answer C = 11).
//
// Count each kind, keep the biggest group (bananas, 4) so the fewest are removed,
// then take away 15 − 4 = 11 (answer C).
//
// Trap: keeping a 3-fruit kind leaves 12 to remove (option D); bananas (4) let
// you remove only 11.

export type Q18Phase = 'show' | 'tally' | 'biggest' | 'keep' | 'result'

export interface Q18Step {
  phase: Q18Phase
  /** Kinds shown at full opacity (empty/undefined = all). */
  keep?: FruitKind[]
  ringKind: FruitKind | null
  caption: string
  hold: number
  result: boolean
}

export interface Q18Storyboard {
  total: number
  remove: number
  answerLabel: string
  steps: Q18Step[]
  finalIndex: number
}

export function buildP24G2Q18Steps(lang: Lang): Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const big = Q18_COUNTS[Q18_BIGGEST] // 4
  const banana = FRUIT_GLYPH[Q18_BIGGEST] // 🍌

  const steps: Q18Step[] = [
    {
      phase: 'show',
      ringKind: null,
      hold: 1700,
      result: false,
      caption: t(`${Q18_TOTAL} fruits — but only ONE kind may stay.`, `${Q18_TOTAL} buah — tapi hanya SATU jenis boleh tinggal.`),
    },
    {
      phase: 'tally',
      ringKind: null,
      hold: 2300,
      result: false,
      caption: t(
        `Count each kind: 🍍3, 🍊2, 🍐3, ${banana}${big}, 🍓2, 🍎1.`,
        `Hitung tiap jenis: 🍍3, 🍊2, 🍐3, ${banana}${big}, 🍓2, 🍎1.`,
      ),
    },
    {
      phase: 'biggest',
      ringKind: Q18_BIGGEST,
      hold: 2000,
      result: false,
      caption: t(`Bananas ${banana} are the most: ${big} of them.`, `Pisang ${banana} paling banyak: ${big} buah.`),
    },
    {
      phase: 'keep',
      keep: [Q18_BIGGEST],
      ringKind: Q18_BIGGEST,
      hold: 2100,
      result: false,
      caption: t('Keep the biggest group so you remove the fewest.', 'Sisakan kelompok terbesar agar mengambil paling sedikit.'),
    },
    {
      phase: 'result',
      keep: [Q18_BIGGEST],
      ringKind: Q18_BIGGEST,
      hold: 0,
      result: true,
      caption: t(
        `Take away ${Q18_TOTAL} − ${big} = ${Q18_REMOVE} fruits — answer C.`,
        `Ambil ${Q18_TOTAL} − ${big} = ${Q18_REMOVE} buah — jawaban C.`,
      ),
    },
  ]

  return { total: Q18_TOTAL, remove: Q18_REMOVE, answerLabel: 'C', steps, finalIndex: steps.length - 1 }
}
