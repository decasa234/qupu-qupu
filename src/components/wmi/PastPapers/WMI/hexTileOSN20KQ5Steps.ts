// Storyboard for OSN-20-SD-KAB-Q5 post-answer explainer.
// "Jumlah tiga bilangan segaris (9 di pusat, 10–15 di luar) adalah ⋯"
// Strategy: outer sum = 75; three opposite pairs → 75÷3 = 25 each; line = 9+25 = 34.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type HexTilePhase = 'intro' | 'outer' | 'pairs' | 'result'

export interface HexTileOSN20KQ5Step {
  phase: HexTilePhase
  showNumbers: boolean
  highlightPairs: boolean
  showLineSum: boolean
  caption: string
  hold: number
}

export interface HexTileOSN20KQ5Storyboard {
  steps: HexTileOSN20KQ5Step[]
  finalIndex: number
  answer: number
}

export function buildHexTileOSN20KQ5Steps(lang: Lang): HexTileOSN20KQ5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HexTileOSN20KQ5Step[] = [
    {
      phase: 'intro',
      showNumbers: false,
      highlightPairs: false,
      showLineSum: false,
      hold: 1800,
      caption: t(
        '9 is fixed at the center. Numbers 10–15 go on the six outer tiles. Each line through the center must give the same sum.',
        '9 tetap di tengah. Bilangan 10–15 ditempatkan di enam ubin luar. Setiap garis melalui pusat harus berjumlah sama.',
      ),
    },
    {
      phase: 'outer',
      showNumbers: true,
      highlightPairs: false,
      showLineSum: false,
      hold: 2200,
      caption: t(
        'Outer numbers: 10+11+12+13+14+15 = 75. Three opposite pairs → 75 ÷ 3 = 25 each.',
        'Bilangan luar: 10+11+12+13+14+15 = 75. Tiga pasang berlawanan → 75 ÷ 3 = 25 tiap pasang.',
      ),
    },
    {
      phase: 'pairs',
      showNumbers: true,
      highlightPairs: true,
      showLineSum: false,
      hold: 2400,
      caption: t(
        'Valid opposite pairs (each = 25): (10,15), (11,14), (12,13).',
        'Pasangan berlawanan yang valid (masing-masing = 25): (10,15), (11,14), (12,13).',
      ),
    },
    {
      phase: 'result',
      showNumbers: true,
      highlightPairs: false,
      showLineSum: true,
      hold: 0,
      caption: t(
        'Every line sum = 9 + 25 = 34.',
        'Setiap jumlah garis = 9 + 25 = 34.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 34 }
}
