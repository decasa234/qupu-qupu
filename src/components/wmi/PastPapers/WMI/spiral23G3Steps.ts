// WMI-23F3A-Q15 (2023 Grade 3 Final) — spiral of heptagons & squares.
//
// Sixteen figures (regular heptagons and squares, each white / gray / black) are
// laid out in a 4×4 grid and read in a clockwise-outward spiral from START.
// The top-row cells (1,3) and (1,4) — spiral positions 15 and 16 — are blank.
// Find the missing pair. Answer: B = (white heptagon, gray square).
//
// METHOD (deduce TWO independent repeating cycles, one idea per beat — never
// jump to the answer):
//
//   1. Trace the spiral. Positions 1..16 from START, clockwise outward.
//
//   2. SHAPE cycle. Reading the shapes along the spiral gives a period-5 run
//      starting at START:  square, square, heptagon, heptagon, heptagon — repeat.
//      Walk it: pos 1-2 sq, 3-5 hept, 6-7 sq, 8-10 hept, 11-12 sq, 13-14-15 hept,
//      so position 15 = heptagon and position 16 begins a fresh square pair ⇒ square.
//
//   3. COLOR cycle. Reading the colours from position 2 onward gives a period-4
//      run:  white, white, gray, black — repeat. Walk it forward to the blanks:
//      position 14 = white (a fresh cycle start), 15 = white, 16 = gray.
//
//   4. Combine. Position 15 (cell 1,3) = white heptagon; position 16 (cell 1,4)
//      = gray square ⇒ option B.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — deterministic,
// SSR-safe. The position table below is the ground truth the figure is built on;
// the two cycles are *derived* from it, then extended to predict 15 and 16.

import type { Lang } from '../concepts/explainers/makeTenSteps'

export type ShapeKind = 'square' | 'heptagon'
export type Tone = 'white' | 'gray' | 'black'

/** The known spiral, positions 1..14 (START is position 1). */
export interface Figure {
  pos: number
  shape: ShapeKind
  tone: Tone
}

// Ground truth for the 14 visible figures, in spiral order from START.
const KNOWN: Figure[] = [
  { pos: 1, shape: 'square', tone: 'black' }, // START
  { pos: 2, shape: 'square', tone: 'white' },
  { pos: 3, shape: 'heptagon', tone: 'white' },
  { pos: 4, shape: 'heptagon', tone: 'gray' },
  { pos: 5, shape: 'heptagon', tone: 'black' },
  { pos: 6, shape: 'square', tone: 'white' },
  { pos: 7, shape: 'square', tone: 'white' },
  { pos: 8, shape: 'heptagon', tone: 'gray' },
  { pos: 9, shape: 'heptagon', tone: 'black' },
  { pos: 10, shape: 'heptagon', tone: 'white' },
  { pos: 11, shape: 'square', tone: 'white' },
  { pos: 12, shape: 'square', tone: 'gray' },
  { pos: 13, shape: 'heptagon', tone: 'black' },
  { pos: 14, shape: 'heptagon', tone: 'white' },
]

// The two repeating cycles, read off the known spiral.
export const SHAPE_CYCLE: ShapeKind[] = ['square', 'square', 'heptagon', 'heptagon', 'heptagon']
export const COLOR_CYCLE: Tone[] = ['white', 'white', 'gray', 'black']

// Derive the shape at a spiral position by walking SHAPE_CYCLE from START (pos 1).
function shapeAt(pos: number): ShapeKind {
  return SHAPE_CYCLE[(pos - 1) % SHAPE_CYCLE.length]
}

// Derive the colour at a spiral position by walking COLOR_CYCLE from pos 2.
function toneAt(pos: number): Tone {
  return COLOR_CYCLE[(pos - 2) % COLOR_CYCLE.length]
}

// The two answers, computed (not asserted) by extending the cycles to 15 & 16.
export const FIG15: Figure = { pos: 15, shape: shapeAt(15), tone: toneAt(15) }
export const FIG16: Figure = { pos: 16, shape: shapeAt(16), tone: toneAt(16) }

export const ANSWER_LABEL = 'B'

type Phase = 'goal' | 'shape' | 'color' | 'combine'

export interface SpiralStep {
  phase: Phase
  /** Reveal the two filled "?" cells in the bound spiral primitive (final beat). */
  reveal: boolean
  /**
   * Highlight ring for the shape-cycle strip: index 0..(len-1) of the cell to
   * pulse, or -1 for none. (Walks the period-5 [sq,sq,hept,hept,hept].)
   */
  shapeFocus: number
  /** Same, for the colour-cycle strip [white,white,gray,black]. */
  colorFocus: number
  /** Which predicted figures to show as solved chips this beat (15, 16, or both). */
  showSolved: 15 | 16 | 'both' | null
  /** True only on the winning beat (holds 0). */
  result: boolean
  caption: string
  hold: number
}

export interface SpiralStoryboard {
  known: Figure[]
  fig15: Figure
  fig16: Figure
  answerLabel: string
  shapeCycle: ShapeKind[]
  colorCycle: Tone[]
  steps: SpiralStep[]
  finalIndex: number
}

function shapeWord(s: ShapeKind, lang: Lang): string {
  if (lang === 'id') return s === 'square' ? 'persegi' : 'segitujuh'
  return s === 'square' ? 'square' : 'heptagon'
}
function toneWord(t: Tone, lang: Lang): string {
  if (lang === 'id') return t === 'white' ? 'putih' : t === 'gray' ? 'abu-abu' : 'hitam'
  return t
}

