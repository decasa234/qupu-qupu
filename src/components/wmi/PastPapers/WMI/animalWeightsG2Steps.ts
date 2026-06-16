import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { PIG, MONKEY, COW, ELEPHANT, SEESAWS, ORDER_HEAVY_TO_LIGHT } from './AnimalWeightsG2Illustration'
import type { AnimalEmoji } from './AnimalWeightsG2Illustration'

export type WeightPhase = 'show' | 'compare' | 'chain' | 'result'

export interface AnimalWeightsStep {
  phase: WeightPhase
  /** Which seesaw (0..2) to glow, or -1 for none. */
  glowIndex: number
  /** Partial / full heaviest→lightest chain to show below, or empty. */
  chain: AnimalEmoji[]
  /** Highlight the answer option with this label, or null. */
  highlightOption: 'A' | 'B' | 'C' | 'D' | null
  caption: string
  hold: number
  result: boolean
}

export interface AnimalWeightsStoryboard {
  steps: AnimalWeightsStep[]
  finalIndex: number
}

/** The heavier emoji of a seesaw (the side that tilts down). */
function heavierOf(i: number): AnimalEmoji {
  const s = SEESAWS[i]
  return s.heavy === 'left' ? s.left : s.right
}
/** The lighter emoji of a seesaw. */
function lighterOf(i: number): AnimalEmoji {
  const s = SEESAWS[i]
  return s.heavy === 'left' ? s.right : s.left
}

/**
 * Storyboard: read each seesaw's winner, chain into the full order, then point
 * at option C.
 *   1. 🐷 > 🐵   2. 🐄 > 🐷   3. 🐘 > 🐄
 * Chain: 🐘 > 🐄 > 🐷 > 🐵 → option C.
 */
export function buildAnimalWeightsG2Steps(lang: Lang): AnimalWeightsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimalWeightsStep[] = [
    {
      phase: 'show',
      glowIndex: -1,
      chain: [],
      highlightOption: null,
      hold: 1800,
      result: false,
      caption: t(
        'On each seesaw, the heavier animal sits LOWER.',
        'Pada setiap jungkat-jungkit, hewan yang lebih berat berada di BAWAH.',
      ),
    },
    {
      phase: 'compare',
      glowIndex: 0,
      chain: [],
      highlightOption: null,
      hold: 1700,
      result: false,
      caption: t(
        `Seesaw 1: ${heavierOf(0)} is lower than ${lighterOf(0)} → ${heavierOf(0)} > ${lighterOf(0)}.`,
        `Jungkat 1: ${heavierOf(0)} lebih rendah dari ${lighterOf(0)} → ${heavierOf(0)} > ${lighterOf(0)}.`,
      ),
    },
    {
      phase: 'compare',
      glowIndex: 1,
      chain: [],
      highlightOption: null,
      hold: 1700,
      result: false,
      caption: t(
        `Seesaw 2: ${heavierOf(1)} is lower than ${lighterOf(1)} → ${heavierOf(1)} > ${lighterOf(1)}.`,
        `Jungkat 2: ${heavierOf(1)} lebih rendah dari ${lighterOf(1)} → ${heavierOf(1)} > ${lighterOf(1)}.`,
      ),
    },
    {
      phase: 'compare',
      glowIndex: 2,
      chain: [],
      highlightOption: null,
      hold: 1700,
      result: false,
      caption: t(
        `Seesaw 3: ${heavierOf(2)} is lower than ${lighterOf(2)} → ${heavierOf(2)} > ${lighterOf(2)}.`,
        `Jungkat 3: ${heavierOf(2)} lebih rendah dari ${lighterOf(2)} → ${heavierOf(2)} > ${lighterOf(2)}.`,
      ),
    },
    {
      phase: 'chain',
      glowIndex: -1,
      chain: [ELEPHANT, COW, PIG, MONKEY],
      highlightOption: null,
      hold: 2000,
      result: false,
      caption: t(
        `Chain them: ${ELEPHANT} > ${COW} > ${PIG} > ${MONKEY}.`,
        `Rantai semuanya: ${ELEPHANT} > ${COW} > ${PIG} > ${MONKEY}.`,
      ),
    },
    {
      phase: 'result',
      glowIndex: -1,
      chain: ORDER_HEAVY_TO_LIGHT,
      highlightOption: 'C',
      hold: 0,
      result: true,
      caption: t(
        `Heaviest → lightest: ${ELEPHANT} ${COW} ${PIG} ${MONKEY} → option C.`,
        `Terberat → teringan: ${ELEPHANT} ${COW} ${PIG} ${MONKEY} → pilihan C.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
