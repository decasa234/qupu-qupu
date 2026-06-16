import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TRI_TOTAL } from './TrapTriangles19P1Illustration'

export type TrapPhase = 'show' | 'count' | 'result'

export interface TrapStep {
  phase: TrapPhase
  /** Triangle id to outline this beat; undefined = none. */
  litId?: number
  /** Running count of triangles found so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface TrapStoryboard {
  total: number
  steps: TrapStep[]
  finalIndex: number
}

/**
 * Beat storyboard for WMI-19P1A-Q11: outline each triangle one at a time with a
 * running counter, landing on the total the source's "Figure A" shows.
 *
 * The dashed lines cut the trapezoid into a left wedge, a right wedge and a
 * central band. The two wedges are the triangles; the band is a quadrilateral, so
 * the total is 2. The triangle list comes from the illustration's data, so the
 * storyboard cannot drift from the figure.
 */
export function buildTrapTriangles19P1Steps(lang: Lang): TrapStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TrapStep[] = [
    {
      phase: 'show',
      litId: undefined,
      running: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Find every triangle. Look at the small single shapes the dashed lines make first.',
        'Cari setiap segitiga. Lihat dulu bentuk tunggal kecil yang dibuat garis putus-putus.',
      ),
    },
    {
      phase: 'count',
      litId: 1,
      running: 1,
      hold: 2000,
      result: false,
      caption: t(
        'Left side: corners top-left and bottom-left meet the centre point — that is triangle 1.',
        'Sisi kiri: sudut kiri-atas dan kiri-bawah bertemu titik tengah — itu segitiga 1.',
      ),
    },
    {
      phase: 'count',
      litId: 2,
      running: 2,
      hold: 2000,
      result: false,
      caption: t(
        'Right side, the mirror of it — triangle 2. The middle band has four sides, so it is not a triangle.',
        'Sisi kanan, cerminnya — segitiga 2. Pita tengah berisi empat sisi, jadi bukan segitiga.',
      ),
    },
    {
      phase: 'result',
      litId: undefined,
      running: TRI_TOTAL,
      hold: 0,
      result: true,
      caption: t(
        `${TRI_TOTAL} triangles in all — that is what Figure A shows (answer A).`,
        `${TRI_TOTAL} segitiga seluruhnya — itulah yang ditunjukkan Gambar A (jawaban A).`,
      ),
    },
  ]

  return { total: TRI_TOTAL, steps, finalIndex: steps.length - 1 }
}
