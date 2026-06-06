import type { Lang } from './makeTenSteps'

export interface PolygonSidesStep {
  sidesHighlighted: number
  caption: string
  hold: number
  result: boolean
}

export interface PolygonSidesStoryboard {
  sides: number
  steps: PolygonSidesStep[]
  finalIndex: number
}

const POLYGON_NAME_EN: Record<number, string> = {
  3: 'triangle',
  4: 'quadrilateral',
  5: 'pentagon',
  6: 'hexagon',
  7: 'heptagon',
  8: 'octagon',
  9: 'nonagon',
  10: 'decagon',
}

const POLYGON_NAME_ID: Record<number, string> = {
  3: 'segitiga',
  4: 'segiempat',
  5: 'segilima',
  6: 'segienam',
  7: 'segi tujuh',
  8: 'segi delapan',
  9: 'segi sembilan',
  10: 'segi sepuluh',
}

export function buildPolygonSidesSteps(sidesRaw: number, lang: Lang): PolygonSidesStoryboard {
  const sides = Math.max(3, Math.min(10, Math.round(sidesRaw)))
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PolygonSidesStep[] = []

  // Intro beat: no sides highlighted, prompt to start counting
  steps.push({
    sidesHighlighted: 0,
    caption: t('Trace each side and count.', 'Telusuri setiap sisi sambil menghitung.'),
    hold: 1200,
    result: false,
  })

  // One beat per side: highlight 1, 2, 3 … sides
  for (let k = 1; k <= sides; k++) {
    steps.push({
      sidesHighlighted: k,
      caption: k < sides
        ? t(`Side ${k}…`, `Sisi ${k}…`)
        : t(`Side ${k} — back to the start!`, `Sisi ${k} — kembali ke awal!`),
      hold: k < sides ? 900 : 1200,
      result: false,
    })
  }

  // Final beat: result
  const nameEn = POLYGON_NAME_EN[sides] ?? `${sides}-gon`
  const nameId = POLYGON_NAME_ID[sides] ?? `segi ${sides}`
  steps.push({
    sidesHighlighted: sides,
    caption: t(
      `${sides} sides — it is a ${nameEn}.`,
      `${sides} sisi — bangun ini adalah ${nameId}.`,
    ),
    hold: 0,
    result: true,
  })

  return { sides, steps, finalIndex: steps.length - 1 }
}
