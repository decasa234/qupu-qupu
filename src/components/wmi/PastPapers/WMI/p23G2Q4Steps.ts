import type { Lang } from '../concepts/explainers/makeTenSteps'
import { HIGH, HOUSE_NUMBERS, inRange, LOW, VISIT_COUNT } from './P23G2Q4Illustration'
import type { HouseState } from './P23G2Q4Illustration'

// WMI-23P2A-Q4 — check each house number against 150 < n < 449.
// Reveal one house per beat (visit ✓ or skip ✗) with a running visit count,
// landing on 6 (answer D).
export interface Q4Step {
  states: Record<number, HouseState>
  visited: number
  caption: string
  hold: number
  result: boolean
}

export interface Q4Storyboard {
  answer: string
  count: number
  steps: Q4Step[]
  finalIndex: number
}

export function buildP23G2Q4Steps(lang: Lang): Q4Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q4Step[] = [
    {
      states: {},
      visited: 0,
      hold: 1900,
      result: false,
      caption: t(
        `Rule: visit a house only if ${LOW} < number < ${HIGH}.`,
        `Aturan: kunjungi rumah hanya jika ${LOW} < nomor < ${HIGH}.`,
      ),
    },
  ]

  const states: Record<number, HouseState> = {}
  let visited = 0
  HOUSE_NUMBERS.forEach((n, i) => {
    const ok = inRange(n)
    states[i] = ok ? 'visit' : 'skip'
    if (ok) visited += 1
    const why = ok
      ? t(`${LOW} < ${n} < ${HIGH} ✓ visit`, `${LOW} < ${n} < ${HIGH} ✓ kunjungi`)
      : n <= LOW
        ? t(`${n} ≤ ${LOW} ✗ too small`, `${n} ≤ ${LOW} ✗ terlalu kecil`)
        : t(`${n} ≥ ${HIGH} ✗ too big`, `${n} ≥ ${HIGH} ✗ terlalu besar`)
    steps.push({
      states: { ...states },
      visited,
      hold: 1650,
      result: false,
      caption: `${why}   ·   ${t('visits', 'kunjungan')}: ${visited}`,
    })
  })

  steps.push({
    states: { ...states },
    visited,
    hold: 0,
    result: true,
    caption: t(
      `Jerry visits ${VISIT_COUNT} houses — answer D.`,
      `Jerry mengunjungi ${VISIT_COUNT} rumah — jawaban D.`,
    ),
  })

  return { answer: 'D', count: VISIT_COUNT, steps, finalIndex: steps.length - 1 }
}
