import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface SegmentGraphHK25P2Q18Step {
  /** -1 = intro/result (no single edge highlighted); 0..9 = index into GRAPH_EDGES */
  highlightUpTo: number
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface SegmentGraphHK25P2Q18Storyboard {
  steps: SegmentGraphHK25P2Q18Step[]
  finalIndex: number
}

// Edge descriptions for captions (en, id)
const EDGE_DESC: [string, string][] = [
  ['top-left to upper-left junction',       'pojok kiri atas ke persimpangan kiri atas'],
  ['upper-left junction down to lower-left','persimpangan kiri atas ke bawah-kiri'],
  ['upper-left junction to upper-center',   'persimpangan kiri atas ke tengah atas'],
  ['upper-center to top-right',             'tengah atas ke kanan atas'],
  ['upper-center to right-center hub',      'tengah atas ke simpul kanan tengah'],
  ['top-right to right-center hub',         'kanan atas ke simpul kanan tengah'],
  ['right-center hub to far-right',         'simpul kanan tengah ke kanan jauh'],
  ['right-center hub to lower-right',       'simpul kanan tengah ke bawah-kanan'],
  ['right-center hub to lower-center',      'simpul kanan tengah ke bawah-tengah'],
  ['lower-center to lower-left',            'bawah-tengah ke bawah-kiri'],
]

export function buildSegmentGraphHK25P2Q18Steps(lang: Lang): SegmentGraphHK25P2Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SegmentGraphHK25P2Q18Step[] = []

  // Beat 0 — intro
  steps.push({
    highlightUpTo: -1,
    running: 0,
    hold: 1400,
    result: false,
    caption: t(
      'Count every line segment — both outer edges and inner diagonals!',
      'Hitung setiap segmen garis — baik sisi luar maupun diagonal dalam!',
    ),
  })

  // Beats 1–10 — highlight each edge in turn (cumulative)
  for (let i = 0; i < 10; i++) {
    const [enDesc, idDesc] = EDGE_DESC[i]
    steps.push({
      highlightUpTo: i,
      running: i + 1,
      hold: 1200,
      result: false,
      caption: t(
        `Segment ${i + 1}: ${enDesc}. Count: ${i + 1}.`,
        `Segmen ${i + 1}: ${idDesc}. Total: ${i + 1}.`,
      ),
    })
  }

  // Beat 11 — result
  steps.push({
    highlightUpTo: 9,
    running: 10,
    hold: 0,
    result: true,
    caption: t(
      '10 line segments in total — answer: 10!',
      '10 segmen garis seluruhnya — jawaban: 10!',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
