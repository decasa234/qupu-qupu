// Storyboard for the WMI-22P1A-Q7 explainer: pick the longest bar, then the next
// longest, … building B → D → C → A, then match "BDCA" to the lettered choice (C).
import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ORDER_LONGEST_FIRST, ORDER_STRING, ROPES } from './P22G1Q7Illustration'

export interface Q7Step {
  showLengths: boolean
  spotlight: string[]
  ranks: Record<string, number>
  caption: string
  hold: number
  result: boolean
}

export interface Q7Storyboard {
  steps: Q7Step[]
  finalIndex: number
  answer: string
  orderString: string
}

export function buildP22G1Q7Steps(lang: Lang, answer: string): Q7Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q7Step[] = [
    {
      showLengths: false,
      spotlight: [],
      ranks: {},
      hold: 1700,
      result: false,
      caption: t(
        'All four ropes start at the same left edge, so the longer the bar, the longer the rope.',
        'Keempat tali mulai dari tepi kiri yang sama, jadi makin panjang batang, makin panjang tali.',
      ),
    },
    {
      showLengths: true,
      spotlight: [],
      ranks: {},
      hold: 1900,
      result: false,
      caption: t('Read each length straight off the ruler.', 'Baca panjang tiap tali dari penggaris.'),
    },
  ]

  // Build the order one pick at a time: longest first.
  const ranks: Record<string, number> = {}
  ORDER_LONGEST_FIRST.forEach((code, i) => {
    ranks[code] = i + 1
    const rope = ROPES.find((r) => r.code === code)!
    const soFar = ORDER_LONGEST_FIRST.slice(0, i + 1).join('')
    const ord =
      i === 0
        ? t(`Longest is ${code} (${rope.len}).`, `Terpanjang ${code} (${rope.len}).`)
        : i === ORDER_LONGEST_FIRST.length - 1
          ? t(`Shortest is ${code} (${rope.len}).`, `Terpendek ${code} (${rope.len}).`)
          : t(`Next longest is ${code} (${rope.len}).`, `Berikutnya ${code} (${rope.len}).`)
    steps.push({
      showLengths: true,
      spotlight: ORDER_LONGEST_FIRST.slice(0, i + 1),
      ranks: { ...ranks },
      hold: 1700,
      result: false,
      caption: `${ord} ${t('Order so far:', 'Urutan sejauh ini:')} ${soFar}`,
    })
  })

  steps.push({
    showLengths: true,
    spotlight: ORDER_LONGEST_FIRST,
    ranks: { ...ranks },
    hold: 0,
    result: true,
    caption: t(
      `Longest → shortest is ${ORDER_STRING}. That is choice ${answer}.`,
      `Terpanjang → terpendek adalah ${ORDER_STRING}. Itu pilihan ${answer}.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer, orderString: ORDER_STRING }
}
