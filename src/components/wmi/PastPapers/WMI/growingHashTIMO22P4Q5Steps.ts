// growingHashTIMO22P4Q5Steps.ts
// TIMO-22-P4H-Q5 beat steps for the animated explainer.
//
// Each Group n is a 2n×2n grid: outer border frame + anti-diagonal in interior.
// Counts: G1=4, G2=14, G3=24, G4=34 (+10 constant difference).
// Formula: Gn = 10n − 6.  Group 9: 10×9 − 6 = 84.
//
// 4 beats (0–3): observe → count/diff → formula → answer.

export interface GrowingHashTIMO22P4Q5Beat {
  caption_en: string
  caption_id: string
  showCounts: boolean
  showDiffs: boolean
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: GrowingHashTIMO22P4Q5Beat[] = [
  {
    caption_en: 'Each group forms a rectangular border frame with an anti-diagonal line of # symbols inside.',
    caption_id: 'Setiap kelompok membentuk bingkai persegi panjang dengan garis anti-diagonal simbol # di dalamnya.',
    showCounts: false,
    showDiffs: false,
    showFormula: false,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption_en: 'Group 1 → 4, Group 2 → 14 (+10), Group 3 → 24 (+10), Group 4 → 34 (+10).',
    caption_id: 'Kelompok 1 → 4, Kelompok 2 → 14 (+10), Kelompok 3 → 24 (+10), Kelompok 4 → 34 (+10).',
    showCounts: true,
    showDiffs: true,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Each group gains exactly 10 more # symbols. Formula: Group n = 10 × n − 6.',
    caption_id: 'Setiap kelompok bertambah tepat 10 simbol #. Rumus: Kelompok ke-n = 10 × n − 6.',
    showCounts: true,
    showDiffs: true,
    showFormula: true,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Group 9: 10 × 9 − 6 = 90 − 6 = 84.',
    caption_id: 'Kelompok ke-9: 10 × 9 − 6 = 90 − 6 = 84.',
    showCounts: true,
    showDiffs: true,
    showFormula: true,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildGrowingHashTIMO22P4Q5Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
