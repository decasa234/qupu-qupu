import type { Lang } from '../concepts/explainers/makeTenSteps'

/**
 * WMI-23F1A-Q12 (2023 Grade 1 Final, Paper A) — bracelet length ordering.
 *
 * Storyboard for the post-answer explainer. PURE builder: `(lang) => steps`.
 * No random / no dates — deterministic and SSR-safe.
 *
 * Method (one bracelet per beat):
 *   1. State the goal: straighten each bracelet, then order longest -> shortest.
 *   2. Straighten Alice, add up her beads  -> 23 cm.
 *   3. Straighten Becky, add up her beads  -> 19 cm.
 *   4. Straighten Chloe, add up her beads  -> 18 cm.
 *   5. Line all three up (longest -> shortest) with the totals showing.
 *   6. Result: 23 > 19 > 18  ->  Alice, Becky, Chloe  (B).
 *
 * Bead legend (from the figure): big square = 3, big circle = 2,
 * small circle = 1, small diamond = 1.  Sums below match the confirmed totals.
 */

export type BraceletPhase = 'goal' | 'measure' | 'order' | 'result'

/** A `count × cm` term shown while we tally one bracelet's beads. */
export interface BeadTerm {
  /** how many beads of this length */
  count: number
  /** length of one such bead, in cm */
  cm: number
}

export interface BraceletStep {
  phase: BraceletPhase
  /** Whose bracelet this beat is measuring (measure phase only). */
  name: string | null
  /** Straighten the bracelets on this beat? */
  straighten: boolean
  /** Reveal the blue total bars on this beat? */
  revealLengths: boolean
  /** Row order top -> bottom by name. */
  order: string[]
  /** Bead-length terms making up this bracelet's sum (measure phase). */
  terms: BeadTerm[]
  /** This bracelet's total length in cm, or null. */
  total: number | null
  caption: string
  hold: number
  /** True only on the final winning beat. */
  result: boolean
}

export interface BraceletStoryboard {
  /** Names ordered longest -> shortest (the answer). */
  orderedNames: string[]
  /** Totals keyed by name. */
  totals: Record<string, number>
  steps: BraceletStep[]
  finalIndex: number
}

const SOURCE_ORDER = ['Alice', 'Becky', 'Chloe']
const ANSWER_ORDER = ['Alice', 'Becky', 'Chloe'] // 23 > 19 > 18

// Bead-length breakdown per bracelet (cm). Sums = confirmed totals.
//   Alice: 4×3 + 4×2 + 2×1 + 1×1 = 12 + 8 + 2 + 1 = 23
//   Becky: 2×3 + 4×2 + 4×1 + 1×1 =  6 + 8 + 4 + 1 = 19
//   Chloe: 4×3 + 1×2 + 2×1 + 2×1 = 12 + 2 + 2 + 2 = 18
const TERMS: Record<string, BeadTerm[]> = {
  Alice: [
    { count: 4, cm: 3 },
    { count: 4, cm: 2 },
    { count: 2, cm: 1 },
    { count: 1, cm: 1 },
  ],
  Becky: [
    { count: 2, cm: 3 },
    { count: 4, cm: 2 },
    { count: 4, cm: 1 },
    { count: 1, cm: 1 },
  ],
  Chloe: [
    { count: 4, cm: 3 },
    { count: 1, cm: 2 },
    { count: 2, cm: 1 },
    { count: 2, cm: 1 },
  ],
}

function sumTerms(terms: BeadTerm[]): number {
  return terms.reduce((s, term) => s + term.count * term.cm, 0)
}

/** "4×3 + 4×2 + 2×1 + 1×1" — the running bead-length addition for a caption. */
function termsExpr(terms: BeadTerm[]): string {
  return terms.map((term) => `${term.count}×${term.cm}`).join(' + ')
}

export function buildBracelets23G1Steps(lang: Lang): BraceletStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const totals: Record<string, number> = {
    Alice: sumTerms(TERMS.Alice),
    Becky: sumTerms(TERMS.Becky),
    Chloe: sumTerms(TERMS.Chloe),
  }

  const steps: BraceletStep[] = []

  // 1) Goal — coiled bracelets, no totals yet.
  steps.push({
    phase: 'goal',
    name: null,
    straighten: false,
    revealLengths: false,
    order: SOURCE_ORDER,
    terms: [],
    total: null,
    hold: 1900,
    result: false,
    caption: t(
      'Straighten each bracelet, then line them up longest to shortest.',
      'Luruskan tiap gelang, lalu urutkan dari terpanjang ke terpendek.',
    ),
  })

  // 2) Measure each bracelet, one beat each. Straightened; reveal grows in.
  SOURCE_ORDER.forEach((name) => {
    const terms = TERMS[name]
    const tot = totals[name]
    steps.push({
      phase: 'measure',
      name,
      straighten: true,
      revealLengths: true,
      order: SOURCE_ORDER,
      terms,
      total: tot,
      hold: 2100,
      result: false,
      caption: t(
        `${name}: ${termsExpr(terms)} = ${tot} cm.`,
        `${name}: ${termsExpr(terms)} = ${tot} cm.`,
      ),
    })
  })

  // 3) Reorder longest -> shortest, totals still showing.
  steps.push({
    phase: 'order',
    name: null,
    straighten: true,
    revealLengths: true,
    order: ANSWER_ORDER,
    terms: [],
    total: null,
    hold: 1900,
    result: false,
    caption: t(
      `Now sort the lengths: ${totals.Alice} > ${totals.Becky} > ${totals.Chloe}.`,
      `Sekarang urutkan panjangnya: ${totals.Alice} > ${totals.Becky} > ${totals.Chloe}.`,
    ),
  })

  // 4) Result — the answer.
  steps.push({
    phase: 'result',
    name: null,
    straighten: true,
    revealLengths: true,
    order: ANSWER_ORDER,
    terms: [],
    total: null,
    hold: 0,
    result: true,
    caption: t(
      `${totals.Alice} > ${totals.Becky} > ${totals.Chloe} → Alice, Becky, Chloe (B).`,
      `${totals.Alice} > ${totals.Becky} > ${totals.Chloe} → Alice, Becky, Chloe (B).`,
    ),
  })

  return {
    orderedNames: ANSWER_ORDER,
    totals,
    steps,
    finalIndex: steps.length - 1,
  }
}
