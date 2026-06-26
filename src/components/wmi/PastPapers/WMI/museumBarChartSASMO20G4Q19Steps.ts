// SASMO 2020 Grade 4 Q19 — explainer storyboard.
// Bar units: Jan=2, Feb=4, Mar=5, Apr=3, May=1, Jun=5
// Solution: Jan+May=3 units; Jun=5 units; 5−3=2 units=200 → 1 unit=100; total=20×100=2000

import type { BarFocus } from './MuseumBarChartSASMO20G4Q19Illustration'

export interface MuseumBarChartStep {
  focus: BarFocus
  showUnits: boolean
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = '2000'
export const ANSWER_EN = '2000'

export function buildMuseumBarChartSASMO20G4Q19Steps(lang: 'en' | 'id'): MuseumBarChartStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      focus: null,
      showUnits: false,
      hold: 2200,
      result: false,
      caption: t(
        'The bar chart shows museum visitors over 6 months. The y-axis is unlabeled — we must use the given condition to find the scale.',
        'Diagram batang menunjukkan pengunjung museum selama 6 bulan. Sumbu-y tidak berlabel — gunakan kondisi yang diberikan untuk menemukan skala.',
      ),
    },
    {
      focus: null,
      showUnits: true,
      hold: 2500,
      result: false,
      caption: t(
        'Count each bar in grid units: Jan=2, Feb=4, Mar=5, Apr=3, May=1, Jun=5.',
        'Hitung setiap batang dalam satuan grid: Jan=2, Feb=4, Mar=5, Apr=3, Mei=1, Jun=5.',
      ),
    },
    {
      focus: 'jan_may',
      showUnits: true,
      hold: 2400,
      result: false,
      caption: t(
        'January + May = 2 + 1 = 3 units.',
        'Januari + Mei = 2 + 1 = 3 satuan.',
      ),
    },
    {
      focus: 'jun',
      showUnits: true,
      hold: 2600,
      result: false,
      caption: t(
        'June = 5 units. Condition: Jan + May is 200 fewer than June → 5 − 3 = 2 units = 200, so 1 unit = 100.',
        'Juni = 5 satuan. Kondisi: Jan + Mei kurang 200 dari Juni → 5 − 3 = 2 satuan = 200, jadi 1 satuan = 100.',
      ),
    },
    {
      focus: null,
      showUnits: true,
      hold: 2600,
      result: false,
      caption: t(
        'Total units: 2+4+5+3+1+5 = 20 units. Each unit = 100 visitors.',
        'Total satuan: 2+4+5+3+1+5 = 20 satuan. Setiap satuan = 100 pengunjung.',
      ),
    },
    {
      focus: null,
      showUnits: false,
      hold: 0,
      result: true,
      caption: t(
        'Total visitors = 20 × 100 = 2000.',
        'Total pengunjung = 20 × 100 = 2000.',
      ),
    },
  ]
}
