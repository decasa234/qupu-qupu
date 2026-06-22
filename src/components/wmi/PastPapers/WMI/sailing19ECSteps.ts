// IKMC-22-EC-Q19 — storyboard for the sailing buoys animation.
//
// Question: Karin sailed around four buoys (labeled 1–4) as shown.
// Which buoys did she sail around in a counterclockwise direction?
// Answer: B — buoys 2 and 3.
//
// Animation strategy — trace each buoy one at a time, annotate CW or CCW:
//   Beat 0: intro — show the static figure, no labels.
//   Beat 1: highlight buoy 3 → CCW (counterclockwise) ← "berlawanan jarum jam"
//   Beat 2: highlight buoy 1 → CW  (clockwise)
//   Beat 3: highlight buoy 4 → CW  (clockwise)
//   Beat 4: highlight buoy 2 → CCW (counterclockwise)
//   Beat 5: result — buoys 2 and 3 glow; "Answer B".
//
// Pure builder: (lang) → storyboard.  No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SailingPhase = 'intro' | 'check' | 'result'

export interface BuoyAnnotation {
  /** Buoy number (1–4). */
  buoy: number
  /** Direction: 'cw' | 'ccw' | null (not yet shown). */
  dir: 'cw' | 'ccw' | null
  /** Highlight colour. */
  color: string
}

export interface SailingBeat {
  phase: SailingPhase
  /** Buoy annotations for this beat (all 4 shown; un-visited ones have dir: null). */
  annotations: BuoyAnnotation[]
  /** Caption shown in the explanation box. */
  caption: string
  /** Short label shown in the equation badge ('', 'CW', 'CCW', or the final answer). */
  equation: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface SailingStoryboard {
  steps: SailingBeat[]
  finalIndex: number
}

// ── Directions for each buoy ──────────────────────────────────────────────────
// From the figure: the sailing path loops CCW around buoy 3, CW around buoy 1,
// CW around buoy 4, CCW around buoy 2.
// Answer is buoys 2 and 3 (the counterclockwise ones).

type BuoyDir = 'cw' | 'ccw'
const BUOY_DIR: Record<number, BuoyDir> = {
  3: 'ccw',
  1: 'cw',
  4: 'cw',
  2: 'ccw',
}

/** The visit order as shown in the figure. */
const VISIT_ORDER = [3, 1, 4, 2] as const

/** Colours used for annotations. */
const COLOR_CCW = '#2563EB'   // blue for counterclockwise
const COLOR_CW  = '#9CA3AF'   // grey for clockwise
const COLOR_ANSWER = '#10B981' // green for the final highlighted answer

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildSailing19ECSteps(lang: Lang): SailingStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const blankAnnotations = (): BuoyAnnotation[] =>
    [1, 2, 3, 4].map((n) => ({ buoy: n, dir: null, color: '#D1D5DB' }))

  const steps: SailingBeat[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    annotations: blankAnnotations(),
    equation: '',
    hold: 2000,
    result: false,
    caption: t(
      'Karin sails around buoys 3, 1, 4, and 2 in that order. Look at the direction she circles each buoy.',
      'Karin berlayar mengelilingi pelampung 3, 1, 4, dan 2 secara berurutan. Perhatikan arah dia melingkari setiap pelampung.',
    ),
  })

  // Beats 1–4 — check each buoy in visit order
  const seen: number[] = []
  for (const buoyNum of VISIT_ORDER) {
    seen.push(buoyNum)
    const dir = BUOY_DIR[buoyNum]
    const isCCW = dir === 'ccw'

    const annotations: BuoyAnnotation[] = [1, 2, 3, 4].map((n) => {
      if (n === buoyNum) {
        // Currently being highlighted
        return { buoy: n, dir, color: isCCW ? COLOR_CCW : COLOR_CW }
      }
      if (seen.includes(n) && n !== buoyNum) {
        // Already visited
        const prevDir = BUOY_DIR[n]
        return { buoy: n, dir: prevDir, color: prevDir === 'ccw' ? COLOR_CCW : COLOR_CW }
      }
      return { buoy: n, dir: null, color: '#D1D5DB' }
    })

    const dirLabel = isCCW
      ? t('counterclockwise (CCW)', 'berlawanan jarum jam (CCW)')
      : t('clockwise (CW)', 'searah jarum jam (CW)')

    steps.push({
      phase: 'check',
      annotations,
      equation: isCCW ? 'CCW ↺' : 'CW ↻',
      hold: 2400,
      result: false,
      caption: t(
        `Buoy ${buoyNum}: Karin circles it ${dirLabel}.${isCCW ? ' ← counterclockwise!' : ''}`,
        `Pelampung ${buoyNum}: Karin melingkarinya ${dirLabel}.${isCCW ? ' ← berlawanan jarum jam!' : ''}`,
      ),
    })
  }

  // Beat 5 — result: highlight buoys 2 and 3
  const resultAnnotations: BuoyAnnotation[] = [1, 2, 3, 4].map((n) => {
    const dir = BUOY_DIR[n]
    const isCCW = dir === 'ccw'
    return {
      buoy: n,
      dir,
      color: isCCW ? COLOR_ANSWER : COLOR_CW,
    }
  })

  steps.push({
    phase: 'result',
    annotations: resultAnnotations,
    equation: t('Buoys 2 & 3 → B', 'Pelampung 2 & 3 → B'),
    hold: 0,
    result: true,
    caption: t(
      'Buoys 2 and 3 were circled counterclockwise — answer B.',
      'Pelampung 2 dan 3 dikelilingi berlawanan jarum jam — jawaban B.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
