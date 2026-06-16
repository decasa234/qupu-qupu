import type { Lang } from '../concepts/explainers/makeTenSteps'
import { UNIT_LEN, ANSWER } from './ShapePattern23G1Illustration'

// Storyboard for WMI-23F1A-Q11 (2023 Grade 1 final): find the position of the ▲
// (filled triangle) that has exactly 12 star shapes (☆ + ★) before it.
//
// Method (one idea per beat, deduce — never assert):
//   • The unit is 5 shapes: △ ▲ □ ☆ ★. The ▲ is shape #2, BEFORE the two stars
//     of its own unit — so a unit's two stars are counted only for LATER ▲s.
//   • Stars before the ▲ of unit n (1-indexed) = 2(n − 1). Walk the running
//     star count one unit at a time: 0 → 2 → 4 → 6 → 8 → 10 → 12.
//   • 12 stars is reached at unit 7; that ▲ sits at position 5×6 + 2 = 32.
//
// Pure function of `lang` only: no Math.random, no Date — SSR-safe & deterministic.

export const TARGET_STARS = 12

export type ShapePatternPhase = 'intro' | 'walk' | 'place' | 'result'

export interface ShapePatternStep {
  phase: ShapePatternPhase
  /** 1-indexed unit whose ▲ we are inspecting this beat (null on intro/result). */
  unit: number | null
  /** Stars counted BEFORE that unit's ▲ = 2(unit − 1). */
  starsBefore: number
  /** 1-based global position of that unit's ▲ = 5(unit − 1) + 2 (null on intro). */
  trianglePos: number | null
  /** How many shapes the strip should reveal star-tallies for (revealCountUpTo). */
  revealUpTo: number | null
  /** Position to ring on the strip, or null. */
  markPos: number | null
  /** True once the running tally has hit the target (the landing unit + result). */
  hit: boolean
  result: boolean
  caption: string
  /** ms to linger before auto-advancing; the winner is last with hold 0. */
  hold: number
}

export interface ShapePatternStoryboard {
  target: number
  answer: number
  unitLen: number
  /** 1-indexed unit whose ▲ wins (where 2(n−1) = target). */
  winningUnit: number
  steps: ShapePatternStep[]
  finalIndex: number
}

/** 1-based global position of the ▲ in unit n (1-indexed). ▲ is shape #2. */
function trianglePosOf(unit: number): number {
  return UNIT_LEN * (unit - 1) + 2
}

export function buildShapePattern23G1Steps(lang: Lang): ShapePatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // 2(n − 1) = target ⇒ n = target / 2 + 1.
  const winningUnit = TARGET_STARS / 2 + 1 // 7

  const steps: ShapePatternStep[] = [
    {
      phase: 'intro',
      unit: null,
      starsBefore: 0,
      trianglePos: null,
      revealUpTo: null,
      markPos: null,
      hit: false,
      result: false,
      hold: 2000,
      caption: t(
        'Find the ▲ with exactly 12 stars (☆ + ★) before it.',
        'Cari ▲ yang punya tepat 12 bintang (☆ + ★) sebelumnya.',
      ),
    },
    {
      phase: 'intro',
      unit: null,
      starsBefore: 0,
      trianglePos: null,
      revealUpTo: UNIT_LEN, // tally the first unit's stars
      markPos: null,
      hit: false,
      result: false,
      hold: 2100,
      caption: t(
        'Each unit △ ▲ □ ☆ ★ adds 2 stars — and they come AFTER its ▲.',
        'Tiap unit △ ▲ □ ☆ ★ menambah 2 bintang — dan letaknya SETELAH ▲-nya.',
      ),
    },
  ]

  // Walk the running star count one unit at a time, inspecting each unit's ▲.
  for (let unit = 1; unit <= winningUnit; unit++) {
    const starsBefore = 2 * (unit - 1)
    const pos = trianglePosOf(unit)
    const isHit = starsBefore === TARGET_STARS
    const revealUpTo = pos // tally every star strictly before this ▲

    if (isHit) {
      // Reached 12 — stop walking and place the ring on this ▲.
      steps.push({
        phase: 'place',
        unit,
        starsBefore,
        trianglePos: pos,
        revealUpTo,
        markPos: pos,
        hit: true,
        result: false,
        hold: 2100,
        caption: t(
          `Unit ${unit}: that's 12 stars before its ▲ — this is the one!`,
          `Unit ${unit}: tepat 12 bintang sebelum ▲-nya — inilah jawabannya!`,
        ),
      })
    } else {
      const remaining = TARGET_STARS - starsBefore
      steps.push({
        phase: 'walk',
        unit,
        starsBefore,
        trianglePos: pos,
        revealUpTo,
        markPos: null,
        hit: false,
        result: false,
        hold: 1700,
        caption: t(
          `Unit ${unit}'s ▲: ${starsBefore} stars before it — need ${remaining} more.`,
          `▲ unit ${unit}: ${starsBefore} bintang sebelumnya — kurang ${remaining} lagi.`,
        ),
      })
    }
  }

  // Final beat: lands on the answer, keeps the ring lit.
  const winPos = trianglePosOf(winningUnit) // 32
  steps.push({
    phase: 'result',
    unit: winningUnit,
    starsBefore: TARGET_STARS,
    trianglePos: winPos,
    revealUpTo: winPos,
    markPos: winPos,
    hit: true,
    result: true,
    hold: 0,
    caption: t(
      `Position ${UNIT_LEN}×${winningUnit - 1} + 2 = ${winPos}.`,
      `Posisi ${UNIT_LEN}×${winningUnit - 1} + 2 = ${winPos}.`,
    ),
  })

  return {
    target: TARGET_STARS,
    answer: ANSWER, // 32
    unitLen: UNIT_LEN,
    winningUnit,
    steps,
    finalIndex: steps.length - 1,
  }
}
