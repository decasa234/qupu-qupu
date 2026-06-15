// Deterministic storyboard for WMI-19P1A-Q14 (BeltPulley19P1Explainer).
//
// The marked top-left wheel spins counter-clockwise. Each CROSSED belt reverses
// the spin, so propagating along the chain W1 → W2 → W3 → A flips three times:
//   CCW → CW → CCW → CW.
// Wheel A therefore spins CLOCKWISE, which is direction B.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { BP_LINKS, BP_MARKED_SPIN, bpSpins } from './BeltPulley19P1Illustration'
import type { Spin } from './BeltPulley19P1Illustration'

export interface BeltPulleyStep {
  /** How many wheels have a resolved spin (1 = only the marked wheel). */
  resolved: number
  /** Spin of the wheel resolved on this beat (the "active" wheel). */
  activeSpin: Spin
  /** Index of the wheel resolved on this beat. */
  activeIndex: number
  /** Show the four direction-option chips. */
  showOptions: boolean
  /** Highlight the winning option (B). */
  highlightWinner: boolean
  result: boolean
  hold: number
  caption: string
}

export interface BeltPulleyStoryboard {
  steps: BeltPulleyStep[]
  finalIndex: number
  /** Resolved spin of every wheel. */
  spins: Spin[]
  /** Wheel A's spin. */
  answerSpin: Spin
  /** Winning option label. */
  answer: 'A' | 'B' | 'C' | 'D'
}

export function buildBeltPulley19P1Steps(lang: Lang): BeltPulleyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const spins = bpSpins()
  const spinWord = (s: Spin) => (s === 'cw' ? t('clockwise', 'searah jarum jam') : t('counter-clockwise', 'berlawanan jarum jam'))

  const steps: BeltPulleyStep[] = []

  // Beat 0 — the marked wheel.
  steps.push({
    resolved: 1,
    activeSpin: BP_MARKED_SPIN,
    activeIndex: 0,
    showOptions: false,
    highlightWinner: false,
    result: false,
    hold: 2200,
    caption: t(
      `The marked wheel spins ${spinWord(BP_MARKED_SPIN)}. A crossed belt flips the direction.`,
      `Roda yang ditandai berputar ${spinWord(BP_MARKED_SPIN)}. Sabuk menyilang membalik arah.`,
    ),
  })

  // One beat per belt link — flip and resolve the next wheel.
  const labelFor = ['W1', 'W2', 'W3', 'A']
  for (let i = 0; i < BP_LINKS.length; i++) {
    const link = BP_LINKS[i]
    const toIdx = link.to
    const sp = spins[toIdx]
    const last = toIdx === spins.length - 1
    steps.push({
      resolved: toIdx + 1,
      activeSpin: sp,
      activeIndex: toIdx,
      showOptions: false,
      highlightWinner: false,
      result: false,
      hold: 2000,
      caption: t(
        `Crossed belt to ${labelFor[toIdx]}: flip → ${spinWord(sp)}.` + (last ? ` That is wheel A.` : ''),
        `Sabuk menyilang ke ${labelFor[toIdx]}: balik → ${spinWord(sp)}.` + (last ? ` Itu roda A.` : ''),
      ),
    })
  }

  // Penultimate — present options.
  steps.push({
    resolved: spins.length,
    activeSpin: spins[spins.length - 1],
    activeIndex: spins.length - 1,
    showOptions: true,
    highlightWinner: false,
    result: false,
    hold: 2000,
    caption: t('Which arrow matches wheel A’s spin?', 'Panah mana yang cocok dengan putaran roda A?'),
  })

  // Result.
  steps.push({
    resolved: spins.length,
    activeSpin: spins[spins.length - 1],
    activeIndex: spins.length - 1,
    showOptions: true,
    highlightWinner: true,
    result: true,
    hold: 0,
    caption: t(
      `Wheel A spins ${spinWord(spins[spins.length - 1])} — direction B.`,
      `Roda A berputar ${spinWord(spins[spins.length - 1])} — arah B.`,
    ),
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    spins,
    answerSpin: spins[spins.length - 1],
    answer: 'B',
  }
}
