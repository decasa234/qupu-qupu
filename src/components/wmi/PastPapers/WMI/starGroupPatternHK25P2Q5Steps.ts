// starGroupPatternHK25P2Q5Steps.ts
// Beat steps for HKIMO-25-P2H-Q5 explainer.
//
// Pattern: group n has an n×n grid with * in the top row and left column → 2n−1 stars.
// Groups 1–4 counts: 1, 3, 5, 7 (odd numbers, +2 each time).
// Group 99: 2×99−1 = 197.
//
// 4 beats (0–3): introduce → reveal counts → formula → answer.

export interface StarGroupPatternHK25P2Q5Beat {
  caption_en: string
  caption_id: string
  showCounts: boolean
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: StarGroupPatternHK25P2Q5Beat[] = [
  {
    caption_en: 'Each group n has an n×n grid with * symbols filling the top row and left column.',
    caption_id: 'Setiap kelompok n memiliki kisi n×n dengan simbol * mengisi baris atas dan kolom kiri.',
    showCounts: false,
    showFormula: false,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption_en: 'Count the stars: Group 1 → 1, Group 2 → 3 (+2), Group 3 → 5 (+2), Group 4 → 7 (+2).',
    caption_id: 'Hitung bintangnya: Kelompok 1 → 1, Kelompok 2 → 3 (+2), Kelompok 3 → 5 (+2), Kelompok 4 → 7 (+2).',
    showCounts: true,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'The count goes up by 2 each time. Formula: Group n = 2 × n − 1.',
    caption_id: 'Jumlahnya naik 2 setiap kali. Rumus: Kelompok ke-n = 2 × n − 1.',
    showCounts: true,
    showFormula: true,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Group 99: 2 × 99 − 1 = 198 − 1 = 197.',
    caption_id: 'Kelompok ke-99: 2 × 99 − 1 = 198 − 1 = 197.',
    showCounts: true,
    showFormula: true,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildStarGroupPatternHK25P2Q5Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
