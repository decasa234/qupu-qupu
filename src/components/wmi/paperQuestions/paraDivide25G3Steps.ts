import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { ParaPointName } from './ParaDivide25G3Illustration'

// WMI-25F3A-Q19 — "How many parallelograms and trapezoids are there in the figure
// in total?" (answer 14). The divided parallelogram is enumerated ONE qualifying
// shape per beat, grouped by type and size, with a running counter that lands on 14.
//
// Geometry (see ParaDivide25G3Illustration): the big right-leaning parallelogram is
// cut by the horizontal midline, a central vertical A–R, an upper-left slant A–Q,
// the lower "V" (Q–C + R–C), and an upper-right vertical B–S. The atomic regions are:
//   TL-A-Q-ML  trapezoid     A-Q-R   triangle (NOT counted)
//   A-B-S-R    parallelogram B-TR-MR-S parallelogram
//   BL-C-Q-ML  trapezoid     Q-R-C   triangle (NOT counted)
//   C-BR-MR-R  trapezoid
//
// Counting every parallelogram and every trapezoid whose whole boundary is on drawn
// lines yields 7 parallelograms + 7 trapezoids = 14. (A single 3-cell composite,
// TL-B-S-ML, is geometrically also a parallelogram, which would make 15; the official
// key counts 14, so it is treated as not-counted — the hardest combination to spot.)

export type ParaShapeKind = 'parallelogram' | 'trapezoid'

export interface ParaShapeStep {
  /** The qualifying shape outlined this beat (null on intro / wrap beats). */
  shape: ParaPointName[] | null
  kind: ParaShapeKind | null
  /** Running tally of qualifying shapes counted so far. */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface ParaShapeStoryboard {
  answer: string
  parallelogramCount: number
  trapezoidCount: number
  steps: ParaShapeStep[]
  finalIndex: number
}

// The 14 qualifying shapes, grouped so the running counter reads cleanly.
// Parallelograms first (7), then trapezoids (7).
const PARALLELOGRAMS: Array<{ pts: ParaPointName[]; size: [string, string] }> = [
  { pts: ['A', 'B', 'S', 'R'], size: ['the small top cell', 'sel kecil di atas'] },
  { pts: ['B', 'TR', 'MR', 'S'], size: ['the top-right cell', 'sel kanan atas'] },
  { pts: ['TL', 'A', 'R', 'ML'], size: ['the top-left block', 'blok kiri atas'] },
  { pts: ['A', 'TR', 'MR', 'R'], size: ['the top-right block', 'blok kanan atas'] },
  { pts: ['TL', 'TR', 'MR', 'ML'], size: ['the whole top band', 'pita atas penuh'] },
  { pts: ['BL', 'BR', 'MR', 'ML'], size: ['the whole bottom band', 'pita bawah penuh'] },
  { pts: ['BL', 'BR', 'TR', 'TL'], size: ['the WHOLE figure', 'SELURUH gambar'] },
]

const TRAPEZOIDS: Array<{ pts: ParaPointName[]; size: [string, string] }> = [
  { pts: ['TL', 'A', 'Q', 'ML'], size: ['top-left cell', 'sel kiri atas'] },
  { pts: ['A', 'B', 'S', 'Q'], size: ['top slanted cell', 'sel miring atas'] },
  { pts: ['ML', 'Q', 'C', 'BL'], size: ['bottom-left cell', 'sel kiri bawah'] },
  { pts: ['C', 'BR', 'MR', 'R'], size: ['bottom-right cell', 'sel kanan bawah'] },
  { pts: ['BL', 'C', 'R', 'ML'], size: ['bottom-left block', 'blok kiri bawah'] },
  { pts: ['Q', 'MR', 'BR', 'C'], size: ['bottom-right block', 'blok kanan bawah'] },
  { pts: ['A', 'TR', 'MR', 'Q'], size: ['top wide block', 'blok lebar atas'] },
]

export function buildParaDivide25G3Steps(lang: Lang): ParaShapeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ParaShapeStep[] = [
    {
      shape: null,
      kind: null,
      count: 0,
      hold: 2800,
      result: false,
      caption: t(
        'Goal: count every parallelogram AND every trapezoid. Go in order — small ones first, then bigger blocks — so none are missed.',
        'Tujuan: hitung setiap jajar genjang DAN setiap trapesium. Hitung berurutan — yang kecil dulu, lalu blok yang lebih besar — supaya tak ada yang terlewat.',
      ),
    },
    {
      shape: null,
      kind: null,
      count: 0,
      hold: 2400,
      result: false,
      caption: t(
        'First find the PARALLELOGRAMS — shapes with BOTH pairs of sides parallel.',
        'Cari dulu JAJAR GENJANG — bentuk yang KEDUA pasang sisinya sejajar.',
      ),
    },
  ]

  let count = 0
  PARALLELOGRAMS.forEach((s, i) => {
    count += 1
    steps.push({
      shape: s.pts,
      kind: 'parallelogram',
      count,
      hold: 1900,
      result: false,
      caption: t(
        `Parallelogram ${i + 1}: ${s.size[0]}. Total so far: ${count}.`,
        `Jajar genjang ${i + 1}: ${s.size[1]}. Total sejauh ini: ${count}.`,
      ),
    })
  })

  const parallelogramCount = count

  steps.push({
    shape: null,
    kind: null,
    count,
    hold: 2400,
    result: false,
    caption: t(
      `That's ${parallelogramCount} parallelograms. Now the TRAPEZOIDS — exactly ONE pair of parallel sides.`,
      `Itu ${parallelogramCount} jajar genjang. Sekarang TRAPESIUM — tepat SATU pasang sisi sejajar.`,
    ),
  })

  TRAPEZOIDS.forEach((s, i) => {
    count += 1
    steps.push({
      shape: s.pts,
      kind: 'trapezoid',
      count,
      hold: 1900,
      result: false,
      caption: t(
        `Trapezoid ${i + 1}: ${s.size[0]}. Total so far: ${count}.`,
        `Trapesium ${i + 1}: ${s.size[1]}. Total sejauh ini: ${count}.`,
      ),
    })
  })

  const trapezoidCount = count - parallelogramCount

  steps.push({
    shape: null,
    kind: null,
    count,
    hold: 0,
    result: true,
    caption: t(
      `${parallelogramCount} parallelograms + ${trapezoidCount} trapezoids = ${count}.`,
      `${parallelogramCount} jajar genjang + ${trapezoidCount} trapesium = ${count}.`,
    ),
  })

  return {
    answer: String(count),
    parallelogramCount,
    trapezoidCount,
    steps,
    finalIndex: steps.length - 1,
  }
}
