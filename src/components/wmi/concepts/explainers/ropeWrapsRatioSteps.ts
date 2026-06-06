export type RwrPhase = 'ratio' | 'scale' | 'result'

export interface RwrStep {
  phase: RwrPhase
  /** Width of bar A, 0–1 relative to the max visible bar. */
  barAFrac: number
  /** Width of bar B (first rope), 0–1. */
  barBFrac: number
  /** Width of bar B-second (scaled), 0–1. */
  barBScaledFrac: number
  /** Width of bar A-scaled (the answer bar), 0–1. */
  barAScaledFrac: number
  caption: string
  hold: number
  result: boolean
}

export interface RwrStoryboard {
  aWraps: number
  bWraps: number
  bSecond: number
  scaleFactor: number
  answer: number
  steps: RwrStep[]
  finalIndex: number
}

/**
 * Build animation steps for the rope-wraps-ratio explainer.
 * Strategy: A/B ratio is aWraps/bWraps.
 * When B wraps bSecond times, A wraps bSecond × aWraps / bWraps.
 */
export function buildRopeWrapsRatioSteps(
  aWrapsRaw: number,
  bWrapsRaw: number,
  bSecondRaw: number,
  lang: 'en' | 'id',
): RwrStoryboard {
  // Defensive: clamp to valid range, default to safe values
  const aWraps = Number.isFinite(aWrapsRaw) && aWrapsRaw >= 1 ? Math.round(aWrapsRaw) : 2
  const bWraps = Number.isFinite(bWrapsRaw) && bWrapsRaw >= 1 ? Math.round(bWrapsRaw) : 4
  const bSecond = Number.isFinite(bSecondRaw) && bSecondRaw >= 1 ? Math.round(bSecondRaw) : 8

  // Safe division: if bWraps is 0 somehow, fallback to 1
  const safeBWraps = bWraps === 0 ? 1 : bWraps
  const scaleFactor = bSecond / safeBWraps
  const answer = bSecond * aWraps / safeBWraps

  // The max bar value across all four bars is max(aWraps, bWraps, bSecond, answer).
  const maxVal = Math.max(aWraps, bWraps, bSecond, answer) || 1

  const barAFrac = aWraps / maxVal
  const barBFrac = bWraps / maxVal
  const barBScaledFrac = bSecond / maxVal
  const barAScaledFrac = answer / maxVal

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RwrStep[] = [
    // Beat 0 — show the ratio (first rope: A vs B)
    {
      phase: 'ratio',
      barAFrac,
      barBFrac,
      barBScaledFrac: 0,
      barAScaledFrac: 0,
      caption: T(
        `Rope 1: A wraps ${aWraps} times, B wraps ${bWraps} times. Ratio A : B = ${aWraps} : ${bWraps}.`,
        `Tali 1: A melilit ${aWraps} kali, B melilit ${bWraps} kali. Rasio A : B = ${aWraps} : ${bWraps}.`,
      ),
      hold: 2200,
      result: false,
    },
    // Beat 1 — reveal the scale: B second rope has bSecond wraps
    {
      phase: 'scale',
      barAFrac,
      barBFrac,
      barBScaledFrac,
      barAScaledFrac: 0,
      caption: T(
        `Rope 2: B wraps ${bSecond} times. Scale factor = ${bSecond} ÷ ${bWraps} = ${scaleFactor}.`,
        `Tali 2: B melilit ${bSecond} kali. Faktor skala = ${bSecond} ÷ ${bWraps} = ${scaleFactor}.`,
      ),
      hold: 2200,
      result: false,
    },
    // Beat 2 — apply the same factor to A
    {
      phase: 'result',
      barAFrac,
      barBFrac,
      barBScaledFrac,
      barAScaledFrac,
      caption: T(
        `Apply to A: ${bSecond} x ${aWraps} / ${bWraps} = ${answer}. A wraps ${answer} times.`,
        `Terapkan ke A: ${bSecond} x ${aWraps} / ${bWraps} = ${answer}. A melilit ${answer} kali.`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { aWraps, bWraps, bSecond, scaleFactor, answer, steps, finalIndex: steps.length - 1 }
}
