// HKIMO-18-P3H-Q5 beat steps for the animated explainer.
//
// Pattern: group n has 2n²−1 ⊗ symbols in a (2n−1)×(2n−1) grid.
// Group 1→1, Group 2→7, Group 3→17 (differences +6, +10 increasing by 4).
// Group 10 = 2×100−1 = 181.
//
// 4 beats (0–3): introduce → count differences → formula → answer.

export interface BlockGridHK18P3Q5Beat {
  caption_en: string
  caption_id: string
  showCounts: boolean
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: BlockGridHK18P3Q5Beat[] = [
  {
    caption_en: 'Each group is a square grid of ⊗ symbols that grows outward.',
    caption_id: 'Setiap kelompok adalah kisi kotak dari simbol ⊗ yang tumbuh ke luar.',
    showCounts: false,
    showFormula: false,
    showAnswer: false,
    hold: 2000,
  },
  {
    caption_en: 'Group 1 → 1, Group 2 → 7 (+6), Group 3 → 17 (+10). The gap grows by 4 each time!',
    caption_id: 'Kelompok 1 → 1, Kelompok 2 → 7 (+6), Kelompok 3 → 17 (+10). Selisihnya bertambah 4!',
    showCounts: true,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Differences +6, +10, +14, … increase by 4 — quadratic. Formula: Group n = 2n² − 1.',
    caption_id: 'Selisih +6, +10, +14, … naik 4 — kuadratik. Rumus: Kelompok ke-n = 2n² − 1.',
    showCounts: true,
    showFormula: true,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Group 10: 2 × 10² − 1 = 200 − 1 = 181.',
    caption_id: 'Kelompok ke-10: 2 × 10² − 1 = 200 − 1 = 181.',
    showCounts: true,
    showFormula: true,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildBlockGridHK18P3Q5Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
