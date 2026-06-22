/**
 * IKMC-21-EC-Q5 — storyboard for the shooting-target explainer.
 *
 * Question: Five boys competed in a shooting challenge. Ricky scored the most
 * points. Which target was Ricky's?
 * Answer: E (8 + 9 + 10 = 27 — highest score).
 *
 * Ring scoring: bull = 10, next = 9, next = 8, outer = 7.
 * Each boy fired exactly 3 arrows.
 *
 * Scores per target:
 *   A: 7 + 7 + 8  = 22
 *   B: 7 + 7 + 9  = 23
 *   C: 7 + 8 + 8  = 23
 *   D: 7 + 8 + 9  = 24
 *   E: 8 + 9 + 10 = 27  ← Ricky's (highest!)
 *
 * Teaching walk, one idea per beat:
 *   0. intro    — rings are scored 10 → 9 → 8 → 7; add the 3 arrow values.
 *   1. targetA  — A: 7+7+8 = 22.
 *   2. targetB  — B: 7+7+9 = 23.
 *   3. targetC  — C: 7+8+8 = 23.
 *   4. targetD  — D: 7+8+9 = 24.
 *   5. targetE  — E: 8+9+10 = 27 — highest!
 *   6. result   — Ricky's target is E.
 *
 * Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.
 */

export type Lang = 'en' | 'id'

export type TargetPhaseId =
  | 'intro'
  | 'targetA'
  | 'targetB'
  | 'targetC'
  | 'targetD'
  | 'targetE'
  | 'result'

export interface TargetBeat {
  /** Animation phase id. */
  phase: TargetPhaseId
  /** Which option label is being scored ('A'…'E', or null for non-target beats). */
  activeOption: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Which ring to visually highlight (7–10), or null. */
  highlightRing: 7 | 8 | 9 | 10 | null
  /** Equation chip text ('7+7+8 = 22'), or '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TargetStoryboard {
  steps: TargetBeat[]
  finalIndex: number
}

export function buildTargets5ECSteps(lang: Lang): TargetStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TargetBeat[] = [
    // Beat 0 — intro: explain ring scoring
    {
      phase: 'intro',
      activeOption: null,
      highlightRing: null,
      equation: '10 → 9 → 8 → 7',
      hold: 2400,
      result: false,
      caption: t(
        'Rings score 10 (bull), 9, 8, 7 (outer). Each boy shot 3 arrows — add the 3 ring values to get his total.',
        'Cincin dinilai 10 (tengah), 9, 8, 7 (luar). Setiap anak menembakkan 3 anak panah — jumlahkan 3 nilai cincin untuk mendapat totalnya.',
      ),
    },

    // Beat 1 — target A
    {
      phase: 'targetA',
      activeOption: 'A',
      highlightRing: 7,
      equation: '7 + 7 + 8 = 22',
      hold: 2200,
      result: false,
      caption: t(
        'Target A: 2 arrows in ring 7, 1 in ring 8 → 7 + 7 + 8 = 22 points.',
        'Target A: 2 panah di cincin 7, 1 di cincin 8 → 7 + 7 + 8 = 22 poin.',
      ),
    },

    // Beat 2 — target B
    {
      phase: 'targetB',
      activeOption: 'B',
      highlightRing: 7,
      equation: '7 + 7 + 9 = 23',
      hold: 2200,
      result: false,
      caption: t(
        'Target B: 2 arrows in ring 7, 1 in ring 9 → 7 + 7 + 9 = 23 points.',
        'Target B: 2 panah di cincin 7, 1 di cincin 9 → 7 + 7 + 9 = 23 poin.',
      ),
    },

    // Beat 3 — target C
    {
      phase: 'targetC',
      activeOption: 'C',
      highlightRing: 8,
      equation: '7 + 8 + 8 = 23',
      hold: 2200,
      result: false,
      caption: t(
        'Target C: 1 arrow in ring 7, 2 in ring 8 → 7 + 8 + 8 = 23 points.',
        'Target C: 1 panah di cincin 7, 2 di cincin 8 → 7 + 8 + 8 = 23 poin.',
      ),
    },

    // Beat 4 — target D
    {
      phase: 'targetD',
      activeOption: 'D',
      highlightRing: 9,
      equation: '7 + 8 + 9 = 24',
      hold: 2200,
      result: false,
      caption: t(
        'Target D: 1 in ring 7, 1 in ring 8, 1 in ring 9 → 7 + 8 + 9 = 24 points.',
        'Target D: 1 di cincin 7, 1 di cincin 8, 1 di cincin 9 → 7 + 8 + 9 = 24 poin.',
      ),
    },

    // Beat 5 — target E (the answer!)
    {
      phase: 'targetE',
      activeOption: 'E',
      highlightRing: 10,
      equation: '8 + 9 + 10 = 27',
      hold: 2400,
      result: false,
      caption: t(
        'Target E: 1 in ring 8, 1 in ring 9, 1 in the bull (10) → 8 + 9 + 10 = 27 — the highest score!',
        'Target E: 1 di cincin 8, 1 di cincin 9, 1 di tengah (10) → 8 + 9 + 10 = 27 — skor tertinggi!',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      activeOption: 'E',
      highlightRing: 10,
      equation: '27 > 24 > 23 > 22 → E',
      hold: 0,
      result: true,
      caption: t(
        'Ricky scored the most points: 27. His target is E.',
        'Ricky mendapat poin terbanyak: 27. Target miliknya adalah E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
