import type { Lang } from '../concepts/explainers/makeTenSteps'

export type Q23Phase = 'show' | 'sameCells' | 'rule' | 'apply' | 'result'

export interface Q23Step {
  phase: Q23Phase
  /** Highlight the five shared cells (rule = positions never move). */
  highlightCells: boolean
  /** Show the rotation arc badge on each arrow. */
  showTurn: boolean
  /** Reveal the answer grid (variant 3) in the last panel instead of "?". */
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q23Storyboard {
  answerLetter: string
  steps: Q23Step[]
  finalIndex: number
}

export function buildP20G2Q23Steps(lang: Lang): Q23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q23Step[] = [
    {
      phase: 'show',
      highlightCells: false,
      showTurn: false,
      revealAnswer: false,
      hold: 1700,
      result: false,
      caption: t('Compare the three grids carefully.', 'Bandingkan ketiga kotak dengan teliti.'),
    },
    {
      phase: 'sameCells',
      highlightCells: true,
      showTurn: false,
      revealAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'The five arrows stay in the SAME cells — only their directions change.',
        'Kelima panah tetap di sel yang SAMA — hanya arahnya yang berubah.',
      ),
    },
    {
      phase: 'rule',
      highlightCells: false,
      showTurn: true,
      revealAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'Every arrow turns 90° clockwise from one grid to the next.',
        'Setiap panah berputar 90° searah jarum jam dari satu kotak ke kotak berikutnya.',
      ),
    },
    {
      phase: 'apply',
      highlightCells: false,
      showTurn: true,
      revealAnswer: true,
      hold: 2000,
      result: false,
      caption: t(
        'Turn each arrow one more step: up→left, right→up, left→down, down→right.',
        'Putar tiap panah satu langkah lagi: atas→kiri, kanan→atas, kiri→bawah, bawah→kanan.',
      ),
    },
    {
      phase: 'result',
      highlightCells: false,
      showTurn: false,
      revealAnswer: true,
      hold: 0,
      result: true,
      caption: t('That is the figure in option A.', 'Itulah gambar pada pilihan A.'),
    },
  ]

  return { answerLetter: 'A', steps, finalIndex: steps.length - 1 }
}
