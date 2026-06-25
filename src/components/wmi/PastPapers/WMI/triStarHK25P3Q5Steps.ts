// HKIMO-25-P3H-Q5 — beat storyboard for the triangular star pattern explainer.
// T(n) = n(n+1)/2; T(99) − T(30) = 4950 − 465 = 4485.

export type Lang = 'en' | 'id'

export interface TriStarBeat {
  phase: 'intro' | 'formula' | 'g99' | 'g30' | 'diff'
  highlightGroup: number | null   // which group (1–4) to highlight; null = all
  equation: string
  caption: string
  hold: number    // ms before auto-advance (0 = final / manual)
  result: boolean
}

const DATA: Record<Lang, TriStarBeat[]> = {
  en: [
    {
      phase: 'intro',
      highlightGroup: null,
      equation: '',
      caption: 'Groups 1–4 show the staircase star pattern. How many ★ are in each group?',
      hold: 2200,
      result: false,
    },
    {
      phase: 'formula',
      highlightGroup: null,
      equation: 'T(n) = n × (n + 1) ÷ 2',
      caption: 'Each group adds one more star than the group before: 1, 3, 6, 10 … These are triangular numbers! Group n has n × (n+1) ÷ 2 stars.',
      hold: 2800,
      result: false,
    },
    {
      phase: 'g99',
      highlightGroup: null,
      equation: 'T(99) = 99 × 100 ÷ 2 = 4 950',
      caption: 'Group 99 has 99 × 100 ÷ 2 = 4 950 stars.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'g30',
      highlightGroup: null,
      equation: 'T(30) = 30 × 31 ÷ 2 = 465',
      caption: 'Group 30 has 30 × 31 ÷ 2 = 465 stars.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'diff',
      highlightGroup: null,
      equation: '4 950 − 465 = 4 485',
      caption: 'Difference = T(99) − T(30) = 4 950 − 465 = 4 485.',
      hold: 0,
      result: true,
    },
  ],
  id: [
    {
      phase: 'intro',
      highlightGroup: null,
      equation: '',
      caption: 'Kelompok 1–4 memperlihatkan pola bintang bertangga. Berapa banyak ★ di setiap kelompok?',
      hold: 2200,
      result: false,
    },
    {
      phase: 'formula',
      highlightGroup: null,
      equation: 'T(n) = n × (n + 1) ÷ 2',
      caption: 'Setiap kelompok menambah satu bintang lebih: 1, 3, 6, 10 … Ini adalah bilangan segitiga! Kelompok ke-n memiliki n × (n+1) ÷ 2 bintang.',
      hold: 2800,
      result: false,
    },
    {
      phase: 'g99',
      highlightGroup: null,
      equation: 'T(99) = 99 × 100 ÷ 2 = 4.950',
      caption: 'Kelompok ke-99 memiliki 99 × 100 ÷ 2 = 4.950 bintang.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'g30',
      highlightGroup: null,
      equation: 'T(30) = 30 × 31 ÷ 2 = 465',
      caption: 'Kelompok ke-30 memiliki 30 × 31 ÷ 2 = 465 bintang.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'diff',
      highlightGroup: null,
      equation: '4.950 − 465 = 4.485',
      caption: 'Selisih = T(99) − T(30) = 4.950 − 465 = 4.485.',
      hold: 0,
      result: true,
    },
  ],
}

export interface TriStarStory {
  steps: TriStarBeat[]
  finalIndex: number
}

export function buildTriStarHK25P3Q5Steps(lang: Lang): TriStarStory {
  const steps = DATA[lang]
  return { steps, finalIndex: steps.length - 1 }
}
