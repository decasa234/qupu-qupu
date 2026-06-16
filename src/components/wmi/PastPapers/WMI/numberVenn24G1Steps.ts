import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24F1A-Q10 (Grade 1): how many numbers are in BOTH the square and circle,
// NOT in the triangle, AND larger than 40?
//
// The square ∩ circle (not-triangle) region holds {90, 13, 58, 44, 32, 8}.
// Filter to > 40 → {90, 58, 44}. Answer: 3 (choice C).
//
// One filter per beat:
//   beat 1 — name the square∩circle-but-not-triangle region {90,13,58,44,32,8}.
//   beat 2 — keep only > 40: 90 ✓, 58 ✓, 44 ✓; 13, 32, 8 too small ✗.
//   beat 3 — result: ring 90, 58, 44 → 3 numbers.

// The six numbers in the square ∩ circle (not-triangle) region, in scan order.
const REGION = [90, 13, 58, 44, 32, 8] as const
const KEEPERS = REGION.filter((n) => n > 40) // 90, 58, 44
const DROPPED = REGION.filter((n) => n <= 40) // 13, 32, 8

export type NumberVenn24G1Phase = 'region' | 'filter' | 'result'

export interface NumberVenn24G1Step {
  phase: NumberVenn24G1Phase
  /** Which candidate numbers are shown as chips this beat (always the six). */
  candidates: number[]
  /** Numbers marked as kept (> 40) — green chips. Empty until the filter beat. */
  kept: number[]
  /** Numbers marked as dropped (≤ 40) — gray chips. Empty until the filter beat. */
  dropped: number[]
  /** Ring the three qualifying numbers in the figure (result beat only). */
  highlight: boolean
  caption: string
  hold: number
  result: boolean
}

export interface NumberVenn24G1Storyboard {
  region: number[]
  keepers: number[]
  dropped: number[]
  answer: number
  steps: NumberVenn24G1Step[]
  finalIndex: number
}

export function buildNumberVenn24G1Steps(lang: Lang): NumberVenn24G1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const region = [...REGION]
  const keepers = [...KEEPERS]
  const dropped = [...DROPPED]
  const answer = keepers.length // 3

  // "a, b and c" / "a, b dan c" — comma-separated with the final pair conjoined.
  const conjoin = (xs: number[]) => {
    if (xs.length <= 1) return xs.join('')
    const word = lang === 'id' ? ' dan ' : ' and '
    return xs.slice(0, -1).join(', ') + word + xs[xs.length - 1]
  }

  const regionList = region.join(', ')
  const keepList = keepers.join(', ')
  const dropList = conjoin(dropped)

  const steps: NumberVenn24G1Step[] = [
    {
      phase: 'region',
      candidates: region,
      kept: [],
      dropped: [],
      highlight: false,
      hold: 2100,
      result: false,
      caption: t(
        `Inside BOTH the square and circle, but NOT the triangle: ${regionList}.`,
        `Di dalam persegi DAN lingkaran, tapi BUKAN segitiga: ${regionList}.`,
      ),
    },
    {
      phase: 'filter',
      candidates: region,
      kept: keepers,
      dropped,
      highlight: false,
      hold: 2100,
      result: false,
      caption: t(
        `Keep only the ones bigger than 40: ${keepList} stay; ${dropList} are too small.`,
        `Simpan yang lebih besar dari 40 saja: ${keepList} tinggal; ${dropList} terlalu kecil.`,
      ),
    },
    {
      phase: 'result',
      candidates: region,
      kept: keepers,
      dropped,
      highlight: true,
      hold: 0,
      result: true,
      caption: t(
        `${keepList} are all bigger than 40 → ${answer} numbers.`,
        `${keepList} semuanya lebih besar dari 40 → ${answer} angka.`,
      ),
    },
  ]

  return { region, keepers, dropped, answer, steps, finalIndex: steps.length - 1 }
}