export function buildSpiral23G3Steps(lang: Lang): SpiralStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const sh15 = shapeWord(FIG15.shape, lang)
  const sh16 = shapeWord(FIG16.shape, lang)
  const tn15 = toneWord(FIG15.tone, lang)
  const tn16 = toneWord(FIG16.tone, lang)

  const steps: SpiralStep[] = [
    // Beat 1 — state the goal and trace the spiral.
    {
      phase: 'goal',
      reveal: false,
      shapeFocus: -1,
      colorFocus: -1,
      showSolved: null,
      result: false,
      hold: 2600,
      caption: t(
        'Follow the spiral from START, going clockwise outward. The last two cells are blank — find them.',
        'Ikuti spiral dari START, searah jarum jam ke luar. Dua sel terakhir kosong — temukan keduanya.',
      ),
    },

    // Beat 2 — reveal the SHAPE cycle, then extend it.
    {
      phase: 'shape',
      reveal: false,
      shapeFocus: -1,
      colorFocus: -1,
      showSolved: null,
      result: false,
      hold: 2700,
      caption: t(
        'Look only at the shapes. They repeat in fives: square, square, heptagon, heptagon, heptagon.',
        'Lihat bentuknya saja. Berulang per lima: persegi, persegi, segitujuh, segitujuh, segitujuh.',
      ),
    },
    {
      phase: 'shape',
      reveal: false,
      // pos 15 = (15-1)%5 = 4 → the third heptagon of the run.
      shapeFocus: (15 - 1) % SHAPE_CYCLE.length,
      colorFocus: -1,
      showSolved: 15,
      result: false,
      hold: 2400,
      caption: t(
        `Keep counting: 13, 14, 15 are all heptagons. So cell 15 is a ${shapeWord(FIG15.shape, lang)}.`,
        `Lanjut hitung: 13, 14, 15 semuanya segitujuh. Jadi sel 15 adalah ${shapeWord(FIG15.shape, lang)}.`,
      ),
    },
    {
      phase: 'shape',
      reveal: false,
      // pos 16 = (16-1)%5 = 0 → a fresh square starts the next run.
      shapeFocus: (16 - 1) % SHAPE_CYCLE.length,
      colorFocus: -1,
      showSolved: 'both',
      result: false,
      hold: 2400,
      caption: t(
        `Position 16 starts a new pair of squares. So cell 16 is a ${shapeWord(FIG16.shape, lang)}.`,
        `Posisi 16 memulai pasangan persegi baru. Jadi sel 16 adalah ${shapeWord(FIG16.shape, lang)}.`,
      ),
    },

    // Beat 3 — reveal the COLOR cycle, then extend it.
    {
      phase: 'color',
      reveal: false,
      shapeFocus: -1,
      colorFocus: -1,
      showSolved: 'both',
      result: false,
      hold: 2700,
      caption: t(
        'Now the colours. From figure 2 they repeat in fours: white, white, gray, black.',
        'Sekarang warnanya. Dari figur ke-2 berulang per empat: putih, putih, abu-abu, hitam.',
      ),
    },
    {
      phase: 'color',
      reveal: false,
      // pos 15 = (15-2)%4 = 1 → second white of the run.
      colorFocus: (15 - 2) % COLOR_CYCLE.length,
      shapeFocus: -1,
      showSolved: 15,
      result: false,
      hold: 2400,
      caption: t(
        `Walk the colours to the end: 14 white, 15 ${toneWord(FIG15.tone, lang)}. Cell 15 is ${tn15}.`,
        `Jalankan warnanya sampai akhir: 14 putih, 15 ${toneWord(FIG15.tone, lang)}. Sel 15 ${tn15}.`,
      ),
    },
    {
      phase: 'color',
      reveal: false,
      // pos 16 = (16-2)%4 = 2 → gray.
      colorFocus: (16 - 2) % COLOR_CYCLE.length,
      shapeFocus: -1,
      showSolved: 'both',
      result: false,
      hold: 2400,
      caption: t(
        `Next colour after white is ${toneWord(FIG16.tone, lang)}. So cell 16 is ${tn16}.`,
        `Warna setelah putih adalah ${toneWord(FIG16.tone, lang)}. Jadi sel 16 ${tn16}.`,
      ),
    },

    // Beat 4 — combine shape + colour, reveal the filled cells, land on B.
    {
      phase: 'combine',
      reveal: true,
      shapeFocus: -1,
      colorFocus: -1,
      showSolved: 'both',
      result: true,
      hold: 0,
      caption: t(
        `Put it together: cell 15 = ${tn15} ${sh15}, cell 16 = ${tn16} ${sh16}. That's option ${ANSWER_LABEL}.`,
        `Gabungkan: sel 15 = ${sh15} ${tn15}, sel 16 = ${sh16} ${tn16}. Itu pilihan ${ANSWER_LABEL}.`,
      ),
    },
  ]

  return {
    known: KNOWN,
    fig15: FIG15,
    fig16: FIG16,
    answerLabel: ANSWER_LABEL,
    shapeCycle: SHAPE_CYCLE,
    colorCycle: COLOR_CYCLE,
    steps,
    finalIndex: steps.length - 1,
  }
}
