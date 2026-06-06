/** Pure builder for the net-progress-cycles explainer animation. */

export type Lang = 'en' | 'id'

export interface NetProgressCyclesStep {
  /** Beat phase label. */
  phase: string
  /** Current height of the token (accumulated net position). */
  tokenPos: number
  /** Which cycle we are showing (1-based; 0 = intro). */
  cycleNum: number
  /** Substep within the current cycle: 'up' | 'down' | 'net' | 'intro' | 'total'. */
  substep: 'intro' | 'up' | 'down' | 'net' | 'total'
  /** Plain-text caption (bilingual label already baked in). */
  caption: string
  /** How long (ms) to hold before auto-advancing. 0 = last beat stays. */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface NetProgressCyclesStory {
  up: number
  down: number
  cycles: number
  net: number
  answer: number
  /** Maximum height reached (= answer); used to scale the track. */
  trackMax: number
  steps: NetProgressCyclesStep[]
  finalIndex: number
}

function clampFinite(v: number, fallback: number): number {
  return Number.isFinite(v) && !Number.isNaN(v) ? v : fallback
}

export function buildNetProgressCyclesSteps(
  rawUp: number,
  rawDown: number,
  rawCycles: number,
  lang: Lang,
): NetProgressCyclesStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Defensive clamping
  const up = Math.max(1, Math.min(20, Math.round(clampFinite(rawUp, 4))))
  const down = Math.max(0, Math.min(up - 1, Math.round(clampFinite(rawDown, 1))))
  const cycles = Math.max(1, Math.min(8, Math.round(clampFinite(rawCycles, 2))))
  const net = up - down
  const answer = net * cycles

  // Track height: at least enough to show a single up-move above the answer
  const trackMax = Math.max(answer + up, up + 2)

  const steps: NetProgressCyclesStep[] = []

  // Beat 0 — intro: explain one-cycle rule
  steps.push({
    phase: 'intro',
    tokenPos: 0,
    cycleNum: 0,
    substep: 'intro',
    caption: t(
      `Each cycle: up ${up}, then down ${down}. Net = ${up} − ${down} = ${net} per cycle.`,
      `Setiap siklus: naik ${up}, lalu turun ${down}. Bersih = ${up} − ${down} = ${net} per siklus.`,
    ),
    hold: 1800,
    result: false,
  })

  // Per-cycle beats: up sub-beat, down sub-beat, net label
  for (let c = 1; c <= cycles; c++) {
    const basePos = net * (c - 1)
    const afterUp = basePos + up
    const afterDown = afterUp - down // = net * c

    // Sub-beat: going up
    steps.push({
      phase: `c${c}-up`,
      tokenPos: afterUp,
      cycleNum: c,
      substep: 'up',
      caption: t(
        `Cycle ${c}: climb up ${up} → position ${afterUp}.`,
        `Siklus ${c}: naik ${up} → posisi ${afterUp}.`,
      ),
      hold: 1200,
      result: false,
    })

    // Sub-beat: sliding down
    steps.push({
      phase: `c${c}-down`,
      tokenPos: afterDown,
      cycleNum: c,
      substep: 'down',
      caption: t(
        `Slide down ${down} → position ${afterDown}. Net gain this cycle: ${net}.`,
        `Turun ${down} → posisi ${afterDown}. Untung siklus ini: ${net}.`,
      ),
      hold: 1200,
      result: false,
    })
  }

  // Final beat — total
  steps.push({
    phase: 'total',
    tokenPos: answer,
    cycleNum: cycles,
    substep: 'total',
    caption: t(
      `Total: ${net} \xd7 ${cycles} = ${answer} steps higher than start.`,
      `Total: ${net} \xd7 ${cycles} = ${answer} anak tangga lebih tinggi dari awal.`,
    ),
    hold: 0,
    result: true,
  })

  return {
    up,
    down,
    cycles,
    net,
    answer,
    trackMax,
    steps,
    finalIndex: steps.length - 1,
  }
}
