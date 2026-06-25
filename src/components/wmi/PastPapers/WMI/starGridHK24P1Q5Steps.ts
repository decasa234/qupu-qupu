// HKIMO-24-P1H-Q5 — beat steps for the animated explainer.
//
// Pattern: group n = n×n grid of stars with the bottom-right cell empty → n²−1 stars.
// Answer: group 6 = 6²−1 = 35.
//
// 6 beats (0–5): intro → G2 count → G3 count → G4 count → formula → answer.

export interface StarGridHK24P1Q5Beat {
  caption_en: string
  caption_id: string
  /** 0 = no group highlighted; 1–4 = that group is visually active. */
  activeGroup: 0 | 1 | 2 | 3 | 4
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

export interface StarGridHK24P1Q5Story {
  beats: StarGridHK24P1Q5Beat[]
  finalIndex: number
}

const BEATS: StarGridHK24P1Q5Beat[] = [
  {
    caption_en: 'Each group n shows an n × n arrangement of stars with the bottom-right cell empty.',
    caption_id: 'Setiap kelompok ke-n memiliki susunan n × n bintang dengan sel pojok kanan bawah kosong.',
    activeGroup: 0,
    showFormula: false,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption_en: 'Group 2: 2 × 2 grid − 1 empty cell = 3 stars ✓',
    caption_id: 'Kelompok 2: kotak 2 × 2 − 1 sel kosong = 3 bintang ✓',
    activeGroup: 2,
    showFormula: false,
    showAnswer: false,
    hold: 1800,
  },
  {
    caption_en: 'Group 3: 3 × 3 − 1 = 8 stars ✓',
    caption_id: 'Kelompok 3: 3 × 3 − 1 = 8 bintang ✓',
    activeGroup: 3,
    showFormula: false,
    showAnswer: false,
    hold: 1800,
  },
  {
    caption_en: 'Group 4: 4 × 4 − 1 = 15 stars ✓',
    caption_id: 'Kelompok 4: 4 × 4 − 1 = 15 bintang ✓',
    activeGroup: 4,
    showFormula: false,
    showAnswer: false,
    hold: 1800,
  },
  {
    caption_en: 'Pattern discovered: Group n has n² − 1 stars.',
    caption_id: 'Pola ditemukan: Kelompok n memiliki n² − 1 bintang.',
    activeGroup: 0,
    showFormula: true,
    showAnswer: false,
    hold: 2000,
  },
  {
    caption_en: 'Group 6 = 6² − 1 = 36 − 1 = 35 stars.',
    caption_id: 'Kelompok ke-6 = 6² − 1 = 36 − 1 = 35 bintang.',
    activeGroup: 0,
    showFormula: true,
    showAnswer: true,
    hold: 2500,
  },
]

export const StarGridHK24P1Q5Story: StarGridHK24P1Q5Story = {
  beats: BEATS,
  finalIndex: BEATS.length - 1,
}
