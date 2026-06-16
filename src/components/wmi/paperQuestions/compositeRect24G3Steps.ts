// Storyboard builder for WMI-24F3A-Q6: composite-rectangle perimeter.
//
// Shape: small rectangle (30 cm × ★ cm) centred on top of large rectangle
// (50 cm × 22 cm). Ledges each side = 10 cm. Perimeter = 168 cm. Find ★.
//
// Method: sum all known edges → subtract from perimeter → divide by 2.

export type Lang = 'en' | 'id'

export type PerimPhase =
  | 'intro'        // show shape + goal
  | 'edges'        // walk around listing each known edge
  | 'remainder'    // 168 − 144 = 24 for two ★ sides
  | 'result'       // ★ = 12, answer D

export interface PerimStep {
  phase: PerimPhase
  /** Which edge segments to highlight (named for the shape walk). */
  highlight: EdgeName[]
  /** Running sum of known edges so far. */
  runningSum: number | null
  /** When set, show the star value in the figure. */
  starValue: number | null
  caption: string
  hold: number
  result: boolean
}

/** Named segments of the composite-rectangle perimeter (clockwise from bottom). */
export type EdgeName =
  | 'bottom'      // 50 cm bottom edge
  | 'rightBottom' // 22 cm right side of the bottom rect
  | 'rightLedge'  // 10 cm right ledge (horizontal step)
  | 'rightStar'   // ★ cm right side of the top rect
  | 'top'         // 30 cm top edge
  | 'leftStar'    // ★ cm left side of the top rect
  | 'leftLedge'   // 10 cm left ledge (horizontal step)
  | 'leftBottom'  // 22 cm left side of the bottom rect

export interface PerimStoryboard {
  steps: PerimStep[]
  finalIndex: number
}

export function buildCompositeRect24G3Steps(lang: Lang): PerimStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PerimStep[] = [
    {
      phase: 'intro',
      highlight: [],
      runningSum: null,
      starValue: null,
      hold: 2600,
      result: false,
      caption: t(
        'Walk around the OUTSIDE of the shape and add up every edge. The total must equal 168 cm.',
        'Jalan mengelilingi LUAR bangun dan jumlahkan setiap tepi. Totalnya harus 168 cm.',
      ),
    },
    {
      phase: 'edges',
      highlight: ['bottom', 'rightBottom', 'rightLedge'],
      runningSum: 82,
      starValue: null,
      hold: 2400,
      result: false,
      caption: t(
        '50 + 22 + 10 = 82 cm — bottom, right side, right ledge.',
        '50 + 22 + 10 = 82 cm — bawah, sisi kanan, tepi kanan.',
      ),
    },
    {
      phase: 'edges',
      highlight: ['bottom', 'rightBottom', 'rightLedge', 'top', 'leftLedge', 'leftBottom'],
      runningSum: 144,
      starValue: null,
      hold: 2400,
      result: false,
      caption: t(
        '+ 30 + 10 + 22 = 144 cm — six known edges. Two ★ sides still to count!',
        '+ 30 + 10 + 22 = 144 cm — enam tepi diketahui. Dua sisi ★ belum dihitung!',
      ),
    },
    {
      phase: 'remainder',
      highlight: ['leftStar', 'rightStar'],
      runningSum: 144,
      starValue: null,
      hold: 2400,
      result: false,
      caption: t(
        '168 − 144 = 24 cm left for the TWO ★ sides.',
        '168 − 144 = 24 cm tersisa untuk DUA sisi ★.',
      ),
    },
    {
      phase: 'result',
      highlight: ['leftStar', 'rightStar'],
      runningSum: 168,
      starValue: 12,
      hold: 0,
      result: true,
      caption: t(
        '★ = 24 ÷ 2 = 12 cm → answer D.',
        '★ = 24 ÷ 2 = 12 cm → jawaban D.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
