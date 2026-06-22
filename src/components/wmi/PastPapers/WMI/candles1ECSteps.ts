// Storyboard for IKMC-23-EC-Q1 — "Which candle stopped burning first?"
//
// 5 identical candles lit simultaneously, stop at different times.
// Post-burn heights (from OCR source image 2023.imgs/001.jpg):
//   D (tallest) > B > A > C > E (shortest)
//
// Key insight: a candle that stops burning EARLY has burned LESS wax →
//   it is TALLER now. So the tallest candle = stopped FIRST.
// Trap: the shortest candle (E) burned the MOST wax → it stopped LAST.
//
// Beats:
//   0 — Intro: show the five candles, state the setup.
//   1 — Rule: "stopped early → burned less → still tall".
//   2 — Scan: highlight E (shortest) — it burned the MOST, stopped LAST.
//   3 — Scan: highlight D (tallest) — it burned the LEAST, stopped FIRST.
//   4 — Result: winner D revealed in green.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { CandleName } from './Candles1ECIllustration'
import { CANDLE_HEIGHTS } from './Candles1ECIllustration'

export const CANDLES_1_EC_ANSWER = 'Candle D'
export const CANDLES_1_EC_CHOICE = 'D'

export interface Candles1ECStep {
  phase: string
  /** Heights map fed to <CandleRow />. */
  heights: Record<CandleName, number>
  /** Candles to highlight in amber this beat. */
  highlight: CandleName[]
  /** When set, ring this candle green (the winner reveal). */
  winner?: CandleName
  caption: string
  hold: number
  result: boolean
}

export interface Candles1ECStoryboard {
  answer: string
  steps: Candles1ECStep[]
  finalIndex: number
}

export function buildCandles1ECSteps(lang: Lang): Candles1ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Candles1ECStep[] = [
    {
      phase: 'intro',
      heights: CANDLE_HEIGHTS,
      highlight: [],
      hold: 2400,
      result: false,
      caption: t(
        'Akira lit 5 identical candles at the SAME time. They stopped burning at different times. Now they look like this — different heights.',
        'Akira menyalakan 5 lilin identik pada WAKTU YANG SAMA. Mereka berhenti menyala pada waktu berbeda. Sekarang tingginya berbeda-beda.',
      ),
    },
    {
      phase: 'rule',
      heights: CANDLE_HEIGHTS,
      highlight: [],
      hold: 2400,
      result: false,
      caption: t(
        'Key rule: a candle that stops burning EARLY burns less wax → it is still TALLER. A candle that burns longest becomes the SHORTEST.',
        'Aturan kunci: lilin yang berhenti LEBIH AWAL membakar lebih sedikit lilin → masih lebih TINGGI. Lilin yang paling lama menyala menjadi yang paling PENDEK.',
      ),
    },
    {
      phase: 'trap',
      heights: CANDLE_HEIGHTS,
      highlight: ['E'],
      hold: 2200,
      result: false,
      caption: t(
        'Candle E is the SHORTEST — it burned the MOST wax, which means it kept burning the longest. E stopped LAST, not first.',
        'Lilin E paling PENDEK — ia membakar paling banyak lilin, artinya ia menyala paling lama. E berhenti paling TERAKHIR, bukan pertama.',
      ),
    },
    {
      phase: 'winner',
      heights: CANDLE_HEIGHTS,
      highlight: ['D'],
      hold: 2200,
      result: false,
      caption: t(
        'Candle D is the TALLEST — it burned the LEAST wax. That means D stopped burning the EARLIEST of all five candles.',
        'Lilin D paling TINGGI — ia membakar paling sedikit lilin. Artinya D berhenti menyala paling AWAL di antara kelima lilin.',
      ),
    },
    {
      phase: 'result',
      heights: CANDLE_HEIGHTS,
      highlight: [],
      winner: 'D',
      hold: 0,
      result: true,
      caption: t(
        `Tallest candle = burned least = stopped first. Candle D is the tallest → Answer: ${CANDLES_1_EC_CHOICE}.`,
        `Lilin tertinggi = paling sedikit terbakar = berhenti pertama. Lilin D paling tinggi → Jawaban: ${CANDLES_1_EC_CHOICE}.`,
      ),
    },
  ]

  return {
    answer: CANDLES_1_EC_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
