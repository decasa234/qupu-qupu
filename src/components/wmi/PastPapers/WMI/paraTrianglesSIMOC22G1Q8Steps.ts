import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { PARA_TRI_GROUPS, PARA_TRI_TOTAL } from './ParaTrianglesSIMOC22G1Q8Illustration'

export interface ParaTrianglesStep {
  highlightGroup: number | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface ParaTrianglesStoryboard {
  total: number
  steps: ParaTrianglesStep[]
  finalIndex: number
}

export function buildParaTrianglesSIMOC22G1Q8Steps(lang: Lang): ParaTrianglesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ParaTrianglesStep[] = [
    {
      highlightGroup: null,
      running: 0,
      hold: 1400,
      result: false,
      caption: t(
        'Count ALL triangles — small, medium, and large composite ones.',
        'Hitung SEMUA segitiga — kecil, sedang, dan gabungan besar.',
      ),
    },
  ]

  const groupDescs = [
    {
      en: (n: number, run: number) =>
        `${n} small triangles — the two diagonals and the horizontal midline split the parallelogram into ${n} basic pieces. Running total: ${run}.`,
      id: (n: number, run: number) =>
        `${n} segitiga kecil — dua diagonal dan garis tengah horizontal membagi jajaran genjang menjadi ${n} bagian dasar. Total: ${run}.`,
    },
    {
      en: (n: number, run: number) =>
        `${n} medium triangles — each spans one full side (left or right) and the centre point. Running total: ${run}.`,
      id: (n: number, run: number) =>
        `${n} segitiga sedang — masing-masing mencakup satu sisi penuh (kiri atau kanan) dan titik tengah. Total: ${run}.`,
    },
    {
      en: (n: number, run: number) =>
        `${n} large triangles — each is a half-parallelogram triangle using 3 of the 4 outer vertices. Running total: ${run}.`,
      id: (n: number, run: number) =>
        `${n} segitiga besar — masing-masing adalah segitiga setengah jajaran genjang menggunakan 3 dari 4 sudut luar. Total: ${run}.`,
    },
  ]

  let running = 0
  PARA_TRI_GROUPS.forEach(({ tris }, i) => {
    running += tris.length
    steps.push({
      highlightGroup: i,
      running,
      hold: 2000,
      result: false,
      caption: t(
        groupDescs[i].en(tris.length, running),
        groupDescs[i].id(tris.length, running),
      ),
    })
  })

  const parts = PARA_TRI_GROUPS.map((g) => g.tris.length).join(' + ')
  steps.push({
    highlightGroup: null,
    running: PARA_TRI_TOTAL,
    hold: 0,
    result: true,
    caption: t(
      `${parts} = ${PARA_TRI_TOTAL} triangles in total. Answer: B (${PARA_TRI_TOTAL}).`,
      `${parts} = ${PARA_TRI_TOTAL} segitiga seluruhnya. Jawaban: B (${PARA_TRI_TOTAL}).`,
    ),
  })

  return { total: PARA_TRI_TOTAL, steps, finalIndex: steps.length - 1 }
}
