// OSN-08-SD-KAB-Q18 — storyboard for the shaded area animation.
//
// Question: grid with shaded polygon, each unit square = 5 cm².
// Shaded area = 7.5 unit squares → 37.5 cm².
//
// Teaching walk:
//   0. intro  — show the grid + shaded shape; task = count the squares.
//   1. count  — shaded region = exactly 7.5 unit squares.
//   2. result — 7.5 × 5 cm² = 37.5 cm².
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ShadedGridQ18PhaseId = 'intro' | 'count' | 'result'

export interface ShadedGridQ18Beat {
  phase: ShadedGridQ18PhaseId
  equation: string
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** Override fill on the polygon to indicate this beat's emphasis. */
  fillOverride?: string
}

export interface ShadedGridQ18Storyboard {
  steps: ShadedGridQ18Beat[]
  finalIndex: number
}

export function buildShadedGridOSN08KQ18Steps(lang: Lang): ShadedGridQ18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShadedGridQ18Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      equation: '',
      caption: t(
        'Each small square has area 5 cm². Count the shaded unit squares — including half-squares made by diagonals.',
        'Setiap kotak kecil luasnya 5 cm². Hitung kotak satuan yang diarsir — termasuk setengah kotak dari diagonal.',
      ),
      hold: 2800,
    },

    // Beat 1 — count
    {
      phase: 'count',
      equation: '7½',
      fillOverride: '#93C5FD',
      caption: t(
        'The shaded polygon covers exactly 7½ unit squares (count whole squares plus the half-squares cut by diagonal edges).',
        'Poligon yang diarsir mencakup tepat 7½ kotak satuan (hitung kotak penuh dan setengah kotak yang dipotong tepi diagonal).',
      ),
      hold: 3000,
    },

    // Beat 2 — result
    {
      phase: 'result',
      equation: '7,5 × 5 = 37,5 cm²',
      fillOverride: '#BBF7D0',
      caption: t(
        '7.5 unit squares × 5 cm² each = 37.5 cm². The area of the shaded region is 37.5 cm².',
        '7,5 kotak satuan × 5 cm² per kotak = 37,5 cm². Luas daerah yang diarsir adalah 37,5 cm².',
      ),
      hold: 0,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
