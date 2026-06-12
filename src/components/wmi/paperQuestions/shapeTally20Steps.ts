import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { TallyShapeKind } from './ShapeTallyOption20'

// Storyboard for WMI-20F1A-Q14 (count the shapes in the houses + bird + sun
// picture). The explainer does not redraw the scene — it builds a tally board
// of four rows, one per shape kind, each revealing WHERE the shapes hide.
// Canonical counts (seed hint_steps): triangles 8, circles 9, squares 7,
// rectangles 6 → table A "8, 9, 7, 6".
export const TALLY_COUNTS = [8, 9, 7, 6] as const

export interface TallyRow {
  kind: TallyShapeKind
  count: number
  /** Localized sub-count chips showing where the shapes hide. */
  chips: string[]
}

export interface ShapeTallyStep {
  /** How many tally rows are revealed (0..4). */
  revealRow: number
  caption: string
  hold: number
  result: boolean
}

export interface ShapeTallyStoryboard {
  rows: TallyRow[]
  answerText: string
  steps: ShapeTallyStep[]
  finalIndex: number
}

export function buildShapeTally20Steps(lang: Lang): ShapeTallyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const rows: TallyRow[] = [
    {
      kind: 'triangle',
      count: 8,
      chips: [
        t('3 roofs', '3 atap'),
        t('2 on the ground', '2 di tanah'),
        t('1 beak', '1 paruh'),
        t('2 tail', '2 ekor'),
      ],
    },
    {
      kind: 'circle',
      count: 9,
      chips: [t('bird 4', 'burung 4'), t('sun 5', 'matahari 5')],
    },
    {
      kind: 'square',
      count: 7,
      chips: [t('windows 1+2+3', 'jendela 1+2+3'), t('small house 1', 'rumah kecil 1')],
    },
    {
      kind: 'rectangle',
      count: 6,
      chips: [t('2 tall bodies', '2 badan tinggi'), t('4 sun rays', '4 sinar matahari')],
    },
  ]

  const steps: ShapeTallyStep[] = [
    {
      revealRow: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Count one shape kind at a time — triangles, circles, squares, rectangles.',
        'Hitung satu jenis bentuk setiap kali — segitiga, lingkaran, persegi, persegi panjang.',
      ),
    },
    {
      revealRow: 1,
      hold: 2200,
      result: false,
      caption: t(
        "Triangles: 3 roofs + 2 small ones on the ground + the bird's beak + 2 tail feathers = 8.",
        'Segitiga: 3 atap + 2 segitiga kecil di tanah + paruh burung + 2 bulu ekor = 8.',
      ),
    },
    {
      revealRow: 2,
      hold: 2200,
      result: false,
      caption: t(
        'Circles: the bird has 4 (head, eye, body, tail dot) and the sun has 5 (middle + 4 small) = 9.',
        'Lingkaran: burung punya 4 (kepala, mata, badan, ujung ekor) dan matahari punya 5 (tengah + 4 kecil) = 9.',
      ),
    },
    {
      revealRow: 3,
      hold: 2200,
      result: false,
      caption: t(
        "Squares: windows 1 + 2 + 3, plus the small house's body = 7. The tall house bodies are NOT squares!",
        'Persegi: jendela 1 + 2 + 3, ditambah badan rumah kecil = 7. Badan rumah tinggi BUKAN persegi!',
      ),
    },
    {
      revealRow: 4,
      hold: 2000,
      result: false,
      caption: t(
        'Rectangles: the 2 tall house bodies + 4 sun rays = 6.',
        'Persegi panjang: 2 badan rumah tinggi + 4 sinar matahari = 6.',
      ),
    },
    {
      revealRow: 4,
      hold: 0,
      result: true,
      caption: t('8, 9, 7, 6 — that is table A.', '8, 9, 7, 6 — itu tabel A.'),
    },
  ]

  return {
    rows,
    answerText: TALLY_COUNTS.join(', '),
    steps,
    finalIndex: steps.length - 1,
  }
}
