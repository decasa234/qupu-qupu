import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { OVER_COUNT, PER_ICON, THRESHOLD, ZOO_ICONS, ZOO_TOTALS } from './P20G3Q14Illustration'

export interface Q14Step {
  /** Row whose "= total" badge is shown (-1 = none). */
  revealRow: number
  /** Rows ringed as over-10. */
  markedOver: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q14Storyboard {
  answer: number
  steps: Q14Step[]
  finalIndex: number
}

export function buildP20G3Q14Steps(lang: Lang): Q14Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q14Step[] = [
    {
      revealRow: -1,
      markedOver: [],
      hold: 1700,
      result: false,
      caption: t(
        `Each icon = ${PER_ICON} elephants, so count icons × ${PER_ICON}.`,
        `Tiap ikon = ${PER_ICON} gajah, jadi hitung jumlah ikon × ${PER_ICON}.`,
      ),
    },
  ]

  // Reveal each zoo's total one at a time.
  ZOO_ICONS.forEach((zoo, r) => {
    steps.push({
      revealRow: r,
      markedOver: [],
      hold: 1500,
      result: false,
      caption: t(
        `Zoo ${zoo.label}: ${zoo.icons} × ${PER_ICON} = ${ZOO_TOTALS[r]} elephants.`,
        `Kebun ${zoo.label}: ${zoo.icons} × ${PER_ICON} = ${ZOO_TOTALS[r]} gajah.`,
      ),
    })
  })

  const overRows = ZOO_TOTALS.map((tot, r) => (tot > THRESHOLD ? r : -1)).filter((r) => r >= 0)
  const overLabels = overRows.map((r) => ZOO_ICONS[r].label).join(' & ')

  steps.push({
    revealRow: -1,
    markedOver: overRows,
    hold: 2000,
    result: false,
    caption: t(
      `Which beat ${THRESHOLD}? Only ${overLabels} (15 and 12) are more than ${THRESHOLD}.`,
      `Mana yang lebih dari ${THRESHOLD}? Hanya ${overLabels} (15 dan 12) yang lebih dari ${THRESHOLD}.`,
    ),
  })

  steps.push({
    revealRow: -1,
    markedOver: overRows,
    hold: 0,
    result: true,
    caption: t(
      `${OVER_COUNT} zoos have more than ${THRESHOLD} elephants — answer B.`,
      `${OVER_COUNT} kebun binatang punya lebih dari ${THRESHOLD} gajah — jawaban B.`,
    ),
  })

  return { answer: OVER_COUNT, steps, finalIndex: steps.length - 1 }
}
