import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FILL_ORDER, FILL_ORDER_STR, TANKS } from './P23G2Q5Illustration'
import type { Tank } from './P23G2Q5Illustration'

// WMI-23P2A-Q5 — same pour rate into all four tanks at once. The smallest
// capacity tops out first. Equal-rate pour ⇒ at the instant tank X is full
// (volume poured = capX), every tank Y holds min(1, capX/capY) of its height.
// Walk the four completions in capacity order: B, A, C, D. Answer D ("BACD").
type Id = Tank['id']

export interface Q5Step {
  fills: Partial<Record<Id, number>>
  done: Partial<Record<Id, boolean>>
  ranks: Partial<Record<Id, number>>
  caption: string
  hold: number
  result: boolean
}

export interface Q5Storyboard {
  order: string
  answer: string
  steps: Q5Step[]
  finalIndex: number
}

const CAP: Record<Id, number> = Object.fromEntries(TANKS.map((t) => [t.id, t.cap])) as Record<Id, number>

export function buildP23G2Q5Steps(lang: Lang): Q5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q5Step[] = [
    {
      fills: {},
      done: {},
      ranks: {},
      hold: 1900,
      result: false,
      caption: t(
        'Same pour, same start — the smallest tank fills first.',
        'Tuangan sama, mulai bersamaan — wadah terkecil penuh duluan.',
      ),
    },
  ]

  // Capacity comparison beat (just under half-full snapshot) to make sizes obvious.
  const half = TANKS[0].cap // pour volume = smallest cap, see who's still filling
  steps.push({
    fills: Object.fromEntries(TANKS.map((tk) => [tk.id, Math.min(1, half / CAP[tk.id])])) as Record<Id, number>,
    done: {},
    ranks: {},
    hold: 2000,
    result: false,
    caption: t(
      `Sizes: B < A < C < D, so they finish in that order.`,
      `Ukuran: B < A < C < D, jadi penuh dengan urutan itu.`,
    ),
  })

  // One beat per completion, in capacity order.
  const done: Partial<Record<Id, boolean>> = {}
  const ranks: Partial<Record<Id, number>> = {}
  FILL_ORDER.forEach((id, k) => {
    const pour = CAP[id] // volume poured at the instant `id` tops out
    done[id] = true
    ranks[id] = k + 1
    const fills = Object.fromEntries(TANKS.map((tk) => [tk.id, Math.min(1, pour / CAP[tk.id])])) as Record<Id, number>
    const place = ['1st', '2nd', '3rd', '4th'][k]
    const placeId = ['ke-1', 'ke-2', 'ke-3', 'ke-4'][k]
    steps.push({
      fills,
      done: { ...done },
      ranks: { ...ranks },
      hold: k === FILL_ORDER.length - 1 ? 1700 : 1800,
      result: false,
      caption: t(`${id} is full — ${place} to finish.`, `${id} penuh — selesai ${placeId}.`),
    })
  })

  steps.push({
    fills: Object.fromEntries(TANKS.map((tk) => [tk.id, 1])) as Record<Id, number>,
    done: { ...done },
    ranks: { ...ranks },
    hold: 0,
    result: true,
    caption: t(
      `Order: ${FILL_ORDER_STR} — answer D.`,
      `Urutan: ${FILL_ORDER_STR} — jawaban D.`,
    ),
  })

  return { order: FILL_ORDER_STR, answer: 'D', steps, finalIndex: steps.length - 1 }
}
