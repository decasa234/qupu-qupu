// OSN-15-SD-NAS-Q19 — angle-chase storyboard
//
// Problem: D on BC with AC=CD, ∠CAB = ∠ABC + 45°. Find ∠BAD.
// Solution: let ∠ABC = β → ∠CAB = β+45° → ∠ACB = 135°−2β
//           isosceles ACD (AC=CD) → ∠CAD = (180°−(135°−2β))/2 = 22.5°+β
//           ∠BAD = (β+45°) − (22.5°+β) = 22.5°
//
// Beats:
//   0. intro       — show static figure, state conditions
//   1. name-beta   — label ∠ABC = β, ∠CAB = β+45°
//   2. angle-c     — compute ∠ACB = 135°−2β
//   3. isosceles   — △ACD isosceles → ∠CAD = 22.5°+β
//   4. result      — ∠BAD = 22.5°

export type Lang = 'en' | 'id'

export type CevianPhase = 'intro' | 'name-beta' | 'angle-c' | 'isosceles' | 'result'

export interface CevianBeat {
  phase: CevianPhase
  /** Highlight ∠ABC arc at B */
  showBeta: boolean
  /** Highlight ∠CAB arc at A in blue */
  showAlpha: boolean
  /** Highlight ∠ACB arc at C in orange */
  showGammaC: boolean
  /** Highlight equal arcs at A and D for the isosceles sub-triangle */
  showIsosceles: boolean
  /** Highlight ∠BAD arc at A in green (final answer) */
  showResult: boolean
  equation: string
  caption: string
  /** Auto-hold ms; 0 = final (manual) */
  hold: number
  result: boolean
}

export interface CevianStoryboard {
  steps: CevianBeat[]
  finalIndex: number
}

export function buildCevianOSN15NQ19Steps(lang: Lang): CevianStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CevianBeat[] = [
    {
      phase: 'intro',
      showBeta: false, showAlpha: false, showGammaC: false, showIsosceles: false, showResult: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'D is on BC with AC = CD (tick marks). Given ∠CAB = ∠ABC + 45°. Find ∠BAD.',
        'D berada pada BC dengan AC = CD (tanda centang). Diketahui ∠CAB = ∠ABC + 45°. Cari ∠BAD.',
      ),
    },
    {
      phase: 'name-beta',
      showBeta: true, showAlpha: true, showGammaC: false, showIsosceles: false, showResult: false,
      equation: '∠CAB = β + 45°',
      hold: 2200,
      result: false,
      caption: t(
        'Let ∠ABC = β. The condition says ∠CAB = β + 45°.',
        'Misalkan ∠ABC = β. Syarat menyatakan ∠CAB = β + 45°.',
      ),
    },
    {
      phase: 'angle-c',
      showBeta: true, showAlpha: true, showGammaC: true, showIsosceles: false, showResult: false,
      equation: '∠ACB = 180° − β − (β+45°) = 135° − 2β',
      hold: 2500,
      result: false,
      caption: t(
        'Angle sum in △ABC: ∠ACB = 180° − β − (β+45°) = 135° − 2β.',
        'Jumlah sudut di △ABC: ∠ACB = 180° − β − (β+45°) = 135° − 2β.',
      ),
    },
    {
      phase: 'isosceles',
      showBeta: false, showAlpha: true, showGammaC: false, showIsosceles: true, showResult: false,
      equation: '∠CAD = (180°−(135°−2β)) / 2 = 22.5°+β',
      hold: 2500,
      result: false,
      caption: t(
        '△ACD is isosceles (AC=CD), so ∠CAD = ∠CDA = (45°+2β)/2 = 22.5°+β.',
        '△ACD sama kaki (AC=CD), sehingga ∠CAD = ∠CDA = (45°+2β)/2 = 22,5°+β.',
      ),
    },
    {
      phase: 'result',
      showBeta: false, showAlpha: false, showGammaC: false, showIsosceles: false, showResult: true,
      equation: '∠BAD = (β+45°) − (22.5°+β) = 22.5°',
      hold: 0,
      result: true,
      caption: t(
        '∠BAD = ∠CAB − ∠CAD = (β+45°) − (22.5°+β) = 22.5°.',
        '∠BAD = ∠CAB − ∠CAD = (β+45°) − (22,5°+β) = 22,5°.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
