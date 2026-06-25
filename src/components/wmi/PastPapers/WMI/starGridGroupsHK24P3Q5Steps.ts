// starGridGroupsHK24P3Q5Steps.ts
// Beat steps for HKIMO-24-P3H-Q5 explainer.
//
// Group n (n≥2) has n rows × (n−1) cols → n×(n−1) stars. Group 1 = 1 (1×1).
// Counts: 1, 2, 6, 12. Answer: Group 14 = 14×13 = 182.
//
// 4 beats (0–3): introduce → reveal counts → formula → answer.

export interface StarGridGroupsHK24P3Q5Beat {
  caption_en: string
  caption_id: string
  showCounts: boolean
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: StarGridGroupsHK24P3Q5Beat[] = [
  {
    caption_en: 'Each group shows a full grid of * symbols. Group 1 has 1 row × 1 column; Group n (n≥2) has n rows × (n−1) columns.',
    caption_id: 'Setiap kelompok menampilkan kisi penuh simbol *. Kelompok 1 memiliki 1 baris × 1 kolom; Kelompok n (n≥2) memiliki n baris × (n−1) kolom.',
    showCounts: false,
    showFormula: false,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption_en: 'Count the stars: Group 1 → 1, Group 2 → 2, Group 3 → 6, Group 4 → 12.',
    caption_id: 'Hitung bintangnya: Kelompok 1 → 1, Kelompok 2 → 2, Kelompok 3 → 6, Kelompok 4 → 12.',
    showCounts: true,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Formula: Group n = n × (n − 1). Check: 3×2=6 ✓, 4×3=12 ✓',
    caption_id: 'Rumus: Kelompok ke-n = n × (n − 1). Cek: 3×2=6 ✓, 4×3=12 ✓',
    showCounts: true,
    showFormula: true,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Group 14: 14 × 13 = 182.',
    caption_id: 'Kelompok ke-14: 14 × 13 = 182.',
    showCounts: true,
    showFormula: true,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildStarGridGroupsHK24P3Q5Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
