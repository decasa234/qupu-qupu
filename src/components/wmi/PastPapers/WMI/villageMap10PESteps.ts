// IKMC-20-PE-Q10 — storyboard for the village-map road-count animation.
//
// Question: "A village of 12 houses has four straight roads and four circular
// roads. The map shows 11 of the houses. On each straight road there are 3
// houses. On each circular road there are also 3 houses. Where on the map
// should the 12th house be put?" Answer: C
//
// Layout (reconstructed from constraint analysis — see VillageMap10PEIllustration):
//   Candidates: A=Right-r3, B=Top-r1, C=Right-r4, D=Bottom-r2, E=Left-r4
//   Houses (11): Top-r2,r3,r4 | Right-r1,r2 | Bottom-r1,r3,r4 | Left-r1,r2,r3
//   Deficient roads: Right spoke (2/3) and Ring 4 (2/3).
//   Only C (Right×Ring4) is the intersection of both → unique valid answer.
//
// Beat sequence:
//   0. Intro       — plain map, explain the rule (3 per road).
//   1. Right spoke — highlight the right spoke, count shows 2/3 houses.
//   2. Ring 4      — highlight ring 4, count shows 2/3 houses.
//   3. Both        — highlight both roads simultaneously, pinpoint intersection = C.
//   4. Result      — confirm C in green.
//
// Pure (correctAnswer, lang) → storyboard. Deterministic: no Math.random, no Date.

import type { HighlightRoad } from './VillageMap10PEIllustration'

export type VillageMapPhase = 'intro' | 'right-spoke' | 'ring4' | 'both' | 'result'

export interface VillageMap10PEStep {
  phase: VillageMapPhase
  highlightRoad: HighlightRoad
  highlightAnswer: boolean
  caption: string
  /** Short road-count badge shown beneath the map, or null on intro/result. */
  badge: string | null
  hold: number
  result: boolean
}

export interface VillageMap10PEStoryboard {
  steps: VillageMap10PEStep[]
  finalIndex: number
}

type Lang = 'en' | 'id'

export function buildVillageMap10PESteps(
  _correctAnswer: string,
  lang: Lang,
): VillageMap10PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: VillageMap10PEStep[] = [
    // ── Beat 0: Intro ──────────────────────────────────────────────────────
    {
      phase: 'intro',
      highlightRoad: null,
      highlightAnswer: false,
      caption: t(
        'Each straight road and each circular road must have exactly 3 houses. One house is missing — find where it goes.',
        'Setiap jalan lurus dan jalan melingkar harus punya tepat 3 rumah. Satu rumah hilang — temukan di mana letaknya.',
      ),
      badge: null,
      hold: 2400,
      result: false,
    },

    // ── Beat 1: Right spoke — only 2 houses ────────────────────────────────
    {
      phase: 'right-spoke',
      highlightRoad: 'right-spoke',
      highlightAnswer: false,
      caption: t(
        'The right road (straight) has only 2 houses — it needs 1 more.',
        'Jalan kanan (lurus) hanya punya 2 rumah — butuh 1 lagi.',
      ),
      badge: t('Right road: 2 / 3 houses', 'Jalan kanan: 2 / 3 rumah'),
      hold: 2200,
      result: false,
    },

    // ── Beat 2: Ring 4 — only 2 houses ────────────────────────────────────
    {
      phase: 'ring4',
      highlightRoad: 'ring4',
      highlightAnswer: false,
      caption: t(
        'The outer circular road (ring 4) also has only 2 houses — it needs 1 more.',
        'Jalan melingkar terluar (cincin 4) juga hanya punya 2 rumah — butuh 1 lagi.',
      ),
      badge: t('Outer ring: 2 / 3 houses', 'Cincin terluar: 2 / 3 rumah'),
      hold: 2200,
      result: false,
    },

    // ── Beat 3: Both — intersection is C ─────────────────────────────────
    {
      phase: 'both',
      highlightRoad: 'both',
      highlightAnswer: false,
      caption: t(
        'The missing house must lie on BOTH the right road and the outer ring at the same time. That intersection is position C!',
        'Rumah yang hilang harus berada di jalan kanan DAN cincin terluar sekaligus. Persimpangan itu adalah posisi C!',
      ),
      badge: t('Right road ∩ Outer ring = C', 'Jalan kanan ∩ Cincin terluar = C'),
      hold: 2600,
      result: false,
    },

    // ── Beat 4: Result ────────────────────────────────────────────────────
    {
      phase: 'result',
      highlightRoad: 'both',
      highlightAnswer: true,
      caption: t(
        'Place the 12th house at C — every straight road and every circular road now has exactly 3 houses. Answer: C.',
        'Letakkan rumah ke-12 di C — setiap jalan lurus dan jalan melingkar kini punya tepat 3 rumah. Jawaban: C.',
      ),
      badge: null,
      hold: 0,
      result: true,
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
