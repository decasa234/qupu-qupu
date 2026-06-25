// HKIMO-24-P2H-Q5 — beat steps for the animated explainer.
//
// Pattern: group n has a triangular staircase of n(n+1)/2 stars.
// Group 1=1, Group 2=3, Group 3=6, Group 4=10. Answer: Group 10 = 55.
//
// 6 beats (0–5): intro → G2 count → G3 count → G4 count → formula → answer.

export interface TriStairHK24P2Q5Beat {
  caption_en: string
  caption_id: string
  /** 0 = no group highlighted; 1–4 = that group is visually active. */
  activeGroup: 0 | 1 | 2 | 3 | 4
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

export interface TriStairHK24P2Q5Story {
  beats: TriStairHK24P2Q5Beat[]
  finalIndex: number
}

const BEATS: TriStairHK24P2Q5Beat[] = [
  {
    caption_en: 'Each group n shows a staircase: the top row has n stars, the next n−1, … down to 1.',
    caption_id: 'Setiap kelompok ke-n membentuk tangga: baris atas memiliki n bintang, baris berikutnya n−1, … hingga 1.',
    activeGroup: 0,
    showFormula: false,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption_en: 'Group 2: 2 + 1 = 3 stars ✓',
    caption_id: 'Kelompok ke-2: 2 + 1 = 3 bintang ✓',
    activeGroup: 2,
    showFormula: false,
    showAnswer: false,
    hold: 1800,
  },
  {
    caption_en: 'Group 3: 3 + 2 + 1 = 6 stars ✓',
    caption_id: 'Kelompok ke-3: 3 + 2 + 1 = 6 bintang ✓',
    activeGroup: 3,
    showFormula: false,
    showAnswer: false,
    hold: 1800,
  },
  {
    caption_en: 'Group 4: 4 + 3 + 2 + 1 = 10 stars ✓',
    caption_id: 'Kelompok ke-4: 4 + 3 + 2 + 1 = 10 bintang ✓',
    activeGroup: 4,
    showFormula: false,
    showAnswer: false,
    hold: 1800,
  },
  {
    caption_en: 'Pattern: Group n = 1 + 2 + … + n = n(n+1)/2 stars.',
    caption_id: 'Pola: Kelompok ke-n = 1 + 2 + … + n = n(n+1)/2 bintang.',
    activeGroup: 0,
    showFormula: true,
    showAnswer: false,
    hold: 2000,
  },
  {
    caption_en: 'Group 10 = 10 × 11 / 2 = 55 stars.',
    caption_id: 'Kelompok ke-10 = 10 × 11 / 2 = 55 bintang.',
    activeGroup: 0,
    showFormula: true,
    showAnswer: true,
    hold: 2500,
  },
]

export const TriStairHK24P2Q5Story: TriStairHK24P2Q5Story = {
  beats: BEATS,
  finalIndex: BEATS.length - 1,
}
