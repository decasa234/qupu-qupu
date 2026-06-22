// IKMC-23-PE-Q17 — storyboard for the triangle tiling explainer.
//
// Question: Elvis has 6 identical triangles (an inverted equilateral triangle
// subdivided by midpoint connections). Which hexagon figure can he make?
// Answer: A — a regular hexagon tiled by exactly 6 copies of the stem triangle.
//
// Teaching walk (one idea per beat):
//   0. intro   — show the stem triangle; note the midpoint subdivision.
//   1. tile    — show 2 triangles fitting together (forming a rhombus).
//   2. count   — show all 6 triangles fitting into a hexagon outline.
//   3. option  — highlight option A as the match; eliminate others.
//   4. result  — confirm answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Triangle17Phase = 'intro' | 'tile' | 'count' | 'option' | 'result'

export interface Triangle17Beat {
  phase: Triangle17Phase
  /** How many of the 6 sectors to show filled (0–6). */
  sectorsShown: number
  /** Equation / key phrase chip text ('' to hide). */
  equation: string
  /** Which option label is highlighted (null = none). */
  focusOption: string | null
  /** True if the focused option is the correct answer. */
  focusCorrect: boolean
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Triangle17Storyboard {
  steps: Triangle17Beat[]
  finalIndex: number
}

export function buildTriangle17PESteps(lang: Lang): Triangle17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Triangle17Beat[] = [
    // Beat 0 — intro: identify the stem triangle
    {
      phase: 'intro',
      sectorsShown: 0,
      equation: '',
      focusOption: null,
      focusCorrect: false,
      hold: 2200,
      result: false,
      caption: t(
        'Elvis has 6 identical triangles — each is an inverted equilateral triangle with lines connecting the midpoints of its three edges.',
        'Elvis memiliki 6 segitiga yang identik — masing-masing adalah segitiga sama sisi terbalik dengan garis yang menghubungkan titik tengah ketiga sisinya.',
      ),
    },

    // Beat 1 — show 2 triangles fitting together
    {
      phase: 'tile',
      sectorsShown: 2,
      equation: t('2 of 6 tiles placed', '2 dari 6 tile dipasang'),
      focusOption: null,
      focusCorrect: false,
      hold: 2000,
      result: false,
      caption: t(
        'Two triangles can share a long edge to form a rhombus. Keep rotating and placing copies.',
        'Dua segitiga dapat berbagi sisi panjang membentuk belah ketupat. Teruskan memutar dan menempatkan salinan.',
      ),
    },

    // Beat 2 — show all 6 triangles fitting (complete hexagon)
    {
      phase: 'count',
      sectorsShown: 6,
      equation: t('6 of 6 = full hexagon', '6 dari 6 = segi enam penuh'),
      focusOption: null,
      focusCorrect: false,
      hold: 2200,
      result: false,
      caption: t(
        'All 6 triangles fit together perfectly around a centre point, forming a regular hexagon. The internal subdivision lines are all visible.',
        'Semua 6 segitiga muat sempurna mengelilingi titik pusat, membentuk segi enam beraturan. Garis subdivisi internal semuanya terlihat.',
      ),
    },

    // Beat 3 — highlight option A
    {
      phase: 'option',
      sectorsShown: 6,
      equation: t('A: 6 × triangle ✓', 'A: 6 × segitiga ✓'),
      focusOption: 'A',
      focusCorrect: true,
      hold: 2400,
      result: false,
      caption: t(
        'Figure A shows exactly this hexagon — 6 identical X-subdivided sectors. Options B, C, D, E show different line patterns that cannot come from 6 copies of this triangle.',
        'Gambar A menunjukkan tepat segi enam ini — 6 sektor bersubdivisi X yang identik. Pilihan B, C, D, E menunjukkan pola garis berbeda yang tidak bisa berasal dari 6 salinan segitiga ini.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      sectorsShown: 6,
      equation: t('Answer: A', 'Jawaban: A'),
      focusOption: 'A',
      focusCorrect: true,
      hold: 0,
      result: true,
      caption: t(
        'Only figure A can be made by tiling exactly 6 identical copies of the stem triangle — answer A.',
        'Hanya gambar A yang bisa dibuat dengan menyusun tepat 6 salinan identik dari segitiga batang — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
