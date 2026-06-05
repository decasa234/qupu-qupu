export type Lang = 'en' | 'id'

export interface CorrectionParams {
  name: string
  right: number
  wrong: number
  place: 'units' | 'tens'
  correct: number
}

export interface CorrectionStep {
  /** How many derivation lines are visible. */
  linesShown: number
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface CorrectionStoryboard {
  lines: string[]
  /** How much too big the misread made the number (and thus the sum). */
  delta: number
  /** The (too-big) sum the child actually got. */
  got: number
  correct: number
  steps: CorrectionStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

// Reasons about place value: the misread digit made one number
// (wrong − right) × placeValue too big, so the sum is that much too big —
// subtract it back off.
export function buildCorrectionSteps(p: CorrectionParams, lang: Lang): CorrectionStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const placeVal = p.place === 'units' ? 1 : 10
  const delta = (p.wrong - p.right) * placeVal
  const got = p.correct + delta
  const placeWord = t(p.place === 'units' ? 'ones' : 'tens', p.place === 'units' ? 'satuan' : 'puluhan')

  const lines = [
    `${p.wrong} → ${p.right}`,
    `(${p.wrong} − ${p.right}) × ${placeVal} = ${delta}`,
    `${got} − ${delta} = ${p.correct}`,
  ]
  const captions = [
    t(`read ${p.wrong} instead of ${p.right} (${placeWord})`, `baca ${p.wrong} bukan ${p.right} (${placeWord})`),
    t(`that makes the sum ${delta} too big`, `itu membuat hasilnya ${delta} terlalu besar`),
    t(`so subtract ${delta} → ${p.correct}`, `jadi kurangi ${delta} → ${p.correct}`),
  ]

  const steps: CorrectionStep[] = lines.map((_, i) => ({
    linesShown: i + 1,
    caption: captions[i],
    hold: i === lines.length - 1 ? 0 : 2000,
    result: i === lines.length - 1,
  }))
  return { lines, delta, got, correct: p.correct, steps, finalIndex: steps.length - 1 }
}
