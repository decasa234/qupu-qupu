import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRIANGLES } from './P22G1Q19Illustration'

// WMI-22P1A-Q19 — "How many triangles, big and small?" (seed answer key: C).
//
// The animation ENUMERATES: each triangle lights up in turn (smallest first),
// with a running counter, so the learner sees the systematic "small cells first,
// then the bigger combined triangles" method that beats eyeballing. The closing
// beat names the keyed option.
//
// The faithful figure contains the triangles in TRIANGLES (ten of them, matching
// the key: option C = 10). The final caption reports the total and the option.

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
    1: ['the small cell under the horizontal line, by the right edge', 'sel kecil di bawah garis mendatar, dekat sisi kanan'],
    2: ['the upper cell between the middle line and the right edge', 'sel atas antara garis tengah dan sisi kanan'],
    3: ['a small one at the bottom, right of the middle line', 'satu kecil di bawah, di kanan garis tengah'],
    4: ['a small one in the lower-left', 'satu kecil di kiri bawah'],
    5: ['apex to the right corner — two cells as one', 'puncak ke sudut kanan — dua sel jadi satu'],
    6: ['the big LEFT cell (apex to the left corner)', 'sel KIRI besar (puncak ke sudut kiri)'],
    7: ['the wide bottom triangle, corner to corner', 'segitiga bawah lebar, dari sudut ke sudut'],
    8: ['apex, base point and right corner — three cells as one', 'puncak, titik alas, dan sudut kanan — tiga sel jadi satu'],
    9: ['everything left of the middle line, apex to base', 'semua di kiri garis tengah, puncak sampai alas'],
    10: ['the WHOLE big triangle', 'segitiga besar SELURUHNYA'],
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
      `${TRIANGLES.length} triangles in all — option ${answerLetter}.`,
      `Seluruhnya ${TRIANGLES.length} segitiga — pilihan ${answerLetter}.`,
    ),
  })

  return { total: TRIANGLES.length, answerLetter, steps, finalIndex: steps.length - 1 }
}
