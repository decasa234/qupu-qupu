import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FIGURE_COUNTS, FIGURE_ORDER, type FigureLabel } from './P21G1Q13Illustration'

// Storyboard for WMI-21P1A-Q13 — count the cubes of each figure A→B→C→D with a
// running "most so far" leader, then crown the figure with the most cubes (D).

export interface Q13Step {
  /** Figures whose count has been revealed so far (prefix of FIGURE_ORDER). */
  counted: FigureLabel[]
  /** The figure being counted on this beat (or null on the intro/result beats). */
  active: FigureLabel | null
  /** The current leader (most cubes among counted figures), or null before any. */
  leader: FigureLabel | null
  caption: string
  hold: number
  result: boolean
}

export interface Q13Storyboard {
  counts: Record<FigureLabel, number>
  answer: FigureLabel
  steps: Q13Step[]
  finalIndex: number
}

function leaderOf(counted: FigureLabel[]): FigureLabel | null {
  if (counted.length === 0) return null
  return counted.reduce((best, l) => (FIGURE_COUNTS[l] > FIGURE_COUNTS[best] ? l : best), counted[0])
}

export function buildP21G1Q13Steps(lang: Lang): Q13Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const c = FIGURE_COUNTS

  const steps: Q13Step[] = [
    {
      counted: [],
      active: null,
      leader: null,
      hold: 1900,
      result: false,
      caption: t(
        'Count the cubes in each figure — count the cubes you cannot see too.',
        'Hitung kubus tiap bangun — kubus yang tak terlihat ikut dihitung.',
      ),
    },
  ]

  // Count each figure in turn, tracking the running leader.
  FIGURE_ORDER.forEach((label, i) => {
    const counted = FIGURE_ORDER.slice(0, i + 1)
    const leader = leaderOf(counted)
    steps.push({
      counted,
      active: label,
      leader,
      hold: 2000,
      result: false,
      caption: t(
        `Figure (${label}) has ${c[label]} cubes.`,
        `Bangun (${label}) punya ${c[label]} kubus.`,
      ),
    })
  })

  const answer: FigureLabel = leaderOf(FIGURE_ORDER) as FigureLabel
  steps.push({
    counted: FIGURE_ORDER,
    active: answer,
    leader: answer,
    hold: 0,
    result: true,
    caption: t(
      `${c.A}, ${c.B}, ${c.C}, ${c.D} — the most is ${c[answer]}, so figure (${answer}) wins.`,
      `${c.A}, ${c.B}, ${c.C}, ${c.D} — paling banyak ${c[answer]}, jadi bangun (${answer}) menang.`,
    ),
  })

  return {
    counts: { ...c },
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
