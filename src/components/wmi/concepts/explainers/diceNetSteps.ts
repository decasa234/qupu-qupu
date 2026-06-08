import type { Lang } from './makeTenSteps'

type Cell = [number, number]

export interface DiceNetStep {
  /** Which net indices are marked as invalid (red). */
  eliminated: number[]
  /** Which net index is highlighted as the answer (green), or -1. */
  winner: number
  caption: string
  hold: number
  result: boolean
}

export interface DiceNetStoryboard {
  nets: Cell[][]
  validIndex: number
  answerLabel: string
  steps: DiceNetStep[]
  finalIndex: number
}

/** Detect if a net contains a 2×2 filled block (which prevents folding). */
function has2x2Block(cells: Cell[]): boolean {
  const set = new Set(cells.map(([c, r]) => `${c},${r}`))
  for (const [c, r] of cells) {
    if (
      set.has(`${c + 1},${r}`) &&
      set.has(`${c},${r + 1}`) &&
      set.has(`${c + 1},${r + 1}`)
    ) {
      return true
    }
  }
  return false
}

/** Detect if a net is a straight 1×6 strip. */
function is1x6Strip(cells: Cell[]): boolean {
  const cols = new Set(cells.map(([c]) => c))
  const rows = new Set(cells.map(([, r]) => r))
  return cols.size === 1 || rows.size === 1
}

/** Detect if a net is a 2×3 rectangle. */
function is2x3Rect(cells: Cell[]): boolean {
  const cols = new Set(cells.map(([c]) => c))
  const rows = new Set(cells.map(([, r]) => r))
  return (cols.size === 2 && rows.size === 3) || (cols.size === 3 && rows.size === 2)
}

/**
 * Returns a short reason key for why a net is invalid.
 * Returns null if the net appears valid.
 */
function invalidReason(cells: Cell[]): 'block' | 'strip' | 'rect' | null {
  if (!Array.isArray(cells) || cells.length !== 6) return null
  if (is1x6Strip(cells)) return 'strip'
  if (is2x3Rect(cells)) return 'rect'
  if (has2x2Block(cells)) return 'block'
  return null
}

const LABELS = ['A', 'B', 'C', 'D'] as const

/**
 * Builds the dice-net-fold explainer storyboard.
 *
 * Beats:
 *   0  – show all four nets, introduce the task
 *   1  – scan for 2×2 blocks / rectangular strips, eliminate one or more invalid nets
 *   2  – (optional) eliminate remaining invalid nets with a second reason
 *   last – result beat: only the valid net survives
 *
 * Defensive: if params are missing / malformed, returns a minimal single-step storyboard.
 */
export function buildDiceNetSteps(
  netsRaw: unknown,
  validIndexRaw: unknown,
  lang: Lang,
): DiceNetStoryboard {
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  // Defensive defaults
  const nets: Cell[][] = Array.isArray(netsRaw)
    ? (netsRaw as Cell[][]).filter(Array.isArray)
    : []
  const validIndex =
    typeof validIndexRaw === 'number' &&
    Number.isFinite(validIndexRaw) &&
    validIndexRaw >= 0 &&
    validIndexRaw < nets.length
      ? Math.round(validIndexRaw)
      : 0

  const answerLabel = LABELS[validIndex] ?? 'A'

  if (nets.length === 0) {
    const fallback: DiceNetStep = {
      eliminated: [],
      winner: validIndex,
      caption: T(
        `Net ${answerLabel} folds into a cube.`,
        `Jaring ${answerLabel} membentuk kubus.`,
      ),
      hold: 0,
      result: true,
    }
    return { nets, validIndex, answerLabel, steps: [fallback], finalIndex: 0 }
  }

  // Group invalid nets by reason so we can batch them in steps
  const blockNets: number[] = []
  const stripNets: number[] = []
  const rectNets: number[] = []

  nets.forEach((cells, i) => {
    if (i === validIndex) return
    const reason = invalidReason(cells)
    if (reason === 'block') blockNets.push(i)
    else if (reason === 'strip') stripNets.push(i)
    else if (reason === 'rect') rectNets.push(i)
    else blockNets.push(i) // fallback
  })

  const steps: DiceNetStep[] = []

  // Beat 0 — introduce: show all nets, no eliminations yet
  steps.push({
    eliminated: [],
    winner: -1,
    caption: T(
      'Each net has 6 squares. A valid cube net folds without any face overlapping another.',
      'Setiap jaring memiliki 6 persegi. Jaring kubus yang benar terlipat tanpa ada bidang yang saling menumpuk.',
    ),
    hold: 2200,
    result: false,
  })

  // Beat 1 — eliminate block nets (most common invalid type)
  if (blockNets.length > 0) {
    const labels = blockNets.map((i) => LABELS[i]).join(', ')
    steps.push({
      eliminated: [...blockNets],
      winner: -1,
      caption: T(
        `Net${blockNets.length > 1 ? 's' : ''} ${labels} contain${blockNets.length === 1 ? 's' : ''} a 2×2 block — two faces would overlap when folded.`,
        `Jaring ${labels} mengandung blok 2×2 — dua bidang akan saling menumpuk saat dilipat.`,
      ),
      hold: 2400,
      result: false,
    })
  }

  // Beat 2 — eliminate strip / rect nets
  const otherInvalid = [...stripNets, ...rectNets]
  if (otherInvalid.length > 0) {
    const alreadyEliminated = [...blockNets]
    const labels = otherInvalid.map((i) => LABELS[i]).join(', ')
    steps.push({
      eliminated: [...alreadyEliminated, ...otherInvalid],
      winner: -1,
      caption: T(
        `Net${otherInvalid.length > 1 ? 's' : ''} ${labels} form${otherInvalid.length === 1 ? 's' : ''} a rectangle — it cannot wrap around all six faces.`,
        `Jaring ${labels} membentuk persegi panjang — tidak dapat menutup semua enam sisi kubus.`,
      ),
      hold: 2400,
      result: false,
    })
  }

  // Result beat — winner revealed
  const allInvalid = [
    ...blockNets,
    ...stripNets,
    ...rectNets,
  ]
  steps.push({
    eliminated: allInvalid,
    winner: validIndex,
    caption: T(
      `Net ${answerLabel} is the only net that folds into a perfect cube.`,
      `Jaring ${answerLabel} adalah satu-satunya jaring yang dapat dilipat menjadi kubus sempurna.`,
    ),
    hold: 0,
    result: true,
  })

  return { nets, validIndex, answerLabel, steps, finalIndex: steps.length - 1 }
}
