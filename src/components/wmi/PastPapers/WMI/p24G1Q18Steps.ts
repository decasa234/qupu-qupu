import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FRUIT_ROWS, type FruitKind } from './P24G1Q18Illustration'

// WMI-24P1A-Q18 storyboard — keep one kind, remove the fewest.
//
// Tally the 10 fruits: banana 4 · strawberry 3 · pineapple 2 · orange 1.
// To keep only ONE kind while removing the fewest, keep the BIGGEST group
// (4 bananas) and take away the other 10 - 4 = 6. Answer = B.

function tally(): Record<FruitKind, number> {
  const t = { pineapple: 0, orange: 0, strawberry: 0, banana: 0 } as Record<FruitKind, number>
  FRUIT_ROWS.flat().forEach((k) => {
    t[k] += 1
  })
  return t
}

export const TALLY = tally()
export const TOTAL = FRUIT_ROWS.flat().length // 10
export const KEEP_KIND: FruitKind = (Object.keys(TALLY) as FruitKind[]).reduce((best, k) =>
  TALLY[k] > TALLY[best] ? k : best,
)
export const KEEP_COUNT = TALLY[KEEP_KIND] // 4
export const REMOVE_COUNT = TOTAL - KEEP_COUNT // 6

export type FruitPhase = 'show' | 'tally' | 'keep' | 'remove' | 'result'

export interface FruitStep {
  phase: FruitPhase
  /** Show the per-kind tally counters. */
  showTally: boolean
  /** Highlight the kept (biggest) kind. */
  highlightKeep: boolean
  /** Dim/cross-out the kinds being removed. */
  removeOthers: boolean
  caption: string
  hold: number
  result: boolean
}

export interface FruitStoryboard {
  total: number
  keepKind: FruitKind
  keepCount: number
  removeCount: number
  tally: Record<FruitKind, number>
  steps: FruitStep[]
  finalIndex: number
}

export function buildP24G1Q18Steps(lang: Lang): FruitStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const keepEn = KEEP_KIND === 'banana' ? 'bananas' : KEEP_KIND + 's'
  const keepId = lang === 'id' ? (KEEP_KIND === 'banana' ? 'pisang' : KEEP_KIND) : keepEn

  const steps: FruitStep[] = [
    {
      phase: 'show',
      showTally: false,
      highlightKeep: false,
      removeOthers: false,
      hold: 1600,
      result: false,
      caption: t(`There are ${TOTAL} fruits of 4 kinds.`, `Ada ${TOTAL} buah dari 4 jenis.`),
    },
    {
      phase: 'tally',
      showTally: true,
      highlightKeep: false,
      removeOthers: false,
      hold: 2200,
      result: false,
      caption: t(
        `Count each kind: banana ${TALLY.banana}, strawberry ${TALLY.strawberry}, pineapple ${TALLY.pineapple}, orange ${TALLY.orange}.`,
        `Hitung tiap jenis: pisang ${TALLY.banana}, stroberi ${TALLY.strawberry}, nanas ${TALLY.pineapple}, jeruk ${TALLY.orange}.`,
      ),
    },
    {
      phase: 'keep',
      showTally: true,
      highlightKeep: true,
      removeOthers: false,
      hold: 2100,
      result: false,
      caption: t(
        `To remove the fewest, keep the biggest group — the ${KEEP_COUNT} ${keepEn}.`,
        `Agar membuang paling sedikit, simpan kelompok terbesar — ${KEEP_COUNT} ${keepId}.`,
      ),
    },
    {
      phase: 'remove',
      showTally: true,
      highlightKeep: true,
      removeOthers: true,
      hold: 2000,
      result: false,
      caption: t(
        `Take away all the others: ${TOTAL} - ${KEEP_COUNT} = ${REMOVE_COUNT}.`,
        `Buang semua yang lain: ${TOTAL} - ${KEEP_COUNT} = ${REMOVE_COUNT}.`,
      ),
    },
    {
      phase: 'result',
      showTally: true,
      highlightKeep: true,
      removeOthers: true,
      hold: 0,
      result: true,
      caption: t(
        `At least ${REMOVE_COUNT} fruits must be taken away — answer B.`,
        `Paling sedikit ${REMOVE_COUNT} buah harus diambil — jawaban B.`,
      ),
    },
  ]

  return {
    total: TOTAL,
    keepKind: KEEP_KIND,
    keepCount: KEEP_COUNT,
    removeCount: REMOVE_COUNT,
    tally: TALLY,
    steps,
    finalIndex: steps.length - 1,
  }
}
