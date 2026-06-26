// OSN-25-SD-NAS-FINAL-Q5 storyboard — bus seating counting.
//
// Problem: 5 people in [1][2]|LORONG|[3][4][5].
//   Amir → window seat (1 or 5): 2 choices.
//   Budi → aisle-adjacent seat (2, 3, or 4): 3 choices (no conflict with window).
//   Remaining 3 → 3! = 6.
//   Answer: 2 × 3 × 6 = 36.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { SeatState } from './BusSeatOSN25NFQ5Illustration'

export type BusSeatPhase = 'intro' | 'amir' | 'budi' | 'rest' | 'result'

export interface BusSeatStep {
  phase: BusSeatPhase
  /** Visual state per seat, indices 0–4 = seats 1–5. */
  seatStates: readonly SeatState[]
  /** Equation string to display ('' = hide). */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface BusSeatStoryboard {
  steps: BusSeatStep[]
  finalIndex: number
}

const ALL_NORMAL: readonly SeatState[] = ['normal', 'normal', 'normal', 'normal', 'normal']

export function buildBusSeatOSN25NFQ5Steps(lang: Lang): BusSeatStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BusSeatStep[] = [
    // Beat 0 — intro: show the seat row, state the constraints
    {
      phase: 'intro',
      seatStates: ALL_NORMAL,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Five seats: [1][2] | aisle | [3][4][5]. Amir wants a window seat; Budi wants a seat next to the aisle.',
        'Lima kursi: [1][2] | lorong | [3][4][5]. Amir ingin kursi jendela; Budi ingin kursi samping lorong.',
      ),
    },

    // Beat 1 — Amir's window choices: seats 1 and 5
    {
      phase: 'amir',
      seatStates: ['window', 'normal', 'normal', 'normal', 'window'],
      equation: 'Amir: 2 pilihan',
      hold: 2400,
      result: false,
      caption: t(
        'Window seats are seat 1 and seat 5. Amir has 2 choices.',
        'Kursi jendela adalah kursi 1 dan kursi 5. Amir punya 2 pilihan.',
      ),
    },

    // Beat 2 — Budi's aisle-adjacent choices: seats 2, 3, 4
    {
      phase: 'budi',
      seatStates: ['taken', 'aisle', 'aisle', 'aisle', 'taken'],
      equation: 'Budi: 3 pilihan',
      hold: 2400,
      result: false,
      caption: t(
        'Seats next to the aisle: seat 2 (left), seat 3 (right), seat 4 (also right block). Budi has 3 choices — none conflict with Amir\'s window.',
        'Kursi samping lorong: kursi 2 (kiri), kursi 3 (kanan), kursi 4 (kanan). Budi punya 3 pilihan — tidak bertabrakan dengan jendela Amir.',
      ),
    },

    // Beat 3 — remaining 3 people fill the last 3 seats freely
    {
      phase: 'rest',
      seatStates: ['window', 'aisle', 'aisle', 'aisle', 'window'],
      equation: '3! = 6',
      hold: 2400,
      result: false,
      caption: t(
        'After Amir and Budi are seated, Carli, Doni, and Eki fill the remaining 3 seats in 3! = 6 ways.',
        'Setelah Amir dan Budi duduk, Carli, Doni, dan Eki mengisi 3 kursi tersisa dalam 3! = 6 cara.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      seatStates: ['window', 'highlight', 'highlight', 'highlight', 'window'],
      equation: '2 × 3 × 6 = 36',
      hold: 0,
      result: true,
      caption: t(
        'Total arrangements: Amir (2) × Budi (3) × others (6) = 36.',
        'Total susunan: Amir (2) × Budi (3) × lainnya (6) = 36.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
