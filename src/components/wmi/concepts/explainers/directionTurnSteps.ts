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

  // One beat per quarter-turn — EVERY turn is animated, even the ones that
  // complete a full circle. The arrow keeps spinning clockwise (heading keeps
  // accumulating +90) so the child sees each individual rotation.
  for (let i = 1; i <= turns; i++) {
    const curDirIndex = (start + i) % 4
    const curNameEN = DIRS_EN[curDirIndex]
    const curNameID = DIRS_ID[curDirIndex]
    const lap = i % 4 === 0 // this turn lands back on a full circle
    steps.push({
      dirIndex: curDirIndex,
      headingDeg: startHeading + i * 90,
      caption: t(
        lap
          ? `Turn ${i} of ${turns}: facing ${curNameEN} — full circle!`
          : `Turn ${i} of ${turns}: now facing ${curNameEN}.`,
        lap
          ? `Putaran ${i} dari ${turns}: menghadap ${curNameID} — satu lingkaran penuh!`
          : `Putaran ${i} dari ${turns}: sekarang menghadap ${curNameID}.`,
      ),
      hold: 1300,
      result: false,
    })
  }

  // Shortcut explanation for big rotations (more than 180°). Teaches the smart
  // reductions an olympiad tutor would use: drop whole circles (every 4 turns
  // returns to the start), and a 270° clockwise turn equals one quarter-turn
  // the other way. The arrow holds on the final direction while we explain.
  const finalHeading = startHeading + turns * 90
  if (turns >= 3) {
    const fullCircles = Math.floor(turns / 4)
    if (turns >= 4) {
      steps.push({
        dirIndex: finalDirIndex,
        headingDeg: finalHeading,
        caption: t(
          netTurns === 0
            ? `Shortcut: every 4 turns is one full circle. ${turns} turns = ${fullCircles} full circle${fullCircles > 1 ? 's' : ''}, right back to ${startNameEN}.`
            : `Shortcut: every 4 turns is one full circle. ${turns} = ${fullCircles}×4 + ${netTurns}, so only ${netTurns} turn${netTurns > 1 ? 's' : ''} change your direction.`,
          netTurns === 0
            ? `Pintasan: setiap 4 putaran adalah satu lingkaran penuh. ${turns} putaran = ${fullCircles} lingkaran penuh, kembali tepat ke ${startNameID}.`
            : `Pintasan: setiap 4 putaran adalah satu lingkaran penuh. ${turns} = ${fullCircles}×4 + ${netTurns}, jadi hanya ${netTurns} putaran yang mengubah arah.`,
        ),
        hold: 2400,
        result: false,
      })
    }
    if (netTurns === 3) {
      steps.push({
        dirIndex: finalDirIndex,
        headingDeg: finalHeading,
        caption: t(
          `Shortcut: 3 quarter-turns clockwise (270°) is the same as 1 the other way (90° counter-clockwise) — both face ${finalNameEN}.`,
          `Pintasan: 3 putaran searah jarum jam (270°) sama dengan 1 putaran arah sebaliknya (90° berlawanan jarum jam) — sama-sama menghadap ${finalNameID}.`,
        ),
        hold: 2400,
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
