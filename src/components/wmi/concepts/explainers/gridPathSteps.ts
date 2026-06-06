export type Lang = 'en' | 'id'

export interface GridPathStep {
  /** Current token column (grid x). */
  tokenX: number
  /** Current token row (grid y). */
  tokenY: number
  /** Number of moves completed so far (used for the counter display). */
  stepsTaken: number
  caption: string
  /** Hold duration in ms (0 on the final result beat). */
  hold: number
  result: boolean
}

export interface GridPathStoryboard {
  cols: number
  rows: number
  sx: number
  sy: number
  ex: number
  ey: number
  dx: number
  dy: number
  answer: number
  /** Array of animation beats. (Deliberately named "steps" as required by the pattern.) */
  steps: GridPathStep[]
  finalIndex: number
}

function clampInt(n: unknown, lo: number, hi: number): number {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return lo
  return Math.max(lo, Math.min(hi, Math.round(v)))
}

/**
 * Build the storyboard for the grid-path-steps explainer.
 *
 * Strategy: move horizontally first (one cell per beat), then vertically.
 * Each beat the token moves one cell; a step counter increments.
 * The final beat shows: `${dx} + ${dy} = ${answer} steps`.
 */
export function buildGridPathSteps(
  colsRaw: unknown,
  rowsRaw: unknown,
  sxRaw: unknown,
  syRaw: unknown,
  exRaw: unknown,
  eyRaw: unknown,
  lang: Lang,
): GridPathStoryboard {
  const cols = clampInt(colsRaw, 4, 6)
  const rows = clampInt(rowsRaw, 3, 5)
  const sx = clampInt(sxRaw, 0, cols - 1)
  const sy = clampInt(syRaw, 0, rows - 1)
  const ex = clampInt(exRaw, 0, cols - 1)
  const ey = clampInt(eyRaw, 0, rows - 1)

  const dx = Math.abs(ex - sx)
  const dy = Math.abs(ey - sy)
  const answer = dx + dy

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridPathStep[] = []

  // Beat 0: token at start, nothing moved yet
  steps.push({
    tokenX: sx,
    tokenY: sy,
    stepsTaken: 0,
    caption: t(
      `Start! Move only along grid lines to reach the flag.`,
      `Mulai! Bergerak hanya sepanjang garis kisi menuju bendera.`,
    ),
    hold: 1600,
    result: false,
  })

  // Horizontal phase: move one column at a time toward ex
  const hDir = ex > sx ? 1 : -1
  for (let i = 1; i <= dx; i++) {
    const curX = sx + hDir * i
    const movesTaken = i
    const isLastH = i === dx
    steps.push({
      tokenX: curX,
      tokenY: sy,
      stepsTaken: movesTaken,
      caption: isLastH
        ? t(
            `${dx} step${dx !== 1 ? 's' : ''} across — now go up or down.`,
            `${dx} langkah ke samping — sekarang naik atau turun.`,
          )
        : t(
            `Step ${movesTaken}: move ${ex > sx ? 'right' : 'left'}.`,
            `Langkah ${movesTaken}: gerak ke ${ex > sx ? 'kanan' : 'kiri'}.`,
          ),
      hold: 900,
      result: false,
    })
  }

  // Vertical phase: move one row at a time toward ey
  const vDir = ey > sy ? 1 : -1
  for (let j = 1; j <= dy; j++) {
    const curY = sy + vDir * j
    const movesTaken = dx + j
    const isLastV = j === dy
    steps.push({
      tokenX: ex,
      tokenY: curY,
      stepsTaken: movesTaken,
      caption: isLastV
        ? t(
            `${dy} step${dy !== 1 ? 's' : ''} up/down — reached the flag!`,
            `${dy} langkah naik/turun — mencapai bendera!`,
          )
        : t(
            `Step ${movesTaken}: move ${ey > sy ? 'down' : 'up'}.`,
            `Langkah ${movesTaken}: gerak ke ${ey > sy ? 'bawah' : 'atas'}.`,
          ),
      hold: 900,
      result: false,
    })
  }

  // Final result beat
  steps.push({
    tokenX: ex,
    tokenY: ey,
    stepsTaken: answer,
    caption: t(
      `${dx} + ${dy} = ${answer} steps`,
      `${dx} + ${dy} = ${answer} langkah`,
    ),
    hold: 0,
    result: true,
  })

  return { cols, rows, sx, sy, ex, ey, dx, dy, answer, steps, finalIndex: steps.length - 1 }
}
