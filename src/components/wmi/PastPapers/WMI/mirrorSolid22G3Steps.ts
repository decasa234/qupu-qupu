/**
 * mirrorSolid22G3Steps — storyboard builder for WMI-22F3A-Q24.
 *
 * Method: "shadows + maximise"
 *   1. Recall the three piece types (white 1, gray 2, black 3 unit cubes).
 *   2. Read the mirror shadows — a BLACK cell forces a 1×1×3 piece; a GRAY cell
 *      forces a 1×1×2 piece.
 *   3. Place those forced long pieces so both mirrors are satisfied.
 *   4. Every remaining (unclaimed) cell can be a white 1×1×1 — maximise them.
 *   5. Count: at most 6 white cubes.
 *
 * Pure function — no Math.random, no Date. SSR-safe and deterministic.
 */

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type MirrorSolidPhase =
  | 'pieces'
  | 'shadows'
  | 'forced'
  | 'maximise'
  | 'result'

export interface MirrorSolidStep {
  phase: MirrorSolidPhase
  /**
   * Which piece types to highlight in the legend.
   * 'white' | 'gray' | 'black', shown as an array so multiple can glow at once.
   */
  highlightPieces: Array<'white' | 'gray' | 'black'>
  /**
   * Show the coloured fill of the forced pieces inside the isometric solid.
   * false = solid drawn as plain white outline (question state)
   * 'forced' = only black + gray forced blocks are coloured
   * 'full' = forced blocks + all remaining white cubes coloured
   */
  solidFill: false | 'forced' | 'full'
  /**
   * Highlight a mirror in the layout ('side' | 'back' | 'both' | null).
   */
  mirrorHighlight: 'side' | 'back' | 'both' | null
  caption: string
  hold: number
  result: boolean
}

export interface MirrorSolidStoryboard {
  answer: number
  steps: MirrorSolidStep[]
  finalIndex: number
}

export function buildMirrorSolid22G3Steps(lang: Lang): MirrorSolidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ANSWER = 6

  const steps: MirrorSolidStep[] = [
    // Beat 0 — recall the three piece types
    {
      phase: 'pieces',
      highlightPieces: ['white', 'gray', 'black'],
      solidFill: false,
      mirrorHighlight: null,
      hold: 2000,
      result: false,
      caption: t(
        'There are 3 piece types: WHITE = 1 cube, GRAY = 2 cubes long, BLACK = 3 cubes long.',
        'Ada 3 jenis balok: PUTIH = 1 kubus, ABU-ABU = panjang 2, HITAM = panjang 3.',
      ),
    },
    // Beat 1 — mirror shadows decode
    {
      phase: 'shadows',
      highlightPieces: [],
      solidFill: false,
      mirrorHighlight: 'both',
      hold: 2200,
      result: false,
      caption: t(
        'The mirrors are coloured shadows. A BLACK cell in a mirror means a 1×1×3 piece must reach there. A GRAY cell means a 1×1×2 piece must reach there.',
        'Cermin adalah bayangan warna. Sel HITAM di cermin berarti ada balok 1×1×3 yang harus menjangkau titik itu. Sel ABU-ABU berarti ada balok 1×1×2 yang harus menjangkau titik itu.',
      ),
    },
    // Beat 2 — place forced pieces
    {
      phase: 'forced',
      highlightPieces: ['gray', 'black'],
      solidFill: 'forced',
      mirrorHighlight: 'both',
      hold: 2400,
      result: false,
      caption: t(
        'So we MUST place at least one BLACK 1×1×3 and at least one GRAY 1×1×2 to satisfy both mirror shadows. Those cells are taken.',
        'Jadi kita HARUS meletakkan paling sedikit satu balok HITAM 1×1×3 dan satu balok ABU-ABU 1×1×2 agar kedua cermin terpenuhi. Sel-sel itu sudah terpakai.',
      ),
    },
    // Beat 3 — maximise white
    {
      phase: 'maximise',
      highlightPieces: ['white'],
      solidFill: 'full',
      mirrorHighlight: null,
      hold: 2200,
      result: false,
      caption: t(
        'To get the MOST white cubes, make every remaining cell its own white 1×1×1 piece. No other long piece needs to be added.',
        'Untuk mendapatkan kubus PUTIH terbanyak, jadikan setiap sel yang tersisa sebagai kubus putih 1×1×1. Tidak perlu menambah balok panjang lagi.',
      ),
    },
    // Beat 4 — count and answer
    {
      phase: 'result',
      highlightPieces: ['white'],
      solidFill: 'full',
      mirrorHighlight: null,
      hold: 0,
      result: true,
      caption: t(
        `Count the cells left for white after placing the forced pieces. At most ${ANSWER} white 1×1×1 cubes fit — so the answer is ${ANSWER}!`,
        `Hitung sel yang tersisa untuk putih setelah meletakkan balok yang diwajibkan. Paling banyak ${ANSWER} kubus putih 1×1×1 yang muat — jadi jawabannya ${ANSWER}!`,
      ),
    },
  ]

  return {
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
