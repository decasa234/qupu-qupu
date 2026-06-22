// IKMC-23-EC-Q12 — "7 houses north of Road A, 8 east of Road B, 5 south of
// Road A. How many houses are west of Road B?" → Answer A (4).
//
// Teaching walk — one idea per beat:
//   0. intro    — show the map; state the three given counts.
//   1. total    — Road A splits all houses: 7 + 5 = 12 total.
//   2. east     — highlight Road B; 8 houses are east of it.
//   3. west     — west = 12 − 8 = 4 houses.
//   4. result   — 4 → answer A.
//
// Pure data builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { HighlightMode } from './RoadHouses12ECIllustration'

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'total' | 'east' | 'west' | 'result'

export interface RoadBeat {
  phase: PhaseId
  /** Which part of the map to tint / annotate. */
  highlight: HighlightMode
  /** Equation line shown below the figure; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface RoadStoryboard {
  steps: RoadBeat[]
  finalIndex: number
}

export function buildRoadHouses12ECSteps(lang: Lang): RoadStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RoadBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: null,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        '7 houses north of Road A · 8 houses east of Road B · 5 houses south of Road A.',
        '7 rumah di utara Jalan A · 8 rumah di timur Jalan B · 5 rumah di selatan Jalan A.',
      ),
    },

    // Beat 1 — total
    {
      phase: 'total',
      highlight: 'road-a',
      equation: '7 + 5 = 12',
      hold: 2400,
      result: false,
      caption: t(
        'Road A splits ALL houses into North + South. Total = 7 + 5 = 12 houses.',
        'Jalan A membagi SEMUA rumah menjadi Utara + Selatan. Total = 7 + 5 = 12 rumah.',
      ),
    },

    // Beat 2 — east count
    {
      phase: 'east',
      highlight: 'road-b',
      equation: '8 east of Road B',
      hold: 2200,
      result: false,
      caption: t(
        'Road B splits those same 12 houses into East + West. 8 are east of Road B.',
        'Jalan B membagi 12 rumah yang sama menjadi Timur + Barat. 8 berada di timur Jalan B.',
      ),
    },

    // Beat 3 — west = 12 − 8
    {
      phase: 'west',
      highlight: 'west-answer',
      equation: '12 − 8 = 4',
      hold: 2400,
      result: false,
      caption: t(
        'Houses west of Road B = total − east = 12 − 8 = 4.',
        'Rumah di barat Jalan B = total − timur = 12 − 8 = 4.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlight: 'west-answer',
      equation: '4 → A',
      hold: 0,
      result: true,
      caption: t(
        '4 houses are west of Road B — answer A.',
        '4 rumah berada di barat Jalan B — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
