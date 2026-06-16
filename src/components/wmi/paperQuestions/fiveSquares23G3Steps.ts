// WMI-23F3A-Q18 (2023 Grade 3 Final) — fan of shaded triangles over five squares.
//
// "Five squares sit side by side on a line; from shortest to longest their sides
// are 2, 3, 4, 5, 6. From one baseline point P, lines fan to each square's top
// corners; the triangle from P up to each square's top edge is shaded. Find the
// total shaded area."  (fill-in; answer = 45.)
//
// METHOD (the elegant "each triangle is HALF its square" — one idea per beat).
// For a square of side s, its shaded triangle has base = s (the top edge) and
// height = s (apex P is on the baseline, the top edge sits s units above it). So
//     triangle area = ½ · s · s = s²/2 = HALF that square,
// no matter where P sits on the baseline. Spotlight the tallest square first
// (side 6): its triangle = ½·6·6 = 18 = half of 36. Generalize to all five, then
// add the squares 2²+3²+4²+5²+6² = 4+9+16+25+36 = 90, and halve: 90 ÷ 2 = 45.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. SIDES and ANSWER come from the illustration's exports; nothing
// about the total (45) is re-asserted by hand.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER, SIDES } from './FiveSquares23G3Illustration'

/** What the explainer renders on a beat. */
export interface FiveSquaresStep {
  /** Which square's triangle to spotlight (highlightIndex into SIDES, left→right), or null. */
  highlightIndex: number | null
  /** Annotate every triangle as s²/2 (half its square). */
  showHalves: boolean
  /**
   * The side length being reasoned about this beat (for the ½·s·s line), or null
   * when the beat is a goal / sum / final summary.
   */
  spotlightSide: number | null
  /** The running squares-sum string "4 + 9 + 16 + 25 + 36 = 90" when the add beat. */
  sumLine: string | null
  /** True only on the winning final beat. */
  result: boolean
  caption: string
  hold: number
}

export interface FiveSquaresStoryboard {
  answer: number
  /** Sum of the five squares, 2²+…+6² = 90. */
  squaresSum: number
  steps: FiveSquaresStep[]
  finalIndex: number
}

/** Side lengths in ascending value order (2,3,4,5,6) for the squares-sum. */
const ASCENDING = [...SIDES].slice().sort((a, b) => a - b)

export function buildFiveSquaresSteps(lang: Lang): FiveSquaresStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Spotlight the tallest square (side 6 = centre). Map side → highlightIndex.
  const tallest = Math.max(...SIDES) // 6
  const tallestIndex = SIDES.indexOf(tallest) // 2 (centre)
  const tallestSquare = tallest * tallest // 36
  const tallestHalf = tallestSquare / 2 // 18

  // Squares in ascending order and their running sum.
  const squares = ASCENDING.map((s) => s * s) // [4, 9, 16, 25, 36]
  const squaresSum = squares.reduce((a, b) => a + b, 0) // 90
  const sumLine = `${squares.join(' + ')} = ${squaresSum}`

  const steps: FiveSquaresStep[] = [
    // 1) Goal — show the whole shaded fan; what's the total orange?
    {
      highlightIndex: null,
      showHalves: false,
      spotlightSide: null,
      sumLine: null,
      result: false,
      hold: 2600,
      caption: t(
        'Every square has one orange triangle from the same point P. Goal: add up all the orange.',
        'Tiap persegi punya satu segitiga oranye dari titik P yang sama. Tujuan: jumlahkan semua oranye.',
      ),
    },

    // 2) Take ONE square (the tallest, side 6): base = 6, height = 6 → half of 36.
    {
      highlightIndex: tallestIndex,
      showHalves: false,
      spotlightSide: tallest,
      sumLine: null,
      result: false,
      hold: 2700,
      caption: t(
        `Take the side-${tallest} square. Its triangle has base ${tallest} and height ${tallest}: ½·${tallest}·${tallest} = ${tallestHalf} — exactly HALF of ${tallestSquare}.`,
        `Ambil persegi sisi ${tallest}. Segitiganya beralas ${tallest} dan tinggi ${tallest}: ½·${tallest}·${tallest} = ${tallestHalf} — tepat SETENGAH dari ${tallestSquare}.`,
      ),
    },

    // 3) Generalize — P is always on the baseline, so EVERY triangle is half.
    {
      highlightIndex: null,
      showHalves: true,
      spotlightSide: null,
      sumLine: null,
      result: false,
      hold: 2700,
      caption: t(
        'P sits on the line, so each top edge is s units up. Base = s, height = s → every triangle is HALF its square (s²⁄2).',
        'P di garis alas, jadi tiap sisi atas s satuan ke atas. Alas = s, tinggi = s → tiap segitiga SETENGAH perseginya (s²⁄2).',
      ),
    },

    // 4) Add the squares: 4 + 9 + 16 + 25 + 36 = 90.
    {
      highlightIndex: null,
      showHalves: true,
      spotlightSide: null,
      sumLine,
      result: false,
      hold: 2700,
      caption: t(
        `So shaded = half of all five squares. Add the squares first: ${sumLine}.`,
        `Jadi arsir = setengah dari kelima persegi. Jumlahkan dulu persegi-perseginya: ${sumLine}.`,
      ),
    },

    // 5) Halve it → 45. Winner.
    {
      highlightIndex: null,
      showHalves: true,
      spotlightSide: null,
      sumLine,
      result: true,
      hold: 0,
      caption: t(
        `Shaded = half of ${squaresSum} = ${squaresSum} ÷ 2 = ${ANSWER}.`,
        `Arsir = setengah dari ${squaresSum} = ${squaresSum} ÷ 2 = ${ANSWER}.`,
      ),
    },
  ]

  return { answer: ANSWER, squaresSum, steps, finalIndex: steps.length - 1 }
}
