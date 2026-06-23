// SEAMO-16-B-Q24 — storyboard for the half-hexagon division explainer.
//
// Question: "The figure below shows half a hexagon. Divide the figure into
//            4 identical shapes of equal area."
// Figure:   Orange trapezoid — half a regular hexagon (bottom 2s, top s, height h=s√3/2).
//
// Key insight:
//   A regular hexagon = 6 equilateral triangles.
//   The HALF hexagon (trapezoid) = 3 equilateral triangles (2 upright + 1 inverted).
//   Divide the half-hexagon into 4 congruent right-trapezoids using 3 cut lines from
//   specific bottom-edge points to specific top-edge points:
//     • Cut 1: bottom-left-third  → top-left corner   (B1 → T_L)
//     • Cut 2: bottom-midpoint    → top-midpoint       (B2 → T_mid)
//     • Cut 3: bottom-right-third → top-right corner  (B3 → T_R)
//   This produces 4 congruent pieces, each a parallelogram / right trapezoid.
//
// Teaching walk (one idea per beat):
//   0. intro    — show blank half-hexagon; state the task.
//   1. structure — highlight that it equals 3 equilateral triangles.
//   2. cut1     — draw first diagonal cut (left side).
//   3. cut2     — draw second cut (middle vertical).
//   4. cut3     — draw third diagonal cut (right side).
//   5. result   — all 4 congruent pieces coloured; confirm equal area.

export type Lang = 'en' | 'id'

export type HalfHex16B24Phase =
  | 'intro'
  | 'structure'
  | 'cut1'
  | 'cut2'
  | 'cut3'
  | 'result'

export interface HalfHex16B24Beat {
  phase: HalfHex16B24Phase
  /** How many of the 3 cut lines to show (0-3). */
  cutsShown: number
  /** Show equilateral-triangle grid overlay. */
  showTriangleGrid: boolean
  /** Colour the 4 pieces distinctly. */
  colorPieces: boolean
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface HalfHex16B24Storyboard {
  steps: HalfHex16B24Beat[]
  finalIndex: number
}

export function buildHalfHex16B24Steps(lang: Lang): HalfHex16B24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HalfHex16B24Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      cutsShown: 0,
      showTriangleGrid: false,
      colorPieces: false,
      hold: 2000,
      result: false,
      caption: t(
        'This is half a regular hexagon — a trapezoid. We need to divide it into 4 identical shapes of equal area.',
        'Ini adalah setengah segi enam beraturan — sebuah trapesium. Kita perlu membaginya menjadi 4 bentuk yang identik dengan luas yang sama.',
      ),
    },

    // Beat 1 — structure
    {
      phase: 'structure',
      cutsShown: 0,
      showTriangleGrid: true,
      colorPieces: false,
      hold: 2400,
      result: false,
      caption: t(
        'A regular hexagon is made of 6 equilateral triangles. Half of it = 3 equilateral triangles. We need to split these into 4 equal pieces.',
        'Segi enam beraturan terdiri dari 6 segitiga sama sisi. Separuhnya = 3 segitiga sama sisi. Kita perlu membaginya menjadi 4 bagian yang sama.',
      ),
    },

    // Beat 2 — first cut
    {
      phase: 'cut1',
      cutsShown: 1,
      showTriangleGrid: false,
      colorPieces: false,
      hold: 2200,
      result: false,
      caption: t(
        'First cut: draw a line from the left-bottom-third point up to the top-left corner.',
        'Potongan pertama: tarik garis dari titik sepertiga kiri bawah ke sudut kiri atas.',
      ),
    },

    // Beat 3 — second cut
    {
      phase: 'cut2',
      cutsShown: 2,
      showTriangleGrid: false,
      colorPieces: false,
      hold: 2200,
      result: false,
      caption: t(
        'Second cut: draw a line from the midpoint of the bottom edge straight up to the midpoint of the top edge.',
        'Potongan kedua: tarik garis dari titik tengah sisi bawah lurus ke titik tengah sisi atas.',
      ),
    },

    // Beat 4 — third cut
    {
      phase: 'cut3',
      cutsShown: 3,
      showTriangleGrid: false,
      colorPieces: false,
      hold: 2200,
      result: false,
      caption: t(
        'Third cut: draw a line from the right-bottom-third point up to the top-right corner.',
        'Potongan ketiga: tarik garis dari titik sepertiga kanan bawah ke sudut kanan atas.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      cutsShown: 3,
      showTriangleGrid: false,
      colorPieces: true,
      hold: 0,
      result: true,
      caption: t(
        '4 identical congruent pieces — each is the same shape and has the same area (¼ of the total). Done!',
        '4 bagian yang identik dan kongruen — masing-masing bentuknya sama dan luasnya sama (¼ dari total). Selesai!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
