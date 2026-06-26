// fishTrianglesSASMO19G4Q2Steps — SASMO-19-G4-Q2
//
// Teaching walk for "How many triangles in the fish figure?" (answer B = 12).
//
// Strategy: count by size, then add.
//   0. intro      — introduce the figure; remind students to look for ALL sizes.
//   1. tail-small — 4 small (size-1) triangles in the tail wedges.
//   2. fins-small — 4 small triangles in the fins (dorsal + ventral + 2 pectoral).
//   3. medium     — 3 medium (size-2) triangles: consecutive tail-wedge pairs.
//   4. large      — 1 large (size-4) triangle: the entire tail.
//   5. result     — 8 + 3 + 1 = 12 → Answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId =
  | 'intro'
  | 'tail-small'
  | 'fins-small'
  | 'medium'
  | 'large'
  | 'result'

export interface Beat {
  phase: PhaseId
  headline_en: string
  headline_id: string
  sub_en: string
  sub_id: string
  hold: number
}

export interface Storyboard {
  steps: Beat[]
  finalIndex: number
}

export function buildFishTrianglesSASMO19G4Q2Steps(_lang: Lang): Storyboard {
  const steps: Beat[] = [
    {
      phase: 'intro',
      headline_en: 'Count ALL triangles in the figure',
      headline_id: 'Hitung SEMUA segitiga dalam gambar',
      sub_en: 'Include small triangles and any formed by combining smaller ones.',
      sub_id: 'Termasuk segitiga kecil dan yang terbentuk dari gabungan segitiga kecil.',
      hold: 2000,
    },
    {
      phase: 'tail-small',
      headline_en: '4 small triangles in the tail',
      headline_id: '4 segitiga kecil di ekor',
      sub_en: 'The tail is split by 3 lines from the tip into 4 wedge triangles.',
      sub_id: 'Ekor dibagi oleh 3 garis dari ujungnya menjadi 4 segitiga irisan.',
      hold: 2200,
    },
    {
      phase: 'fins-small',
      headline_en: '4 more small triangles in the fins',
      headline_id: '4 segitiga kecil lagi di sirip',
      sub_en: 'Top fin + bottom fin + outer pectoral + inner pectoral = 4. Total small: 8.',
      sub_id: 'Sirip atas + bawah + sirip luar + sirip dalam = 4. Total kecil: 8.',
      hold: 2200,
    },
    {
      phase: 'medium',
      headline_en: '3 medium triangles (2 wedges each)',
      headline_id: '3 segitiga sedang (2 irisan masing-masing)',
      sub_en: 'Pair consecutive wedges: W1+W2, W2+W3, W3+W4 → 3 medium triangles.',
      sub_id: 'Gabungkan irisan berdekatan: W1+W2, W2+W3, W3+W4 → 3 segitiga sedang.',
      hold: 2400,
    },
    {
      phase: 'large',
      headline_en: '1 large triangle (the whole tail)',
      headline_id: '1 segitiga besar (seluruh ekor)',
      sub_en: 'All 4 wedges together form 1 large triangle covering the tail.',
      sub_id: 'Keempat irisan bersama membentuk 1 segitiga besar yang mencakup seluruh ekor.',
      hold: 1800,
    },
    {
      phase: 'result',
      headline_en: '8 + 3 + 1 = 12 → Answer B',
      headline_id: '8 + 3 + 1 = 12 → Jawaban B',
      sub_en: 'Small (8) + medium (3) + large (1) = 12 triangles in total.',
      sub_id: 'Kecil (8) + sedang (3) + besar (1) = 12 segitiga semuanya.',
      hold: 2500,
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}
