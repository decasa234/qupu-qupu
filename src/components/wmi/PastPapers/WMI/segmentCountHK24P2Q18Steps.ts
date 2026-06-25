// HKIMO-24-P2H-Q18 — storyboard for the segment-counting animation.
//
// Figure: cross (top) + rectangle-with-X-diagonals (middle) + triangle (bottom).
// 9 labelled dots. Collinear sets give 20 segments.
//
// Teaching walk, one group per beat:
//   0  intro       — show full figure; prompt to count.
//   1  vertical    — amber: {A,B,G,I,K} → C(5,2) = 10.
//   2  horizontal  — blue: {C,B,D} → C(3,2) = 3. Running 13.
//   3  bottom-edge — green: {H,I,J} → C(3,2) = 3. Running 16.
//   4  diagonals   — purple: {G,J} and {G,H} → 2. Running 18.
//   5  triangle    — orange: {H,K} and {J,K} → 2. Running 20.
//   6  result      — final answer = 20.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SCPhase =
  | 'intro'
  | 'vertical'
  | 'horizontal'
  | 'bottom-edge'
  | 'diagonals'
  | 'triangle'
  | 'result'

export interface SCBeat {
  phase: SCPhase
  showVertical: boolean
  showHorizontal: boolean
  showBottomEdge: boolean
  showDiagonals: boolean
  showTriangle: boolean
  /** Running segment count (0 = none highlighted yet). */
  count: number
  /** Arithmetic label shown below the figure. */
  equation: string
  caption: string
  /** Auto-advance hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface SCStoryboard {
  steps: SCBeat[]
  finalIndex: number
}

export function buildSegmentCountHK24P2Q18Steps(lang: Lang): SCStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SCBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showVertical: false, showHorizontal: false, showBottomEdge: false,
      showDiagonals: false, showTriangle: false,
      count: 0, equation: '',
      hold: 2000, result: false,
      caption: t(
        'Count ALL line segments — every sub-segment between any two labeled dots on the same drawn line.',
        'Hitung SEMUA segmen garis — setiap sub-segmen antara dua titik berlabel pada garis yang sama.',
      ),
    },
    // Beat 1 — vertical (10 segments)
    {
      phase: 'vertical',
      showVertical: true, showHorizontal: false, showBottomEdge: false,
      showDiagonals: false, showTriangle: false,
      count: 10, equation: 'C(5,2) = 10',
      hold: 2400, result: false,
      caption: t(
        '5 labeled dots on the vertical line → C(5,2) = 10 segments.',
        '5 titik berlabel pada garis vertikal → C(5,2) = 10 segmen.',
      ),
    },
    // Beat 2 — horizontal bar (+3 → 13)
    {
      phase: 'horizontal',
      showVertical: true, showHorizontal: true, showBottomEdge: false,
      showDiagonals: false, showTriangle: false,
      count: 13, equation: '10 + C(3,2) = 13',
      hold: 2400, result: false,
      caption: t(
        '3 dots on the horizontal bar → C(3,2) = 3 more. Running total: 13.',
        '3 titik pada batang horizontal → C(3,2) = 3 lagi. Total sementara: 13.',
      ),
    },
    // Beat 3 — bottom edge (+3 → 16)
    {
      phase: 'bottom-edge',
      showVertical: true, showHorizontal: true, showBottomEdge: true,
      showDiagonals: false, showTriangle: false,
      count: 16, equation: '13 + C(3,2) = 16',
      hold: 2400, result: false,
      caption: t(
        '3 dots on the rectangle\'s bottom edge → C(3,2) = 3 more. Running total: 16.',
        '3 titik pada tepi bawah persegi panjang → C(3,2) = 3 lagi. Total sementara: 16.',
      ),
    },
    // Beat 4 — partial diagonals (+2 → 18)
    {
      phase: 'diagonals',
      showVertical: true, showHorizontal: true, showBottomEdge: true,
      showDiagonals: true, showTriangle: false,
      count: 18, equation: '16 + 1 + 1 = 18',
      hold: 2400, result: false,
      caption: t(
        'Each diagonal has 2 labeled dots (centre + one corner) → 1 segment each, 2 more. Running total: 18.',
        'Setiap diagonal memiliki 2 titik berlabel (pusat + satu sudut) → 1 segmen masing-masing, 2 lagi. Total sementara: 18.',
      ),
    },
    // Beat 5 — triangle sides (+2 → 20)
    {
      phase: 'triangle',
      showVertical: true, showHorizontal: true, showBottomEdge: true,
      showDiagonals: true, showTriangle: true,
      count: 20, equation: '18 + 1 + 1 = 20',
      hold: 2400, result: false,
      caption: t(
        'Two triangle sides → 2 more segments. Total: 20.',
        'Dua sisi segitiga → 2 segmen lagi. Total: 20.',
      ),
    },
    // Beat 6 — result
    {
      phase: 'result',
      showVertical: true, showHorizontal: true, showBottomEdge: true,
      showDiagonals: true, showTriangle: true,
      count: 20, equation: '10 + 3 + 3 + 2 + 2 = 20',
      hold: 0, result: true,
      caption: t(
        'There are 20 line segments in total.',
        'Ada 20 segmen garis seluruhnya.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
