// growingHashTIMO22P2Q5Steps.ts
// TIMO-22-P2H-Q5 beat steps for the animated explainer.
//
// Each Group n is a (2n × 2n) grid: X/hourglass + full bottom row.
// Formula: 6n − 3 symbols per group → 3, 9, 15, 21, 27, 33.
// Groups 1–4 count: 3, 9, 15, 21 (+6 constant difference).
// Group 6: 6 × 6 − 3 = 33.
//
// 4 beats (0–3): observe → count/diff → formula → answer.

export interface GrowingHashTIMO22P2Q5Beat {
  caption_en: string
  caption_id: string
  showCounts: boolean
  showDiffs: boolean
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: GrowingHashTIMO22P2Q5Beat[] = [
  {
    caption_en: 'Each group builds a growing X-shape plus a full bottom row of # symbols.',
    caption_id: 'Setiap kelompok membentuk pola X yang membesar ditambah baris bawah penuh simbol #.',
    showCounts: false,
    showDiffs: false,
    showFormula: false,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption_en: 'Group 1 → 3, Group 2 → 9 (+6), Group 3 → 15 (+6), Group 4 → 21 (+6).',
    caption_id: 'Kelompok 1 → 3, Kelompok 2 → 9 (+6), Kelompok 3 → 15 (+6), Kelompok 4 → 21 (+6).',
    showCounts: true,
    showDiffs: true,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Each group gains exactly 6 more # symbols. Formula: Group n = 6 × n − 3.',
    caption_id: 'Setiap kelompok bertambah tepat 6 simbol #. Rumus: Kelompok ke-n = 6 × n − 3.',
    showCounts: true,
    showDiffs: true,
    showFormula: true,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Group 6: 6 × 6 − 3 = 36 − 3 = 33.',
    caption_id: 'Kelompok ke-6: 6 × 6 − 3 = 36 − 3 = 33.',
    showCounts: true,
    showDiffs: true,
    showFormula: true,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildGrowingHashTIMO22P2Q5Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
