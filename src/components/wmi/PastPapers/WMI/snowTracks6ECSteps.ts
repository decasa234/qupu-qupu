// IKMC-19-EC-Q6 — "Snow Tracks" storyboard builder.
//
// Three people crossed a snow field. The crossing order is determined by which
// track lies UNDER the others at crossing points (laid first) vs ON TOP (last).
// Answer A: dotted (D) first, ribbed (R) second, oval (O) third.
//
// Pure module — no React, no Math.random, no Date. SSR-safe.

export type Lang = 'en' | 'id'

export type SnowPhase =
  | 'intro'
  | 'crossings'
  | 'first'
  | 'second'
  | 'third'
  | 'result'

export interface SnowBeat {
  phase: SnowPhase
  showCrossings: boolean
  highlightFirst: boolean
  highlightSecond: boolean
  highlightThird: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SnowStoryboard {
  steps: SnowBeat[]
  finalIndex: number
}

export const SNOW_ANSWER = 'A'
export const SNOW_CHOICE = 'A'

export function buildSnowTracks6ECSteps(lang: Lang): SnowStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SnowBeat[] = [
    {
      phase: 'intro',
      showCrossings: false,
      highlightFirst: false,
      highlightSecond: false,
      highlightThird: false,
      hold: 2200,
      result: false,
      caption: t(
        'Three people left overlapping tracks in the snow.',
        'Tiga orang meninggalkan jejak yang saling bertumpang tindih di salju.',
      ),
    },
    {
      phase: 'crossings',
      showCrossings: true,
      highlightFirst: false,
      highlightSecond: false,
      highlightThird: false,
      hold: 2200,
      result: false,
      caption: t(
        'At each crossing, the track ON TOP was made LATER.',
        'Di setiap persimpangan, jejak yang DI ATAS dibuat LEBIH BELAKANGAN.',
      ),
    },
    {
      phase: 'first',
      showCrossings: true,
      highlightFirst: true,
      highlightSecond: false,
      highlightThird: false,
      hold: 2200,
      result: false,
      caption: t(
        'Dotted track is UNDER all others — walked 1st.',
        'Jejak titik berada DI BAWAH semua lainnya — berjalan ke-1.',
      ),
    },
    {
      phase: 'second',
      showCrossings: true,
      highlightFirst: false,
      highlightSecond: true,
      highlightThird: false,
      hold: 2200,
      result: false,
      caption: t(
        'Ribbed track is under oval but above dotted — walked 2nd.',
        'Jejak bergaris berada di bawah oval tetapi di atas titik — berjalan ke-2.',
      ),
    },
    {
      phase: 'third',
      showCrossings: true,
      highlightFirst: false,
      highlightSecond: false,
      highlightThird: true,
      hold: 2200,
      result: false,
      caption: t(
        'Oval track is ON TOP of all others — walked 3rd.',
        'Jejak oval berada DI ATAS semua lainnya — berjalan ke-3.',
      ),
    },
    {
      phase: 'result',
      showCrossings: true,
      highlightFirst: true,
      highlightSecond: true,
      highlightThird: true,
      hold: 0,
      result: true,
      caption: t(
        'Order: dotted → ribbed → oval. Answer A.',
        'Urutan: titik → bergaris → oval. Jawaban A.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
