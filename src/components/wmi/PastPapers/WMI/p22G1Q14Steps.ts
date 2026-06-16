import type { Lang } from '../concepts/explainers/makeTenSteps'
import { DESSERT_GRID, DESSERT_KINDS, DESSERT_LABEL, frequencyOfKind, type DessertKind } from './P22G1Q14Illustration'

// WMI-22P1A-Q14 (2022 Semifinal Grade 1): which single dessert appears the MOST
// often in the 3x10 grid?  Method, one idea per beat:
//   1. show the grid and say "count each kind";
//   2..n. wash each dessert kind in turn and announce its count;
//   result: the donut wins (11) — option B.
//
// The original options were dessert pictures, so the seed key is the option
// LETTER (B); the explainer derives WHICH dessert that is (the donut) by the
// tally and states the letter.

export type DessertPhase = 'show' | 'tally' | 'result'

export interface DessertStep {
  phase: DessertPhase
  /** Kind whose cells light up on this beat, or null. */
  highlight: DessertKind | null
  caption: string
  hold: number
  result: boolean
}

export interface DessertStoryboard {
  /** Each kind with its count, in descending count order. */
  counts: ReadonlyArray<{ kind: DessertKind; count: number }>
  /** The winning (most frequent) kind. */
  most: { kind: DessertKind; count: number }
  /** The option letter the seed answer points to. */
  answerLetter: string
  steps: DessertStep[]
  finalIndex: number
}

export function buildP22G1Q14Steps(lang: Lang, answerLetter: string): DessertStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Tally every kind (derived from the grid — single source of truth).
  // Iterate in a fixed kind order for determinism, then sort by count desc with
  // a stable kind-order tie-break.
  const order = DESSERT_KINDS
  const counts = order
    .map((kind) => ({ kind, count: frequencyOfKind(kind) }))
    .sort((a, b) => b.count - a.count || order.indexOf(a.kind) - order.indexOf(b.kind))

  const most = counts[0]
  const total = DESSERT_GRID.flat().length

  const label = (k: DessertKind) => (lang === 'id' ? DESSERT_LABEL[k] : DESSERT_LABEL[k])

  const steps: DessertStep[] = [
    {
      phase: 'show',
      highlight: null,
      hold: 1900,
      result: false,
      caption: t(
        `There are ${total} cells. Tally each kind of dessert.`,
        `Ada ${total} kotak. Hitung tiap jenis makanan penutup.`,
      ),
    },
    // One beat per kind, in descending-count order so the winner is built up to.
    ...counts.map<DessertStep>((c) => ({
      phase: 'tally',
      highlight: c.kind,
      hold: 1800,
      result: false,
      caption: t(
        `${label(c.kind)}: ${c.count}.`,
        `${label(c.kind)}: ${c.count}.`,
      ),
    })),
    {
      phase: 'result',
      highlight: most.kind,
      hold: 0,
      result: true,
      caption: t(
        `${label(most.kind)} wins — ${most.count} times. That is option ${answerLetter}.`,
        `${label(most.kind)} menang — ${most.count} kali. Itu pilihan ${answerLetter}.`,
      ),
    },
  ]

  return { counts, most, answerLetter, steps, finalIndex: steps.length - 1 }
}
