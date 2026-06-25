// triStarGroupsHK23P3SFQ2Steps.ts
// Beat steps for HKIMO-23-P3SF-Q2 explainer.
//
// Groups 1–2 are empty n×n grids (0 stars visible, matching the source figure).
// Groups 3–4 show stars in the upper-left triangle: cells where col < n−row−1 (0-indexed).
// Counts: 0, 0, 3, 6. Formula: n(n−1)/2. Group 16 → 16×15/2 = 120.
//
// 4 beats (0–3): introduce → reveal counts → formula → answer.

export interface TriStarGroupsHK23P3SFQ2Beat {
  caption_en: string
  caption_id: string
  showCounts: boolean
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: TriStarGroupsHK23P3SFQ2Beat[] = [
  {
    caption_en: 'Each group is an n×n grid. Groups 1 and 2 are empty. Starting from Group 3, stars (*) fill the upper-left triangular region of each grid.',
    caption_id: 'Setiap kelompok adalah kisi n×n. Kelompok 1 dan 2 kosong. Mulai dari Kelompok 3, bintang (*) mengisi segitiga kiri atas kisi.',
    showCounts: false,
    showFormula: false,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption_en: 'Count the stars: Group 1 → 0, Group 2 → 0, Group 3 → 3, Group 4 → 6.',
    caption_id: 'Hitung bintangnya: Kelompok 1 → 0, Kelompok 2 → 0, Kelompok 3 → 3, Kelompok 4 → 6.',
    showCounts: true,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Formula: Group n has n × (n − 1) ÷ 2 stars. Check: 3×2÷2=3 ✓, 4×3÷2=6 ✓',
    caption_id: 'Rumus: Kelompok ke-n memiliki n × (n − 1) ÷ 2 bintang. Cek: 3×2÷2=3 ✓, 4×3÷2=6 ✓',
    showCounts: true,
    showFormula: true,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Group 16: 16 × 15 ÷ 2 = 120.',
    caption_id: 'Kelompok ke-16: 16 × 15 ÷ 2 = 120.',
    showCounts: true,
    showFormula: true,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildTriStarGroupsHK23P3SFQ2Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
