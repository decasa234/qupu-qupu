import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FLOWER_PIECE, type PieceId } from './FlowerPiece19P1Illustration'

// WMI-19P1A-Q24 — "Which piece carries the flower mark?" (answer D).
//
// The animation FITS the four pieces into the figure one at a time (each piece
// may only be ROTATED, never flipped). As each piece drops in it is tinted; when
// the piece covering the flower cell lands, the flower mark sits on it, so the
// answer is read straight off the data (FLOWER_PIECE), never hardcoded.

export interface FlowerPieceStep {
  /** Pieces already dropped into the figure on this beat. */
  placed: PieceId[]
  /** The piece being introduced this beat (for the focus tray), if any. */
  focus?: PieceId
  /** True on the closing answer beat. */
  result: boolean
  caption: string
  hold: number
}

export interface FlowerPieceStoryboard {
  answer: PieceId
  steps: FlowerPieceStep[]
  finalIndex: number
}

// Reveal order: place A, B, C first (they do NOT hold the flower), then the
// flower piece last so the ✿ lands on it and the answer is obvious.
const PLACE_ORDER: PieceId[] = (['A', 'B', 'C', 'D'] as PieceId[]).filter((id) => id !== FLOWER_PIECE).concat(FLOWER_PIECE)

export function buildFlowerPiece19P1Steps(lang: Lang): FlowerPieceStoryboard {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)

  const steps: FlowerPieceStep[] = []

  // Beat 0 — the rule.
  steps.push({
    placed: [],
    result: false,
    hold: 2200,
    caption: t(
      'Fit the four pieces in — each may be TURNED but never flipped over.',
      'Pasang keempat potongan — boleh DIPUTAR tetapi tidak boleh dibalik.',
    ),
  })

  // One beat per piece dropped in.
  const placed: PieceId[] = []
  PLACE_ORDER.forEach((id) => {
    placed.push(id)
    const isFlower = id === FLOWER_PIECE
    steps.push({
      placed: [...placed],
      focus: id,
      result: false,
      hold: isFlower ? 2100 : 1700,
      caption: isFlower
        ? t(
            `Piece ${id} drops in last — and the flower ✿ sits right on it!`,
            `Potongan ${id} masuk terakhir — dan bunga ✿ tepat berada di atasnya!`,
          )
        : t(
            `Piece ${id} turns to fit — no flower on this one.`,
            `Potongan ${id} diputar agar pas — tidak ada bunga di sini.`,
          ),
    })
  })

  // Final beat — the answer.
  steps.push({
    placed: [...placed],
    result: true,
    hold: 0,
    caption: t(
      `The flower mark is on piece ${FLOWER_PIECE}. Answer D.`,
      `Tanda bunga ada di potongan ${FLOWER_PIECE}. Jawaban D.`,
    ),
  })

  return { answer: FLOWER_PIECE, steps, finalIndex: steps.length - 1 }
}
