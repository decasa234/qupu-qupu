// SEAMO-18-B-Q2 storyboard: descending 3-step staircase perimeter.
//
// Strategy: "slide" trick — unlabeled sides mirror labeled sides.
//   Labeled: 5 + 2 + 5 + 2 + 5 + 4 = 23 cm
//   Unlabeled: bottom = 15, left = 8 → total = 23 cm
//   Perimeter = 23 + 23 = 46 cm → D

import type { Stair2Phase } from './StairPerim18B2Illustration'

export type Lang = 'en' | 'id'

export interface Stair2Beat {
  phase: Stair2Phase
  caption: string
  equation: string
  hold: number
  result: boolean
}

export function buildStairPerim18B2Steps(lang: Lang): Stair2Beat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      phase: null,
      hold: 2200,
      result: false,
      equation: '',
      caption: t(
        'The shape has 6 labeled sides and 2 unlabeled sides. Find all of them.',
        'Bangun ini memiliki 6 sisi berlabel dan 2 sisi tak berlabel. Temukan semuanya.',
      ),
    },
    {
      phase: 'flat',
      hold: 3000,
      result: false,
      equation: t('Horizontals: 5 + 5 + 5 = 15 | Bottom = 15', 'Horizontal: 5 + 5 + 5 = 15 | Bawah = 15'),
      caption: t(
        'FLAT sides: the three top steps (5 + 5 + 5 = 15) slide together — they equal the bottom (15). Total flat sides = 15 + 15 = 30 cm.',
        'Sisi DATAR: tiga anak tangga atas (5 + 5 + 5 = 15) bila disatukan sama dengan sisi bawah (15). Total sisi datar = 15 + 15 = 30 cm.',
      ),
    },
    {
      phase: 'standing',
      hold: 3000,
      result: false,
      equation: t('Verticals: 2 + 2 + 4 = 8 | Left wall = 8', 'Vertikal: 2 + 2 + 4 = 8 | Dinding kiri = 8'),
      caption: t(
        'STANDING sides: the step drops (2 + 2 + 4 = 8) match the left wall (8). Total standing sides = 8 + 8 = 16 cm.',
        'Sisi TEGAK: turunan tangga (2 + 2 + 4 = 8) sama dengan dinding kiri (8). Total sisi tegak = 8 + 8 = 16 cm.',
      ),
    },
    {
      phase: null,
      hold: 2600,
      result: false,
      equation: t('30 + 16 = 46', '30 + 16 = 46'),
      caption: t(
        'Perimeter = flat sides + standing sides = 30 + 16 = 46 cm.',
        'Keliling = sisi datar + sisi tegak = 30 + 16 = 46 cm.',
      ),
    },
    {
      phase: null,
      hold: 0,
      result: true,
      equation: t('Perimeter = 46 cm → D', 'Keliling = 46 cm → D'),
      caption: t(
        'The perimeter is 46 cm — answer D. (Trap: counting only 6 labeled sides gives 23, not the full perimeter.)',
        'Kelilingnya 46 cm — jawaban D. (Jebakan: hanya menjumlahkan 6 sisi berlabel menghasilkan 23, bukan keliling penuh.)',
      ),
    },
  ]
}
