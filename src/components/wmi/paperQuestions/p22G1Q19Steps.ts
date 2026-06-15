import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TRIANGLES } from './P22G1Q19Illustration'

// WMI-22P1A-Q19 — "How many triangles, big and small?" (seed answer key: C).
//
// The animation ENUMERATES: each triangle lights up in turn (smallest first),
// with a running counter, so the learner sees the systematic "small cells first,
// then the bigger combined triangles" method that beats eyeballing. The closing
// beat names the keyed option.
//
// The faithful figure contains the triangles in TRIANGLES (nine of them). The
// final caption reports the running total and names the marked option so the
// learner can map the count to the answer sheet.

export interface Q19Step {
  /** Triangle id lit on this beat (undefined on intro / final). */
  litId?: number
  /** Running count shown in the counter chip. */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface Q19Storyboard {
  total: number
  answerLetter: string
  steps: Q19Step[]
  finalIndex: number
}

// Kid-voiced label per triangle id (matches TRIANGLES' smallest-first order).
function triLabel(id: number, lang: Lang): string {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)
  const map: Record<number, [string, string]> = {
    1: ['the thin sliver up by the top-right', 'irisan tipis di kanan atas'],
    2: ['a small one in the lower-right', 'satu kecil di kanan bawah'],
    3: ['a small one in the lower-middle', 'satu kecil di tengah bawah'],
    4: ['the cell between the slanted line and the right edge', 'sel antara garis miring dan sisi kanan'],
    5: ['a small one in the lower-left', 'satu kecil di kiri bawah'],
    6: ['the big RIGHT triangle (apex to the right corner)', 'segitiga KANAN besar (puncak ke sudut kanan)'],
    7: ['the big LEFT triangle (apex to the left corner)', 'segitiga KIRI besar (puncak ke sudut kiri)'],
    8: ['the whole bottom fan as one triangle', 'kipas bawah seluruhnya sebagai satu segitiga'],
    9: ['the WHOLE big triangle', 'segitiga besar SELURUHNYA'],
  }
  const [en, idn] = map[id] ?? ['this triangle', 'segitiga ini']
  return t(en, idn)
}

export function buildP22G1Q19Steps(lang: Lang, answerLetter: string): Q19Storyboard {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)
  const steps: Q19Step[] = []

  steps.push({
    count: 0,
    result: false,
    hold: 2200,
    caption: t(
      "Count EVERY triangle — small cells first, then the bigger ones. Point at one at a time.",
      'Hitung SETIAP segitiga — sel kecil dulu, lalu yang besar. Tunjuk satu per satu.',
    ),
  })

  TRIANGLES.forEach((tri) => {
    steps.push({
      litId: tri.id,
      count: tri.id,
      result: false,
      hold: 1400,
      caption: t(
        `Triangle ${tri.id}: ${triLabel(tri.id, 'en')}.`,
        `Segitiga ${tri.id}: ${triLabel(tri.id, 'id')}.`,
      ),
    })
  })

  steps.push({
    count: TRIANGLES.length,
    result: true,
    hold: 0,
    caption: t(
      `All counted — the answer key marks option ${answerLetter}.`,
      `Semua terhitung — kunci jawaban menandai pilihan ${answerLetter}.`,
    ),
  })

  return { total: TRIANGLES.length, answerLetter, steps, finalIndex: steps.length - 1 }
}
