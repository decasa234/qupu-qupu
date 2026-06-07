import type { Lang } from '../concepts/explainers/makeTenSteps'
import { CANDY_ROWS, CANDY_TOTAL } from './candyVisual'

export type CandyPhase = 'show' | 'row' | 'result'

export interface CandyStep {
  phase: CandyPhase
  row: number | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CandyStoryboard {
  rows: number[]
  total: number
  steps: CandyStep[]
  finalIndex: number
}

export function buildCandyCountSteps(lang: Lang): CandyStoryboard {
  const rows = [...CANDY_ROWS]
  const total = CANDY_TOTAL
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CandyStep[] = [
    { phase: 'show', row: null, running: 0, hold: 1500, result: false, caption: t('How many candies are there?', 'Ada berapa banyak permen? Hitung!') },
  ]
  let running = 0
  rows.forEach((count, i) => {
    running += count
    steps.push({
      phase: 'row',
      row: i,
      running,
      hold: 1700,
      result: false,
      caption: t(`Row ${i + 1}: ${count}. Total so far ${running}.`, `Baris ${i + 1}: ${count}. Sejauh ini ${running}.`),
    })
  })
  steps.push({
    phase: 'result',
    row: null,
    running: total,
    hold: 0,
    result: true,
    caption: t(`${rows.join(' + ')} = ${total} candies.`, `${rows.join(' + ')} = ${total} permen.`),
  })

  return { rows, total, steps, finalIndex: steps.length - 1 }
}
