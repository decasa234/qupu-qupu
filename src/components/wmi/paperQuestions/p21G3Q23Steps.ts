import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q23_ANSWER, Q23_FACES, Q23_MIN_COLORS } from './P21G3Q23Illustration'

export type Q23Phase = 'show' | 'rule' | 'tryOne' | 'paintUpper' | 'paintLower' | 'check' | 'result'

export interface Q23Step {
  phase: Q23Phase
  painted: Record<number, 0 | 1 | 'clash'>
  active: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q23Storyboard {
  minColors: number
  answer: string
  steps: Q23Step[]
  finalIndex: number
}

// Verified 2-colouring (octahedron face graph is bipartite): each face's three
// neighbours are all the opposite class. colorClass on every face encodes it.
const FULL: Record<number, 0 | 1> = {}
for (const f of Q23_FACES) FULL[f.id] = f.colorClass

const UPPER = Q23_FACES.filter((f) => f.id <= 3)
const LOWER = Q23_FACES.filter((f) => f.id >= 4)

function paintSubset(ids: number[]): Record<number, 0 | 1 | 'clash'> {
  const out: Record<number, 0 | 1 | 'clash'> = {}
  for (const id of ids) out[id] = FULL[id]
  return out
}

export function buildP21G3Q23Steps(lang: Lang): Q23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const upperIds = UPPER.map((f) => f.id)
  const lowerIds = LOWER.map((f) => f.id)

  const steps: Q23Step[] = [
    {
      phase: 'show',
      painted: {},
      active: [],
      hold: 1800,
      result: false,
      caption: t(
        'The lantern is an octahedron: 8 triangular faces in all.',
        'Lampion ini oktahedron: ada 8 sisi segitiga seluruhnya.',
      ),
    },
    {
      phase: 'rule',
      painted: {},
      active: [0, 1, 3],
      hold: 2000,
      result: false,
      caption: t(
        'Each triangle shares an edge with 3 others — those neighbours must differ in colour.',
        'Setiap segitiga berbagi sisi dengan 3 segitiga lain — warnanya harus berbeda.',
      ),
    },
    {
      phase: 'tryOne',
      painted: { 0: 0, 1: 'clash' },
      active: [1],
      hold: 2000,
      result: false,
      caption: t(
        '1 colour is impossible: two touching faces would match. So we need more.',
        '1 warna mustahil: dua sisi yang bersentuhan akan sama. Jadi perlu lebih.',
      ),
    },
    {
      phase: 'paintUpper',
      painted: paintSubset(upperIds),
      active: upperIds,
      hold: 2100,
      result: false,
      caption: t(
        'Try 2 colours. Paint the 4 top faces alternately around the apex.',
        'Coba 2 warna. Cat 4 sisi atas berselang-seling mengelilingi puncak.',
      ),
    },
    {
      phase: 'paintLower',
      painted: FULL,
      active: lowerIds,
      hold: 2100,
      result: false,
      caption: t(
        'Now the 4 bottom faces — each gets the OTHER colour from the top face above it.',
        'Sekarang 4 sisi bawah — masing-masing dapat warna LAIN dari sisi atas di atasnya.',
      ),
    },
    {
      phase: 'check',
      painted: FULL,
      active: [],
      hold: 2100,
      result: false,
      caption: t(
        'Check every shared edge: the two faces are always different colours. It works!',
        'Periksa setiap sisi bersama: kedua segitiga selalu beda warna. Berhasil!',
      ),
    },
    {
      phase: 'result',
      painted: FULL,
      active: [],
      hold: 0,
      result: true,
      caption: t(
        `So only ${Q23_MIN_COLORS} colours are needed — answer ${Q23_ANSWER}.`,
        `Jadi cukup ${Q23_MIN_COLORS} warna saja — jawaban ${Q23_ANSWER}.`,
      ),
    },
  ]

  return { minColors: Q23_MIN_COLORS, answer: Q23_ANSWER, steps, finalIndex: steps.length - 1 }
}
