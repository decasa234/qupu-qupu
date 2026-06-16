import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TREE_RANKS } from './SpecialTrees25G1Illustration'

// Storyboard for WMI-25F1A-Q24 (2025 G1 final).
//
// 10 trees of different heights in a row, west -> east, as height RANKS
// (1 = shortest … 10 = tallest): [2, 1, 3, 4, 6, 5, 7, 9, 10, 8].
//
// A tree is "special" iff every tree to its WEST is shorter AND every tree to
// its EAST is taller — i.e. max(all west) < it < min(all east).
//
// The animation teaches the *test*: spotlight a candidate, read its tallest
// western neighbour (left-max) and its shortest eastern neighbour (right-min),
// then decide. We walk a couple of FAILURES first (a tree with a shorter tree
// to its east loses) so the rule earns its keep, then the three PASSES
// (positions 3, 4, 7), then flag all three and report the count: 3.
//
// Pure builder — deterministic, SSR-safe. Everything derives from TREE_RANKS so
// the figure and the logic can never drift apart.

export type SpecialTreesPhase = 'intro' | 'probe-pass' | 'probe-fail' | 'mark' | 'result'

export interface SpecialTreesStep {
  phase: SpecialTreesPhase
  /** 0-based index of the tree being tested this beat (null on intro/mark/result). */
  litTree: number | null
  /** When true, the three special trees get their check-mark badges. */
  markSpecial: boolean
  /** Tallest rank among all trees to the WEST (null when probing none / at west end). */
  leftMax: number | null
  /** Shortest rank among all trees to the EAST (null when probing none / at east end). */
  rightMin: number | null
  /** Running count of special trees confirmed so far. */
  found: number
  caption: string
  hold: number
  /** Did the candidate this beat pass the test? (used for verdict colour) */
  pass: boolean
  /** Final answer beat. */
  result: boolean
}

export interface SpecialTreesStoryboard {
  answer: number
  ranks: number[]
  /** 0-based indices of the special trees (west -> east). */
  specialIndices: number[]
  steps: SpecialTreesStep[]
  finalIndex: number
}

const COUNT = TREE_RANKS.length

/** Tallest rank strictly to the west of index i (null at the west end). */
function leftMaxOf(i: number): number | null {
  if (i === 0) return null
  return Math.max(...TREE_RANKS.slice(0, i))
}

/** Shortest rank strictly to the east of index i (null at the east end). */
function rightMinOf(i: number): number | null {
  if (i === COUNT - 1) return null
  return Math.min(...TREE_RANKS.slice(i + 1))
}

function isSpecial(i: number): boolean {
  const lm = leftMaxOf(i)
  const rm = rightMinOf(i)
  const here = TREE_RANKS[i]
  const westOk = lm === null || lm < here
  const eastOk = rm === null || here < rm
  return westOk && eastOk
}

export function buildSpecialTrees25G1Steps(lang: Lang): SpecialTreesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Derive the special set from the ranks (the load-bearing truth).
  const specialIndices: number[] = []
  for (let i = 0; i < COUNT; i++) if (isSpecial(i)) specialIndices.push(i)
  const answer = specialIndices.length

  const steps: SpecialTreesStep[] = []

  // 1) Set the goal.
  steps.push({
    phase: 'intro',
    litTree: null,
    markSpecial: false,
    leftMax: null,
    rightMin: null,
    found: 0,
    pass: false,
    result: false,
    hold: 1900,
    caption: t(
      'A tree is special if every tree to its west is shorter and every tree to its east is taller.',
      'Pohon istimewa: semua pohon di baratnya lebih pendek dan semua di timurnya lebih tinggi.',
    ),
  })

  // The probing script: a couple of failures, then the three passes — west -> east.
  // We pick failures that show different ways the test breaks.
  //  - pos 1 (index 0, rank 2): tree to its EAST is rank 1 (shorter) -> fails.
  //  - pos 5 (index 4, rank 6): tree to its EAST is rank 5 (shorter) -> fails.
  const probeOrder = [0, 2, 3, 4, 6]
  let found = 0
  for (const i of probeOrder) {
    const lm = leftMaxOf(i)
    const rm = rightMinOf(i)
    const here = TREE_RANKS[i]
    const pos = i + 1 // 1-based position for kid-facing captions
    const pass = isSpecial(i)
    if (pass) found += 1

    // Compose a short, concrete verdict line.
    const eastOk = rm === null || here < rm
    let caption: string
    if (pass) {
      caption = t(
        `Tree ${pos}: tallest to the west is ${lm}, shortest to the east is ${rm}. ${lm} < ${here} < ${rm} — special!`,
        `Pohon ${pos}: tertinggi di barat ${lm}, terpendek di timur ${rm}. ${lm} < ${here} < ${rm} — istimewa!`,
      )
    } else if (!eastOk) {
      // A shorter tree sits to the east.
      caption = t(
        `Tree ${pos}: but a shorter tree (height ${rm}) stands to its east — not special.`,
        `Pohon ${pos}: tapi ada pohon lebih pendek (tinggi ${rm}) di timurnya — bukan istimewa.`,
      )
    } else {
      // A taller tree sits to the west.
      caption = t(
        `Tree ${pos}: but a taller tree (height ${lm}) stands to its west — not special.`,
        `Pohon ${pos}: tapi ada pohon lebih tinggi (tinggi ${lm}) di baratnya — bukan istimewa.`,
      )
    }

    steps.push({
      phase: pass ? 'probe-pass' : 'probe-fail',
      litTree: i,
      markSpecial: false,
      leftMax: lm,
      rightMin: rm,
      found,
      pass,
      result: false,
      hold: pass ? 1900 : 2100, // failures linger so the rejection reads
      caption,
    })
  }

  // 2) Flag all three confirmed special trees at once.
  steps.push({
    phase: 'mark',
    litTree: null,
    markSpecial: true,
    leftMax: null,
    rightMin: null,
    found: answer,
    pass: true,
    result: false,
    hold: 1700,
    caption: t(
      `Trees 3, 4 and 7 each pass the test — three special trees in the row.`,
      `Pohon 3, 4, dan 7 lolos uji — ada tiga pohon istimewa di barisan.`,
    ),
  })

  // 3) Result.
  steps.push({
    phase: 'result',
    litTree: null,
    markSpecial: true,
    leftMax: null,
    rightMin: null,
    found: answer,
    pass: true,
    result: true,
    hold: 0,
    caption: t(`So there are ${answer} special trees.`, `Jadi ada ${answer} pohon istimewa.`),
  })

  return { answer, ranks: TREE_RANKS, specialIndices, steps, finalIndex: steps.length - 1 }
}
