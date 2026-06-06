import type { Lang } from './makeTenSteps'

/** Direction names (index matches concept's DIRS order: N=0, E=1, S=2, W=3). */
const DIRS_EN = ['North', 'East', 'South', 'West'] as const
const DIRS_ID = ['Utara', 'Timur', 'Selatan', 'Barat'] as const

/** Heading in degrees for SVG rotation (N=0 = up, E=90 = right, S=180 = down, W=270 = left). */
const HEADING_DEG = [0, 90, 180, 270] as const

export interface DirectionTurnStep {
  /** Current facing direction index (0=N, 1=E, 2=S, 3=W). */
  dirIndex: number
  /** Arrow heading in degrees for CSS/framer-motion rotate (0=up/N, 90=right/E, 180=down/S, 270=left/W). */
  headingDeg: number
  caption: string
  /** Hold duration in ms (0 on the final beat). */
  hold: number
  /** True on the last beat (shows the answer). */
  result: boolean
}

export interface DirectionTurnStoryboard {
  /** Resolved start index (0–3). */
  start: number
  /** Resolved turn count (1–7). */
  turns: number
  /** Net turns after mod-4 reduction. */
  netTurns: number
  /** Final direction index (0–3). */
  finalDirIndex: number
  steps: DirectionTurnStep[]
  /** Index of the last beat. */
  finalIndex: number
}

export interface DirectionTurnParams {
  start?: unknown
  turns?: unknown
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function safeInt(v: unknown, lo: number, hi: number, fallback: number): number {
  const n = Number(v)
  if (!Number.isFinite(n) || !Number.isInteger(n)) return fallback
  return clamp(n, lo, hi)
}

/**
 * Builds the beat storyboard for the direction-orientation explainer.
 *
 * Param fields (matching concept's Params schema):
 *   - `start`: integer 0–3 (index into N/E/S/W)
 *   - `turns`: integer 1–7 (number of clockwise quarter-turns)
 *
 * All turns are clockwise (matching the concept definition).
 * Beat sequence:
 *   1. Show starting direction (compass arrow at rest).
 *   2–(turns+1). One beat per quarter-turn — arrow rotates 90° clockwise per beat.
 *      If turns > 4, apply mod-4 reduction: show the equivalent net turns but
 *      caption explains the full/remainder split.
 *   Last beat: result beat naming the final direction.
 */
export function buildDirectionTurnSteps(
  params: DirectionTurnParams,
  lang: Lang,
): DirectionTurnStoryboard {
  // Defensive parsing
  const start = safeInt((params ?? {}).start, 0, 3, 0)
  const turns = safeInt((params ?? {}).turns, 1, 7, 1)

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const netTurns = turns % 4
  const finalDirIndex = (start + turns) % 4

  const startNameEN = DIRS_EN[start]
  const startNameID = DIRS_ID[start]
  const finalNameEN = DIRS_EN[finalDirIndex]
  const finalNameID = DIRS_ID[finalDirIndex]

  const steps: DirectionTurnStep[] = []

  // Beat 0: show starting direction
  const startHeading = HEADING_DEG[start]
  const startCaption = t(
    `Facing ${startNameEN}.`,
    `Menghadap ${startNameID}.`,
  )
  steps.push({
    dirIndex: start,
    headingDeg: startHeading,
    caption: startCaption,
    hold: 1600,
    result: false,
  })

  if (turns > 4 && netTurns === 0) {
    // Full circles only — net displacement is 0
    const fullCircles = Math.floor(turns / 4)
    const circleCaption = t(
      `${turns} turns = ${fullCircles} full circle${fullCircles > 1 ? 's' : ''} — back to ${finalNameEN}.`,
      `${turns} putaran = ${fullCircles} lingkaran penuh — kembali ke ${finalNameID}.`,
    )
    steps.push({
      dirIndex: finalDirIndex,
      headingDeg: startHeading,
      caption: circleCaption,
      hold: 2200,
      result: false,
    })
  } else {
    // Determine how many individual turn beats to animate
    const animateTurns = netTurns === 0 ? 0 : netTurns
    const prefixCaption =
      turns > 4
        ? t(
            `${turns} turns = ${Math.floor(turns / 4)} full circle${Math.floor(turns / 4) > 1 ? 's' : ''} + ${netTurns} extra. Applying ${netTurns}:`,
            `${turns} putaran = ${Math.floor(turns / 4)} lingkaran penuh + ${netTurns} sisa. Menerapkan ${netTurns}:`,
          )
        : null

    if (prefixCaption) {
      steps.push({
        dirIndex: start,
        headingDeg: startHeading,
        caption: prefixCaption,
        hold: 2000,
        result: false,
      })
    }

    // One beat per net quarter-turn (clockwise)
    for (let i = 1; i <= animateTurns; i++) {
      const curDirIndex = (start + i) % 4
      const curNameEN = DIRS_EN[curDirIndex]
      const curNameID = DIRS_ID[curDirIndex]
      // Accumulate heading: each step adds 90° clockwise
      // We want the arrow to spin smoothly so we keep adding 90 rather than
      // jumping around (framer-motion will take the shortest path unless we
      // accumulate; accumulating from startHeading is correct for 1–3 net turns).
      const headingDeg = startHeading + i * 90

      const turnCaption = t(
        `Turn ${i}: now facing ${curNameEN}.`,
        `Putaran ${i}: sekarang menghadap ${curNameID}.`,
      )
      steps.push({
        dirIndex: curDirIndex,
        headingDeg,
        caption: turnCaption,
        hold: i < animateTurns ? 1600 : 1800,
        result: false,
      })
    }
  }

  // Final result beat
  const resultHeadingDeg = steps[steps.length - 1].headingDeg
  const resultCaption = t(
    `You end up facing ${finalNameEN}!`,
    `Kamu akhirnya menghadap ${finalNameID}!`,
  )
  steps.push({
    dirIndex: finalDirIndex,
    headingDeg: resultHeadingDeg,
    caption: resultCaption,
    hold: 0,
    result: true,
  })

  return {
    start,
    turns,
    netTurns,
    finalDirIndex,
    steps,
    finalIndex: steps.length - 1,
  }
}
