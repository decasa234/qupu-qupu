// Beat storyboard for IKMC-23-PE-Q2.
//
// Question: 5 cubes shown from the front; what is the view from above?
// Answer: B — red | yellow | blue.
//
// Strategy: mental-rotation walk.
//   Beat 1 (intro)   — show front view, introduce the 3-column layout.
//   Beat 2 (col-l)   — focus on the LEFT column: 2 tall, TOP is RED → seen from above = RED.
//   Beat 3 (col-m)   — focus on the MIDDLE column: 1 tall, only YELLOW → above = YELLOW.
//   Beat 4 (col-r)   — focus on the RIGHT column: 2 tall, TOP is BLUE → above = BLUE.
//   Beat 5 (result)  — assemble top view: red | yellow | blue → answer B.

export type CubesView2PEPhase =
  | 'intro'
  | 'col-l'
  | 'col-m'
  | 'col-r'
  | 'result'

export interface CubesView2PEStep {
  phase: CubesView2PEPhase
  /** Which column index (0/1/2) to highlight; -1 = none (all normal). */
  highlightCol: number
  /** Show the assembled top-view answer strip. */
  showTopView: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CubesView2PEStoryboard {
  steps: CubesView2PEStep[]
  finalIndex: number
}

export type Lang = 'en' | 'id'

/**
 * Builds the beat storyboard for IKMC-23-PE-Q2 in the requested language.
 */
export function buildCubesView2PESteps(lang: Lang): CubesView2PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubesView2PEStep[] = [
    {
      phase: 'intro',
      highlightCol: -1,
      showTopView: false,
      hold: 1800,
      result: false,
      caption: t(
        'This is the FRONT view of 5 coloured cubes in 3 columns. Imagine looking straight DOWN from above.',
        'Ini adalah tampilan DEPAN dari 5 kubus berwarna dalam 3 kolom. Bayangkan kamu melihat dari ATAS ke bawah.',
      ),
    },
    {
      phase: 'col-l',
      highlightCol: 0,
      showTopView: false,
      hold: 2000,
      result: false,
      caption: t(
        'Left column — 2 cubes tall: RED on top, yellow below. From above you see the RED top.',
        'Kolom kiri — 2 kubus tinggi: MERAH di atas, kuning di bawah. Dari atas kamu melihat warna MERAH.',
      ),
    },
    {
      phase: 'col-m',
      highlightCol: 1,
      showTopView: false,
      hold: 2000,
      result: false,
      caption: t(
        'Middle column — 1 cube: YELLOW only. From above you see YELLOW.',
        'Kolom tengah — 1 kubus: hanya KUNING. Dari atas kamu melihat KUNING.',
      ),
    },
    {
      phase: 'col-r',
      highlightCol: 2,
      showTopView: false,
      hold: 2000,
      result: false,
      caption: t(
        'Right column — 2 cubes tall: BLUE on top, yellow below. From above you see BLUE.',
        'Kolom kanan — 2 kubus tinggi: BIRU di atas, kuning di bawah. Dari atas kamu melihat BIRU.',
      ),
    },
    {
      phase: 'result',
      highlightCol: -1,
      showTopView: true,
      hold: 0,
      result: true,
      caption: t(
        'Top view = RED | YELLOW | BLUE → that matches picture B. Answer: B.',
        'Tampilan atas = MERAH | KUNING | BIRU → sesuai dengan gambar B. Jawaban: B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
