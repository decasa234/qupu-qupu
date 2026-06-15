import type { Lang } from '../concepts/explainers/makeTenSteps'
import { OPTIMAL_GRID, GRID_SIZE, MAX_BLACK } from './Grid24G2Illustration'

/**
 * Storyboard for WMI-24F2A-Q23 (Grade 2 Final 2024).
 *
 * Goal: on a 4×4 board of black/white Go stones, every stone must touch (share a
 * side with) at least one BLACK neighbour AND at least one WHITE neighbour. We
 * want the most blacks possible.
 *
 * The animation teaches the method rather than asserting the answer:
 *   1. State the goal and the two-colour-neighbour rule.
 *   2. Try the greedy "all 16 black" — it busts, because a black stone in the
 *      middle has no white neighbour. So some whites are forced.
 *   3. Place white stones cleverly, region by region (corners then the right
 *      edge), revealing the verified OPTIMAL_GRID a few cells at a time.
 *   4. Check both halves of the rule: each white still touches a black, and each
 *      black now touches a white.
 *   5. Count the blacks straight off the board → the answer (derived, not typed).
 *
 * Everything is derived from OPTIMAL_GRID so the count can never drift from the
 * illustration's verified layout. Pure function of `lang` — SSR-safe.
 */

export type GridPhase = 'goal' | 'allblack' | 'reveal' | 'checkW' | 'checkB' | 'result'

/** A 16-element placement (index = row*4 + col), null cells are still empty. */
export type CellState = Array<'B' | 'W' | null>

export interface GridStep {
  phase: GridPhase
  /** What is drawn on the board this beat. */
  placement: CellState
  /** Cell indices to ring in orange (focus of this beat). */
  lit: number[]
  /** Black stones visible so far (for the running counter chip; null = hide chip). */
  blackCount: number | null
  caption: string
  hold: number
  result: boolean
}

export interface GridStoryboard {
  answer: number
  /** Localized "black" / "white" words for chips. */
  blackWord: string
  whiteWord: string
  steps: GridStep[]
  finalIndex: number
}

// --- helpers (pure, derived from OPTIMAL_GRID) ------------------------------

const N = GRID_SIZE // 4

/** Indices of the white cells in the verified optimal layout, reading order. */
const whiteCells = OPTIMAL_GRID.map((c, i) => (c === 'W' ? i : -1)).filter((i) => i >= 0)

/** Count blacks present in a partial placement. */
const blacksIn = (p: CellState) => p.filter((c) => c === 'B').length

/** A fresh all-empty board. */
const empty = (): CellState => Array<'B' | 'W' | null>(N * N).fill(null)

/** A board filled entirely with black. */
const allBlack = (): CellState => Array<'B' | 'W' | null>(N * N).fill('B')

/**
 * Build the layout in stages: start all-black, then convert the white cells to
 * white in three regions so the reveal reads region by region.
 *   region 0: the two TOP corners      (row 0, cols 0-1)
 *   region 1: the RIGHT edge middle     (rows 1-2, col 3)
 *   region 2: the two BOTTOM corners    (row 3, cols 0-1)
 */
function whiteRegions(): number[][] {
  const top = whiteCells.filter((i) => Math.floor(i / N) === 0)
  const right = whiteCells.filter((i) => i % N === N - 1)
  const bottom = whiteCells.filter((i) => Math.floor(i / N) === N - 1)
  return [top, right, bottom]
}

// --- builder ----------------------------------------------------------------

