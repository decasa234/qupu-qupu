/**
 * mirrorBlocks22G1Steps — storyboard builder for WMI-22F1A-Q24 (Grade 1).
 *
 * Method: "read the mirror shadows, then count the leftover singles".
 *   1. Show the solid + its two mirrors; recall the three block types
 *      (white = 1×1×1, gray = 1×1×2, black = 1×1×3).
 *   2. A long/tall shadow in a mirror can only be made by a long block — so the
 *      black 1×3 block and the gray 1×2 block are forced into place.
 *   3. Once the long blocks are placed, every leftover single cube must be white.
 *   4. Light up the white singles (MirrorScene highlightWhite) and count them.
 *   5. Result: WHITE_COUNT white blocks.
 *
 * Pure function — no Math.random, no Date. SSR-safe and deterministic.
 */

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { WHITE_COUNT } from './MirrorBlocks22G1Illustration'

export type MirrorBlocksPhase = 'recall' | 'black' | 'gray' | 'reveal' | 'result'

export interface MirrorBlocksStep {
  phase: MirrorBlocksPhase
  /** Light up the white singles in the scene (MirrorScene highlightWhite). */
  highlightWhite: boolean
  /** Which block types to spotlight in the legend chips this beat. */
  highlightTypes: Array<'white' | 'gray' | 'black'>
  caption: string
  hold: number
  result: boolean
}

export interface MirrorBlocksStoryboard {
  /** Final white-block count (from the illustration's documented export). */
  answer: number
  steps: MirrorBlocksStep[]
  finalIndex: number
}

export function buildMirrorBlocks22G1Steps(lang: Lang): MirrorBlocksStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MirrorBlocksStep[] = [
    // Beat 0 — recall the three block types
    {
      phase: 'recall',
      highlightWhite: false,
      highlightTypes: ['white', 'gray', 'black'],
      hold: 2200,
      result: false,
      caption: t(
        'Look at the shape and its two mirrors. There are 3 block sizes: white = 1 cube, gray = 2 cubes long, black = 3 cubes long.',
        'Lihat bentuk dan dua cerminnya. Ada 3 ukuran balok: putih = 1 kubus, abu-abu = panjang 2 kubus, hitam = panjang 3 kubus.',
      ),
    },
    // Beat 1 — the longest shadow forces the black 1×3 block
    {
      phase: 'black',
      highlightWhite: false,
      highlightTypes: ['black'],
      hold: 2100,
      result: false,
      caption: t(
        'A mirror shows a LONG shadow — only the black block (3 cubes) is that long. So the black 1×3 block must sit there.',
        'Cermin menunjukkan bayangan PANJANG — hanya balok hitam (3 kubus) sepanjang itu. Jadi balok hitam 1×3 pasti di situ.',
      ),
    },
    // Beat 2 — the medium shadow forces the gray 1×2 block
    {
      phase: 'gray',
      highlightWhite: false,
      highlightTypes: ['gray'],
      hold: 2100,
      result: false,
      caption: t(
        'The other shadow is shorter — that takes the gray block (2 cubes). Place the gray 1×2 block there.',
        'Bayangan satunya lebih pendek — itu untuk balok abu-abu (2 kubus). Letakkan balok abu-abu 1×2 di situ.',
      ),
    },
    // Beat 3 — leftover singles must be white; light them up
    {
      phase: 'reveal',
      highlightWhite: true,
      highlightTypes: ['white'],
      hold: 2100,
      result: false,
      caption: t(
        'The black and gray blocks are placed. Every cube left over is just 1 cube — so it must be a white block. Light them up!',
        'Balok hitam dan abu-abu sudah pas. Setiap kubus yang tersisa hanya 1 kubus — jadi pasti balok putih. Nyalakan!',
      ),
    },
    // Beat 4 — count the white blocks
    {
      phase: 'result',
      highlightWhite: true,
      highlightTypes: ['white'],
      hold: 0,
      result: true,
      caption: t(
        `Count the glowing white blocks: ${WHITE_COUNT}. The answer is ${WHITE_COUNT}!`,
        `Hitung balok putih yang menyala: ${WHITE_COUNT}. Jawabannya ${WHITE_COUNT}!`,
      ),
    },
  ]

  return {
    answer: WHITE_COUNT,
    steps,
    finalIndex: steps.length - 1,
  }
}
