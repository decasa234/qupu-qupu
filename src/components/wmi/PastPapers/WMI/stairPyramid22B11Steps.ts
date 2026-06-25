// Storyboard for SEAMO-22-B-Q11 — post-answer explainer.
// "3 layers of 2×2×2 cm cubes — find total area of visible surfaces from top and sides."
// Answer: E (132 cm²) = 33 visible unit faces × 4 cm² each.
//
// Face count breakdown:
//   Top faces:    z=0 front row (y=0): 3; z=1 mid row (y=1): 3; z=2 top row (y=2): 3  = 9
//   Front faces:  z=0 only at y=0, 1 high × 3 wide                                      = 3
//   Back faces:   y=2 side, 3 layers visible: 3 high × 3 wide                            = 9
//   Left faces:   x=0 side, staircase profile: 1+2+3                                     = 6
//   Right faces:  x=2 side, same staircase profile                                       = 6
//   Total = 9 + 3 + 9 + 6 + 6 = 33 faces × 4 cm² = 132 cm²

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type FacePhase = 'intro' | 'top' | 'front' | 'back' | 'sides' | 'total'

export interface StairPyramidStep {
  phase: FacePhase
  /** Which face groups to highlight in the SVG: set of 'top'|'front'|'back'|'left'|'right' */
  highlightFaces: Set<string>
  /** Running face count shown in the UI */
  runningFaces: number
  /** Running area (faces × 4) */
  runningArea: number
  caption: string
  hold: number
  result: boolean
}

export interface StairPyramidStoryboard {
  steps: StairPyramidStep[]
  finalIndex: number
  answer: number
}

export function buildStairPyramid22B11Steps(lang: Lang): StairPyramidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: StairPyramidStep[] = []

  steps.push({
    phase: 'intro',
    highlightFaces: new Set(),
    runningFaces: 0,
    runningArea: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Each small cube face = 2 × 2 = 4 cm². Count visible faces from top and all 4 sides.',
      'Setiap wajah kubus kecil = 2 × 2 = 4 cm². Hitung wajah yang terlihat dari atas dan 4 sisi.',
    ),
  })

  steps.push({
    phase: 'top',
    highlightFaces: new Set(['top']),
    runningFaces: 9,
    runningArea: 36,
    hold: 2400,
    result: false,
    caption: t(
      'Top faces: 3 exposed per layer × 3 layers = 9 faces → 9 × 4 = 36 cm².',
      'Wajah atas: 3 terbuka per lapisan × 3 lapisan = 9 wajah → 9 × 4 = 36 cm².',
    ),
  })

  steps.push({
    phase: 'front',
    highlightFaces: new Set(['top', 'front']),
    runningFaces: 12,
    runningArea: 48,
    hold: 2400,
    result: false,
    caption: t(
      'Front face (y=0): only bottom layer shows, 3 faces → +3 = 12 faces, 48 cm².',
      'Wajah depan (y=0): hanya lapisan bawah terlihat, 3 wajah → +3 = 12 wajah, 48 cm².',
    ),
  })

  steps.push({
    phase: 'back',
    highlightFaces: new Set(['top', 'front', 'back']),
    runningFaces: 21,
    runningArea: 84,
    hold: 2400,
    result: false,
    caption: t(
      'Back face (y=2): all 3 layers visible, 3 high × 3 wide = 9 faces → +9 = 21 faces, 84 cm².',
      'Wajah belakang (y=2): 3 lapisan terlihat, 3 tinggi × 3 lebar = 9 wajah → +9 = 21 wajah, 84 cm².',
    ),
  })

  steps.push({
    phase: 'sides',
    highlightFaces: new Set(['top', 'front', 'back', 'left', 'right']),
    runningFaces: 33,
    runningArea: 132,
    hold: 2400,
    result: false,
    caption: t(
      'Left & right sides: staircase profile = 1+2+3 = 6 faces each → +12 = 33 faces, 132 cm².',
      'Sisi kiri & kanan: profil tangga = 1+2+3 = 6 wajah masing-masing → +12 = 33 wajah, 132 cm².',
    ),
  })

  steps.push({
    phase: 'total',
    highlightFaces: new Set(['top', 'front', 'back', 'left', 'right']),
    runningFaces: 33,
    runningArea: 132,
    hold: 0,
    result: true,
    caption: t(
      '33 visible faces × 4 cm² = 132 cm² — answer E.',
      '33 wajah terlihat × 4 cm² = 132 cm² — jawaban E.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 132 }
}
