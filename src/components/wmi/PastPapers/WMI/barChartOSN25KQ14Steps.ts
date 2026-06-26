// OSN 2025 SD Kabupaten Q14 — storyboard for the bar-chart explainer.
// Chart data (diagram batang): Kelas 4 = 25 buku, Kelas 5 = 30 buku, Kelas 6 = 45 buku.
// OCR source: docs/reference/ocr-res/osn/kabupaten/sd/2025.imgs/009.jpg
// Answer: D — jumlah buku yang dipinjam ketiga kelas adalah 100 buku (25+30+45=100).

export const BAR_DATA = [
  { key: 'g4' as const, label_id: 'Kelas 4', label_en: 'Grade 4', value: 25 },
  { key: 'g5' as const, label_id: 'Kelas 5', label_en: 'Grade 5', value: 30 },
  { key: 'g6' as const, label_id: 'Kelas 6', label_en: 'Grade 6', value: 45 },
] as const

export type BarKey = (typeof BAR_DATA)[number]['key']

export interface BarChartStep {
  focus: BarKey | null
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = 'D — total 100 buku'
export const ANSWER_EN = 'D — total 100 books'

export function buildBarChartOSN25KQ14Steps(lang: 'en' | 'id'): BarChartStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      focus: null,
      hold: 2200,
      result: false,
      caption: t(
        'A bar chart shows how many books were borrowed from the library by three grades in one week. Read each bar.',
        'Diagram batang menunjukkan banyak buku yang dipinjam dari perpustakaan oleh tiga kelas selama satu minggu. Baca setiap batang.',
      ),
    },
    {
      focus: 'g4',
      hold: 2000,
      result: false,
      caption: t('Grade 4: 25 books.', 'Kelas 4: 25 buku.'),
    },
    {
      focus: 'g5',
      hold: 2000,
      result: false,
      caption: t('Grade 5: 30 books.', 'Kelas 5: 30 buku.'),
    },
    {
      focus: 'g6',
      hold: 2000,
      result: false,
      caption: t('Grade 6: 45 books. The highest bar.', 'Kelas 6: 45 buku. Batang tertinggi.'),
    },
    {
      focus: null,
      hold: 2600,
      result: false,
      caption: t(
        'Check choice D: total = 25 + 30 + 45 = 100 books ✓  (A: avg = 100÷3 ≈ 33 ≠ 30 ✗  B: diff = 45−25 = 20 ≠ 15 ✗  C: median = 30 ≠ 35 ✗)',
        'Cek pilihan D: total = 25 + 30 + 45 = 100 buku ✓  (A: rata-rata = 100÷3 ≈ 33 ≠ 30 ✗  B: selisih = 45−25 = 20 ≠ 15 ✗  C: median = 30 ≠ 35 ✗)',
      ),
    },
    {
      focus: null,
      hold: 0,
      result: true,
      caption: t(
        'Total books borrowed = 25 + 30 + 45 = 100 books. Choice D is correct.',
        'Jumlah buku yang dipinjam = 25 + 30 + 45 = 100 buku. Pernyataan D tepat.',
      ),
    },
  ]
}
