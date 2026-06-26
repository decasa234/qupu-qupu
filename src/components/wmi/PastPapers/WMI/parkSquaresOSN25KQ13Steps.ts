// OSN 2025 SD Kabupaten Q13 — three adjacent square parks, top-aligned staircase, find perimeter.
// Taman 1 (side 10 m), Taman 2 (side 8 m), Taman 3 (side 6 m).
// Perimeter = 2×(10+8+6) + 2×10 = 48 + 20 = 68 m. Answer: C.

export type ParkPhase = 'plain' | 'side1' | 'sided' | 'perimeter'

export interface ParkSquaresStep {
  phase: ParkPhase
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = 'C — 68 m'
export const ANSWER_EN = 'C — 68 m'

export function buildParkSquaresOSN25KQ13Steps(lang: 'en' | 'id'): ParkSquaresStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      phase: 'plain',
      hold: 2200,
      result: false,
      caption: t(
        'Three square parks (Park 1, 2, 3) are placed side by side, all tops aligned. Their side lengths are in ratio 5 : 4 : 3.',
        'Tiga taman persegi (Taman 1, 2, 3) berjajar berimpitan, sejajar di bagian atas. Panjang sisi dalam rasio 5 : 4 : 3.',
      ),
    },
    {
      phase: 'side1',
      hold: 2400,
      result: false,
      caption: t(
        'Area of Park 1 = 100 m² → side = √100 = 10 m. So 1 ratio unit = 10 ÷ 5 = 2 m.',
        'Luas Taman 1 = 100 m² → sisi = √100 = 10 m. Maka 1 satuan rasio = 10 ÷ 5 = 2 m.',
      ),
    },
    {
      phase: 'sided',
      hold: 2400,
      result: false,
      caption: t(
        'Park 2: 4 × 2 = 8 m. Park 3: 3 × 2 = 6 m. All three side lengths are now known.',
        'Taman 2: 4 × 2 = 8 m. Taman 3: 3 × 2 = 6 m. Ketiga panjang sisi kini diketahui.',
      ),
    },
    {
      phase: 'perimeter',
      hold: 2800,
      result: false,
      caption: t(
        'Trace the outer boundary. Each park adds its top + bottom = 2×(10+8+6) = 48 m. Left side (10) + total right steps (6+2+2 = 10) = 20 m. Perimeter = 48 + 20 = 68 m.',
        'Telusuri batas luar. Setiap taman menyumbang atas + bawah = 2×(10+8+6) = 48 m. Sisi kiri (10) + kanan total (6+2+2 = 10) = 20 m. Keliling = 48 + 20 = 68 m.',
      ),
    },
    {
      phase: 'perimeter',
      hold: 0,
      result: true,
      caption: t(
        'Perimeter of the city park = 68 m. Answer C.',
        'Keliling taman kota = 68 m. Jawaban C.',
      ),
    },
  ]
}
