import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SIX_PARTS, SIX_COUNT } from './P19G2Q21Illustration'

// WMI-19P2A-Q21 — the decomposition machine counts how many ways the input can
// be written as a sum of TWO OR MORE whole numbers (order ignored). The worked
// example shows 4 → 4 ways. We now fill the 6-box one partition at a time,
// grouped by how many parts the sum has, with a running counter, landing on
// 10 → choice C. Both the count and the answer derive from SIX_PARTS, never a
// hardcoded 10.

export interface PartMachineStep {
  /** How many of SIX_PARTS are shown in the box so far. */
  shown: number
  /** Index (into SIX_PARTS) of the part highlighted this beat (undefined = none). */
  litIndex?: number
  /** Running count to show in the counter chip. */
  count: number
  /** Output text in the right pill while building ("?" then the final number). */
  output: string
  /** True on the closing total beat. */
  result: boolean
  caption: string
  hold: number
}

export interface PartMachineStoryboard {
  answer: number
  steps: PartMachineStep[]
  finalIndex: number
}

export function buildP19G2Q21Steps(lang: Lang): PartMachineStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Captions describing each group of partitions as they appear.
  const groupCaption: Record<number, [string, string]> = {
    // first index of a new group → its caption
    0: [
      'Two-part sums for 6: 1+5, 2+4, 3+3 — that is 3 ways.',
      'Penjumlahan dua bagian untuk 6: 1+5, 2+4, 3+3 — ada 3 cara.',
    ],
    3: [
      'Three-part sums: 1+1+4, 1+2+3, 2+2+2 — 3 more ways.',
      'Penjumlahan tiga bagian: 1+1+4, 1+2+3, 2+2+2 — 3 cara lagi.',
    ],
    6: [
      'Four-part sums: 1+1+1+3, 1+1+2+2 — 2 more ways.',
      'Penjumlahan empat bagian: 1+1+1+3, 1+1+2+2 — 2 cara lagi.',
    ],
    8: [
      'Five-part sum: 1+1+1+1+2 — one way.',
      'Penjumlahan lima bagian: 1+1+1+1+2 — satu cara.',
    ],
    9: [
      'Six-part sum: 1+1+1+1+1+1 — the last way.',
      'Penjumlahan enam bagian: 1+1+1+1+1+1 — cara terakhir.',
    ],
  }

  const steps: PartMachineStep[] = []

  // Beat 0 — read the worked example, state the rule.
  steps.push({
    shown: 0,
    count: 0,
    output: '?',
    result: false,
    hold: 2400,
    caption: t(
      'The machine counts the ways to write a number as a sum of two or more parts. For 4 there were 4 ways.',
      'Mesin menghitung berapa cara menulis bilangan sebagai jumlah dua bagian atau lebih. Untuk 4 ada 4 cara.',
    ),
  })

  // One beat per partition of 6, lighting it as it lands in the box.
  SIX_PARTS.forEach((p, i) => {
    const caption = groupCaption[i]
      ? t(groupCaption[i][0], groupCaption[i][1])
      : t(`Add ${p} — that is way number ${i + 1}.`, `Tambah ${p} — itu cara ke-${i + 1}.`)
    steps.push({
      shown: i + 1,
      litIndex: i,
      count: i + 1,
      output: '?',
      result: false,
      hold: 1500,
      caption,
    })
  })

  // Final beat — total → 10 → C.
  steps.push({
    shown: SIX_PARTS.length,
    count: SIX_COUNT,
    output: String(SIX_COUNT),
    result: true,
    hold: 0,
    caption: t(
      `${SIX_COUNT} ways in all, so 6 → ${SIX_COUNT} — answer C.`,
      `${SIX_COUNT} cara seluruhnya, jadi 6 → ${SIX_COUNT} — jawaban C.`,
    ),
  })

  return { answer: SIX_COUNT, steps, finalIndex: steps.length - 1 }
}
