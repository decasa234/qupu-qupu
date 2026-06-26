// SASMO 2019 Grade 4 Q20 — storyboard for the bar-chart explainer.
// Bar data (from OCR solution): Mon=2u=$40, Tue=4u=$80, Wed=3u=$60, Thu=5u=$100, Fri=1u=$20
// Answer: Saturday = 1/5 × $300 = $60.

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export const DAY_DATA = [
  { key: 'mon' as DayKey, label_id: 'Senin',  label_en: 'Monday',    units: 2, dollars: 40  },
  { key: 'tue' as DayKey, label_id: 'Selasa', label_en: 'Tuesday',   units: 4, dollars: 80  },
  { key: 'wed' as DayKey, label_id: 'Rabu',   label_en: 'Wednesday', units: 3, dollars: 60  },
  { key: 'thu' as DayKey, label_id: 'Kamis',  label_en: 'Thursday',  units: 5, dollars: 100 },
  { key: 'fri' as DayKey, label_id: 'Jumat',  label_en: 'Friday',    units: 1, dollars: 20  },
] as const

export interface SpendingStep {
  /** Null = all bars at full opacity. Array = only these bars highlighted; others dimmed. */
  focus: DayKey[] | null
  showValues: boolean
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = '$60'
export const ANSWER_EN = '$60'

export function buildBarChartMarySpentSASMO19G4Q20Steps(lang: 'en' | 'id'): SpendingStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      focus: null,
      showValues: false,
      hold: 2200,
      result: false,
      caption: t(
        'The bar chart shows money Mary spent Mon–Fri. Horizontal lines are equally spaced — find the unit value.',
        'Diagram batang menunjukkan pengeluaran Mary Sen–Jum. Garis horizontal berjarak sama — cari nilai per satuan.',
      ),
    },
    {
      focus: ['tue', 'fri'],
      showValues: false,
      hold: 2600,
      result: false,
      caption: t(
        'Tuesday is 2nd-highest (4 units). Friday is lowest (1 unit). Gap = 4 − 1 = 3 units = $60 → 1 unit = $20.',
        'Selasa adalah tertinggi ke-2 (4 satuan). Jumat terendah (1 satuan). Selisih = 4 − 1 = 3 satuan = $60 → 1 satuan = $20.',
      ),
    },
    {
      focus: null,
      showValues: true,
      hold: 2600,
      result: false,
      caption: t(
        'Each unit = $20. Mon=$40, Tue=$80, Wed=$60, Thu=$100, Fri=$20. Total Mon–Fri = $300.',
        'Setiap satuan = $20. Sen=$40, Sel=$80, Rab=$60, Kam=$100, Jum=$20. Total Sen–Jum = $300.',
      ),
    },
    {
      focus: null,
      showValues: true,
      hold: 0,
      result: true,
      caption: t(
        'Saturday = 1/5 × $300 = $60.',
        'Sabtu = 1/5 × $300 = $60.',
      ),
    },
  ]
}
