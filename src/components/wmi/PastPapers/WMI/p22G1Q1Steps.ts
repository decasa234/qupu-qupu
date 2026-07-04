// Storyboard for the WMI-22P1A-Q1 explainer: count the tiles in each of the
// six pictures, mark the ones that use exactly 8, and land on "3 pictures → C".
import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FIGURES, MATCH_COUNT, TARGET_TILES, TILE_COUNTS } from './P22G1Q1Illustration'

export interface Q1Step {
  /** Figure under inspection (0..5), or -1 for the intro / result. */
  activeFigure: number
  /** Tiles of the active figure shown as counted so far. */
  countedTiles: number
  /** Figures whose count badge is shown. */
  badged: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q1Storyboard {
  steps: Q1Step[]
  finalIndex: number
  answer: string
}

export function buildP22G1Q1Steps(lang: Lang, answer: string): Q1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q1Step[] = [
    {
      activeFigure: -1,
      countedTiles: 0,
      badged: [],
      hold: 1700,
      result: false,
      caption: t(
        'Every picture is made of the same triangle tile. Count the tiles in each one.',
        'Tiap gambar tersusun dari keping segitiga yang sama. Hitung kepingnya satu per satu.',
      ),
    },
  ]

  // One beat per figure: highlight it, show all its tiles counted + a badge.
  for (let i = 0; i < FIGURES.length; i++) {
    const n = TILE_COUNTS[i]
    const fig = FIGURES[i]
    const name = lang === 'id' ? fig.labelId : fig.labelEn
    const hit = n === TARGET_TILES
    steps.push({
      activeFigure: i,
      countedTiles: n,
      badged: Array.from({ length: i + 1 }, (_, k) => k),
      hold: 1700,
      result: false,
      caption: hit
        ? t(`${name}: ${n} tiles — exactly 8! ✓`, `${name}: ${n} keping — tepat 8! ✓`)
        : t(`${name}: ${n} tiles — not 8.`, `${name}: ${n} keping — bukan 8.`),
    })
  }

  steps.push({
    activeFigure: -1,
    countedTiles: 0,
    badged: [0, 1, 2, 3, 4, 5],
    hold: 0,
    result: true,
    caption: t(
      `Pictures with 8 tiles: table, boat, person — ${MATCH_COUNT} of them. Answer ${answer}.`,
      `Gambar dengan 8 keping: meja, perahu, orang — ada ${MATCH_COUNT}. Jawaban ${answer}.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer }
}
