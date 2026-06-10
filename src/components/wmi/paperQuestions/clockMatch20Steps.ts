import type { Lang } from '../concepts/explainers/makeTenSteps'

// Storyboard for WMI-20F1A-Q6: the digital clock shows 04:30 — which analog
// clock matches? Captions follow the canonical hint_steps in
// db/seed/wmi/papers/2020-final-g1.json, plus the trap note (clock A = 3:30
// also has its minute hand on the 6).
export type ClockMatchPhase = 'show' | 'minute' | 'hour' | 'trap' | 'result'

export interface ClockMatchStep {
  phase: ClockMatchPhase
  /** Emphasize the long minute hand on the answer clock. */
  emphasizeMinute: boolean
  /** Emphasize the short hour hand on the answer clock. */
  emphasizeHour: boolean
  /** Show the dimmed/crossed-out trap clock (A, 3:30) beside the answer clock. */
  showTrap: boolean
  /** Mark the answer clock as the confirmed match (C). */
  revealMatch: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ClockMatchStoryboard {
  steps: ClockMatchStep[]
  finalIndex: number
}

export function buildClock20Steps(lang: Lang): ClockMatchStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockMatchStep[] = [
    {
      phase: 'show',
      emphasizeMinute: false,
      emphasizeHour: false,
      showTrap: false,
      revealMatch: false,
      hold: 1700,
      result: false,
      caption: t('04:30 means half past four.', '04:30 artinya pukul setengah lima.'),
    },
    {
      phase: 'minute',
      emphasizeMinute: true,
      emphasizeHour: false,
      showTrap: false,
      revealMatch: false,
      hold: 2000,
      result: false,
      caption: t(
        'The 30 minutes put the long minute hand straight down at the 6.',
        'Menit ke-30 membuat jarum panjang menunjuk lurus ke angka 6.',
      ),
    },
    {
      phase: 'hour',
      emphasizeMinute: false,
      emphasizeHour: true,
      showTrap: false,
      revealMatch: false,
      hold: 2000,
      result: false,
      caption: t(
        'At half past, the short hour hand sits halfway between 4 and 5.',
        'Pada setengah jam, jarum pendek berada di tengah antara 4 dan 5.',
      ),
    },
    {
      phase: 'trap',
      emphasizeMinute: false,
      emphasizeHour: false,
      showTrap: true,
      revealMatch: false,
      hold: 2100,
      result: false,
      caption: t(
        'Careful: clock A also has its minute hand on the 6, but its hour hand is between 3 and 4 — that is 3:30.',
        'Hati-hati: jam A juga jarum panjangnya di 6, tapi jarum pendeknya antara 3 dan 4 — itu pukul 3:30.',
      ),
    },
    {
      phase: 'result',
      emphasizeMinute: true,
      emphasizeHour: true,
      showTrap: false,
      revealMatch: true,
      hold: 0,
      result: true,
      caption: t(
        'Clock C shows exactly that — minute hand at 6, hour hand between 4 and 5. (C)',
        'Jam C tepat seperti itu — jarum panjang di 6, jarum pendek antara 4 dan 5. (C)',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
