import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRIS_BY_SIZE_20A1, TRI_TOTAL_20A1 } from './CountTri20A1Illustration'

export type CountTri20A1Phase = 'show' | 'count' | 'result'

export interface CountTri20A1Step {
  phase: CountTri20A1Phase
  size: number | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CountTri20A1Storyboard {
  total: number
  steps: CountTri20A1Step[]
  finalIndex: number
}

export function buildCountTri20A1Steps(lang: Lang): CountTri20A1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CountTri20A1Step[] = [
    {
      phase: 'show',
      size: null,
      running: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Count ALL triangles — small, medium, large, and the whole. Start with the smallest.',
        'Hitung SEMUA segitiga — kecil, sedang, besar, dan keseluruhan. Mulai dari yang terkecil.',
      ),
    },
  ]

  let running = 0
  TRIS_BY_SIZE_20A1.forEach(({ size, tris }) => {
    running += tris.length
    const sizeLabel =
      size === 1
        ? t('unit (size-1)', 'satuan (ukuran-1)')
        : size === 2
          ? t('size-2', 'ukuran-2')
          : size === 3
            ? t('size-3', 'ukuran-3')
            : t('the whole (size-4)', 'seluruhnya (ukuran-4)')
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

  const sumParts = TRIS_BY_SIZE_20A1.map((g) => g.tris.length).join(' + ')
  steps.push({
    phase: 'result',
    size: null,
    running: TRI_TOTAL_20A1,
    hold: 0,
    result: true,
    caption: t(
      `${sumParts} = ${TRI_TOTAL_20A1} triangles in all. Answer: E.`,
      `${sumParts} = ${TRI_TOTAL_20A1} segitiga semuanya. Jawaban: E.`,
    ),
  })

  return { total: TRI_TOTAL_20A1, steps, finalIndex: steps.length - 1 }
}
