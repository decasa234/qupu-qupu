import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRIANGLES, TRI_TOTAL } from './SquareTriangles19P1Illustration'

// WMI-19P1A-Q21 — "How many triangles are in the figure?" (answer A = 14).
//
// The animation ENUMERATES: one triangle lights up per beat with a running
// counter (1, 2, 3, …). Smallest pieces first (the four in the X), then the
// half-square triangles, then the big composite ones — so the kid sees we never
// miss the "big" combined triangles. The final beat shows the total. Both the
// beat count and the answer derive from the data (TRIANGLES / TRI_TOTAL), never
// a hardcoded 14.

export interface SquareTriStep {
  /** Which triangle id is lit on this beat (undefined = the intro/final). */
  litId?: number
  /** Running count to show in the counter chip. */
  count: number
  /** True on the closing total beat. */
  result: boolean
  caption: string
  hold: number
}

export interface SquareTriStoryboard {
  total: number
  answer: number
  steps: SquareTriStep[]
  finalIndex: number
}

// Kid-voiced label for each triangle as it is revealed, keyed by 1-based id.
function triLabel(id: number, lang: Lang): string {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)
  const map: Record<number, [string, string]> = {
    1: ['a tiny one in the X — the top wedge', 'satu kecil di X — bagian atas'],
    2: ['a tiny one in the X — the left wedge', 'satu kecil di X — bagian kiri'],
    3: ['a tiny one in the X — the right wedge', 'satu kecil di X — bagian kanan'],
    4: ['a tiny one in the X — the bottom wedge', 'satu kecil di X — bagian bawah'],
    5: ['half the little square, split one way', 'separuh persegi kecil, dibelah satu arah'],
    6: ['the other half, same split', 'separuh lainnya, belahan yang sama'],
    7: ['half the little square, split the other way', 'separuh persegi kecil, dibelah arah lain'],
    8: ['the other half, that split', 'separuh lainnya, belahan itu'],
    9: ['the slim strip above the little square', 'jalur tipis di atas persegi kecil'],
    10: ['the WHOLE square split by the big diagonal — top-right half', 'SELURUH persegi dibelah diagonal besar — separuh kanan-atas'],
    11: ['…and its bottom-left half', '…dan separuh kiri-bawahnya'],
    12: ['a big one under the diagonal, right of the little square', 'satu besar di bawah diagonal, kanan persegi kecil'],
    13: ['the bottom-right wedge under the diagonal', 'bagian kanan-bawah di bawah diagonal'],
    14: ['the big left triangle from the corner to the centre', 'segitiga besar kiri dari sudut ke pusat'],
  }
  const [en, idn] = map[id] ?? ['this triangle', 'segitiga ini']
  return t(en, idn)
}

export function buildSquareTriangles19P1Steps(lang: Lang): SquareTriStoryboard {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)

  const steps: SquareTriStep[] = []

  // Beat 0 — set up the strategy.
  steps.push({
    count: 0,
    result: false,
    hold: 2200,
    caption: t(
      "Don't just count the little ones — find EVERY triangle, big and small. One at a time.",
      'Jangan cuma hitung yang kecil — cari SETIAP segitiga, besar dan kecil. Satu per satu.',
    ),
  })

  // One beat per triangle, with the running counter.
  TRIANGLES.forEach((tri) => {
    const n = tri.id
    steps.push({
      litId: n,
      count: n,
      result: false,
      hold: 1500,
      caption: t(`Triangle ${n}: ${triLabel(n, 'en')}.`, `Segitiga ${n}: ${triLabel(n, 'id')}.`),
    })
  })

  // Final beat — total.
  steps.push({
    count: TRI_TOTAL,
    result: true,
    hold: 0,
    caption: t(
      `All counted — ${TRI_TOTAL} triangles. Answer A.`,
      `Semua terhitung — ${TRI_TOTAL} segitiga. Jawaban A.`,
    ),
  })

  return { total: TRI_TOTAL, answer: TRI_TOTAL, steps, finalIndex: steps.length - 1 }
}
