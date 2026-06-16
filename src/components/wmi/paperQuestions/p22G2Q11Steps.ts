import type { Lang } from '../concepts/explainers/makeTenSteps'
import { NET_CELLS, OPPOSITE_PAIRS } from './P22G2Q11Illustration'

export type Q11Phase = 'show' | 'pairs' | 'pick1' | 'pick2' | 'pick3' | 'result'

const valById = (id: number) => NET_CELLS.find((c) => c.id === id)!.value

export interface Q11Step {
  phase: Q11Phase
  /** Cell ids to spotlight (others dim). Empty = all bright. */
  highlight: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q11Storyboard {
  pairs: Array<[number, number]> // value pairs (bigger first)
  answer: number
  steps: Q11Step[]
  finalIndex: number
}

export function buildP22G2Q11Steps(lang: Lang): Q11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // For each opposite pair, the winner is the bigger value; track ids too.
  const ranked = OPPOSITE_PAIRS.map(([a, b]) => {
    const va = valById(a)
    const vb = valById(b)
    return va >= vb ? { winId: a, loseId: b, win: va, lose: vb } : { winId: b, loseId: a, win: vb, lose: va }
  })
  const winners = ranked.map((r) => r.win) // [5, 4, 9]
  const total = winners.reduce((s, v) => s + v, 0) // 18

  const showAllOpp = OPPOSITE_PAIRS.flat()

  const steps: Q11Step[] = [
    {
      phase: 'show',
      highlight: [],
      hold: 1800,
      result: false,
      caption: t(
        'Fold the net into a cube. Three faces meeting at a corner are never an opposite pair.',
        'Lipat jaring-jaring jadi kubus. Tiga sisi yang bertemu di sudut tidak pernah saling berhadapan.',
      ),
    },
    {
      phase: 'pairs',
      highlight: showAllOpp,
      hold: 2300,
      result: false,
      caption: t(
        `Folding pairs the opposite faces: ${ranked[0].win} with ${ranked[0].lose}, ${ranked[1].win} with ${ranked[1].lose}, ${ranked[2].win} with ${ranked[2].lose}.`,
        `Saat dilipat sisi-sisi berhadapan: ${ranked[0].win} dengan ${ranked[0].lose}, ${ranked[1].win} dengan ${ranked[1].lose}, ${ranked[2].win} dengan ${ranked[2].lose}.`,
      ),
    },
    {
      phase: 'pick1',
      highlight: [ranked[0].winId],
      hold: 2000,
      result: false,
      caption: t(
        `From ${ranked[0].win}/${ranked[0].lose}, keep the bigger: ${ranked[0].win}.`,
        `Dari ${ranked[0].win}/${ranked[0].lose}, ambil yang lebih besar: ${ranked[0].win}.`,
      ),
    },
    {
      phase: 'pick2',
      highlight: [ranked[0].winId, ranked[1].winId],
      hold: 2000,
      result: false,
      caption: t(
        `From ${ranked[1].win}/${ranked[1].lose}, keep ${ranked[1].win}. Running sum ${winners[0]} + ${winners[1]} = ${winners[0] + winners[1]}.`,
        `Dari ${ranked[1].win}/${ranked[1].lose}, ambil ${ranked[1].win}. Jumlah sementara ${winners[0]} + ${winners[1]} = ${winners[0] + winners[1]}.`,
      ),
    },
    {
      phase: 'pick3',
      highlight: [ranked[0].winId, ranked[1].winId, ranked[2].winId],
      hold: 2100,
      result: false,
      caption: t(
        `From ${ranked[2].win}/${ranked[2].lose}, keep ${ranked[2].win} (so ${ranked[2].lose} drops out).`,
        `Dari ${ranked[2].win}/${ranked[2].lose}, ambil ${ranked[2].win} (jadi ${ranked[2].lose} gugur).`,
      ),
    },
    {
      phase: 'result',
      highlight: [ranked[0].winId, ranked[1].winId, ranked[2].winId],
      hold: 0,
      result: true,
      caption: t(
        `${winners.join(' + ')} = ${total} — answer C.`,
        `${winners.join(' + ')} = ${total} — jawaban C.`,
      ),
    },
  ]

  return {
    pairs: ranked.map((r) => [r.win, r.lose] as [number, number]),
    answer: total,
    steps,
    finalIndex: steps.length - 1,
  }
}
