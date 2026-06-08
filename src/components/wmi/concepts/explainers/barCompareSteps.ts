export type Lang = 'en' | 'id'

export interface BarStep {
  /** Bar A (taller) is shown at full height when true. */
  showA: boolean
  /** Bar B (shorter) is shown at full height when true. */
  showB: boolean
  /** Highlight the difference segment on bar A. */
  showDiff: boolean
  caption: string
  /** How long to hold this beat, ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface BarStoryboard {
  a: string
  b: string
  vA: number
  vB: number
  diff: number
  steps: BarStep[]
  finalIndex: number
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

export function buildBarCompareSteps(a: string, b: string, vARaw: number, vBRaw: number, lang: Lang): BarStoryboard {
  const vA = num(vARaw)
  const vB = num(vBRaw)
  const diff = vA - vB
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const emA = a || '?'
  const emB = b || '?'
  const steps: BarStep[] = [
    { showA: true, showB: false, showDiff: false, caption: t(`the ${emA} bar reaches ${vA}`, `batang ${emA} mencapai ${vA}`), hold: 1600, result: false },
    { showA: true, showB: true, showDiff: false, caption: t(`the ${emB} bar reaches ${vB}`, `batang ${emB} mencapai ${vB}`), hold: 1800, result: false },
    { showA: true, showB: true, showDiff: true, caption: `${vA} − ${vB} = ${diff}`, hold: 0, result: true },
  ]
  return { a: emA, b: emB, vA, vB, diff, steps, finalIndex: steps.length - 1 }
}
