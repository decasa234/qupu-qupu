import type { Lang } from '../concepts/explainers/makeTenSteps'

export const BRACKET_ANSWER = '12'

/** Bracket props understood by the illustrator's primitive. */
export type BracketKind = 'topRight' | 'topLeft' | 'bottomLeft' | 'center'

export interface BracketGridStep {
  /** Which corner bracket the illustrator should draw this beat (undefined = none). */
  bracket?: BracketKind
  /** Grid cell (row, col 0-based) to highlight as the one the bracket "takes". */
  highlightCell?: [number, number]
  /** Cumulative collected values so far, in pick order — drives the running sum. */
  collected: number[]
  caption: string
  hold: number
  result: boolean
}

export interface BracketGridStoryboard {
  answer: string
  steps: BracketGridStep[]
  finalIndex: number
}

/**
 * WMI-22F1A-Q16 — corner brackets reading a 3×3 number grid.
 *
 * Grid (row, col 0-based):
 *   [0,0]=6  [0,1]=9  [0,2]=1
 *   [1,0]=2  [1,1]=4  [1,2]=8
 *   [2,0]=3  [2,1]=7  [2,2]=5
 *
 * Each corner bracket opens toward exactly one cell and "takes" its number; a
 * square (□) wraps the centre. The LEGEND establishes the rule with ∟: a bracket
 * opening toward the TOP-RIGHT lands on cell [0,2] = 1.
 *
 * The question asks for ¬ + □ + ┌:
 *   ¬  opens toward the BOTTOM-LEFT  → cell [2,0] = 3   (illustrator: bracket='topRight')
 *   □  wraps the CENTRE              → cell [1,1] = 4   (illustrator: bracket='center')
 *   ┌  opens toward the BOTTOM-RIGHT → cell [2,2] = 5   (illustrator: bracket='topLeft')
 *   Sum = 3 + 4 + 5 = 12.
 *
 * NOTE on the illustrator's `bracket` tokens: they name the glyph's printed shape,
 * not the cell it points to, so the names look "rotated" versus the opening
 * direction. The mapping above is fixed by the illustrator's primitive.
 *
 * The animation walks one bracket per beat, naming the concrete running sum each
 * time, then totals them on the final beat. It never jumps straight to 12.
 */
export function buildBracketGrid22G1Steps(lang: Lang): BracketGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BracketGridStep[] = [
    // 1) Recall the rule from the legend: ∟ opens toward the top-right = 1.
    {
      bracket: 'bottomLeft',
      highlightCell: [0, 2],
      collected: [],
      hold: 2600,
      result: false,
      caption: t(
        'The RULE first: a corner bracket opens toward ONE cell and grabs its number. The legend ∟ opens to the TOP-RIGHT, landing on the 1.',
        'ATURANNYA dulu: tanda siku membuka ke SATU kotak dan mengambil angkanya. Contoh ∟ membuka ke KANAN-ATAS, jatuh pada angka 1.',
      ),
    },
    // 2) ¬ opens toward the bottom-left → 3.
    {
      bracket: 'topRight',
      highlightCell: [2, 0],
      collected: [3],
      hold: 2300,
      result: false,
      caption: t(
        'Now ¬ opens toward the BOTTOM-LEFT corner → it grabs the 3. Running sum: 3.',
        'Sekarang ¬ membuka ke pojok KIRI-BAWAH → mengambil angka 3. Jumlah sementara: 3.',
      ),
    },
    // 3) □ wraps the centre → 4.
    {
      bracket: 'center',
      highlightCell: [1, 1],
      collected: [3, 4],
      hold: 2300,
      result: false,
      caption: t(
        'The square □ wraps the CENTRE cell → it grabs the 4. Running sum: 3 + 4 = 7.',
        'Kotak □ membungkus sel TENGAH → mengambil angka 4. Jumlah sementara: 3 + 4 = 7.',
      ),
    },
    // 4) ┌ opens toward the bottom-right → 5.
    {
      bracket: 'topLeft',
      highlightCell: [2, 2],
      collected: [3, 4, 5],
      hold: 2300,
      result: false,
      caption: t(
        '┌ opens toward the BOTTOM-RIGHT corner → it grabs the 5. Running sum: 3 + 4 + 5.',
        '┌ membuka ke pojok KANAN-BAWAH → mengambil angka 5. Jumlah sementara: 3 + 4 + 5.',
      ),
    },
    // 5) Add them all up.
    {
      collected: [3, 4, 5],
      hold: 0,
      result: true,
      caption: t(
        `Add the three: 3 + 4 + 5 = ${BRACKET_ANSWER}.`,
        `Jumlahkan ketiganya: 3 + 4 + 5 = ${BRACKET_ANSWER}.`,
      ),
    },
  ]

  return {
    answer: BRACKET_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
