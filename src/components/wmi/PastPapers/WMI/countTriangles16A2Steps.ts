import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRIS_BY_SIZE, TRI_TOTAL, type TriSize } from './CountTriangles16A2Illustration'

export type CountTriangles16A2Phase = 'show' | 'count' | 'result'

export interface CountTriangles16A2Step {
  phase: CountTriangles16A2Phase
  size: TriSize | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CountTriangles16A2Storyboard {
  total: number
  steps: CountTriangles16A2Step[]
  finalIndex: number
}

export function buildCountTriangles16A2Steps(lang: Lang): CountTriangles16A2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CountTriangles16A2Step[] = [
    {
      phase: 'show',
      size: null,
      running: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Count ALL triangles — small, medium, and large. Start with the smallest.',
        'Hitung SEMUA segitiga — kecil, sedang, dan besar. Mulai dari yang terkecil.',
      ),
    },
  ]

  let running = 0
  TRIS_BY_SIZE.forEach(({ size, tris }) => {
    running += tris.length
    const sizeLabel = size === 1 ? t('unit (size-1)', 'satuan (ukuran-1)') : size === 2 ? t('size-2', 'ukuran-2') : t('the whole (size-3)', 'seluruhnya (ukuran-3)')
    steps.push({
      phase: 'count',
      size,
      running,
      hold: 1800,
      result: false,
      caption: t(
        `${tris.length} ${sizeLabel} triangle${tris.length !== 1 ? 's' : ''}. Running total: ${running}.`,
        `${tris.length} segitiga ${sizeLabel}. Total sementara: ${running}.`,
      ),
    })
  })

  const sumParts = TRIS_BY_SIZE.map((g) => g.tris.length).join(' + ')
  steps.push({
    phase: 'result',
    size: null,
    running: TRI_TOTAL,
    hold: 0,
    result: true,
    caption: t(
      `${sumParts} = ${TRI_TOTAL} triangles in all. Answer: D.`,
      `${sumParts} = ${TRI_TOTAL} segitiga semuanya. Jawaban: D.`,
    ),
  })

  return { total: TRI_TOTAL, steps, finalIndex: steps.length - 1 }
}
