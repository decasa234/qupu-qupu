// HKIMO-18-P2H-Q5 beat steps for the animated explainer.
//
// Pattern: group n has 4n−3 ⊗ symbols arranged in a cross/plus shape
// (center + n−1 arms in each of 4 directions).
//
// Groups 1–4 counts: 1, 5, 9, 13 (+4 each time).
// Group 12: 4×12 − 3 = 45.
//
// 4 beats (0–3): introduce → count differences → formula → answer.

export interface CrossPatternHK18P2Q5Beat {
  caption_en: string
  caption_id: string
  showCounts: boolean
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: CrossPatternHK18P2Q5Beat[] = [
  {
    caption_en: 'Each group forms a cross/plus shape made of ⊗ symbols.',
    caption_id: 'Setiap kelompok membentuk pola salib dari simbol ⊗.',
    showCounts: false,
    showFormula: false,
    showAnswer: false,
    hold: 2000,
  },
  {
    caption_en: 'Group 1 → 1, Group 2 → 5 (+4), Group 3 → 9 (+4), Group 4 → 13 (+4).',
    caption_id: 'Kelompok 1 → 1, Kelompok 2 → 5 (+4), Kelompok 3 → 9 (+4), Kelompok 4 → 13 (+4).',
    showCounts: true,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'The count increases by 4 each time. Formula: Group n = 4 × n − 3.',
    caption_id: 'Jumlahnya bertambah 4 setiap kali. Rumus: Kelompok ke-n = 4 × n − 3.',
    showCounts: true,
    showFormula: true,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Group 12: 4 × 12 − 3 = 48 − 3 = 45.',
    caption_id: 'Kelompok ke-12: 4 × 12 − 3 = 48 − 3 = 45.',
    showCounts: true,
    showFormula: true,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildCrossPatternHK18P2Q5Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
