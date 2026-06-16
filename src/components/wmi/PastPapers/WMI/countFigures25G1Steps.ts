import type { Lang } from '../concepts/explainers/makeTenSteps'
import { OPTION_PAIRS } from './CountFigures25G1Option'
import type { FigureKind } from './CountFigures25G1Illustration'

// Storyboard for WMI-25F1A-Q14 (2025 Grade 1 Final, Paper A).
//
// "Count the 48 figures. Which two kinds appear in equal quantity?" → answer C.
//
// Method, one idea per beat:
//   1. goal     — tally each kind, then hunt for the matching pair.
//   2-6. tally  — rose 12, cosmos 12, blue 6, tulip 8, xflower 10 (show count).
//   7. recap    — all five counts together.
//   8-12. check — option A 8≠6, B 12≠10, C 12=12 ✓, D 6≠10, E 10≠8.
//   13. result  — only C is a matching pair → C.
//
// Pure builder of `lang` → ordered beats; deterministic, SSR-safe (no random/
// date/state). The tally is read straight off the transcribed scan so it can
// never drift from the printed paper.

export type CountFiguresPhase = 'goal' | 'tally' | 'recap' | 'check' | 'result'
export type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

// Counts of the 48 figures, transcribed from the scan (see the illustration).
export const FIGURE_COUNTS: Record<FigureKind, number> = {
  rose: 12,
  cosmos: 12,
  blue: 6,
  tulip: 8,
  xflower: 10,
}

// Order the tally is walked in (matches the reading order of the strip).
const TALLY_ORDER: FigureKind[] = ['rose', 'cosmos', 'blue', 'tulip', 'xflower']
const OPTION_ORDER: OptionLabel[] = ['A', 'B', 'C', 'D', 'E']

const NAME: Record<FigureKind, [string, string]> = {
  rose: ['roses', 'mawar'],
  cosmos: ['cosmos', 'kosmos'],
  blue: ['blue flowers', 'bunga biru'],
  tulip: ['tulips', 'tulip'],
  xflower: ['orange flowers', 'bunga oranye'],
}

export interface CountFiguresStep {
  phase: CountFiguresPhase
  /** Kind being tallied on a 'tally' beat, else null. */
  kind: FigureKind | null
  /** Kinds whose count is already known (drives the running tally chips). */
  tallied: FigureKind[]
  /** Option being checked on a 'check'/'result' beat, else null. */
  option: OptionLabel | null
  /** The checked pair's two counts, when on a 'check'/'result' beat. */
  pair: [FigureKind, FigureKind] | null
  /** True when the checked pair is equal (the match). */
  equal: boolean
  caption: string
  hold: number
  /** True only on the winning final beat. */
  result: boolean
}

export interface CountFiguresStoryboard {
  total: number
  answer: OptionLabel
  steps: CountFiguresStep[]
  finalIndex: number
}

export function buildCountFiguresSteps(lang: Lang): CountFiguresStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const nm = (k: FigureKind) => NAME[k][lang === 'id' ? 1 : 0]

  const steps: CountFiguresStep[] = []

  // 1) Goal.
  steps.push({
    phase: 'goal',
    kind: null,
    tallied: [],
    option: null,
    pair: null,
    equal: false,
    hold: 2600,
    result: false,
    caption: t(
      'First count each kind of flower. Then find the two kinds with the SAME number.',
      'Hitung dulu tiap jenis bunga. Lalu cari dua jenis yang jumlahnya SAMA.',
    ),
  })

  // 2-6) Tally each kind, one beat at a time, building a running list.
  const tallied: FigureKind[] = []
  for (const kind of TALLY_ORDER) {
    tallied.push(kind)
    steps.push({
      phase: 'tally',
      kind,
      tallied: [...tallied],
      option: null,
      pair: null,
      equal: false,
      hold: 1900,
      result: false,
      caption: t(
        `Count the ${nm(kind)}: ${FIGURE_COUNTS[kind]} of them.`,
        `Hitung ${nm(kind)}: ada ${FIGURE_COUNTS[kind]}.`,
      ),
    })
  }

  // 7) Recap — all five counts side by side.
  steps.push({
    phase: 'recap',
    kind: null,
    tallied: [...TALLY_ORDER],
    option: null,
    pair: null,
    equal: false,
    hold: 2600,
    result: false,
    caption: t(
      'All counted! Now check each choice: is the pair equal?',
      'Sudah dihitung! Sekarang cek tiap pilihan: apakah pasangannya sama?',
    ),
  })

  // 8-12) Check every option's pair. Equal ones win; unequal ones linger longer.
  for (const option of OPTION_ORDER) {
    const pair = OPTION_PAIRS[option]
    const a = FIGURE_COUNTS[pair[0]]
    const b = FIGURE_COUNTS[pair[1]]
    const equal = a === b
    steps.push({
      phase: 'check',
      kind: null,
      tallied: [...TALLY_ORDER],
      option,
      pair,
      equal,
      hold: equal ? 2600 : 2100,
      result: false,
      caption: equal
        ? t(
            `${option}: ${nm(pair[0])} ${a} and ${nm(pair[1])} ${b} — ${a} = ${b}, equal! ✓`,
            `${option}: ${nm(pair[0])} ${a} dan ${nm(pair[1])} ${b} — ${a} = ${b}, sama! ✓`,
          )
        : t(
            `${option}: ${nm(pair[0])} ${a} and ${nm(pair[1])} ${b} — ${a} ≠ ${b}, not equal. ✗`,
            `${option}: ${nm(pair[0])} ${a} dan ${nm(pair[1])} ${b} — ${a} ≠ ${b}, tidak sama. ✗`,
          ),
    })
  }

  // 13) Result — only C matched.
  const answer: OptionLabel = 'C'
  const winPair = OPTION_PAIRS[answer]
  steps.push({
    phase: 'result',
    kind: null,
    tallied: [...TALLY_ORDER],
    option: answer,
    pair: winPair,
    equal: true,
    hold: 0,
    result: true,
    caption: t(
      `Only ${answer} has a matching pair: ${nm(winPair[0])} ${FIGURE_COUNTS[winPair[0]]} = ${nm(winPair[1])} ${FIGURE_COUNTS[winPair[1]]}. Answer ${answer}.`,
      `Hanya ${answer} yang pasangannya sama: ${nm(winPair[0])} ${FIGURE_COUNTS[winPair[0]]} = ${nm(winPair[1])} ${FIGURE_COUNTS[winPair[1]]}. Jawaban ${answer}.`,
    ),
  })

  const total = TALLY_ORDER.reduce((sum, k) => sum + FIGURE_COUNTS[k], 0)
  return { total, answer, steps, finalIndex: steps.length - 1 }
}
