/**
 * mirrorSolid22G3Steps — storyboard builder for WMI-22F3A-Q24.
 *
 * Method: "count cells + force the shadows + maximise"
 *   1. Count the 13 unit cells (8 bottom + 4 slab + 1 top); recall the piece types.
 *   2. Read the mirror shadows — every coloured mirror cell pins the colour of
 *      the piece touching that surface.
 *   3. Place the forced pieces: one BLACK 1×1×3 along the left floor plus TWO
 *      GRAY 1×1×2 blocks (the back mirror's gray L needs two) — 7 cells locked.
 *   4. Every remaining cell can be a white 1×1×1 — maximise them.
 *   5. Count: 13 − 7 = 6 white cubes at most.
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
        'The solid has 13 unit cells: 8 on the floor (the 2×2 slab must be supported underneath), 4 in the slab, 1 on top. Pieces: WHITE = 1 cube, GRAY = 2 long, BLACK = 3 long.',
        'Bangun itu punya 13 sel satuan: 8 di lantai (lempeng 2×2 harus tertopang di bawahnya), 4 di lempeng, 1 di puncak. Balok: PUTIH = 1 kubus, ABU-ABU = panjang 2, HITAM = panjang 3.',
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
        'The mirrors show the coloured surfaces. Side mirror: a BLACK face 3 long and a GRAY face 2 long. Back mirror: three GRAY cells (an L) and one BLACK cell. Each coloured cell pins the colour of the piece touching that side.',
        'Cermin menunjukkan permukaan berwarna. Cermin samping: sisi HITAM sepanjang 3 dan sisi ABU-ABU sepanjang 2. Cermin belakang: tiga sel ABU-ABU (bentuk L) dan satu sel HITAM. Setiap sel berwarna menetapkan warna balok yang menyentuh sisi itu.',
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
        'So one BLACK 1×1×3 lies along the left floor, and TWO GRAY 1×1×2 blocks are forced — one lying in the slab, one standing at the back (one gray can never cover the L). That locks 3 + 4 = 7 cells.',
        'Jadi satu balok HITAM 1×1×3 terbaring di tepi kiri lantai, dan DUA balok ABU-ABU 1×1×2 wajib ada — satu terbaring di lempeng, satu berdiri di belakang (satu abu-abu tak mungkin menutup bentuk L). Itu mengunci 3 + 4 = 7 sel.',
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
        'To get the MOST white cubes, make every remaining cell its own white 1×1×1 piece — this colouring still matches both mirrors exactly.',
        'Untuk mendapatkan kubus PUTIH terbanyak, jadikan setiap sel yang tersisa sebagai kubus putih 1×1×1 — pewarnaan ini tetap cocok persis dengan kedua cermin.',
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
        `13 cells − 7 forced coloured cells = ${ANSWER}. At most ${ANSWER} white 1×1×1 cubes — so the answer is ${ANSWER}!`,
        `13 sel − 7 sel berwarna wajib = ${ANSWER}. Paling banyak ${ANSWER} kubus putih 1×1×1 — jadi jawabannya ${ANSWER}!`,
      ),
    },
  ]

  return {
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
