import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRI_TOTAL, TRIS_BY_GROUP } from './TrianglesX22A7Illustration'

export interface TrianglesX22A7Step {
  highlightGroup: number | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface TrianglesX22A7Storyboard {
  total: number
  steps: TrianglesX22A7Step[]
  finalIndex: number
}

export function buildTrianglesX22A7Steps(lang: Lang): TrianglesX22A7Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TrianglesX22A7Step[] = [
    {
      highlightGroup: null,
      running: 0,
      hold: 1400,
      result: false,
      caption: t(
        'Count ALL triangles — unit, medium (size-2), and the big outer triangle.',
        'Hitung SEMUA segitiga — satuan, sedang (ukuran-2), dan segitiga besar luar.',
      ),
    },
  ]

  const groupDescs = [
    {
      en: (n: number, run: number) =>
        `${n} unit (size-1) triangles — count row by row. Running total: ${run}.`,
      id: (n: number, run: number) =>
        `${n} segitiga satuan (ukuran-1) — hitung baris per baris. Total: ${run}.`,
    },
    {
      en: (n: number, run: number) =>
        `${n} medium upward (size-2) triangles — each contains 4 small ones. Running total: ${run}.`,
      id: (n: number, run: number) =>
        `${n} segitiga sedang ke atas (ukuran-2) — masing-masing berisi 4 segitiga kecil. Total: ${run}.`,
    },
    {
      en: (n: number, run: number) =>
        `${n} large triangle spanning the whole figure. Running total: ${run}.`,
      id: (n: number, run: number) =>
        `${n} segitiga besar yang mencakup seluruh gambar. Total: ${run}.`,
    },
  ]

  let running = 0
  TRIS_BY_GROUP.forEach(({ tris }, i) => {
    running += tris.length
    steps.push({
      highlightGroup: i,
      running,
      hold: 2000,
      result: false,
      caption: t(groupDescs[i].en(tris.length, running), groupDescs[i].id(tris.length, running)),
    })
  })

  const parts = TRIS_BY_GROUP.map((g) => g.tris.length).join(' + ')
  steps.push({
    highlightGroup: null,
    running: TRI_TOTAL,
    hold: 0,
    result: true,
    caption: t(
      `${parts} = ${TRI_TOTAL} triangles in total. Answer: ${TRI_TOTAL}.`,
      `${parts} = ${TRI_TOTAL} segitiga seluruhnya. Jawaban: ${TRI_TOTAL}.`,
    ),
  })

  return { total: TRI_TOTAL, steps, finalIndex: steps.length - 1 }
}
