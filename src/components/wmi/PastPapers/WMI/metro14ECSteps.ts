// IKMC-23-EC-Q14 — storyboard for the metro-line bounce animation.
//
// THE QUESTION:
//   The Metro line has 6 stations A–F. The train starts at B going East
//   (first stop = C). At an end station (A or F) it reverses. Which station
//   is the 96th stop? → Answer D.
//
// Teaching walk, one idea per beat:
//   0. intro    — show the line; train at B heading East; first stop = C.
//   1. sequence — reveal the first 10 stops: C,D,E,F,E,D,C,B,A,B.
//   2. cycle    — label the 10-stop cycle; stop 10 = B (same as start of cycle).
//   3. mod      — 96 ÷ 10 = 9 remainder 6; so stop 96 = same as stop 6.
//   4. result   — stop 6 = D → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type MetroPhaseId = 'intro' | 'sequence' | 'cycle' | 'mod' | 'result'

export interface MetroBeat {
  /** Which animation phase this beat belongs to. */
  phase: MetroPhaseId
  /**
   * How many stops in the sequence to show (0 = none).
   * The sequence is: C(1), D(2), E(3), F(4), E(5), D(6), C(7), B(8), A(9), B(10).
   */
  showStops: number
  /** Highlight the period bracket (wrapping stops 1–10). */
  showCycleBracket: boolean
  /** Show the modulo equation. */
  showMod: boolean
  /** Highlight the answer station on the figure. */
  highlightAnswer: boolean
  /** Equation/maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface MetroStoryboard {
  steps: MetroBeat[]
  finalIndex: number
}

/** The 10-stop repeating cycle (stop indices 1–10). */
export const STOP_CYCLE = ['C', 'D', 'E', 'F', 'E', 'D', 'C', 'B', 'A', 'B'] as const

export function buildMetro14ECSteps(lang: Lang): MetroStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MetroBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showStops: 0,
      showCycleBracket: false,
      showMod: false,
      highlightAnswer: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The train starts at B and moves East — first stop: C. At stations A and F it reverses direction.',
        'Kereta mulai di B dan bergerak ke Timur — perhentian pertama: C. Di stasiun A dan F arahnya berbalik.',
      ),
    },

    // Beat 1 — show the first 4 stops going East to F
    {
      phase: 'sequence',
      showStops: 4,
      showCycleBracket: false,
      showMod: false,
      highlightAnswer: false,
      equation: 'Stop 1=C, 2=D, 3=E, 4=F',
      hold: 2600,
      result: false,
      caption: t(
        'Going East: stops 1, 2, 3, 4 land on C, D, E, F. At F (end station) — reverse!',
        'Menuju Timur: perhentian 1, 2, 3, 4 berada di C, D, E, F. Di F (stasiun ujung) — berbalik!',
      ),
    },

    // Beat 2 — show stops 5–9 going West to A
    {
      phase: 'sequence',
      showStops: 9,
      showCycleBracket: false,
      showMod: false,
      highlightAnswer: false,
      equation: 'Stop 5=E, 6=D, 7=C, 8=B, 9=A',
      hold: 2600,
      result: false,
      caption: t(
        'Going West: stops 5, 6, 7, 8, 9 land on E, D, C, B, A. At A (end station) — reverse again!',
        'Menuju Barat: perhentian 5, 6, 7, 8, 9 berada di E, D, C, B, A. Di A (stasiun ujung) — berbalik lagi!',
      ),
    },

    // Beat 3 — show stop 10 = B; show cycle bracket
    {
      phase: 'cycle',
      showStops: 10,
      showCycleBracket: true,
      showMod: false,
      highlightAnswer: false,
      equation: 'Stop 10=B → cycle repeats every 10',
      hold: 2600,
      result: false,
      caption: t(
        'Stop 10 = B — back where the cycle started! The pattern repeats every 10 stops.',
        'Perhentian 10 = B — kembali ke awal siklus! Pola berulang setiap 10 perhentian.',
      ),
    },

    // Beat 4 — modulo reasoning
    {
      phase: 'mod',
      showStops: 10,
      showCycleBracket: true,
      showMod: true,
      highlightAnswer: false,
      equation: '96 ÷ 10 = 9 remainder 6',
      hold: 2600,
      result: false,
      caption: t(
        '96 ÷ 10 = 9 remainder 6. So stop 96 is the same as stop 6 in the cycle.',
        '96 ÷ 10 = 9 sisa 6. Jadi perhentian ke-96 sama dengan perhentian ke-6 dalam siklus.',
      ),
    },

    // Beat 5 — result: stop 6 = D
    {
      phase: 'result',
      showStops: 10,
      showCycleBracket: false,
      showMod: false,
      highlightAnswer: true,
      equation: 'Stop 6 = D → answer D',
      hold: 0,
      result: true,
      caption: t(
        'The 6th stop in the cycle is D. The 96th stop is station D — answer D.',
        'Perhentian ke-6 dalam siklus adalah D. Perhentian ke-96 adalah stasiun D — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
