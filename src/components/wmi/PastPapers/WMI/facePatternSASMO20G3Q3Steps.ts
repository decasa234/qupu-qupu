// Animation steps for SASMO-20-G3-Q3 — face matrix pattern.
//
// Strategy:
//   1. Intro — show the 3×3 grid of faces.
//   2. Mouth rule — each row/column has exactly one smile, flat, frown (Latin square).
//   3. Identify ? mouth — must be 'smile' (the only missing mouth in that row + column).
//   4. Hair rule — direction is fixed per column: col 0 = left, col 1 = up, col 2 = right.
//   5. Hair count — ? position needs 1 stroke (single).
//   6. Result — matches option C: single stroke right + smile.

export type Lang = 'en' | 'id'

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export type FacePhase = 'intro' | 'mouth-rule' | 'mouth-id' | 'hair-rule' | 'hair-id' | 'result'

export interface FacePatternStep {
  phase:       FacePhase
  /** Which cell indices (0–8) to highlight with a ring, or empty. */
  highlight:   number[]
  /** Which option label to spotlight, or null. */
  spotOption:  'A' | 'B' | 'C' | 'D' | 'E' | null
  /** True when this is the answer-reveal beat. */
  result:      boolean
  hold:        number
  caption:     string
}

export interface FacePatternStoryboard {
  steps:      FacePatternStep[]
  finalIndex: number
}

export function buildFacePatternSASMO20G3Q3Steps(lang: Lang): FacePatternStoryboard {
  const steps: FacePatternStep[] = []

  // Beat 0 — intro
  steps.push({
    phase:      'intro',
    highlight:  [],
    spotOption: null,
    result:     false,
    hold:       1600,
    caption: t(
      lang,
      'Study the 3×3 grid of faces — each face has a mouth expression and hair strokes.',
      'Perhatikan kotak 3×3 berisi wajah — setiap wajah punya ekspresi mulut dan rambut.',
    ),
  })

  // Beat 1 — mouth rule: highlight row 2 (indices 6,7,8) to show each row has all three
  steps.push({
    phase:      'mouth-rule',
    highlight:  [0, 1, 2, 3, 4, 5, 6, 7],
    spotOption: null,
    result:     false,
    hold:       2200,
    caption: t(
      lang,
      'Mouth rule: each row has exactly one smile, one flat, and one frown (Latin square pattern).',
      'Aturan mulut: setiap baris punya tepat satu senyum, satu datar, dan satu sedih (pola kotak Latin).',
    ),
  })

  // Beat 2 — identify ? mouth
  steps.push({
    phase:      'mouth-id',
    highlight:  [6, 7, 8],
    spotOption: null,
    result:     false,
    hold:       2000,
    caption: t(
      lang,
      'Bottom row already has frown (col 0) and flat (col 1) → the "?" must be a smile.',
      'Baris bawah sudah punya sedih (kol 0) dan datar (kol 1) → "?" harus berupa senyum.',
    ),
  })

  // Beat 3 — hair direction rule
  steps.push({
    phase:      'hair-rule',
    highlight:  [0, 3, 6, 1, 4, 7, 2, 5],
    spotOption: null,
    result:     false,
    hold:       2200,
    caption: t(
      lang,
      'Hair direction follows the column: col 0 = left, col 1 = up, col 2 = right.',
      'Arah rambut mengikuti kolom: kol 0 = kiri, kol 1 = atas, kol 2 = kanan.',
    ),
  })

  // Beat 4 — identify ? hair
  steps.push({
    phase:      'hair-id',
    highlight:  [2, 5, 8],
    spotOption: null,
    result:     false,
    hold:       2000,
    caption: t(
      lang,
      'Column 2 already has 2 strokes (row 0) and 1 stroke (row 1) → "?" needs 1 stroke to the right.',
      'Kolom 2 sudah punya 2 goresan (baris 0) dan 1 goresan (baris 1) → "?" butuh 1 goresan ke kanan.',
    ),
  })

  // Beat 5 — spotlight C among options, show it matches
  steps.push({
    phase:      'result',
    highlight:  [8],
    spotOption: 'C',
    result:     true,
    hold:       0,
    caption: t(
      lang,
      '1 stroke right + smile = option C → answer C.',
      '1 goresan kanan + senyum = pilihan C → jawaban C.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
