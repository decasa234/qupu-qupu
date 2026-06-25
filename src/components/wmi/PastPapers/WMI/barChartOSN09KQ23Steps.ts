// OSN 2009 SD Kabupaten Q23 — storyboard for the bar-chart explainer.
// Chart data: Bersepeda 75, Jalan kaki 100, Antar jemput 37.
// Answer: jalan kaki (walking) — the tallest bar.

export const BAR_DATA = [
  { key: 'bike',   label_id: 'Bersepeda',    label_en: 'Bicycle',  value: 75  },
  { key: 'walk',   label_id: 'Jalan kaki',   label_en: 'Walking',  value: 100 },
  { key: 'pickup', label_id: 'Antar jemput', label_en: 'Drop-off', value: 37  },
] as const

export type BarKey = (typeof BAR_DATA)[number]['key']

export interface BarChartStep {
  focus: BarKey | null
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = 'jalan kaki'
export const ANSWER_EN = 'walking'

export function buildBarChartOSN09KQ23Steps(lang: 'en' | 'id'): BarChartStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      focus: null,
      hold: 2200,
      result: false,
      caption: t(
        'The bar chart shows three ways students travel to school. Read each bar to find the tallest.',
        'Diagram batang menunjukkan tiga cara siswa menuju ke sekolah. Baca setiap batang untuk menemukan yang tertinggi.',
      ),
    },
    {
      focus: 'bike',
      hold: 2000,
      result: false,
      caption: t(
        'Bicycle: 75 students.',
        'Bersepeda: 75 siswa.',
      ),
    },
    {
      focus: 'walk',
      hold: 2200,
      result: false,
      caption: t(
        'Walking: 100 students. This bar is the tallest — 100 > 75.',
        'Jalan kaki: 100 siswa. Batang ini tertinggi — 100 > 75.',
      ),
    },
    {
      focus: 'pickup',
      hold: 2000,
      result: false,
      caption: t(
        'Drop-off: 37 students. The shortest bar — 37 is smallest of all three.',
        'Antar jemput: 37 siswa. Batang terpendek — 37 adalah yang terkecil dari ketiganya.',
      ),
    },
    {
      focus: 'walk',
      hold: 0,
      result: true,
      caption: t(
        'Walking (100 students) has the highest bar. Most students come to school by walking.',
        'Jalan kaki (100 siswa) memiliki batang tertinggi. Sebagian besar siswa datang ke sekolah dengan jalan kaki.',
      ),
    },
  ]
}
