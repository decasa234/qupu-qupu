// Storyboard builder for WMI-22F3A-Q21 — four rectangles pinwheeled around a
// shaded starred centre region.  Answer = 30.
//
// Method: enclosing-rectangle identity.
//   1. Find each rectangle's missing dimension from its area.
//   2. Spot that all five pieces tile a 13×17 enclosing rectangle.
//   3. Big rectangle area = 13 × 17 = 221.
//   4. Sum the four known rectangles: 56 + 45 + 48 + 42 = 191.
//   5. Shaded area = 221 − 191 = 30.

export type Lang = 'en' | 'id'

// Which piece is being highlighted in a given beat.
export type HighlightPhase =
  | 'none'
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'all_four'
  | 'enclosing'
  | 'star'

export interface RectFrameStep {
  /** Piece(s) to highlight in the RectFrame primitive. */
  highlight: string[]
  /** Whether to show the enclosing-rectangle overlay. */
  showEnclosing: boolean
  /** Arithmetic expression shown in the annotation chip. */
  equation: string
  /** True on the final winner beat. */
  result: boolean
  /** Caption text. */
  caption: string
  /** Hold in ms; 0 = final beat (no auto-advance). */
  hold: number
}

export interface RectFrameStoryboard {
  steps: RectFrameStep[]
  finalIndex: number
  answer: number
}

// Piece dimensions (verified: see illustration header).
//   TOP    7 × 8  = 56   LEFT  5 × 9  = 45
//   RIGHT  6 × 8  = 48   BOTTOM 7 × 6 = 42
// Enclosing rectangle: width = 7 + 6 = 13, height = 8 + 9 = 17.
const BIG_W = 13  // 7 (top width) + 6 (right width)
const BIG_H = 17  // 8 (top height) + 9 (left height)
const BIG_AREA = BIG_W * BIG_H           // 221
const SUM_FOUR = 56 + 45 + 48 + 42       // 191
const ANSWER = BIG_AREA - SUM_FOUR       // 30

export function buildRectFrameSteps(lang: Lang): RectFrameStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: RectFrameStep[] = []

  // Beat 0 — intro: show the puzzle, nothing highlighted yet.
  steps.push({
    highlight: [],
    showEnclosing: false,
    equation: '',
    result: false,
    hold: 1700,
    caption: t(
      'Four rectangles surround a shaded region ★. We need its area!',
      'Empat persegi panjang mengelilingi daerah berbintang ★. Cari luasnya!',
    ),
  })

  // Beat 1 — TOP rectangle: 56 = 7 × 8, so missing side = 8.
  steps.push({
    highlight: ['top'],
    showEnclosing: false,
    equation: '56 = 7 × 8',
    result: false,
    hold: 2000,
    caption: t(
      'TOP: area 56, side 7 → other side = 56 ÷ 7 = 8.',
      'ATAS: luas 56, sisi 7 → sisi lain = 56 ÷ 7 = 8.',
    ),
  })

  // Beat 2 — LEFT rectangle: 45 = 9 × 5, so missing side = 5.
  steps.push({
    highlight: ['left'],
    showEnclosing: false,
    equation: '45 = 9 × 5',
    result: false,
    hold: 2000,
    caption: t(
      'LEFT: area 45, side 9 → other side = 45 ÷ 9 = 5.',
      'KIRI: luas 45, sisi 9 → sisi lain = 45 ÷ 9 = 5.',
    ),
  })

  // Beat 3 — RIGHT rectangle: 48 = 8 × 6, so missing side = 6.
  steps.push({
    highlight: ['right'],
    showEnclosing: false,
    equation: '48 = 8 × 6',
    result: false,
    hold: 2000,
    caption: t(
      'RIGHT: area 48, side 8 → other side = 48 ÷ 8 = 6.',
      'KANAN: luas 48, sisi 8 → sisi lain = 48 ÷ 8 = 6.',
    ),
  })

  // Beat 4 — BOTTOM rectangle: 42 = 7 × 6.
  steps.push({
    highlight: ['bottom'],
    showEnclosing: false,
    equation: '42 = 7 × 6',
    result: false,
    hold: 2000,
    caption: t(
      'BOTTOM: area 42, sides 7 and 6 — matches perfectly!',
      'BAWAH: luas 42, sisi 7 dan 6 — pas!',
    ),
  })

  // Beat 5 — enclosing rectangle: all four pieces + star tile a 13 × 17 box.
  steps.push({
    highlight: ['top', 'left', 'right', 'bottom', 'star'],
    showEnclosing: true,
    equation: `width = 7+6 = ${BIG_W},  height = 8+9 = ${BIG_H}`,
    result: false,
    hold: 2400,
    caption: t(
      `All five pieces fit perfectly inside one big ${BIG_W} × ${BIG_H} rectangle!`,
      `Kelima bagian pas tepat di dalam satu persegi panjang besar ${BIG_W} × ${BIG_H}!`,
    ),
  })

  // Beat 6 — big rectangle area = 221.
  steps.push({
    highlight: [],
    showEnclosing: true,
    equation: `${BIG_W} × ${BIG_H} = ${BIG_AREA}`,
    result: false,
    hold: 2100,
    caption: t(
      `Big rectangle area = ${BIG_W} × ${BIG_H} = ${BIG_AREA}.`,
      `Luas persegi panjang besar = ${BIG_W} × ${BIG_H} = ${BIG_AREA}.`,
    ),
  })

  // Beat 7 — subtract the four rectangles: 56+45+48+42 = 191.
  steps.push({
    highlight: ['top', 'left', 'right', 'bottom'],
    showEnclosing: true,
    equation: `56 + 45 + 48 + 42 = ${SUM_FOUR}`,
    result: false,
    hold: 2200,
    caption: t(
      `The four rectangles together = 56 + 45 + 48 + 42 = ${SUM_FOUR}.`,
      `Keempat persegi panjang = 56 + 45 + 48 + 42 = ${SUM_FOUR}.`,
    ),
  })

  // Beat 8 (final) — shaded area = 221 − 191 = 30.
  steps.push({
    highlight: ['star'],
    showEnclosing: true,
    equation: `${BIG_AREA} − ${SUM_FOUR} = ${ANSWER}`,
    result: true,
    hold: 0,
    caption: t(
      `★ area = ${BIG_AREA} − ${SUM_FOUR} = ${ANSWER}.`,
      `Luas ★ = ${BIG_AREA} − ${SUM_FOUR} = ${ANSWER}.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: ANSWER }
}
