import type { Lang } from './makeTenSteps'

export type JumpsPhase = 'start' | 'jump' | 'result'

export interface JumpsStep {
  kind: JumpsPhase
  /** Current frog position at this beat. */
  pos: number
  /** How many jumps have been completed (0 on start, j on jump j, jumps on result). */
  landedJumps: number
  caption: string
  result: boolean
}

export interface JumpsStoryboard {
  start: number
  step: number
  jumps: number
  landing: number
  /** Array of positions: [start, start+step, start+2*step, …, landing]. */
  positions: number[]
  steps: JumpsStep[]
  finalIndex: number
}

export function buildJumpsSteps(
  start: number,
  step: number,
  jumps: number,
  lang: Lang,
): JumpsStoryboard {
  const landing = start + step * jumps
  const positions: number[] = []
  for (let j = 0; j <= jumps; j++) {
    positions.push(start + step * j)
  }

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: JumpsStep[] = []

  // Beat 0: start
  steps.push({
    kind: 'start',
    pos: start,
    landedJumps: 0,
    caption: t(`The frog starts at ${start}.`, `Katak mulai di ${start}.`),
    result: false,
  })

  // Beats 1..jumps: one per jump
  for (let j = 1; j <= jumps; j++) {
    const pos = start + step * j
    steps.push({
      kind: 'jump',
      pos,
      landedJumps: j,
      caption: t(`Jump ${j}: +${step} → ${pos}.`, `Lompat ${j}: +${step} → ${pos}.`),
      result: false,
    })
  }

  // Last beat: result
  steps.push({
    kind: 'result',
    pos: landing,
    landedJumps: jumps,
    caption: t(
      `${start} + ${step}×${jumps} = ${landing}.`,
      `${start} + ${step}×${jumps} = ${landing}.`,
    ),
    result: true,
  })

  return { start, step, jumps, landing, positions, steps, finalIndex: steps.length - 1 }
}
