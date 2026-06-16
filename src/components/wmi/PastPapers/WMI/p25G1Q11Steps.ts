// Storyboard for WMI-25P1A-Q11 — count the KINDS of shapes (not the total).
// Beat-by-beat: tally each distinct kind once, building up to 6 kinds (answer C).
import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { ShapeKind } from './P25G1Q11Illustration'
import { Q11_NUM_KINDS } from './P25G1Q11Illustration'

export interface Q11Step {
  highlightKind: ShapeKind | null
  confirmedKinds: ShapeKind[]
  tally: number
  caption: string
  hold: number
  result: boolean
}

export interface Q11Storyboard {
  numKinds: number
  answer: number
  steps: Q11Step[]
  finalIndex: number
}

const KIND_LABEL: Record<ShapeKind, { en: string; id: string }> = {
  rectangle: { en: 'rectangle', id: 'persegi panjang' },
  square: { en: 'square', id: 'persegi' },
  triangle: { en: 'triangle', id: 'segitiga' },
  ellipse: { en: 'oval', id: 'oval' },
  circle: { en: 'circle', id: 'lingkaran' },
  hexagon: { en: 'hexagon', id: 'segi enam' },
}

const ORDER: ShapeKind[] = ['rectangle', 'square', 'triangle', 'ellipse', 'circle', 'hexagon']

export function buildP25G1Q11Steps(lang: Lang): Q11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const name = (k: ShapeKind) => (lang === 'id' ? KIND_LABEL[k].id : KIND_LABEL[k].en)

  const steps: Q11Step[] = [
    {
      highlightKind: null,
      confirmedKinds: [],
      tally: 0,
      hold: 1800,
      result: false,
      caption: t(
        'Count KINDS of shapes — tally each kind once, however many times it appears.',
        'Hitung JENIS bangun — tandai tiap jenis sekali, walau muncul berkali-kali.',
      ),
    },
  ]

  // One beat per kind: highlight it, confirm the earlier ones, raise the tally.
  ORDER.forEach((kind, i) => {
    const confirmed = ORDER.slice(0, i)
    steps.push({
      highlightKind: kind,
      confirmedKinds: confirmed,
      tally: i + 1,
      hold: 1700,
      result: false,
      caption: t(`Kind ${i + 1}: ${name(kind)}.`, `Jenis ${i + 1}: ${name(kind)}.`),
    })
  })

  steps.push({
    highlightKind: null,
    confirmedKinds: ORDER,
    tally: Q11_NUM_KINDS,
    hold: 0,
    result: true,
    caption: t(`${Q11_NUM_KINDS} different kinds in all — answer C.`, `Ada ${Q11_NUM_KINDS} jenis berbeda — jawaban C.`),
  })

  return {
    numKinds: Q11_NUM_KINDS,
    answer: Q11_NUM_KINDS,
    steps,
    finalIndex: steps.length - 1,
  }
}
