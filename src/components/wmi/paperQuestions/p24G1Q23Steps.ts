// Storyboard for WMI-24P1A-Q23 (2024 Semifinal Grade 1 Paper A).
//
// Question: two worked examples show how two 3×3 dot grids combine into a
// result grid; apply the SAME rule to a third pair and pick the matching
// option. The choices were images in the source paper (shown as placeholder
// labels A–E), so this explainer DERIVES the result grid and labels it C.
//
// Rule discovered from the examples (XOR per cell):
//   both grids have a dot  → result cell empty (they cancel),
//   exactly one has a dot  → result keeps the dot.
//
// Beats:
//   1) Look at the worked examples — there is one combining rule.
//   2) State the rule (overlapping dots cancel).
//   3) On the third pair, tint the cells where BOTH have a dot — those cancel.
//   4) Reveal the computed result grid (the only one matching) → option C.
//
// Pure (lang) => storyboard. Deterministic: no Math.random / Date. SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q23_ANSWER_LETTER } from './P24G1Q23Illustration'

export type Q23Phase = 'show' | 'rule' | 'cancel' | 'result'

export interface Q23Step {
  phase: Q23Phase
  showCancel: boolean
  showResult: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q23Storyboard {
  answerLetter: string
  steps: Q23Step[]
  finalIndex: number
}

export function buildP24G1Q23Steps(lang: Lang): Q23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q23Step[] = [
    {
      phase: 'show',
      showCancel: false,
      showResult: false,
      hold: 1900,
      result: false,
      caption: t(
        'Read the worked example to find the one combining rule.',
        'Baca contoh yang sudah jadi untuk menemukan satu aturan penggabungan.',
      ),
    },
    {
      phase: 'rule',
      showCancel: false,
      showResult: false,
      hold: 2200,
      result: false,
      caption: t(
        'Rule: where BOTH grids have a dot, it cancels (empty). Where only ONE has a dot, the dot stays.',
        'Aturan: jika KEDUA kisi punya titik, saling meniadakan (kosong). Jika hanya SATU yang punya, titik tetap ada.',
      ),
    },
    {
      phase: 'cancel',
      showCancel: true,
      showResult: false,
      hold: 2300,
      result: false,
      caption: t(
        'Third pair: the highlighted cells have a dot in BOTH grids, so they cancel to empty.',
        'Pasangan ketiga: sel yang disorot punya titik di KEDUA kisi, jadi saling meniadakan menjadi kosong.',
      ),
    },
    {
      phase: 'result',
      showCancel: false,
      showResult: true,
      hold: 0,
      result: true,
      caption: t(
        `Keep the single dots, drop the overlaps — this result is option ${Q23_ANSWER_LETTER}.`,
        `Pertahankan titik tunggal, buang yang bertumpuk — hasil ini adalah opsi ${Q23_ANSWER_LETTER}.`,
      ),
    },
  ]

  return {
    answerLetter: Q23_ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
