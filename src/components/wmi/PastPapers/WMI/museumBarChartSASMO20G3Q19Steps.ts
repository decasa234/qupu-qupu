// SASMO 2020 Grade 3 Q19 — explainer storyboard.
// Bar values: Jan=100, Feb=200, Mar=250, Apr=150, May=50, Jun=250
// Solution: read each bar directly from the labeled y-axis, sum = 1000

import type { BarFocus } from './MuseumBarChartSASMO20G3Q19Illustration'

export interface MuseumBarChartG3Step {
  focus: BarFocus
  showValues: boolean
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = '1000'
export const ANSWER_EN = '1000'

export function buildMuseumBarChartSASMO20G3Q19Steps(lang: 'en' | 'id'): MuseumBarChartG3Step[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      focus: null,
      showValues: false,
      hold: 2200,
      result: false,
      caption: t(
        'The bar chart shows guests at the National Museum over the first 6 months of 2019. Read each bar from the labeled y-axis.',
        'Diagram batang menunjukkan tamu Museum Nasional selama 6 bulan pertama 2019. Baca setiap batang dari sumbu-y berlabel.',
      ),
    },
    {
      focus: null,
      showValues: true,
      hold: 2800,
      result: false,
      caption: t(
        'Read each bar: Jan=100, Feb=200, Mar=250, Apr=150, May=50, Jun=250.',
        'Baca setiap batang: Jan=100, Feb=200, Mar=250, Apr=150, Mei=50, Jun=250.',
      ),
    },
    {
      focus: null,
      showValues: true,
      hold: 2800,
      result: false,
      caption: t(
        'Add all six months: 100 + 200 + 250 + 150 + 50 + 250 = 1000.',
        'Jumlahkan keenam bulan: 100 + 200 + 250 + 150 + 50 + 250 = 1000.',
      ),
    },
    {
      focus: null,
      showValues: false,
      hold: 0,
      result: true,
      caption: t(
        'Total visitors over 6 months = 1000.',
        'Total pengunjung selama 6 bulan = 1000.',
      ),
    },
  ]
}
