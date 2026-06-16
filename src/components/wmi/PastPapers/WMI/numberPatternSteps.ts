import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { STAR_ROW, STAR_COL, STAR_VALUE } from './NumberPatternIllustration'

export type NumberPatternPhase = 'show' | 'rows' | 'cols' | 'apply' | 'result'

export interface NumberPatternStep {
  phase: NumberPatternPhase
  /** Cells to highlight on this beat (establishing or applying the rule). */
  highlight: ReadonlyArray<[number, number]>
  /** Glow the ★ cell on this beat. */
  highlightStar: boolean
  /** Show 67 in the ★ cell instead of the star glyph. */
  revealStar: boolean
  caption: string
  hold: number
  result: boolean
}

export interface NumberPatternStoryboard {
  star: number
  steps: NumberPatternStep[]
  finalIndex: number
}

const tens = (STAR_ROW + 2) * 10 // 60
const units = STAR_COL + 4 //       7

export function buildNumberPatternSteps(lang: Lang): NumberPatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NumberPatternStep[] = [
    {
      phase: 'show',
      highlight: [],
      highlightStar: false,
      revealStar: false,
      caption: t('What number belongs on the ★?', 'Angka berapa yang ada di ★?'),
      hold: 1600,
      result: false,
    },
    {
      // Down the left column: 24, 34, 54 -> the tens digit climbs by 10 each row.
      phase: 'rows',
      highlight: [
        [0, 0],
        [1, 0],
        [3, 0],
      ],
      highlightStar: false,
      revealStar: false,
      caption: t(
        'Down a column the tens digit grows by 10 each row: 24, 34, … , so the ★ row is 60-something.',
        'Ke bawah, angka puluhan naik 10 tiap baris: 24, 34, … , jadi baris ★ adalah 60-an.',
      ),
      hold: 2200,
      result: false,
    },
    {
      // Across a row: 24, 25, 29 -> the units digit climbs by 1 each column.
      phase: 'cols',
      highlight: [
        [0, 0],
        [0, 1],
        [0, 5],
      ],
      highlightStar: false,
      revealStar: false,
      caption: t(
        'Across a row the units digit grows by 1 each column: 24, 25, … , 29.',
        'Ke samping, angka satuan naik 1 tiap kolom: 24, 25, … , 29.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'apply',
      highlight: [],
      highlightStar: true,
      revealStar: false,
      caption: t(
        `Put them together at the ★: tens = ${tens}, units = ${units}.`,
        `Gabungkan di ★: puluhan = ${tens}, satuan = ${units}.`,
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'result',
      highlight: [],
      highlightStar: true,
      revealStar: true,
      caption: t(`${tens} + ${units} = ★ = ${STAR_VALUE}.`, `${tens} + ${units} = ★ = ${STAR_VALUE}.`),
      hold: 0,
      result: true,
    },
  ]

  return { star: STAR_VALUE, steps, finalIndex: steps.length - 1 }
}
