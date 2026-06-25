// SEAMO-21-B-Q19 storyboard: Javier's staircase walking path.
//
// Strategy: all horizontal moves together span exactly 120 m; all vertical
// moves together span exactly 70 m → total = 120 + 70 = 190 m → answer D.
//
// Trap: C (120) counts only horizontal; ignores vertical 70 m.

import type { PathPhase } from './StairPath21B19Illustration'

export type Lang = 'en' | 'id'

export interface StairPath19Beat {
  phase: PathPhase
  caption: string
  equation: string
  hold: number
  result: boolean
}

export function buildStairPath21B19Steps(lang: Lang): StairPath19Beat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      phase: null,
      hold: 2200,
      result: false,
      equation: '',
      caption: t(
        'Javier walks home via a staircase path (right and up turns). The dashed box shows the full span: 120 m across and 70 m tall.',
        'Javier berjalan pulang melalui jalur tangga (belok kanan dan atas). Kotak putus-putus menunjukkan rentang penuh: 120 m mendatar dan 70 m tinggi.',
      ),
    },
    {
      phase: 'horizontal',
      hold: 3000,
      result: false,
      equation: t('All right-steps together = 120 m', 'Semua langkah ke kanan = 120 m'),
      caption: t(
        'Add up every HORIZONTAL segment (blue). No matter how many steps there are, they must collectively cover the full 120 m span.',
        'Jumlahkan setiap segmen HORIZONTAL (biru). Berapa pun banyak langkahnya, secara keseluruhan harus mencakup 120 m penuh.',
      ),
    },
    {
      phase: 'vertical',
      hold: 3000,
      result: false,
      equation: t('All up-steps together = 70 m', 'Semua langkah ke atas = 70 m'),
      caption: t(
        'Add up every VERTICAL segment (green). Together they must cover the full 70 m height.',
        'Jumlahkan setiap segmen VERTIKAL (hijau). Bersama-sama harus mencakup 70 m penuh.',
      ),
    },
    {
      phase: 'total',
      hold: 2800,
      result: false,
      equation: t('Total = 120 + 70 = 190 m', 'Total = 120 + 70 = 190 m'),
      caption: t(
        'Total distance = horizontal span + vertical span = 120 + 70 = 190 m.',
        'Total jarak = rentang horizontal + rentang vertikal = 120 + 70 = 190 m.',
      ),
    },
    {
      phase: 'total',
      hold: 0,
      result: true,
      equation: t('190 m → D', '190 m → D'),
      caption: t(
        'The total distance is 190 m — answer D. (Trap C = 120 counts only horizontal, missing 70 m vertical.)',
        'Total jarak adalah 190 m — jawaban D. (Jebakan C = 120 hanya menghitung horizontal, melewatkan 70 m vertikal.)',
      ),
    },
  ]
}