export function buildGrid24G2Steps(lang: Lang): GridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const regions = whiteRegions()
  const steps: GridStep[] = []

  // Beat 1 — state the goal + the two-colour rule.
  steps.push({
    phase: 'goal',
    placement: empty(),
    lit: [],
    blackCount: null,
    hold: 2600,
    result: false,
    caption: t(
      'Goal: place as many BLACK stones as we can. But every stone must touch a black AND a white neighbour.',
      'Tujuan: taruh batu HITAM sebanyak mungkin. Tapi tiap batu harus bersentuhan dengan tetangga hitam DAN putih.',
    ),
  })

  // Beat 2 — try the greedy all-black board; it busts.
  steps.push({
    phase: 'allblack',
    placement: allBlack(),
    lit: [5, 6, 9, 10], // the four inner cells have no white neighbour
    blackCount: N * N,
    hold: 2200,
    result: false,
    caption: t(
      'All 16 black? ✗ The inside stones touch only black — no white neighbour. So we must turn a few white.',
      'Semua 16 hitam? ✗ Batu di tengah cuma menyentuh hitam — tak ada tetangga putih. Jadi beberapa harus jadi putih.',
    ),
  })

  // Beats 3..5 — reveal the white stones region by region (build up the optimal
  // layout from the all-black board so the change reads).
  const regionCaptions: Array<[string, string]> = [
    [
      'Turn the two TOP corners white. Each one still touches a black, and the blacks beside them now touch a white.',
      'Ubah dua sudut ATAS jadi putih. Tiap putih masih menyentuh hitam, dan hitam di sebelahnya kini menyentuh putih.',
    ],
    [
      'Add two whites on the RIGHT edge. They cover the middle blacks that had no white neighbour yet.',
      'Tambah dua putih di tepi KANAN. Mereka menutup hitam di tengah yang belum punya tetangga putih.',
    ],
    [
      'Finish with the two BOTTOM corners white — by symmetry, the bottom blacks now touch a white too.',
      'Selesaikan dengan dua sudut BAWAH jadi putih — secara simetri, hitam bawah kini menyentuh putih juga.',
    ],
  ]

  const built: CellState = allBlack()
  regions.forEach((region, ri) => {
    for (const i of region) built[i] = 'W'
    steps.push({
      phase: 'reveal',
      placement: built.slice(),
      lit: region.slice(),
      blackCount: blacksIn(built),
      hold: 2000,
      result: false,
      caption: t(regionCaptions[ri][0], regionCaptions[ri][1]),
    })
  })

  // Beat 6 — check rule half 1: every WHITE touches a black.
  steps.push({
    phase: 'checkW',
    placement: built.slice(),
    lit: whiteCells.slice(),
    blackCount: blacksIn(built),
    hold: 2100,
    result: false,
    caption: t(
      `Check the ${whiteCells.length} white stones: each one sits beside a black. ✓`,
      `Cek ${whiteCells.length} batu putih: tiap satu duduk di sebelah hitam. ✓`,
    ),
  })

  // Beat 7 — check rule half 2: every BLACK touches a white.
  steps.push({
    phase: 'checkB',
    placement: built.slice(),
    lit: OPTIMAL_GRID.map((c, i) => (c === 'B' ? i : -1)).filter((i) => i >= 0),
    blackCount: blacksIn(built),
    hold: 2100,
    result: false,
    caption: t(
      'Check every black stone: each one touches a white now too. ✓ The rule holds.',
      'Cek tiap batu hitam: tiap satu kini juga menyentuh putih. ✓ Aturannya terpenuhi.',
    ),
  })

  // Beat 8 — count the blacks straight off the verified board → the answer.
  const answer = blacksIn(built) // === MAX_BLACK, derived from OPTIMAL_GRID
  steps.push({
    phase: 'result',
    placement: built.slice(),
    lit: OPTIMAL_GRID.map((c, i) => (c === 'B' ? i : -1)).filter((i) => i >= 0),
    blackCount: answer,
    hold: 0,
    result: true,
    caption: t(
      `Count the blacks: 16 − ${whiteCells.length} white = ${answer}. Most black stones is ${answer}.`,
      `Hitung yang hitam: 16 − ${whiteCells.length} putih = ${answer}. Batu hitam terbanyak adalah ${answer}.`,
    ),
  })

  return {
    answer, // guaranteed === MAX_BLACK
    blackWord: t('black', 'hitam'),
    whiteWord: t('white', 'putih'),
    steps,
    finalIndex: steps.length - 1,
  }
}

// Re-export so callers can assert the derived answer matches the verified layout.
export { MAX_BLACK }
