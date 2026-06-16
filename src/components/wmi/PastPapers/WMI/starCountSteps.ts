import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { STAR_ROWS, STAR_TOTAL } from './starVisual'

export type StarPhase = 'show' | 'row' | 'result'

export interface StarStep {
  phase: StarPhase
  row: number | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface StarStoryboard {
  rows: number[]
  total: number
  steps: StarStep[]
  finalIndex: number
}

export function buildStarCountSteps(lang: Lang): StarStoryboard {
  const rows = [...STAR_ROWS]
  const total = STAR_TOTAL
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StarStep[] = [
    { phase: 'show', row: null, running: 0, hold: 1500, result: false, caption: t('How many stars are there?', 'Ada berapa banyak bintang? Hitung!') },
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
    caption: t(`${rows.join(' + ')} = ${total} stars.`, `${rows.join(' + ')} = ${total} bintang.`),
  })

  return { rows, total, steps, finalIndex: steps.length - 1 }
}
