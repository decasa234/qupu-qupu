// twoCubesSIMOC22G1Q19Steps.ts
// SIMOC-22-G1-Q19 storyboard: two joined cubes, sum of 7 hidden faces.
// Strategy: total 42 − visible 15 = 27.

export type Lang = 'en' | 'id'

export type TwoCubesPhase = 'intro' | 'visible' | 'total' | 'subtract' | 'result'

export interface TwoCubesBeat {
  phase: TwoCubesPhase
  /** Visible face indices to highlight: 0=L-top,1=R-top,2=L-front,3=R-front,4=R-side */
  highlight: number[]
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface TwoCubesStoryboard {
  steps: TwoCubesBeat[]
  finalIndex: number
}

export function buildTwoCubesSIMOC22G1Q19Steps(lang: Lang): TwoCubesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TwoCubesBeat[] = [
    // Beat 0 — intro: show the figure
    {
      phase: 'intro',
      highlight: [],
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Two cubes are joined. 5 faces show numbers 2, 3, 1, 4, 5. Opposite faces on each cube sum to 7.',
        'Dua kubus digabungkan. 5 sisi menampilkan angka 2, 3, 1, 4, 5. Sisi berhadapan tiap kubus berjumlah 7.',
      ),
    },

    // Beat 1 — highlight visible faces, sum = 15
    {
      phase: 'visible',
      highlight: [0, 1, 2, 3, 4],
      equation: t('2 + 3 + 1 + 4 + 5 = 15', '2 + 3 + 1 + 4 + 5 = 15'),
      hold: 2800,
      result: false,
      caption: t(
        'The 5 visible faces add up to 2 + 3 + 1 + 4 + 5 = 15.',
        '5 sisi yang terlihat berjumlah 2 + 3 + 1 + 4 + 5 = 15.',
      ),
    },

    // Beat 2 — total of all 12 faces = 42
    {
      phase: 'total',
      highlight: [],
      equation: t('2 × (1+2+3+4+5+6) = 42', '2 × (1+2+3+4+5+6) = 42'),
      hold: 2600,
      result: false,
      caption: t(
        'Each cube has faces 1–6, summing to 21. Two cubes together: 2 × 21 = 42.',
        'Tiap kubus punya sisi 1–6, jumlahnya 21. Dua kubus: 2 × 21 = 42.',
      ),
    },

    // Beat 3 — subtract visible from total
    {
      phase: 'subtract',
      highlight: [],
      equation: t('42 − 15 = 27', '42 − 15 = 27'),
      hold: 2800,
      result: false,
      caption: t(
        'Hidden faces = total − visible = 42 − 15 = 27.',
        'Sisi tersembunyi = total − terlihat = 42 − 15 = 27.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlight: [],
      equation: t('Answer: 27', 'Jawaban: 27'),
      hold: 0,
      result: true,
      caption: t(
        'The sum of the 7 faces not visible in the picture is 27.',
        'Jumlah 7 sisi yang tidak terlihat dalam gambar adalah 27.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
