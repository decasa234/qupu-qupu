import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ShapeGridPhase = 'show' | 'row' | 'trap' | 'cell' | 'result'

export interface ShapeGridStep {
  phase: ShapeGridPhase
  /** Row index (0..2) to wash, or null. */
  highlightRow: number | null
  /** [row, col] of the cell ringed in blue, or null. */
  highlightCell: [number, number] | null
  /** [row, col] of the tempting wrong cell (ringed red with an X), or null. */
  trapCell: [number, number] | null
  caption: string
  hold: number
  result: boolean
}

export interface ShapeGridStoryboard {
  steps: ShapeGridStep[]
  finalIndex: number
}

export function buildShapeGrid20Steps(lang: Lang): ShapeGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeGridStep[] = [
    {
      phase: 'show',
      highlightRow: null,
      highlightCell: null,
      trapCell: null,
      hold: 1700,
      result: false,
      caption: t(
        '9 shapes, 3 rows and 3 columns. Where is the bottom right?',
        '9 bentuk, 3 baris dan 3 kolom. Di mana pojok kanan bawah?',
      ),
    },
    {
      phase: 'row',
      highlightRow: 2,
      highlightCell: null,
      trapCell: null,
      hold: 1900,
      result: false,
      caption: t(
        'Bottom means the LAST row: diamond, cross, triangle.',
        'Bawah berarti baris TERAKHIR: belah ketupat, silang, segitiga.',
      ),
    },
    {
      phase: 'trap',
      highlightRow: 2,
      highlightCell: null,
      trapCell: [0, 2],
      hold: 1900,
      result: false,
      caption: t(
        'Careful — the flower is in the TOP right, not the bottom.',
        'Hati-hati — bunga ada di kanan ATAS, bukan bawah.',
      ),
    },
    {
      phase: 'cell',
      highlightRow: 2,
      highlightCell: [2, 2],
      trapCell: null,
      hold: 2000,
      result: false,
      caption: t(
        'Right means the LAST shape in that row — the third one.',
        'Kanan berarti bentuk TERAKHIR di baris itu — yang ketiga.',
      ),
    },
    {
      phase: 'result',
      highlightRow: null,
      highlightCell: [2, 2],
      trapCell: null,
      hold: 0,
      result: true,
      caption: t(
        'The bottom right shape is the blue triangle — answer B.',
        'Bentuk pojok kanan bawah adalah segitiga biru — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
