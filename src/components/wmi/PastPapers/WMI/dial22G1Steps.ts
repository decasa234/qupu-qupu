import type { Lang } from '../concepts/explainers/makeTenSteps'

// Storyboard for WMI-22F1A-Q21 (Grade 1) — answer 93128.
//
// A dial has numbers placed CLOCKWISE from the top at indices 0..9:
//   [0, 3, 1, 9, 2, 7, 6, 4, 8, 5]
// The pointer starts at index 0 (number 0). Turning k steps clockwise adds k to
// the index; counterclockwise subtracts k (mod 10). After each turn we read the
// number sitting at the new index. The numbers read, in order, spell the
// password.
//
// Turns (editor-confirmed):
//   start  index 0  → number 0  (not read; the reading starts after the 1st turn)
//   +3 CW  index 3  → number 9   read 9      password 9
//   -2 CCW index 1  → number 3   read 3      password 93
//   +1 CW  index 2  → number 1   read 1      password 931
//   +2 CW  index 4  → number 2   read 2      password 9312
//   -6 CCW index 8  → number 8   read 8      password 93128
// Password = 93128.

export const DIAL_NUMBERS = [0, 3, 1, 9, 2, 7, 6, 4, 8, 5] as const
export const DIAL_ANSWER = '93128'

export type DialPhase = 'start' | 'turn' | 'result'

export interface DialStep {
  phase: DialPhase
  /** Where the pointer sits on this beat (clockwise index 0..9). */
  pointerIndex: number
  /** Direction of the turn taken to reach this beat (for the arc/badge). */
  direction: 'cw' | 'ccw' | null
  /** How many steps the turn moved. */
  steps: number
  /** The digit just read at the new index (null on the start/result beats). */
  digit: number | null
  /** Running password string after this beat. */
  password: string
  caption: string
  hold: number
  result: boolean
}

export interface DialStoryboard {
  answer: string
  /** Localized "password" badge label. */
  passwordLabel: string
  steps: DialStep[]
  finalIndex: number
}

export function buildDial22G1Steps(lang: Lang): DialStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DialStep[] = [
    {
      phase: 'start',
      pointerIndex: 0,
      direction: null,
      steps: 0,
      digit: null,
      password: '',
      hold: 2400,
      result: false,
      caption: t(
        'The pointer starts at the top, on 0. Each turn lands on a new number, and we write that number down — one digit per turn.',
        'Penunjuk mulai di atas, di angka 0. Tiap putaran berhenti di angka baru, lalu kita tulis angkanya — satu angka tiap putaran.',
      ),
    },
    {
      phase: 'turn',
      pointerIndex: 3,
      direction: 'cw',
      steps: 3,
      digit: 9,
      password: '9',
      hold: 2200,
      result: false,
      caption: t(
        'Turn 3 steps CLOCKWISE: 0 → 3. The pointer lands on 9. Password: 9.',
        'Putar 3 langkah SEARAH jarum jam: 0 → 3. Penunjuk berhenti di 9. Sandi: 9.',
      ),
    },
    {
      phase: 'turn',
      pointerIndex: 1,
      direction: 'ccw',
      steps: 2,
      digit: 3,
      password: '93',
      hold: 2200,
      result: false,
      caption: t(
        'Turn 2 steps the OTHER way (counterclockwise): 3 → 1. The pointer lands on 3. Password: 93.',
        'Putar 2 langkah ke ARAH SEBALIKNYA (berlawanan jarum jam): 3 → 1. Penunjuk berhenti di 3. Sandi: 93.',
      ),
    },
    {
      phase: 'turn',
      pointerIndex: 2,
      direction: 'cw',
      steps: 1,
      digit: 1,
      password: '931',
      hold: 2200,
      result: false,
      caption: t(
        'Turn 1 step CLOCKWISE: 1 → 2. The pointer lands on 1. Password: 931.',
        'Putar 1 langkah SEARAH jarum jam: 1 → 2. Penunjuk berhenti di 1. Sandi: 931.',
      ),
    },
    {
      phase: 'turn',
      pointerIndex: 4,
      direction: 'cw',
      steps: 2,
      digit: 2,
      password: '9312',
      hold: 2200,
      result: false,
      caption: t(
        'Turn 2 steps CLOCKWISE: 2 → 4. The pointer lands on 2. Password: 9312.',
        'Putar 2 langkah SEARAH jarum jam: 2 → 4. Penunjuk berhenti di 2. Sandi: 9312.',
      ),
    },
    {
      phase: 'turn',
      pointerIndex: 8,
      direction: 'ccw',
      steps: 6,
      digit: 8,
      password: '93128',
      hold: 2400,
      result: false,
      caption: t(
        'Turn 6 steps counterclockwise: 4 → 8. The pointer lands on 8. Password: 93128.',
        'Putar 6 langkah berlawanan jarum jam: 4 → 8. Penunjuk berhenti di 8. Sandi: 93128.',
      ),
    },
    {
      phase: 'result',
      pointerIndex: 8,
      direction: null,
      steps: 0,
      digit: null,
      password: DIAL_ANSWER,
      hold: 0,
      result: true,
      caption: t(
        `Reading the numbers in order — 9, 3, 1, 2, 8 — the password is ${DIAL_ANSWER}.`,
        `Baca angkanya berurutan — 9, 3, 1, 2, 8 — sandinya ${DIAL_ANSWER}.`,
      ),
    },
  ]

  return {
    answer: DIAL_ANSWER,
    passwordLabel: t('Password', 'Sandi'),
    steps,
    finalIndex: steps.length - 1,
  }
}
