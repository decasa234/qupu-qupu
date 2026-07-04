import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRIANGLES, TRI_TOTAL } from './TriCount22G1Illustration'

// WMI-22F1A-Q19 — "count every triangle in the tree" (Grade 1, answer 16).
//
// The animation ENUMERATES: one triangle lights up per beat with a running
// counter (1, 2, 3, …). The small unit triangles are revealed first (bottom
// tier up), then the three whole-tier triangles, then the central peak — so the
// kid sees we never miss the "big" combined triangles. The final beat shows the
// total. Both the beat count and the answer derive from the data (TRIANGLES /
// TRI_TOTAL), never a hardcoded 16.

export interface TriCountStep {
  /** Which triangle id is lit on this beat (undefined = none, the intro/final). */
  litId?: number
  /** Running count to show in the counter chip. */
  count: number
  /** True on the closing total beat. */
  result: boolean
  caption: string
  hold: number
}

export interface TriCountStoryboard {
  total: number
  steps: TriCountStep[]
  finalIndex: number
}

// Kid-voiced label for each triangle as it is revealed, keyed by 1-based id.
// Matches the reveal ORDER in TriCount22G1Illustration:
// 1–4 bottom band, 5–10 middle band, 11–16 top band.
function triLabel(id: number, lang: Lang): string {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)
  const map: Record<number, [string, string]> = {
    1: ['the little tent in the middle of the bottom part', 'tenda kecil di tengah bagian bawah'],
    2: ['a big slanted one in the bottom, leaning right', 'satu besar miring di bawah, condong ke kanan'],
    3: ['a big slanted one in the bottom, leaning left', 'satu besar miring di bawah, condong ke kiri'],
    4: ['the WHOLE bottom part is one big triangle too!', 'bagian bawah SELURUHNYA juga satu segitiga besar!'],
    5: ['a little one in the middle-left', 'satu kecil di kiri tengah'],
    6: ['a little one in the middle-right', 'satu kecil di kanan tengah'],
    7: ['the peak poking down into the middle part', 'puncak yang menjulur ke bagian tengah'],
    8: ['a big slanted one in the middle, leaning right', 'satu besar miring di tengah, condong ke kanan'],
    9: ['a big slanted one in the middle, leaning left', 'satu besar miring di tengah, condong ke kiri'],
    10: ['the whole middle part is a big triangle', 'bagian tengah seluruhnya satu segitiga besar'],
    11: ['a little one in the top-left', 'satu kecil di kiri atas'],
    12: ['a little one in the top-right', 'satu kecil di kanan atas'],
    13: ['the little peak poking up in the top part', 'puncak kecil yang menyembul di bagian atas'],
    14: ['the lower-left corner of the top part', 'pojok kiri-bawah bagian atas'],
    15: ['the lower-right corner of the top part', 'pojok kanan-bawah bagian atas'],
    16: ['the whole top part is a big triangle', 'bagian atas seluruhnya satu segitiga besar'],
  }
  const [en, idn] = map[id] ?? ['this triangle', 'segitiga ini']
  return t(en, idn)
}

export function buildTriCount22G1Steps(lang: Lang): TriCountStoryboard {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)

  const steps: TriCountStep[] = []

  // Beat 0 — set up the strategy.
  steps.push({
    count: 0,
    result: false,
    hold: 2200,
    caption: t(
      "Let's count EVERY triangle — big and small. We'll point to one at a time.",
      'Ayo hitung SETIAP segitiga — besar dan kecil. Kita tunjuk satu per satu.',
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
      caption: t(
        `Triangle ${n}: ${triLabel(n, 'en')}.`,
        `Segitiga ${n}: ${triLabel(n, 'id')}.`,
      ),
    })
  })

  // Final beat — total.
  steps.push({
    count: TRI_TOTAL,
    result: true,
    hold: 0,
    caption: t(
      `All counted — ${TRI_TOTAL} triangles in the tree!`,
      `Semua terhitung — ${TRI_TOTAL} segitiga pada pohon itu!`,
    ),
  })

  return { total: TRI_TOTAL, steps, finalIndex: steps.length - 1 }
}
