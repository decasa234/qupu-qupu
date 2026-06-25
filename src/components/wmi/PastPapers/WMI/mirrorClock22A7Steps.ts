import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type MirrorClockPhase = 'show' | 'mirror-rule' | 'reflected' | 'subtract' | 'result'

export interface MirrorClock22A7Step {
  phase: MirrorClockPhase
  caption: string
  hold: number
  result: boolean
  math?: string
  showActual: boolean
  emphasizeHour: boolean
  emphasizeMinute: boolean
  tone: 'info' | 'check' | 'win'
}

export interface MirrorClock22A7Storyboard {
  steps: MirrorClock22A7Step[]
  finalIndex: number
}

/** Storyboard explaining the mirror-clock puzzle (reflected 7:15 → actual 4:45 pm). */
export function buildMirrorClock22A7Steps(lang: Lang): MirrorClock22A7Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MirrorClock22A7Step[] = [
    {
      phase: 'show',
      hold: 1800,
      result: false,
      showActual: false,
      emphasizeHour: false,
      emphasizeMinute: false,
      tone: 'info',
      caption: t(
        'Mark sees a clock in a mirror. What does it appear to show?',
        'Mark melihat jam di cermin. Waktu apa yang tampak ditunjukkan?',
      ),
    },
    {
      phase: 'mirror-rule',
      hold: 2000,
      result: false,
      showActual: false,
      emphasizeHour: false,
      emphasizeMinute: false,
      tone: 'info',
      caption: t(
        'A mirror flips left ↔ right, so the clock reading is reversed.',
        'Cermin membalik kiri ↔ kanan, sehingga pembacaan jam terbalik.',
      ),
    },
    {
      phase: 'reflected',
      hold: 1800,
      result: false,
      showActual: false,
      emphasizeHour: true,
      emphasizeMinute: true,
      tone: 'check',
      caption: t(
        'The reflected image appears to show 7:15.',
        'Bayangan cermin tampak menunjukkan pukul 7:15.',
      ),
      math: '7:15',
    },
    {
      phase: 'subtract',
      hold: 2200,
      result: false,
      showActual: false,
      emphasizeHour: false,
      emphasizeMinute: false,
      tone: 'check',
      caption: t(
        'Mirror rule: actual time = 12:00 − 7:15 = 4:45.',
        'Aturan cermin: waktu nyata = 12:00 − 7:15 = 4:45.',
      ),
      math: '12:00 − 7:15 = 4:45',
    },
    {
      phase: 'result',
      hold: 0,
      result: true,
      showActual: true,
      emphasizeHour: false,
      emphasizeMinute: false,
      tone: 'win',
      caption: t(
        'Actual time = 4:45 pm → Answer D.',
        'Waktu nyata = 16.45 → Jawaban D.',
      ),
      math: '4:45 pm ✓',
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
