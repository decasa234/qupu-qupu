export type Lang = 'en' | 'id'

export interface TallyStep {
  /** Full groups of 5 drawn so far. */
  groups: number
  /** Leftover marks drawn (0 until revealed). */
  leftover: number
  caption: string
  /** How long to hold this beat, ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface TallyStoryboard {
  n: number
  fullGroups: number
  leftover: number
  steps: TallyStep[]
  finalIndex: number
}

export function buildTallySteps(nRaw: number, lang: Lang): TallyStoryboard {
  const n = typeof nRaw === 'number' && Number.isFinite(nRaw) ? Math.max(0, Math.round(nRaw)) : 0
  const fullGroups = Math.floor(n / 5)
  const leftover = n % 5
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TallyStep[] = []
  for (let g = 1; g <= fullGroups; g++) {
    const last = g === fullGroups && leftover === 0
    steps.push({
      groups: g, leftover: 0,
      caption: t(`count by fives: ${g * 5}`, `hitung lima-lima: ${g * 5}`),
      hold: last ? 0 : 1100, result: last,
    })
  }
  if (leftover > 0) {
    steps.push({
      groups: fullGroups, leftover,
      caption: fullGroups > 0 ? `${fullGroups * 5} + ${leftover} = ${n}` : `${n}`,
      hold: 0, result: true,
    })
  }
  if (steps.length === 0) {
    steps.push({ groups: 0, leftover: 0, caption: `${n}`, hold: 0, result: true })
  }
  return { n, fullGroups, leftover, steps, finalIndex: steps.length - 1 }
}
