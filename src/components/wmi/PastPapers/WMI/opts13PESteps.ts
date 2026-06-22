// IKMC-20-PE-Q13 — beat-by-beat explainer steps.
// "In which of the following pictures is more of the shape shaded than any of
// the others?"  Answer: B.
//
// Strategy: compare the shaded fraction (shaded area / total shape area) for
// each option and find the largest.  Cells with a diagonal white triangle
// contribute 0.5 to the shaded total.
//
// Fractions (all over 9 cells in the base square):
//   A: 4 corner cuts (0.5 each) + 5 full cells = 2 + 5 = 7/9 ≈ 0.78
//   B: 3 corner cuts (0.5 each) + 6 full cells = 1.5 + 6 = 7.5/9 ≈ 0.83  ← most
//   C: 1 center cell white + roof adds area, net shaded fraction < B
//   D: 1 full white + 2 corner cuts (0.5 each) + 6 full = 0+1+6 = 7/9 ≈ 0.78
//   E: 2 full white cells → 7/9 ≈ 0.78

export interface Step13PE {
  /** Which option is being highlighted (1-indexed reveal order). */
  reveal: number
  hold: number
  result: boolean
  caption_en: string
  caption_id: string
}

export const opts13PESteps: ReadonlyArray<Step13PE> = [
  {
    reveal: 0,
    hold: 2200,
    result: false,
    caption_en: 'For each picture, compare: how much of the shape is shaded?',
    caption_id: 'Untuk setiap gambar, bandingkan: seberapa banyak bagian yang diarsir?',
  },
  {
    reveal: 1,
    hold: 2200,
    result: false,
    caption_en: 'A: 5 full cells + 4 half-corner cells → 7/9 shaded.',
    caption_id: 'A: 5 sel penuh + 4 sel setengah sudut → 7/9 diarsir.',
  },
  {
    reveal: 2,
    hold: 2200,
    result: false,
    caption_en: 'B: 6 full cells + 3 half-corner cells → 7½/9 shaded. More than A!',
    caption_id: 'B: 6 sel penuh + 3 sel setengah sudut → 7½/9 diarsir. Lebih dari A!',
  },
  {
    reveal: 3,
    hold: 2200,
    result: false,
    caption_en: 'C: white center + roof adds area → shaded fraction is less than B.',
    caption_id: 'C: tengah putih + atap menambah luas → bagian diarsir lebih kecil dari B.',
  },
  {
    reveal: 4,
    hold: 2200,
    result: false,
    caption_en: 'D: 1 white corner cell + 2 half-cells → 7/9 shaded. Less than B.',
    caption_id: 'D: 1 sel sudut putih + 2 sel setengah → 7/9 diarsir. Kurang dari B.',
  },
  {
    reveal: 5,
    hold: 2200,
    result: false,
    caption_en: 'E: 2 white corner cells → 7/9 shaded. Less than B.',
    caption_id: 'E: 2 sel sudut putih → 7/9 diarsir. Kurang dari B.',
  },
  {
    reveal: 5,
    hold: 0,
    result: true,
    caption_en: 'Picture B has the most shading: 7½ of 9 cells grey.',
    caption_id: 'Gambar B memiliki arsiran terbanyak: 7½ dari 9 sel berwarna abu-abu.',
  },
]
