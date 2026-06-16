import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ANSWER, NON_BLACK_TRIANGLE_KEYS, TRIANGLE_KEYS } from './TriangleColors20Illustration'

export type TrianglePhase = 'find' | 'count' | 'exclude' | 'trap' | 'result'

export interface TriangleColorsStep {
  phase: TrianglePhase
  /** Shapes (by key) ringed in amber. */
  highlightKeys: string[]
  /** Fade everything that is not a triangle. */
  dimNonTriangles: boolean
  /** key → true = green check (counted), false = red X (excluded). */
  badges: Record<string, boolean>
  caption: string
  hold: number
  result: boolean
}

export interface TriangleColorsStoryboard {
  answer: number
  steps: TriangleColorsStep[]
  finalIndex: number
}

const BLACK_TRIANGLE_KEYS = TRIANGLE_KEYS.filter((k) => !NON_BLACK_TRIANGLE_KEYS.includes(k))

/** Every triangle checked green — the "count them all" view. */
const allCounted: Record<string, boolean> = Object.fromEntries(TRIANGLE_KEYS.map((k) => [k, true]))
/** Black triangles crossed out, white + gray kept. */
const blackExcluded: Record<string, boolean> = Object.fromEntries(
  TRIANGLE_KEYS.map((k) => [k, NON_BLACK_TRIANGLE_KEYS.includes(k)]),
)

export function buildTriangleColors20Steps(lang: Lang): TriangleColorsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriangleColorsStep[] = [
    {
      phase: 'find',
      highlightKeys: TRIANGLE_KEYS,
      dimNonTriangles: true,
      badges: {},
      hold: 2000,
      result: false,
      caption: t(
        'Find every triangle first! The circles and the square are not triangles — fade them out.',
        'Cari semua segitiga dulu! Lingkaran dan persegi bukan segitiga — pudarkan saja.',
      ),
    },
    {
      phase: 'count',
      highlightKeys: TRIANGLE_KEYS,
      dimNonTriangles: true,
      badges: allCounted,
      hold: 1900,
      result: false,
      caption: t(
        'Count them: 2 black + 1 white + 3 gray = 6 triangles in all.',
        'Hitung: 2 hitam + 1 putih + 3 abu-abu = 6 segitiga semuanya.',
      ),
    },
    {
      phase: 'exclude',
      highlightKeys: BLACK_TRIANGLE_KEYS,
      dimNonTriangles: true,
      badges: blackExcluded,
      hold: 2000,
      result: false,
      caption: t(
        'We want triangles that are NOT black — so cross out the 2 black ones.',
        'Kita mau segitiga yang TIDAK hitam — jadi coret 2 segitiga hitam.',
      ),
    },
    {
      phase: 'trap',
      highlightKeys: ['tri-white'],
      dimNonTriangles: true,
      badges: blackExcluded,
      hold: 2100,
      result: false,
      caption: t(
        'Careful! The white triangle counts too — white is not black.',
        'Hati-hati! Segitiga putih juga ikut dihitung — putih bukan hitam.',
      ),
    },
    {
      phase: 'result',
      highlightKeys: NON_BLACK_TRIANGLE_KEYS,
      dimNonTriangles: true,
      badges: blackExcluded,
      hold: 0,
      result: true,
      caption: t(
        `1 white + 3 gray = ${ANSWER} triangles that are not black.`,
        `1 putih + 3 abu-abu = ${ANSWER} segitiga yang tidak hitam.`,
      ),
    },
  ]

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
