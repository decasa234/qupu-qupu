import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { HEX_COUNT, PIECE_COUNT, RHOMBUS_COUNT } from './P23G1Q10Illustration'

export type Q10Phase = 'show' | 'hexes' | 'rhombi' | 'count' | 'result'

export interface Q10Step {
  phase: Q10Phase
  /** Show the decomposition tiling. */
  showTiling: boolean
  /** Show the 1..N count badges. */
  showCounts: boolean
  /** How many tiles are revealed (0..6). */
  revealed: number
  caption: string
  hold: number
  result: boolean
}

export interface Q10Storyboard {
  hexCount: number
  rhombusCount: number
  pieceCount: number
  answer: string
  steps: Q10Step[]
  finalIndex: number
}

export function buildP23G1Q10Steps(lang: Lang, answer: string): Q10Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q10Step[] = [
    {
      phase: 'show',
      showTiling: false,
      showCounts: false,
      revealed: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Cover the white shape with copies of the two pieces — no gaps, no overlaps.',
        'Tutupi bangun putih dengan salinan kedua kepingan — tanpa celah, tanpa tumpang tindih.',
      ),
    },
    {
      phase: 'hexes',
      showTiling: true,
      showCounts: false,
      revealed: HEX_COUNT,
      hold: 2000,
      result: false,
      caption: t(
        `Two yellow hexagons fill the wide middle: ${HEX_COUNT} hexagons so far.`,
        `Dua segi enam kuning mengisi bagian tengah yang lebar: ${HEX_COUNT} segi enam sejauh ini.`,
      ),
    },
    {
      phase: 'rhombi',
      showTiling: true,
      showCounts: false,
      revealed: PIECE_COUNT,
      hold: 2100,
      result: false,
      caption: t(
        `Four pink rhombi fill the notch, the bottom strip and the top-right gap: ${RHOMBUS_COUNT} rhombi.`,
        `Empat belah ketupat merah muda mengisi takik, jalur bawah, dan celah kanan-atas: ${RHOMBUS_COUNT} belah ketupat.`,
      ),
    },
    {
      phase: 'count',
      showTiling: true,
      showCounts: true,
      revealed: PIECE_COUNT,
      hold: 2000,
      result: false,
      caption: t(
        `Count every piece: ${HEX_COUNT} + ${RHOMBUS_COUNT} = ${PIECE_COUNT} pieces.`,
        `Hitung semua kepingan: ${HEX_COUNT} + ${RHOMBUS_COUNT} = ${PIECE_COUNT} kepingan.`,
      ),
    },
    {
      phase: 'result',
      showTiling: true,
      showCounts: true,
      revealed: PIECE_COUNT,
      hold: 0,
      result: true,
      caption: t(
        `${PIECE_COUNT} pieces total — the option showing this exact set is ${answer}.`,
        `Total ${PIECE_COUNT} kepingan — pilihan yang menunjukkan susunan ini adalah ${answer}.`,
      ),
    },
  ]

  return {
    hexCount: HEX_COUNT,
    rhombusCount: RHOMBUS_COUNT,
    pieceCount: PIECE_COUNT,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
