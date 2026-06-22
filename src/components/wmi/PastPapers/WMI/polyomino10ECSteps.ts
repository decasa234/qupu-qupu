// IKMC-19-EC-Q10 — "Dennis removes one cell from the L/P-pentomino.
// How many of the following shapes can he get?" (answer C = 3).
//
// METHOD (systematic removal, beat-by-beat):
//   Beat 1 — introduce the shape (5 cells), state the strategy.
//   Beat 2 — try removing cell (0,1): produces L-tetromino → matches option A ✓
//   Beat 3 — try removing cell (0,2): produces T-tetromino → matches option B ✓
//   Beat 4 — try removing cell (1,0): produces O-tetromino → matches option D ✓
//   Beat 5 — try removing cell (1,2): produces J-tetromino → matches NO option ✗
//             note that (1,1) disconnects the shape so it is skipped
//   Beat 6 (result) — 3 option shapes matched → answer is C = 3.
//
// Pure builder: (lang) => storyboard. No Math.random / no Date — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { type Cell, STEM_CELLS, OPTION_CELLS } from './Polyomino10ECIllustration'

export const ANSWER = 'C'
export const ANSWER_VALUE = 3 // number of reachable shapes

/** One beat describes a removal attempt and its verdict. */
export interface RemovalBeat {
  /** The cell being removed on this beat ([row, col] in stem coords). */
  removeCell: Cell | null
  /** Cells remaining after the removal (null on beat 0). */
  remaining: Cell[] | null
  /** Label of the option shape that matches ('A'/'B'/'D') or null. */
  matchesOption: string | null
  /** True when this removal keeps connectivity and matches an option. */
  hit: boolean
  /** True when this removal produces a valid tetromino but no option matches. */
  miss: boolean
  /** True when the removal disconnects the shape (invalid). */
  disconnects: boolean
  /** Running count of confirmed matches so far. */
  matchCount: number
  /** True on the final answer beat. */
  result: boolean
  caption: string
  hold: number
}

export interface Polyomino10ECStoryboard {
  answer: string
  answerValue: number
  stemCells: Cell[]
  steps: RemovalBeat[]
  finalIndex: number
}

function cells(arr: Cell[]): Cell[] { return arr }

/** Running list of accepted option labels. */
let _matchCount = 0

function makeRemoval(
  lang: Lang,
  removeCell: Cell,
  matchesOption: string | null,
  disconnects: boolean,
  running: number,
): RemovalBeat {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const rc = `(${removeCell[0] === 0 ? t('top', 'atas') : t('bottom', 'bawah')}-${
    removeCell[1] === 0 ? t('left', 'kiri') : removeCell[1] === 1 ? t('middle', 'tengah') : t('right', 'kanan')
  })`

  const remaining: Cell[] = disconnects
    ? []
    : STEM_CELLS.filter(([r, c]) => !(r === removeCell[0] && c === removeCell[1]))

  const hit = !disconnects && matchesOption !== null
  const miss = !disconnects && matchesOption === null

  let caption: string
  if (disconnects) {
    caption = t(
      `Remove the middle cell — the shape splits into two disconnected parts. Not allowed.`,
      `Hapus sel tengah — bentuk terpecah menjadi dua bagian terpisah. Tidak diperbolehkan.`,
    )
  } else if (hit) {
    caption = t(
      `Remove the ${rc} cell → ${remaining.length} cells remain. This is the shape in option ${matchesOption}! ✓ (${running} match${running === 1 ? '' : 'es'} so far)`,
      `Hapus sel ${rc} → tersisa ${remaining.length} kotak. Ini adalah bentuk pada pilihan ${matchesOption}! ✓ (${running} kecocokan sejauh ini)`,
    )
  } else {
    caption = t(
      `Remove the ${rc} cell → ${remaining.length} cells remain. This shape is NOT among the options. ✗`,
      `Hapus sel ${rc} → tersisa ${remaining.length} kotak. Bentuk ini TIDAK ada di pilihan. ✗`,
    )
  }

  return {
    removeCell,
    remaining: disconnects ? null : remaining,
    matchesOption,
    hit,
    miss,
    disconnects,
    matchCount: running,
    result: false,
    caption,
    hold: disconnects ? 1800 : hit ? 2400 : 2000,
  }
}

export function buildPolyomino10ECSteps(lang: Lang): Polyomino10ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  _matchCount = 0

  const steps: RemovalBeat[] = []

  // Beat 1 — introduce shape, explain strategy
  steps.push({
    removeCell: null,
    remaining: null,
    matchesOption: null,
    hit: false,
    miss: false,
    disconnects: false,
    matchCount: 0,
    result: false,
    caption: t(
      `The shape has ${STEM_CELLS.length} cells. Try removing each cell one by one and compare the result to the ${Object.keys(OPTION_CELLS).length} option shapes.`,
      `Bentuk ini punya ${STEM_CELLS.length} kotak. Coba hapus setiap kotak satu per satu dan bandingkan hasilnya dengan ${Object.keys(OPTION_CELLS).length} pilihan bentuk.`,
    ),
    hold: 2600,
  })

  // Beat 2 — remove (0,1): top-middle → L-tetromino → matches A
  _matchCount = 1
  steps.push(makeRemoval(lang, [0, 1], 'A', false, _matchCount))

  // Beat 3 — remove (0,2): top-right → T-tetromino → matches B
  _matchCount = 2
  steps.push(makeRemoval(lang, [0, 2], 'B', false, _matchCount))

  // Beat 4 — remove (1,0): bottom-left → O-tetromino → matches D
  _matchCount = 3
  steps.push(makeRemoval(lang, [1, 0], 'D', false, _matchCount))

  // Beat 5 — remove (1,2): bottom-right → J-shape → no option matches
  steps.push(makeRemoval(lang, [1, 2], null, false, _matchCount))

  // Beat 6 — remove (1,1): bottom-middle → disconnects
  steps.push(makeRemoval(lang, [1, 1], null, true, _matchCount))

  // Beat 7 (result)
  steps.push({
    removeCell: null,
    remaining: null,
    matchesOption: null,
    hit: false,
    miss: false,
    disconnects: false,
    matchCount: _matchCount,
    result: true,
    caption: t(
      `We found ${_matchCount} matching shapes (options A, B, D). The answer is C = ${_matchCount}.`,
      `Kami menemukan ${_matchCount} bentuk yang cocok (pilihan A, B, D). Jawabannya adalah C = ${_matchCount}.`,
    ),
    hold: 0,
  })

  return {
    answer: ANSWER,
    answerValue: ANSWER_VALUE,
    stemCells: cells(STEM_CELLS),
    steps,
    finalIndex: steps.length - 1,
  }
}
