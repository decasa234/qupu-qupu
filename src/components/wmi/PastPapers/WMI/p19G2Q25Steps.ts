import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER_LETTER } from './P19G2Q25Illustration'

// WMI-19P2A-Q25 — "on which piece is the dot?" (answer C).
//
// The four pieces tile the board and may only be ROTATED, never flipped. The
// animation walks the method on the SAME board the static figure shows:
//   1. state the rule (rotate, never flip — a mirrored piece is a different piece),
//   2. find the cell the dot sits on,
//   3. match that spot to the piece whose rotated outline fits there,
//   4. land on the answer letter (C).
// We do not have the four piece-outlines in the seed (they were images), so the
// reveal proves the location and names the keyed option.

export interface DotStep {
  /** Faintly ring the dot's cell. */
  hintDot: boolean
  /** Fully mark the dot's cell as the answer. */
  markDot: boolean
  result: boolean
  caption: string
  hold: number
}

export interface DotStoryboard {
  answer: string
  steps: DotStep[]
  finalIndex: number
}

export function buildP19G2Q25Steps(lang: Lang): DotStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DotStep[] = [
    {
      hintDot: false,
      markDot: false,
      result: false,
      hold: 2400,
      caption: t(
        'The four pieces may only be turned, never flipped — a mirror-image piece is a different piece, so rule those out.',
        'Keempat potongan hanya boleh diputar, tidak boleh dibalik — potongan cermin adalah potongan lain, jadi coret itu.',
      ),
    },
    {
      hintDot: true,
      markDot: false,
      result: false,
      hold: 2200,
      caption: t(
        'First find the exact square the dot sits on — that fixes where to look.',
        'Pertama, cari kotak tepat tempat titik berada — itu menentukan tempat yang dicari.',
      ),
    },
    {
      hintDot: true,
      markDot: false,
      result: false,
      hold: 2200,
      caption: t(
        'Now turn each piece in your head and see whose outline covers this square — only one fits without flipping.',
        'Sekarang putar tiap potongan dalam benak dan lihat siapa yang menutup kotak ini — hanya satu yang pas tanpa dibalik.',
      ),
    },
    {
      hintDot: false,
      markDot: true,
      result: true,
      hold: 0,
      caption: t(
        `The piece whose rotated outline lands the dot here is Figure ${ANSWER_LETTER} — answer ${ANSWER_LETTER}.`,
        `Potongan yang outline-nya (setelah diputar) menaruh titik di sini adalah Gambar ${ANSWER_LETTER} — jawaban ${ANSWER_LETTER}.`,
      ),
    },
  ]

  return { answer: ANSWER_LETTER, steps, finalIndex: steps.length - 1 }
}
