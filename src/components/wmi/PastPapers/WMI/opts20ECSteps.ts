// IKMC-23-EC-Q20 — Five clocks; which shows the correct time?
//
// "One clock is an hour fast, one is an hour slow, one shows the correct time,
// and two have stopped."  Answer: D (3:30).
//
// STRATEGY: Find three clocks whose times form an arithmetic run of +1h steps.
// The middle one is the correct time; the others are +1h fast and −1h slow.
//
// Clock times:
//   A — 12:30 (stopped)
//   B —  2:30 (1 hour slow)
//   C —  9:15 (stopped)
//   D —  3:30 (correct) ← answer
//   E —  4:30 (1 hour fast)
//
// B + 1h = D + 1h = E  →  D is the middle (correct) clock.
//
// Beat plan (6 beats + final):
//  1. Intro — 5 clocks; describe the puzzle setup.
//  2. Look for a consistent +1h chain.
//  3. Try B and D: 2:30 → 3:30 is +1h apart ✓
//  4. Try D and E: 3:30 → 4:30 is +1h apart ✓
//  5. Chain confirmed: B → D → E are each 1h apart.
//  6. D is the middle — the correct time; A and C are the stopped clocks.
//  7. Answer: D (3:30).
//
// Pure builder: no Math.random, no Date — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const CORRECT_LABEL = 'D'
export const CORRECT_TIME = '3:30'
export const SLOW_LABEL = 'B'
export const FAST_LABEL = 'E'

export type ClockTone = 'info' | 'check' | 'win'

export interface Clocks20ECStep {
  /** Which option labels to draw (A–E), always all five for reference. */
  highlightLabels: string[]
  /** If set, show green checkmark on this label. */
  greenLabel: string | null
  /** If set, show red cross on this label. */
  redLabels: string[]
  /** Arithmetic or short note shown above the clocks. */
  math: string | null
  /** Caption text. */
  caption: string
  /** Tone for caption styling. */
  tone: ClockTone
  /** True only on the final answer beat. */
  result: boolean
  /** Hold in ms (0 = hold indefinitely). */
  hold: number
}

export interface Clocks20ECStoryboard {
  steps: Clocks20ECStep[]
  finalIndex: number
}

export function buildClocks20ECSteps(lang: Lang): Clocks20ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Clocks20ECStep[] = [
    // Beat 1 — setup
    {
      highlightLabels: [],
      greenLabel: null,
      redLabels: [],
      math: null,
      tone: 'info',
      result: false,
      hold: 2000,
      caption: t(
        'Five clocks: 1 is fast (+1 h), 1 is slow (−1 h), 1 is correct, 2 are stopped. Find the correct one.',
        'Lima jam: 1 cepat (+1 j), 1 lambat (−1 j), 1 benar, 2 berhenti. Temukan yang benar.',
      ),
    },
    // Beat 2 — strategy: look for a chain of clocks 1h apart
    {
      highlightLabels: [],
      greenLabel: null,
      redLabels: [],
      math: t('slow − 1h → correct → +1h fast', 'lambat − 1j → benar → +1j cepat'),
      tone: 'info',
      result: false,
      hold: 2200,
      caption: t(
        'The fast clock is 1 hour ahead, the slow clock is 1 hour behind. Look for three clocks each 1 hour apart.',
        'Jam yang cepat 1 jam lebih depan, yang lambat 1 jam lebih belakang. Cari tiga jam yang masing-masing berjarak 1 jam.',
      ),
    },
    // Beat 3 — check B → D: 2:30 + 1h = 3:30
    {
      highlightLabels: ['B', 'D'],
      greenLabel: null,
      redLabels: [],
      math: '2:30 + 1h = 3:30',
      tone: 'check',
      result: false,
      hold: 2200,
      caption: t(
        'Clock B shows 2:30 and clock D shows 3:30. That is exactly 1 hour apart ✓',
        'Jam B menunjukkan 2:30 dan jam D menunjukkan 3:30. Selisihnya tepat 1 jam ✓',
      ),
    },
    // Beat 4 — check D → E: 3:30 + 1h = 4:30
    {
      highlightLabels: ['D', 'E'],
      greenLabel: null,
      redLabels: [],
      math: '3:30 + 1h = 4:30',
      tone: 'check',
      result: false,
      hold: 2200,
      caption: t(
        'Clock D shows 3:30 and clock E shows 4:30. Also exactly 1 hour apart ✓',
        'Jam D menunjukkan 3:30 dan jam E menunjukkan 4:30. Juga tepat 1 jam ✓',
      ),
    },
    // Beat 5 — chain B → D → E confirmed
    {
      highlightLabels: ['B', 'D', 'E'],
      greenLabel: null,
      redLabels: ['A', 'C'],
      math: '2:30 → 3:30 → 4:30',
      tone: 'check',
      result: false,
      hold: 2400,
      caption: t(
        'B → D → E form a chain: each 1 hour apart. A (12:30) and C (9:15) are the two stopped clocks.',
        'B → D → E membentuk rantai: masing-masing berjarak 1 jam. A (12:30) dan C (9:15) adalah dua jam yang berhenti.',
      ),
    },
    // Beat 6 — D is the middle = correct time
    {
      highlightLabels: ['B', 'D', 'E'],
      greenLabel: 'D',
      redLabels: ['A', 'C'],
      math: 'B (−1h)  →  D ✓  →  E (+1h)',
      tone: 'win',
      result: true,
      hold: 0,
      caption: t(
        'D is in the middle of the chain: B is 1h slow, E is 1h fast. Clock D shows the correct time — answer D.',
        'D berada di tengah rantai: B lambat 1 jam, E cepat 1 jam. Jam D menunjukkan waktu yang benar — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
