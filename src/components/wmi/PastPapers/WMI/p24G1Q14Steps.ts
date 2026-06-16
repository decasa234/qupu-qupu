import type { Lang } from '../concepts/explainers/makeTenSteps'
import { FULL_GAP_CM, PENCILS, SHORTEST_CM } from './P24G1Q14Illustration'

export interface PencilStep {
  showFullGap: boolean
  measure: 'yellow' | 'blue' | 'green' | null
  showLength: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PencilStoryboard {
  shortest: number
  steps: PencilStep[]
  finalIndex: number
}

export function buildP24G1Q14Steps(lang: Lang): PencilStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PencilStep[] = [
    {
      showFullGap: false,
      measure: null,
      showLength: false,
      hold: 1800,
      result: false,
      caption: t(
        'All three pencils share the same gap. The longest pencil is 15 cm.',
        'Ketiga pensil berada di celah yang sama. Pensil terpanjang 15 cm.',
      ),
    },
    {
      showFullGap: false,
      measure: 'blue',
      showLength: false,
      hold: 2000,
      result: false,
      caption: t(
        'The middle (blue) pencil reaches furthest — only a 5 cm gap left. So it is the longest = 15 cm.',
        'Pensil tengah (biru) paling jauh — hanya sisa 5 cm. Jadi inilah yang terpanjang = 15 cm.',
      ),
    },
    {
      showFullGap: true,
      measure: 'blue',
      showLength: false,
      hold: 2000,
      result: false,
      caption: t(
        `Full gap = 15 + 5 = ${FULL_GAP_CM} cm.`,
        `Lebar penuh = 15 + 5 = ${FULL_GAP_CM} cm.`,
      ),
    },
    {
      showFullGap: true,
      measure: 'yellow',
      showLength: true,
      hold: 1900,
      result: false,
      caption: t(
        `Yellow: ${FULL_GAP_CM} − 10 = ${PENCILS.yellow.length} cm.`,
        `Kuning: ${FULL_GAP_CM} − 10 = ${PENCILS.yellow.length} cm.`,
      ),
    },
    {
      showFullGap: true,
      measure: 'green',
      showLength: true,
      hold: 1900,
      result: false,
      caption: t(
        `Green: ${FULL_GAP_CM} − 12 = ${PENCILS.green.length} cm — the smallest so far.`,
        `Hijau: ${FULL_GAP_CM} − 12 = ${PENCILS.green.length} cm — terkecil sejauh ini.`,
      ),
    },
    {
      showFullGap: true,
      measure: 'green',
      showLength: true,
      hold: 0,
      result: true,
      caption: t(
        `Shortest = green = ${SHORTEST_CM} cm — answer E.`,
        `Terpendek = hijau = ${SHORTEST_CM} cm — jawaban E.`,
      ),
    },
  ]

  return { shortest: SHORTEST_CM, steps, finalIndex: steps.length - 1 }
}
