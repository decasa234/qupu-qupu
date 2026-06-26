import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { HighlightGroup } from './CountTrianglesRectSASMO20G4Q17Illustration'

export interface CountTrianglesRectSASMO20G4Q17Step {
  highlightGroup: HighlightGroup
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CountTrianglesRectSASMO20G4Q17Storyboard {
  total: number
  steps: CountTrianglesRectSASMO20G4Q17Step[]
  finalIndex: number
}

const TOTAL = 42

export function buildCountTrianglesRectSASMO20G4Q17Steps(
  lang: Lang,
): CountTrianglesRectSASMO20G4Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CountTrianglesRectSASMO20G4Q17Step[] = [
    {
      highlightGroup: null,
      running: 0,
      hold: 1400,
      result: false,
      caption: t(
        'Count ALL triangles systematically — small, medium, and large.',
        'Hitung SEMUA segitiga secara sistematis — kecil, sedang, dan besar.',
      ),
    },
    {
      highlightGroup: 'small',
      running: 0,
      hold: 1800,
      result: false,
      caption: t(
        'Step 1 — Smallest (unit) triangles: count those pointing upward and downward separately.',
        'Langkah 1 — Segitiga terkecil (satuan): hitung yang mengarah ke atas dan ke bawah secara terpisah.',
      ),
    },
    {
      highlightGroup: 'medium',
      running: 0,
      hold: 1800,
      result: false,
      caption: t(
        'Step 2 — Medium triangles (4 unit triangles each, both orientations).',
        'Langkah 2 — Segitiga sedang (masing-masing terdiri dari 4 segitiga satuan, kedua orientasi).',
      ),
    },
    {
      highlightGroup: 'large',
      running: 0,
      hold: 1800,
      result: false,
      caption: t(
        'Step 3 — Larger triangles (9 unit triangles) and the full large triangle.',
        'Langkah 3 — Segitiga besar (9 segitiga satuan) dan segitiga besar keseluruhan.',
      ),
    },
    {
      highlightGroup: null,
      running: TOTAL,
      hold: 0,
      result: true,
      caption: t(
        `Add all groups: small + medium + large = ${TOTAL} triangles in all.`,
        `Jumlahkan semua kelompok: kecil + sedang + besar = ${TOTAL} segitiga semuanya.`,
      ),
    },
  ]

  return { total: TOTAL, steps, finalIndex: steps.length - 1 }
}
