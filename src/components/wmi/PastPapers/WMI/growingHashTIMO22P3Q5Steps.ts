// growingHashTIMO22P3Q5Steps.ts
// TIMO-22-P3H-Q5 beat steps for the animated explainer.
//
// Each Group n is a (2n × 2n) grid:
//   · rows 0…2n−2: full X — both diagonals cross, each row always 2 cells
//     at columns [rr, 2n−1−rr] where rr = min(r, 2n−2−r)
//   · row 2n−1:    full bottom row of 2n # symbols
// Formula: 6n − 2 symbols per group → 4, 10, 16, 22 for groups 1–4.
// Group 7: 6 × 7 − 2 = 40.
//
// 4 beats (0–3): observe → count/diff → formula → answer.

export interface GrowingHashTIMO22P3Q5Beat {
  caption_en: string
  caption_id: string
  showCounts: boolean
  showDiffs: boolean
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: GrowingHashTIMO22P3Q5Beat[] = [
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
    caption_en: 'Group 1 → 4, Group 2 → 10 (+6), Group 3 → 16 (+6), Group 4 → 22 (+6).',
    caption_id: 'Kelompok 1 → 4, Kelompok 2 → 10 (+6), Kelompok 3 → 16 (+6), Kelompok 4 → 22 (+6).',
    showCounts: true,
    showDiffs: true,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Each group gains exactly 6 more # symbols. Formula: Group n = 6 × n − 2.',
    caption_id: 'Setiap kelompok bertambah tepat 6 simbol #. Rumus: Kelompok ke-n = 6 × n − 2.',
    showCounts: true,
    showDiffs: true,
    showFormula: true,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Group 7: 6 × 7 − 2 = 42 − 2 = 40.',
    caption_id: 'Kelompok ke-7: 6 × 7 − 2 = 42 − 2 = 40.',
    showCounts: true,
    showDiffs: true,
    showFormula: true,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildGrowingHashTIMO22P3Q5Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
