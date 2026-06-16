import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRIANGLES, TRI_TOTAL } from './P19G2Q23Illustration'

// WMI-19P2A-Q23 — "count every triangle in the rocket figure" (answer B = 19).
//
// The animation ENUMERATES: one triangle lights up per beat with a running
// counter. The figure splits cleanly into two parts:
//   ids 1–8   the crossed rectangle on top (4 quadrants + 4 halves)
//   ids 9–19  the flared triangle base (small fan pieces → big base triangle)
// The worked example in the paper reminds us to count COMBINED triangles too,
// not just the smallest ones. Both the beat count and the answer derive from the
// data (TRIANGLES / TRI_TOTAL), never a hardcoded 19.

export interface TriCountStep {
  litId?: number
  count: number
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
function triLabel(id: number, lang: Lang): string {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)
  const map: Record<number, [string, string]> = {
    1: ['a small triangle in the top of the rectangle', 'segitiga kecil di atas persegi panjang'],
    2: ['a small triangle on the right of the rectangle', 'segitiga kecil di kanan persegi panjang'],
    3: ['a small triangle at the bottom of the rectangle', 'segitiga kecil di bawah persegi panjang'],
    4: ['a small triangle on the left of the rectangle', 'segitiga kecil di kiri persegi panjang'],
    5: ['the top-left HALF of the rectangle', 'SETENGAH kiri-atas persegi panjang'],
    6: ['the top-right half of the rectangle', 'setengah kanan-atas persegi panjang'],
    7: ['the bottom-left half of the rectangle', 'setengah kiri-bawah persegi panjang'],
    8: ['the bottom-right half of the rectangle', 'setengah kanan-bawah persegi panjang'],
    9: ['a small triangle inside the flare', 'segitiga kecil di dalam corong'],
    10: ['another small triangle in the flare', 'segitiga kecil lain di corong'],
    11: ['the slim triangle on the flare’s left edge', 'segitiga tipis di tepi kiri corong'],
    12: ['a small triangle on the flare’s left', 'segitiga kecil di kiri corong'],
    13: ['a small triangle on the flare’s right', 'segitiga kecil di kanan corong'],
    14: ['the middle of the flare, two pieces joined', 'bagian tengah corong, dua potong digabung'],
    15: ['the left HALF of the flare', 'SETENGAH kiri corong'],
    16: ['the right half of the flare', 'setengah kanan corong'],
    17: ['a bigger combined triangle on the left', 'segitiga gabungan lebih besar di kiri'],
    18: ['a bigger combined triangle on the right', 'segitiga gabungan lebih besar di kanan'],
    19: ['the WHOLE flare is one big triangle too!', 'corong SELURUHNYA juga satu segitiga besar!'],
  }
  const [en, idn] = map[id] ?? ['this triangle', 'segitiga ini']
  return t(en, idn)
}

export function buildP19G2Q23Steps(lang: Lang): TriCountStoryboard {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)

  const steps: TriCountStep[] = []

  // Beat 0 — set up the strategy (echoing the worked example's reminder).
  steps.push({
    count: 0,
    result: false,
    hold: 2400,
    caption: t(
      "Count EVERY triangle — small ones AND the bigger ones made by joining pieces. We'll point to one at a time.",
      'Hitung SETIAP segitiga — yang kecil DAN yang besar dari gabungan potongan. Kita tunjuk satu per satu.',
    ),
  })

  // One beat per triangle, with the running counter; flag the transition.
  TRIANGLES.forEach((tri) => {
    const n = tri.id
    let caption = t(`Triangle ${n}: ${triLabel(n, 'en')}.`, `Segitiga ${n}: ${triLabel(n, 'id')}.`)
    if (n === 1)
      caption = t(
        `Top part first — the rectangle with its X. Triangle 1: ${triLabel(1, 'en')}.`,
        `Bagian atas dulu — persegi panjang dengan tanda X. Segitiga 1: ${triLabel(1, 'id')}.`,
      )
    if (n === 9)
      caption = t(
        `Now the flare at the bottom. Triangle 9: ${triLabel(9, 'en')}.`,
        `Sekarang corong di bawah. Segitiga 9: ${triLabel(9, 'id')}.`,
      )
    steps.push({ litId: n, count: n, result: false, hold: 1400, caption })
  })

  // Final beat — total → 19 → B.
  steps.push({
    count: TRI_TOTAL,
    result: true,
    hold: 0,
    caption: t(
      `All counted — ${TRI_TOTAL} triangles in the figure, so △ = ${TRI_TOTAL} — answer B.`,
      `Semua terhitung — ${TRI_TOTAL} segitiga pada gambar, jadi △ = ${TRI_TOTAL} — jawaban B.`,
    ),
  })

  return { total: TRI_TOTAL, steps, finalIndex: steps.length - 1 }
}
